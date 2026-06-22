'use client';

import { useState } from 'react';
import { Bot, Brain, FileQuestion, Loader2, Sparkles } from 'lucide-react';

export default function StudyRoom() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null); // keeping as any due to dynamic property access for options
  const [type, setType] = useState<'question' | 'flashcard'>('question');

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header section */}
      <div className="bg-indigo-900 rounded-2xl p-8 text-white flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-300" />
            Yapay Zeka Çalışma Odası
          </h1>
          <p className="mt-2 text-indigo-200">İstediğiniz ilahiyat konusunu yazın, yapay zeka sizin için özgün MBSTS soruları veya Aralıklı Tekrar kartları (Flashcard) üretsin.</p>
        </div>
        <Sparkles className="w-24 h-24 text-indigo-700/50" />
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Hangi konuda çalışmak istersiniz?</label>
          <input 
            type="text" 
            placeholder="Örn: İslam Hukuku - Miras Hukuku (Feraiz)" 
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setType('question')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${type === 'question' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 text-slate-500 hover:border-indigo-200'}`}
          >
            <FileQuestion className="w-5 h-5" />
            Deneme Sorusu Üret
          </button>
          <button 
            onClick={() => setType('flashcard')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${type === 'flashcard' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 text-slate-500 hover:border-emerald-200'}`}
          >
            <Brain className="w-5 h-5" />
            Aralıklı Tekrar Kartı Üret
          </button>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!topic || loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Yapay Zeka İçeriği Hazırlıyor...' : 'Oluştur ve Veritabanına Kaydet'}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Üretilen İçerik:</h2>
          
          {type === 'question' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-6 border-b border-slate-200">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-semibold uppercase mb-3">Soru</span>
                <p className="text-lg font-medium text-slate-900">{result.question}</p>
                {result.context && <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">Kaynak: {result.context}</p>}
              </div>
              <div className="p-6 space-y-3">
                {['A', 'B', 'C', 'D', 'E'].map((opt) => (
                  result[`option${opt}`] && (
                    <div key={opt} className={`flex items-center gap-3 p-3 rounded-lg border ${result.correct === opt ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${result.correct === opt ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{opt}</span>
                      <span className={result.correct === opt ? 'text-emerald-900 font-medium' : 'text-slate-700'}>{result[`option${opt}`]}</span>
                    </div>
                  )
                ))}
              </div>
              <div className="bg-slate-50 p-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Çözüm ve Açıklama:</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{result.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[250px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ÖN YÜZ (SORU)</span>
                <h3 className="text-xl font-bold text-slate-900">{result.front}</h3>
              </div>
              <div className="bg-emerald-50 p-8 rounded-2xl border-2 border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[250px]">
                <span className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-4">ARKA YÜZ (CEVAP)</span>
                <p className="text-lg font-medium text-emerald-900">{result.back}</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
