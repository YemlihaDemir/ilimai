import Link from "next/link";
import { LayoutDashboard, BookOpen, BrainCircuit, Mic2, Users, Settings } from "lucide-react";

export function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: "Ana Panel", href: "/" },
    { icon: BrainCircuit, label: "AI Çalışma Odası", href: "/study" },
    { icon: BookOpen, label: "Hafıza & Tekrar", href: "/flashcards" },
    { icon: Mic2, label: "Hıfz & Tecvid", href: "#" },
    { icon: Users, label: "Sıralama & Liderlik", href: "#" },
    { icon: Settings, label: "Admin Paneli", href: "/admin" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold text-white tracking-wider">İlimAI</span>
        <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">BETA</span>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === 0; // Just for mockup
          
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 font-medium" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-slate-800 transition-colors text-left">
          <Settings className="w-5 h-5" />
          <span>Ayarlar</span>
        </button>
      </div>
    </aside>
  );
}
