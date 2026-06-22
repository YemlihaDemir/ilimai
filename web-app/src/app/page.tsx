export const dynamic = "force-dynamic";
import { BookOpen, CheckCircle2, Flame, PlayCircle, Target, TrendingUp } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function Home() {
  // Güvenli Fallback (Veritabanı bağlantısı yoksa uygulamanın çökmesini engeller)
  let user = null;
  try {
    user = await prisma.user.findFirst({
      include: {
        progress: true,
        dailyTasks: {
          orderBy: { order: 'asc' }
        }
      }
    });
  } catch (error) {
    console.error("Veritabanı hatası:", error);
  }

  const safeUser = user || {
    name: "Ahmet Hoca",
    progress: {
      targetCompletion: 65,
      streakDays: 12,
      flashcardsToReview: 42,
      fikihScore: 78,
      kelamScore: 45,
      memorizedAyahs: 124,
    },
    dailyTasks: [
      { id: "1", title: "Fıkıh: Hac İbadeti ve Şartları", type: "Konu Anlatımı", timeOrCount: "15 dk", completed: true, active: false, order: 1 },
      { id: "2", title: "MBSTS Fıkıh Mini Denemesi", type: "Soru Çözümü", timeOrCount: "10 Soru", completed: false, active: true, order: 2 },
      { id: "3", title: "Arapça YDS Kelimeleri (Set 4)", type: "Aralıklı Tekrar", timeOrCount: "20 Kelime", completed: false, active: false, order: 3 },
      { id: "4", title: "Tecvid: Medd-i Tabii Kuralları", type: "Konu Anlatımı", timeOrCount: "10 dk", completed: false, active: false, order: 4 },
    ]
  };

  const progress = safeUser.progress!;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Welcome & Stats Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Selamün Aleyküm, {safeUser.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 mt-1">Bugün öğrenmeye devam etmek için harika bir gün. MBSTS hedefine %{progress.targetCompletion} yaklaştın.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">İlim Serisi</p>
              <p className="text-lg font-bold text-orange-700 leading-none">{progress.streakDays} Gün</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Daily Route Card */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Günlük Çalışma Rotası
              </h2>
              <span className="text-sm text-slate-500">{safeUser.dailyTasks.filter(t => !t.completed).length} Görev Kaldı</span>
            </div>
            
            <div className="space-y-3">
              {safeUser.dailyTasks.length === 0 && <p className="text-sm text-slate-500 italic p-4">Henüz bir görev bulunmuyor.</p>}
              {safeUser.dailyTasks.map((task) => (
                <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border ${task.active ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'} transition-colors`}>
                  <div className="flex items-center gap-4">
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <div className={`w-6 h-6 rounded-full border-2 ${task.active ? 'border-indigo-600' : 'border-slate-300'}`}></div>
                    )}
                    <div>
                      <h3 className={`font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{task.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">{task.timeOrCount}</span>
                    {task.active && (
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Başla
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Exams Module */}
          <section className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-4 inline-block">Yapay Zeka Motoru</span>
              <h2 className="text-2xl font-bold mb-2">MBSTS Adaptif Deneme Sınavı</h2>
              <p className="text-indigo-100 max-w-md mb-6 opacity-80">
                Sistem, geçmiş çözümlerinizi analiz etti. Özellikle &quot;İslam Hukuku&quot; alanındaki eksiklerinize odaklanan yeni bir deneme hazır.
              </p>
              <Link href="/exam" className="bg-white text-indigo-900 hover:bg-indigo-50 px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors w-fit">
                <PlayCircle className="w-5 h-5" />
                Hemen Başla (80 Soru)
              </Link>
            </div>
          </section>

        </div>

        {/* Right Column (Sidebar-ish) */}
        <div className="space-y-6">
          
          {/* Spaced Repetition Card */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Kelime / Ayet Tekrarı
            </h2>
            
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-8 border-emerald-100 mb-4">
                <span className="text-2xl font-bold text-emerald-700">{progress.flashcardsToReview}</span>
              </div>
              <p className="text-slate-600 font-medium">Bugün tekrar edilmesi gereken kartınız var.</p>
              <p className="text-xs text-slate-400 mt-1">Unutma eğrisini kırmak için hemen tekrar edin.</p>
              
              <button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition-colors">
                Tekrara Başla
              </button>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Gelişim Özeti</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Fıkıh Başarısı</span>
                  <span className="font-medium text-slate-900">%{progress.fikihScore}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`bg-blue-500 h-2 rounded-full`} style={{ width: `${progress.fikihScore}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Kelam Başarısı</span>
                  <span className="font-medium text-slate-900">%{progress.kelamScore}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`bg-amber-500 h-2 rounded-full`} style={{ width: `${progress.kelamScore}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Ezberlenen Ayet</span>
                  <span className="font-medium text-slate-900">{progress.memorizedAyahs}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  {/* Oranlama yapılabilir, mock olarak %30 gibi gösteriliyor */}
                  <div className="bg-emerald-500 h-2 rounded-full w-[30%]"></div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
