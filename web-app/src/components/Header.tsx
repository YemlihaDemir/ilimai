import { Bell, Search, UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ayet, Hadis, Soru veya Konu Ara..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>
        
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">Ahmet Hoca</p>
            <p className="text-xs text-slate-500">İlahiyat Lisans</p>
          </div>
          <UserCircle className="w-9 h-9 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
