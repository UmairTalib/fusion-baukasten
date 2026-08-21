"use client";

import React from "react";

export default function ClientKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[24px] mb-8 md:mb-[32px]">
      {/* Card 1 */}
      <div className="bg-surface rounded-lg p-4 md:p-[24px] shadow-[0_14px_36px_rgba(45,55,95,0.08)] border border-border">
        <p className="font-label-caps text-[11px] font-black tracking-[0.08em] text-on-surface-variant mb-4 uppercase">
          Projektstatus
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-success text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="font-h2 text-[18px] font-bold text-on-surface">Aktiv</span>
          </div>
          <span className="bg-success/10 text-success font-label-bold text-[12px] font-extrabold tracking-[0.05em] px-3 py-1 rounded-full">
            On Track
          </span>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-surface rounded-lg p-4 md:p-[24px] shadow-[0_14px_36px_rgba(45,55,95,0.08)] border border-border">
        <p className="font-label-caps text-[11px] font-black tracking-[0.08em] text-on-surface-variant mb-4 uppercase">
          Gesamtfortschritt
        </p>
        <div className="flex flex-col gap-2">
          <span className="font-h2 text-[18px] font-bold text-on-surface">65%</span>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-surface rounded-lg p-4 md:p-[24px] shadow-[0_14px_36px_rgba(45,55,95,0.08)] border border-border">
        <p className="font-label-caps text-[11px] font-black tracking-[0.08em] text-on-surface-variant mb-4 uppercase">
          Nächster Meilenstein
        </p>
        <div className="flex flex-col gap-1">
          <span className="font-h2 text-[18px] font-bold text-on-surface truncate">
            Bürger-Workshop
          </span>
          <span className="font-body-sm text-[13px] text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            12. Juni
          </span>
        </div>
      </div>

      {/* Card 4 */}
      <div className="bg-surface rounded-lg p-4 md:p-[24px] shadow-[0_14px_36px_rgba(45,55,95,0.08)] border border-border">
        <p className="font-label-caps text-[11px] font-black tracking-[0.08em] text-on-surface-variant mb-4 uppercase">
          Letztes Update
        </p>
        <div className="flex flex-col gap-1">
          <span className="font-h2 text-[18px] font-bold text-on-surface">Vor 2 Stunden</span>
          <span className="font-body-sm text-[13px] text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">person</span>
            Anna Weber
          </span>
        </div>
      </div>
    </div>
  );
}
