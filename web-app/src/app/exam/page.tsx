"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Flag, Award } from "lucide-react";
import Link from "next/link";

// Gerçek uygulamada bu veri API'den (Prisma üzerinden) çekilecektir.
const mockExamData = {
  id: "mbsts-mini-1",
  title: "MBSTS Mini Deneme 1",
  duration: 15, // dakika
  questions: [
    {
      id: "q1",
      topic: "Fıkıh",
      text: "Aşağıdakilerden hangisi namazın rükünlerinden (içindeki farzlar) biri değildir?",
      options: { A: "İftitah Tekbiri", B: "Kıyam", C: "Kıraat", D: "Secde", E: "Necasetten Taharet" },
      correct: "E",
      explanation: "Necasetten Taharet, namazın rükünlerinden (içindeki farzlar) değil, şartlarından (dışındaki farzlar) biridir."
    },
    {
      id: "q2",
      topic: "Tefsir",
      text: "Kur'an-ı Kerim'de 'Besmele' ile başlamayan tek sure aşağıdakilerden hangisidir?",
      options: { A: "Fatiha", B: "Tevbe", C: "Yasin", D: "Mülk", E: "İhlas" },
      correct: "B",
      explanation: "Tevbe suresi, Kur'an'da başında Besmele bulunmayan tek suredir."
    },
    {
      id: "q3",
      topic: "Siyer",
      text: "Peygamber Efendimiz (s.a.v) ile Hz. Hatice'nin evliliğine ne ad verilir?",
      options: { A: "Hılfu'l Fudul", B: "Darü'n Nedve", C: "Mübahele", D: "Zifaf", E: "Böyle özel bir isim yoktur" },
      correct: "E",
      explanation: "Hz. Peygamber ve Hz. Hatice'nin evlilik törenine özel bir ad verilmemiştir. Sıklıkla diğer kavramlarla karıştırılır."
    }
  ]
};

export default function ExamPage() {
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(mockExamData.duration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const finishExam = () => {
    let correctCount = 0;
    mockExamData.questions.forEach(q => {
      if (answers[q.id] === q.correct) correctCount++;
    });
    setScore(correctCount);
    setIsFinished(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimeout(finishExam, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examStarted, isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, optionKey: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  if (!examStarted) {
    return (
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-lg text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{mockExamData.title}</h1>
              <div className="text-gray-500 mb-8 space-y-2">
                <p>Bu deneme sınavı <strong>{mockExamData.questions.length} sorudan</strong> oluşmaktadır.</p>
                <p>Sınav süresi <strong>{mockExamData.duration} dakikadır</strong>.</p>
                <p className="text-sm">Sınavı başlattığınızda süre geriye saymaya başlayacaktır. Başarılar dileriz.</p>
              </div>
              <button 
                onClick={() => setExamStarted(true)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-600/20"
              >
                Sınavı Başlat
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sınav Tamamlandı!</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Skorunuz: <span className="font-bold text-emerald-600">{score} / {mockExamData.questions.length}</span>
                </p>
                <Link href="/" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                  Ana Sayfaya Dön
                </Link>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Soru Çözümleri</h2>
                {mockExamData.questions.map((q, idx) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correct;
                  
                  return (
                    <div key={q.id} className={`bg-white p-6 rounded-2xl shadow-sm border ${isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1 block">{q.topic}</span>
                          <p className="text-gray-900 font-medium">{q.text}</p>
                        </div>
                      </div>
                      
                      <div className="ml-12 space-y-3">
                        <p className="text-sm">Sizin Cevabınız: <span className={`font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>{userAnswer ? `${userAnswer}) ${q.options[userAnswer as keyof typeof q.options]}` : 'Boş'}</span></p>
                        {!isCorrect && (
                           <p className="text-sm">Doğru Cevap: <span className="font-semibold text-emerald-600">{q.correct}) {q.options[q.correct as keyof typeof q.options]}</span></p>
                        )}
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-sm text-gray-700"><strong>Çözüm:</strong> {q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentQ = mockExamData.questions[currentQuestionIdx];

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Exam Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
               <AlertCircle className="w-5 h-5" />
             </div>
             <div>
               <h1 className="font-bold text-gray-900">{mockExamData.title}</h1>
               <p className="text-xs text-gray-500">Soru {currentQuestionIdx + 1} / {mockExamData.questions.length}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-800'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={finishExam}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sınavı Bitir
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto flex">
          {/* Question Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              
              <div className="mb-6 flex justify-between items-center">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  {currentQ.topic}
                </span>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
                  <Flag className="w-4 h-4" /> İşaretle
                </button>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl text-gray-900 font-medium leading-relaxed mb-8">
                  <span className="font-bold text-gray-400 mr-2">{currentQuestionIdx + 1}.</span> 
                  {currentQ.text}
                </h2>

                <div className="space-y-3">
                  {Object.entries(currentQ.options).map(([key, value]) => {
                    const isSelected = answers[currentQ.id] === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleAnswer(currentQ.id, key)}
                        className={`w-full flex items-center p-4 rounded-xl border text-left transition-all ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {key}
                        </span>
                        <span className={`text-lg ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                          {value}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Önceki Soru
                </button>
                
                {currentQuestionIdx === mockExamData.questions.length - 1 ? (
                  <button 
                    onClick={finishExam}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Sınavı Tamamla <CheckCircle2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setCurrentQuestionIdx(prev => Math.min(mockExamData.questions.length - 1, prev + 1))}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
                  >
                    Sonraki Soru <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="w-72 bg-white border-l border-gray-200 p-6 overflow-y-auto hidden lg:block">
            <h3 className="font-bold text-gray-900 mb-4">Soru Navigasyonu</h3>
            <div className="grid grid-cols-4 gap-2">
              {mockExamData.questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentQuestionIdx;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`aspect-square rounded-lg font-medium text-sm flex items-center justify-center transition-all ${
                      isCurrent 
                        ? 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700' 
                        : isAnswered 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-4 h-4 rounded bg-gray-800"></div> Çözüldü
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-4 h-4 rounded bg-gray-100"></div> Boş
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-4 h-4 rounded bg-indigo-50 ring-2 ring-indigo-600"></div> Mevcut
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
