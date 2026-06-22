"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BookOpen, PlayCircle, FileText, CheckCircle2, Lock } from "lucide-react";

export default function LessonsPage() {
  const courses = [
    {
      id: "mbsts-fikih",
      title: "İslam İbadet Esasları (Fıkıh)",
      category: "MBSTS",
      progress: 60,
      lessons: [
        { title: "Temizlik (Taharet) ve Suları", type: "video", duration: "45 dk", completed: true },
        { title: "Namazın Şartları ve Rükünleri", type: "text", duration: "20 dk", completed: true },
        { title: "Cemaatle Namaz ve İmamet", type: "video", duration: "35 dk", completed: false },
        { title: "Oruç ve Zekat Hükümleri", type: "text", duration: "30 dk", locked: true },
      ]
    },
    {
      id: "gys-mevzuat",
      title: "Diyanet Mevzuatı ve Teşkilat",
      category: "GYS",
      progress: 25,
      lessons: [
        { title: "633 Sayılı Teşkilat Kanunu", type: "text", duration: "25 dk", completed: true },
        { title: "657 Sayılı DMK (Diyanet Özel)", type: "video", duration: "50 dk", completed: false },
        { title: "Disiplin Yönetmeliği", type: "text", duration: "15 dk", locked: true },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  Dersler & Konu Anlatımları
                </h1>
                <p className="text-gray-500 mt-1">MBSTS ve GYS sınavları için Diyanet kaynaklı konu anlatımları.</p>
              </div>
            </div>

            <div className="space-y-8">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-2 inline-block">
                          {course.category}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-indigo-600">%{course.progress}</span>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Tamamlandı</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {course.lessons.map((lesson, idx) => (
                      <div key={idx} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${lesson.locked ? 'opacity-60' : 'cursor-pointer'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            lesson.completed ? 'bg-emerald-100 text-emerald-600' : 
                            lesson.locked ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {lesson.completed ? <CheckCircle2 className="w-5 h-5" /> : 
                             lesson.locked ? <Lock className="w-5 h-5" /> :
                             lesson.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className={`font-medium ${lesson.locked ? 'text-gray-500' : 'text-gray-900'}`}>{lesson.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              {lesson.type === 'video' ? 'Video Ders' : 'Okuma Metni'} • {lesson.duration}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          {!lesson.locked && !lesson.completed && (
                            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                              Başla
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
