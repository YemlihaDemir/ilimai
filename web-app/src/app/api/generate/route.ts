import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import fs from 'fs';

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

    // RAG Search implementation with Google Embeddings
    if (fs.existsSync('./vector_store') && process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'mock-key') {
      try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
           model: "text-embedding-004",
           apiKey: process.env.GOOGLE_API_KEY
        });
        const vectorStore = await HNSWLib.load('./vector_store', embeddings);
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
    }

    // Mock Response Generator if no real API key is set
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'mock-key') {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (type === 'flashcard') {
        const mockFlashcard = await prisma.flashcard.create({
          data: {
            topic: topic,
            front: `${topic} kavramı nedir?`,
            back: `Açıklama. (Kaynak: Mock Google AI)`
          }
        });
        return NextResponse.json({ success: true, data: mockFlashcard });
      }

      const mockQuestion = await prisma.question.create({
        data: {
          topic: topic,
          context: `Kaynak: Mock Google AI`,
          question: `Mock Soru?`,
          optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D', optionE: 'E',
          correct: 'A', explanation: `Açıklama`
        }
      });
      return NextResponse.json({ success: true, data: mockQuestion });
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

    if (type === 'flashcard') {
      const savedCard = await prisma.flashcard.create({
        data: { topic, front: result.front, back: result.back }
      });
      return NextResponse.json({ success: true, data: savedCard });
    } else {
      const savedQ = await prisma.question.create({
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
      return NextResponse.json({ success: true, data: savedQ });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}
