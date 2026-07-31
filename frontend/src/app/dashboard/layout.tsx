"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/layout/Sidebar";
import Topbar from "@/components/shared/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-[#f8faff]">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0a1230]/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - fixed width 260px on desktop, drawer on mobile */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-[260px] h-screen bg-[#f8faff] w-full min-w-0">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-[34px]">
          {children}
        </div>
      </main>
    </div>
  );
}
