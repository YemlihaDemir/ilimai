import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// SuperMemo-2 Algorithm Implementation
function calculateSM2(quality: number, repetitions: number, easeFactor: number, interval: number) {
  let newRepetitions = repetitions;
  let newInterval = interval;
  let newEaseFactor = easeFactor;

  // Quality: 0=Blackout, 1=Incorrect(remembered), 2=Incorrect(easy), 3=Correct(hard), 4=Correct(good), 5=Correct(easy)
  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1; // 1 day
    } else if (repetitions === 1) {
      newInterval = 6; // 6 days
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions++;
  } else {
    // If forgotten, reset repetitions but keep the adapted easeFactor
    newRepetitions = 0;
    newInterval = 1;
  }

  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + newInterval);

  return { newRepetitions, newInterval, newEaseFactor, nextDueDate };
}

export async function POST(request: Request) {
  try {
    const { flashcardId, quality } = await request.json();

    if (!flashcardId || typeof quality !== 'number' || quality < 0 || quality > 5) {
      return NextResponse.json({ error: 'Geçersiz parametreler' }, { status: 400 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId }
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Kart bulunamadı' }, { status: 404 });
    }

    const { newRepetitions, newInterval, newEaseFactor, nextDueDate } = calculateSM2(
      quality,
      flashcard.repetitions,
      flashcard.easeFactor,
      flashcard.interval
    );

    const updatedCard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        repetitions: newRepetitions,
        interval: newInterval,
        easeFactor: newEaseFactor,
        dueDate: nextDueDate
      }
    });

    return NextResponse.json({ success: true, data: updatedCard });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
