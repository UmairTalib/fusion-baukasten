"use client";

import React from "react";

export default function ActivityFeed() {
  return (
    <div className="bg-surface rounded-lg shadow-sm border border-line p-[18px] transition-transform duration-300 hover:-translate-y-1 w-full" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
      <h3 className="text-[18px] font-bold text-on-surface mb-4">Aktivitäts-Feed</h3>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ced5fd] text-[#545c7d] flex items-center justify-center font-bold text-[11px] flex-shrink-0">
            L
          </div>
          <div>
            <p className="text-[13px] text-on-surface">
              <span className="font-semibold">Laura</span> hat das Dokument "Projektplan V2" hochgeladen.
            </p>
            <p className="text-[11px] text-outline mt-0.5">Heute, 10:23 Uhr</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1456c5] text-[#c8d5ff] flex items-center justify-center font-bold text-[11px] flex-shrink-0">
            F
          </div>
          <div>
            <p className="text-[13px] text-on-surface">
              <span className="font-semibold">Felix</span> hat die Aufgabe "Design-Review" abgeschlossen.
            </p>
            <p className="text-[11px] text-outline mt-0.5">Heute, 09:15 Uhr</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-[11px] flex-shrink-0">
            S
          </div>
          <div>
            <p className="text-[13px] text-on-surface">
              <span className="font-semibold">Sophie</span> hat einen neuen Kommentar hinterlassen.
            </p>
            <p className="text-[11px] text-outline mt-0.5">Gestern, 16:45 Uhr</p>
          </div>
        </div>
      </div>
    </div>
  );
}
