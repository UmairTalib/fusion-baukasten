"use client";

import { useEffect, useState } from "react";
import KanbanBoard from "@/components/features/tasks/KanbanBoard";

export default function PMTasksPage() {
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch projects to get the first active project ID
    fetch("http://localhost:8000/api/v1/dashboard/projects", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setProjectId(data[0].id);
        }
      })
      .catch(err => console.error("Failed to fetch projects", err));
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-subtle overflow-hidden relative z-0">
      {/* Page Header */}
      <div className="px-gutter py-xl bg-surface border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-md flex-shrink-0 z-10 shadow-[0_4px_12px_rgba(45,55,95,0.03)]">
        <div>
          <nav className="flex items-center gap-xs text-on-surface-variant font-body-sm text-body-sm mb-xs">
            <span className="hover:text-primary transition-colors cursor-pointer">Projekte</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface font-medium">Aufgaben</span>
          </nav>
          <h1 className="font-h1 text-h1 text-on-surface">Aufgabenmanagement</h1>
        </div>
        <div className="flex items-center gap-md">
          {/* Team Avatar Stack */}
          <div className="flex -space-x-2 mr-sm">
            <img alt="Team Member" className="w-8 h-8 rounded-full border-2 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD99bo1ruO_oqhttKLF6nWcrZmyH5w7E07_YvKobYsKkyw2GIAd8U1E8jZ6XNU-MUVLwRtLozB_taBtRS2SUD13D4WqUoJtk8WmKrfnNMKgRk1YSaAkijafXb41uztNS6EMP2UYuWEO6tDVzINsiJD6AeIBpiFGRDDKLWS88SEgViSpnqMpnPOA-UkmBK6n8GoCUpu72ek3oTj4T8xWTgES5-MH3aBMN051mzCipiRDNaSyBQuzSIv9HQ" />
            <img alt="Team Member" className="w-8 h-8 rounded-full border-2 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4SQx0slJHHYoHDAHBS8SuHnGGz3HRv85nIpO8I2sM3LK60UL9v-VsNqnB-JztQpJedmIjiLihmFfKxKLNQxrKZvogdMUiZ7M5NTNvNSDSGdvo14LPEwyMF7RRL6AARbJg60n4N1xL7gE33pdZFWNSqU0roidsWPiEIRh0FWG3jsswqS9qwvotfhVubT3Eno8v1mNZDm5G-WkogY2z0jRQzk5t0SaOvVmHYg7x7t2Gdh40VtSPvBwW5w" />
            <img alt="Team Member" className="w-8 h-8 rounded-full border-2 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhJXLlX4vPsQUyc-YmlD935Iaa34HBwjwe37WlPl1pDw5mLw-IAGsM3W5V13PN4sQhHOwcgLamuQWAR5Q2smqi-A_wIWi3R3h7GDBUnSv9YGWjt0o27PI-pdJuoEwt3gygzY2ylehRBbNmt_TXMKlN7j_GIDWcoCjvnre9LgJAD8HBd4o8JiksMngqeMhokSPzXNmOmpUIoW1aZuys6UMRymd2NeoKxDG2ug4Zv0pKA0YQVMOR0_n7CQ" />
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center font-label-caps text-label-caps text-on-surface-variant">+3</div>
          </div>
          {/* Filters */}
          <button className="flex items-center gap-xs px-3 py-1.5 border border-border rounded-DEFAULT hover:bg-surface-container-low transition-colors font-body-sm text-body-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          {/* Primary CTA */}
          <button className="flex items-center gap-xs bg-primary hover:bg-[#3200b3] text-on-primary py-2 px-md rounded-DEFAULT font-label-bold text-label-bold transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Neue Aufgabe
          </button>
        </div>
      </div>
      
      {/* Board */}
      {projectId ? (
        <KanbanBoard projectId={projectId} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-on-surface-variant">Lade Projekte oder keine Projekte vorhanden...</p>
        </div>
      )}
    </div>
  );
}
