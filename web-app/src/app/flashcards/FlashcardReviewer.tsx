'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Flashcard = {
  id: string;
  topic: string;
  front: string;
  back: string;
};

export default function FlashcardReviewer({ initialCards }: { initialCards: Flashcard[] }) {
  const [cards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Oturum Tamamlandı!</h2>
        <button 
          onClick={() => router.refresh()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Sonuçları Güncelle
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleReview = async (quality: number) => {
    setLoading(true);
    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcardId: currentCard.id, quality }),
      });
      
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setLoading(false);
      }, 150); // slight delay for smooth transition
      
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between text-sm font-medium text-slate-500 mb-2 px-2">
        <span>Konu: {currentCard.topic}</span>
        <span>{currentIndex + 1} / {cards.length}</span>
      </div>

      <div 
        className="relative w-full h-[400px] cursor-pointer group perspective-1000"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div className={`w-full h-full transition-transform duration-500 transform-style-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front of Card */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-slate-200 rounded-3xl shadow-md flex flex-col items-center justify-center p-8 text-center hover:border-emerald-300 transition-colors">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 absolute top-6">ÖN YÜZ (SORU)</span>
            <h3 className="text-2xl font-bold text-slate-900">{currentCard.front}</h3>
            {!isFlipped && <p className="text-sm text-slate-400 absolute bottom-6 animate-pulse">Cevabı görmek için karta tıkla</p>}
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-emerald-50 border-2 border-emerald-200 rounded-3xl shadow-md flex flex-col items-center justify-center p-8 text-center rotate-y-180 overflow-y-auto">
            <span className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-6 absolute top-6">ARKA YÜZ (CEVAP)</span>
            <p className="text-xl font-medium text-emerald-900 leading-relaxed mt-8">{currentCard.back}</p>
          </div>

        </div>
      </div>

      {/* Action Buttons (Only visible when flipped) */}
      <div className={`transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <p className="text-center text-sm text-slate-500 mb-4">Bu kartı hatırlamak ne kadar zordu?</p>
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => handleReview(0)} disabled={loading} className="bg-rose-100 hover:bg-rose-200 text-rose-700 py-4 rounded-xl font-bold transition-colors disabled:opacity-50">Tekrarla (0)</button>
          <button onClick={() => handleReview(2)} disabled={loading} className="bg-orange-100 hover:bg-orange-200 text-orange-700 py-4 rounded-xl font-bold transition-colors disabled:opacity-50">Zor (2)</button>
          <button onClick={() => handleReview(4)} disabled={loading} className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-4 rounded-xl font-bold transition-colors disabled:opacity-50">İyi (4)</button>
          <button onClick={() => handleReview(5)} disabled={loading} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kolay (5)'}
          </button>
        </div>
      </div>
    </div>
  );
}
