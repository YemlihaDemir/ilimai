export const dynamic = "force-dynamic";
import { PrismaClient } from "@prisma/client";
import FlashcardReviewer from "./FlashcardReviewer";
import { Brain } from "lucide-react";

const prisma = new PrismaClient();

export default async function FlashcardsPage() {
  // Demo amaçlı "günü gelmiş veya geçmiş" kartları çekiyoruz
  const dueCards = await prisma.flashcard.findMany({
    where: {
      dueDate: {
        lte: new Date()
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-emerald-900 rounded-2xl p-8 text-white flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-emerald-300" />
            Aralıklı Tekrar (Spaced Repetition)
          </h1>
          <p className="mt-2 text-emerald-200">
            Unutma eğrisini kırmak için SuperMemo-2 algoritması devrede. Bugün tekrar etmen gereken {dueCards.length} kart var.
          </p>
        </div>
      </div>

      {dueCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Harika İş!</h2>
          <p className="text-slate-500 mt-2">Bugün için planlanan tüm tekrarları tamamladın.</p>
        </div>
      ) : (
        <FlashcardReviewer initialCards={dueCards} />
      )}
    </div>
  );
}
