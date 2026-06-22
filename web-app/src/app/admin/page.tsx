"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Link, Database, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function AdminPage() {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("web");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: string; error?: string; chunks?: number } | null>(null);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: data.message, chunks: data.chunks });
        setUrl("");
      } else {
        setResult({ error: data.error || "Bilinmeyen bir hata oluştu." });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ağ hatası oluştu.";
      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Database className="w-6 h-6 text-[#2E8B57]" />
                İlim AI Hafıza Yönetimi (Admin)
              </h1>
              <p className="text-gray-600 mb-6">
                RAG (Retrieval-Augmented Generation) altyapısına doğrudan kaynak ekleyerek yapay zekanın hafızasını zenginleştirin. Eklenen kaynaklar vektör veritabanına indekslenir.
              </p>

              <form onSubmit={handleIngest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak URL&apos;si</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Link className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.diyanet.gov.tr/..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-[#2E8B57] focus:border-[#2E8B57] sm:text-sm transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak Türü</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-[#2E8B57] focus:border-[#2E8B57] sm:text-sm bg-white"
                    >
                      <option value="web">Web Sayfası (DİA, Diyanet vb.)</option>
                      <option value="youtube" disabled>YouTube Video (Yakında)</option>
                      <option value="pdf" disabled>PDF Doküman (Yakında)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading || !url}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2E8B57] hover:bg-[#236b43] text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        İndeksleniyor...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Hafızaya Ekle
                      </>
                    )}
                  </button>
                </div>
              </form>

              {result && (
                <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${result.error ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}>
                  {result.error ? <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" /> : <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />}
                  <div>
                    <h3 className="font-semibold">{result.error ? 'İşlem Başarısız' : 'Başarıyla Eklendi!'}</h3>
                    <p className="text-sm mt-1">{result.error || result.success}</p>
                    {result.chunks && (
                      <p className="text-xs mt-2 opacity-80">
                        {result.chunks} adet metin parçacığı (chunk) vektör veritabanına indekslendi.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#2E8B57]" />
                İndekslenmiş Kaynaklar (Önizleme)
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                Yapay zekanın hafızasında yer alan güncel kaynaklar (Diyanet mevzuatı, DİA maddeleri, GYS notları) aşağıda listelenmektedir.
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kaynak Adı</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Mock Veriler - Gerçek uygulamada API'den çekilecek */}
                    {[
                      { title: "Diyanet Teşkilat Şeması", cat: "GYS Mevzuat", date: "2024-06-22", status: "Aktif" },
                      { title: "Diyanet Görev ve Yetkiler", cat: "GYS Mevzuat", date: "2024-06-22", status: "Aktif" },
                      { title: "İslam Ansiklopedisi - Namaz", cat: "DİA / MBSTS", date: "2024-06-20", status: "Aktif" },
                      { title: "İslam Ansiklopedisi - Oruç", cat: "DİA / MBSTS", date: "2024-06-20", status: "Aktif" },
                      { title: "MBSTS 2023 Çıkmış Sorular Çözümleri", cat: "Soru Bankası", date: "2024-06-18", status: "Aktif" },
                      { title: "DHBT Fıkıh Özet Notları", cat: "Ders Notu", date: "2024-06-15", status: "Aktif" },
                    ].map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cat}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sistem Durumu</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Vector Store (HNSWLib)</div>
                  <div className="text-lg font-semibold text-emerald-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Aktif (110+ Chunk)
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Embedding Modeli</div>
                  <div className="text-lg font-medium text-gray-800">text-embedding-004</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Veritabanı (PostgreSQL)</div>
                  <div className="text-lg font-medium text-gray-800">Vercel Neon (Bağlı)</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
