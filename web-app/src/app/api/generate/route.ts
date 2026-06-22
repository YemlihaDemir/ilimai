import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'mock-key' });

export async function POST(request: Request) {
  try {
    const { topic, type } = await request.json(); // type: 'question' or 'flashcard'

    if (!topic) {
      return NextResponse.json({ error: 'Konu (topic) belirtilmelidir.' }, { status: 400 });
    }

    // Mock Response Generator if no real API key is set
    if (!process.env.OPENAI_API_KEY) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (type === 'flashcard') {
        const mockFlashcard = await prisma.flashcard.create({
          data: {
            topic: topic,
            front: `${topic} kelimesinin/kavramının Arapça kökeni ve temel İslami terminolojideki anlamı nedir?`,
            back: `Bu kavram "${topic}" kökünden türemiştir ve fıkıh literatüründe... (Bu alan AI tarafından ${topic} konusuna göre dinamik doldurulacaktır).`
          }
        });
        return NextResponse.json({ success: true, data: mockFlashcard });
      }

      // Default: Question
      const mockQuestion = await prisma.question.create({
        data: {
          topic: topic,
          context: 'Diyanet İslam Ansiklopedisi kaynak alınmıştır.',
          question: `Aşağıdakilerden hangisi "${topic}" konusu ile ilgili temel fıkhi kurallardan biri değildir?`,
          optionA: 'Şarta bağlı olan durumlar asıldır.',
          optionB: 'Zorluk kolaylığı celbeder.',
          optionC: 'Beraet-i zimmet asıldır.',
          optionD: 'Zarar izale olunur.',
          optionE: 'Adet muhakkemdir.',
          correct: 'A',
          explanation: `İslam hukukunda mecelleye göre temel kaidelerden biri B, C, D ve E şıklarındaki kaidelerdir. "${topic}" bağlamında A şıkkı kuralın yanlış verilmiş halidir.`
        }
      });
      return NextResponse.json({ success: true, data: mockQuestion });
    }

    // Real OpenAI Logic (Requires valid process.env.OPENAI_API_KEY)
    let prompt = '';
    if (type === 'flashcard') {
      prompt = `Sen bir İslami İlimler (İlahiyat) profesörüsün. Bana "${topic}" konusuyla ilgili ezberlenmesi gereken çok kritik bir Arapça kelime, ayet, hadis metni veya fıkıh kuralı içeren bir Aralıklı Tekrar (Flashcard) hazırla. JSON formatında dön: {"front": "soru veya kelime", "back": "cevabı ve açıklaması"}`;
    } else {
      prompt = `Sen bir MBSTS ve DHBT soru hazırlama komisyonu üyesisin. Diyanet İslam Ansiklopedisi kaynaklarını baz alarak, "${topic}" konusunda çok zorlayıcı ve öğretici, 5 şıklı bir test sorusu hazırla. JSON formatında dön: {"question": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "optionE": "...", "correct": "A/B/C/D/E", "explanation": "..."}`;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Save to database
    if (type === 'flashcard') {
      const savedCard = await prisma.flashcard.create({
        data: { topic, front: result.front, back: result.back }
      });
      return NextResponse.json({ success: true, data: savedCard });
    } else {
      const savedQ = await prisma.question.create({
        data: {
          topic,
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
