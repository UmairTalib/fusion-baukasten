"use client";

import { Home, CheckSquare, MessageSquare, Bot, FileText, Settings, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Übersicht", href: "/", icon: Home },
    { name: "Aufgaben", href: "/tasks", icon: CheckSquare },
    { name: "Kommunikation", href: "/inbox", icon: MessageSquare },
    { name: "KI-Agenten", href: "/agents", icon: Bot },
    { name: "Werkzeugkasten", href: "/tools", icon: FileText },
  ];

  return (
    <nav className="fixed inset-y-0 left-0 z-20 w-[260px] flex flex-col px-4 py-6 overflow-y-auto bg-white/95 border-r border-fusion-line backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="grid place-items-center w-8 h-8 text-white rounded-lg bg-gradient-to-br from-fusion-purple to-fusion-purpleDark font-black text-sm">
          F
        </div>
        <span className="text-xl font-extrabold text-fusion-text tracking-wide">Fusion</span>
      </div>

      {/* Main Nav */}
      <div className="text-xs font-extrabold text-fusion-muted uppercase tracking-wider mb-2 px-2">
        Projekt
      </div>
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 min-h-[45px] px-3 border-0 rounded-lg text-left font-semibold transition-all duration-200",
                isActive 
                  ? "text-white bg-gradient-to-br from-fusion-purple to-fusion-purpleDark shadow-[0_12px_24px_rgba(83,62,207,0.24)]" 
                  : "text-[#172240] bg-transparent hover:bg-fusion-panelSoft"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Nav */}
      <div className="mt-auto pt-6 border-t border-fusion-line flex flex-col gap-2">
        <button className="flex items-center gap-3 px-3 py-2 text-fusion-muted hover:text-fusion-text hover:bg-fusion-panelSoft rounded-lg font-semibold transition-colors text-sm">
          <Settings className="w-4 h-4" /> Einstellungen
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-fusion-muted hover:text-fusion-text hover:bg-fusion-panelSoft rounded-lg font-semibold transition-colors text-sm">
          <HelpCircle className="w-4 h-4" /> Hilfe & Support
        </button>
        
        {/* User Mini */}
        <div className="flex items-center gap-3 mt-4 px-2">
          <div className="grid place-items-center w-9 h-9 text-white bg-[#263154] rounded-full font-extrabold text-sm shadow-sm">
            UT
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-fusion-text leading-none">Umair Talib</span>
            <span className="text-xs font-medium text-fusion-muted mt-1 leading-none">Projektmanager</span>
          </div>
          <button className="ml-auto text-fusion-muted hover:text-fusion-red transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
