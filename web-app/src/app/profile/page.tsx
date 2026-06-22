"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { User, Mail, Award, Settings, LogOut, Clock, Target, Calendar } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Profilim</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-[#2E8B57] to-[#1e613c]"></div>
              <div className="px-8 pb-8">
                <div className="relative flex justify-between items-end -mt-12 mb-6">
                  <div className="w-24 h-24 bg-white rounded-full p-1 border-4 border-white shadow-md flex items-center justify-center">
                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-[#2E8B57]">
                      <User className="w-10 h-10" />
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Profili Düzenle
                  </button>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-900">Ahmet Hoca</h2>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> ahmet@ilimai.com
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hedef Sınav</p>
                      <p className="font-semibold text-gray-900">MBSTS 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Toplam Çalışma</p>
                      <p className="font-semibold text-gray-900">124 Saat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rozetler</p>
                      <p className="font-semibold text-gray-900">7 Adet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  Abonelik Bilgileri
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">Premium Plan</span>
                      <span className="px-2 py-1 bg-[#2E8B57]/10 text-[#2E8B57] text-xs font-semibold rounded-lg">Aktif</span>
                    </div>
                    <p className="text-sm text-gray-500">Yenilenme Tarihi: 15.08.2024</p>
                  </div>
                  <button className="w-full py-2 text-sm font-medium text-[#2E8B57] hover:bg-[#2E8B57]/5 rounded-xl transition-colors">
                    Planı Değiştir
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  Hesap Ayarları
                </h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                    <span className="text-sm font-medium text-gray-700">Şifre Değiştir</span>
                    <span className="text-gray-400">&gt;</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                    <span className="text-sm font-medium text-gray-700">Bildirim Tercihleri</span>
                    <span className="text-gray-400">&gt;</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-colors text-left group mt-4">
                    <span className="text-sm font-medium text-red-600 group-hover:text-red-700 flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
