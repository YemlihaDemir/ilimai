import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import fs from 'fs';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'mock-key' });

export async function POST(request: Request) {
  try {
    const { topic, type } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Konu (topic) belirtilmelidir.' }, { status: 400 });
    }

    let contextText = "Sistemdeki kısıtlı kaynak (Örn: DİA Ansiklopedisi)";
    let sourceMeta = "Veritabanı dışı";

    // RAG Search implementation (if vector DB exists)
    if (fs.existsSync('./vector_store') && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-key') {
      try {
        const embeddings = new OpenAIEmbeddings();
        const vectorStore = await HNSWLib.load('./vector_store', embeddings);
        // Cast vectorStore to any to bypass the faulty TS declaration in hnswlib
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
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (type === 'flashcard') {
        const mockFlashcard = await prisma.flashcard.create({
          data: {
            topic: topic,
            front: `${topic} kelimesinin/kavramının Arapça kökeni ve temel İslami terminolojideki anlamı nedir?`,
            back: `Bu kavram "${topic}" kökünden türemiştir. (Kaynak: Diyanet İslam Ansiklopedisi Simülasyonu)`
          }
        });
        return NextResponse.json({ success: true, data: mockFlashcard });
      }

      const mockQuestion = await prisma.question.create({
        data: {
          topic: topic,
          context: `Kaynak: Diyanet İslam Ansiklopedisi (Simülasyon)`,
          question: `RAG Mimarisine göre, "${topic}" konusu ile ilgili çekilen metne dayanarak hangisi doğrudur?`,
          optionA: 'Sadece ansiklopedideki veriler kullanılır.',
          optionB: 'Yapay zeka kafasından uydurabilir.',
          optionC: 'Kaynak göstermek yasaktır.',
          optionD: 'DİA harici internet sitelerine bakılır.',
          optionE: 'PDF yüklenemez.',
          correct: 'A',
          explanation: `RAG (Retrieval-Augmented Generation) mimarisinde yapay zeka sadece önceden kendisine verilen vektör veritabanındaki (Örn: DİA) metinlere dayanarak cevap verir. Bu yüzden A şıkkı doğrudur.`
        }
      });
      return NextResponse.json({ success: true, data: mockQuestion });
    }

    // Real RAG OpenAI Logic
    let prompt = '';
    if (type === 'flashcard') {
      prompt = `Sen bir İslami İlimler profesörüsün. SADECE AŞAĞIDAKİ KAYNAK METNİ KULLANARAK "${topic}" konusunda ezberlenmesi gereken bir Aralıklı Tekrar (Flashcard) hazırla.
      Eğer metin boşsa "Bu konu hakkında güvenilir kaynağımda bilgi yok" cevabını dön.
      JSON formatında dön: {"front": "soru veya kelime", "back": "cevabı ve açıklaması (Kaynak: ${sourceMeta})"}.
      
      KAYNAK METİN:
      ${contextText}
      `;
    } else {
      prompt = `Sen bir MBSTS ve DHBT soru hazırlama komisyonu üyesisin. SADECE AŞAĞIDAKİ KAYNAK METNİ BAZ ALARAK "${topic}" konusunda zorlayıcı ve öğretici, 5 şıklı bir test sorusu hazırla.
      Dışarıdan hiçbir bilgi ekleme. Eğer kaynak metinde bilgi yoksa "Yeterli kaynak bulunamadı" olarak cevap üretme.
      JSON formatında dön: {"question": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "optionE": "...", "correct": "A/B/C/D/E", "explanation": "Açıklama (Kaynak: ${sourceMeta})"}`;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

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
