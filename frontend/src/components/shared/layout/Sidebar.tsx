"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  
  // Determine role from pathname to generate dynamic links
  const role = pathname.includes('/team-member') ? 'team-member' : 'project-manager';
  
  const dynamicNavItems = [
    { label: "Dashboard", href: `/dashboard/${role}`, icon: "dashboard" },
    { label: "Aufgaben", href: `/dashboard/${role}/tasks`, icon: "assignment" },
    { label: "Team", href: `/dashboard/${role}/team`, icon: "group" },
    { label: "Berichte", href: `/dashboard/${role}/reports`, icon: "bar_chart" },
  ];

  return (
    <nav 
      className={`fixed md:flex flex-col h-screen w-[260px] left-0 top-0 bg-surface shadow-lg md:shadow-sm border-r border-outline-variant z-50 py-6 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Mobile Close Button */}
      <div className="md:hidden absolute top-4 right-4">
        <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 mb-8 h-16">
        <div className="bg-gradient-to-br from-primary-container to-[#3f2bc4] w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-white text-[24px] font-extrabold tracking-tight">
          F
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-[18px] font-bold text-on-surface leading-none">Fusion</h1>
          <p className="text-[11px] text-on-surface-variant mt-1">Baukasten</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 space-y-1">
        {dynamicNavItems.map((item) => {
          const isActive = pathname === item.href || (pathname === `/dashboard/${role}` && item.href === `/dashboard/${role}`);
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded transition-colors ${
                isActive
                  ? "bg-surface-tint text-on-primary-fixed-variant border-l-4 border-primary rounded-l-none rounded-r-full"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
              onClick={() => {
                if (window.innerWidth < 768 && onClose) {
                  onClose();
                }
              }}
            >
              <span 
                className="material-symbols-outlined" 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[14px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-4 mt-auto mb-6">
        <button className="w-full bg-gradient-to-r from-primary to-secondary text-white text-[13px] font-medium py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Neues Projekt
        </button>
      </div>

    </nav>
  );
}
