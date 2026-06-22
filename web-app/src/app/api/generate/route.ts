import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'mock-key');

export async function POST(request: Request) {
  try {
    const { topic, type } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Konu (topic) belirtilmelidir.' }, { status: 400 });
    }

    let contextText = "Sistemdeki kısıtlı kaynak (Örn: DİA Ansiklopedisi)";
    let sourceMeta = "Veritabanı dışı";

    // Vercel ortamlarında doğru yolu bulmak için process.cwd() kullanıyoruz
    const vectorStorePath = path.join(process.cwd(), 'vector_store');

    // RAG Search implementation with Google Embeddings
    if (fs.existsSync(vectorStorePath) && process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'mock-key') {
      try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
           model: "text-embedding-004",
           apiKey: process.env.GOOGLE_API_KEY
        });
        const vectorStore = await HNSWLib.load(vectorStorePath, embeddings);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vs: any = vectorStore;
        const results = await vs.similaritySearch(topic, 2);
        
        if (results && results.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contextText = results.map((r: any) => r.pageContent).join("\n\n");
            sourceMeta = `${results[0].metadata?.source || 'DİA'} - ${results[0].metadata?.url || ''}`;
        }
      } catch (e) {
          console.error("Vektör arama hatası:", e);
      }
    } else {
        console.log(`Vektör dizini bulunamadı veya API key eksik. Aranan yol: ${vectorStorePath}`);
    }

    // Mock Response Generator if no real API key is set
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'mock-key') {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let mockData: any = {};
      if (type === 'flashcard') {
          mockData = {
            id: "mock-" + Date.now(),
            topic: topic,
            front: `${topic} kavramı nedir?`,
            back: `Açıklama. (Kaynak: Mock Google AI)`,
            createdAt: new Date().toISOString()
          };
      } else {
          mockData = {
              id: "mock-" + Date.now(),
              topic: topic,
              context: `Kaynak: Mock Google AI`,
              question: `Mock Soru: ${topic} hakkında aşağıdakilerden hangisi doğrudur?`,
              optionA: 'Cevap A', optionB: 'Cevap B', optionC: 'Cevap C', optionD: 'Cevap D', optionE: 'Cevap E',
              correct: 'A', explanation: `Bu bir deneme verisidir.`
          };
      }

      // Veritabanına kaydetmeyi DENE, ancak hata olursa bile (db yoksa) cevabı kullanıcıya dön.
      try {
          if(type === 'flashcard') {
             await prisma.flashcard.create({ data: { topic: mockData.topic, front: mockData.front, back: mockData.back } });
          } else {
             await prisma.question.create({ data: { topic: mockData.topic, question: mockData.question, optionA: mockData.optionA, optionB: mockData.optionB, optionC: mockData.optionC, optionD: mockData.optionD, correct: mockData.correct, explanation: mockData.explanation } });
          }
      } catch(dbErr) {
          console.error("DB Mock kayıt hatası (Kullanıcıya veri gönderiliyor):", dbErr);
      }

      return NextResponse.json({ success: true, data: mockData });
    }

    // Real RAG Logic with Gemini
    let prompt = '';
    let schemaDefinition: Schema;

    if (type === 'flashcard') {
      prompt = `Sen bir İslami İlimler profesörüsün. SADECE AŞAĞIDAKİ KAYNAK METNİ KULLANARAK "${topic}" konusunda ezberlenmesi gereken bir Aralıklı Tekrar (Flashcard) hazırla.
      Eğer metin boşsa "Bu konu hakkında güvenilir kaynağımda bilgi yok" cevabını dön.
      Açıklama kısmının sonuna "(Kaynak: ${sourceMeta})" ekle.
      KAYNAK METİN: ${contextText}`;

      schemaDefinition = {
        type: SchemaType.OBJECT,
        properties: {
          front: { type: SchemaType.STRING, description: "Soru veya kelime" },
          back: { type: SchemaType.STRING, description: "Cevap ve açıklama" }
        },
        required: ["front", "back"]
      };

    } else {
      prompt = `Sen bir MBSTS ve DHBT soru hazırlama komisyonu üyesisin. SADECE AŞAĞIDAKİ KAYNAK METNİ BAZ ALARAK "${topic}" konusunda zorlayıcı ve öğretici, 5 şıklı bir test sorusu hazırla.
      Dışarıdan hiçbir bilgi ekleme. Eğer kaynak metinde bilgi yoksa "Yeterli kaynak bulunamadı" olarak cevap üretme.
      Açıklama kısmının sonuna "(Kaynak: ${sourceMeta})" ekle.
      KAYNAK METİN: ${contextText}`;

      schemaDefinition = {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          optionA: { type: SchemaType.STRING },
          optionB: { type: SchemaType.STRING },
          optionC: { type: SchemaType.STRING },
          optionD: { type: SchemaType.STRING },
          optionE: { type: SchemaType.STRING },
          correct: { type: SchemaType.STRING, description: "Sadece A, B, C, D veya E harfi" },
          explanation: { type: SchemaType.STRING }
        },
        required: ["question", "optionA", "optionB", "optionC", "optionD", "optionE", "correct", "explanation"]
      };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schemaDefinition,
      }
    });

    const completion = await model.generateContent(prompt);
    const resultText = completion.response.text();
    const result = JSON.parse(resultText);

    let savedData = result;

    // Veritabanına kaydetmeyi DENE, ancak Supabase/Neon bağlı değilse bile yapay zekanın ürettiği soruyu kullanıcıya GÖSTER.
    try {
      if (type === 'flashcard') {
        savedData = await prisma.flashcard.create({
          data: { topic, front: result.front, back: result.back }
        });
      } else {
        savedData = await prisma.question.create({
          data: {
            topic,
            context: sourceMeta,
            question: result.question,
            optionA: result.optionA,
            optionB: result.optionB,
            optionC: result.optionC,
            optionD: result.optionD,
            optionE: result.optionE || null,
            correct: result.correct,
            explanation: result.explanation
          }
        });
      }
    } catch(dbErr) {
        console.error("DB'ye kaydedilemedi, ancak yapay zeka verisi kullanıcıya iletiliyor:", dbErr);
        savedData.id = "temp-" + Date.now(); // Frontend'de hata almamak için sahte id
    }

    return NextResponse.json({ success: true, data: savedData });

  } catch (error) {
    console.error("Yapay Zeka API Hatası:", error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}
