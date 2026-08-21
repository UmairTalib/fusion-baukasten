"use client";

import React from "react";

export default function ClientMilestones() {
  return (
    <div className="lg:col-span-2 bg-surface rounded-lg shadow-[0_14px_36px_rgba(45,55,95,0.08)] border border-border flex flex-col h-full">
      <div className="p-4 md:p-[24px] border-b border-border flex justify-between items-center">
        <h2 className="font-h2 text-[18px] font-bold text-on-surface">Projekt-Meilensteine</h2>
        <button className="text-primary hover:text-primary-container transition-colors p-2 rounded-full hover:bg-surface-tint">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      <div className="p-4 md:p-[32px] flex-1">
        <div className="relative pl-6 md:pl-[32px] border-l-2 border-border space-y-6 md:space-y-[32px] pb-4">
          
          {/* Phase 1 */}
          <div className="relative">
            <div className="absolute -left-[35px] md:-left-[45px] top-0.5 w-6 h-6 rounded-full bg-success flex items-center justify-center border-4 border-surface shadow-sm">
              <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-bold text-[12px] font-extrabold tracking-[0.05em] text-success mb-1">
                PHASE 1
              </span>
              <span className="font-body-lg text-[16px] line-through text-on-surface-variant">
                Projekt-Initialisierung
              </span>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative">
            <div className="absolute -left-[35px] md:-left-[45px] top-0.5 w-6 h-6 rounded-full bg-success flex items-center justify-center border-4 border-surface shadow-sm">
              <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-bold text-[12px] font-extrabold tracking-[0.05em] text-success mb-1">
                PHASE 2
              </span>
              <span className="font-body-lg text-[16px] line-through text-on-surface-variant">
                Datenerhebung & Analyse
              </span>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative p-4 md:-ml-[16px] bg-surface-tint rounded-lg border border-primary/20 shadow-[0_4px_12px_rgba(83,62,207,0.12)]">
            <div className="absolute -left-[19px] md:-left-[29px] top-[22px] w-6 h-6 rounded-full bg-primary flex items-center justify-center border-4 border-surface shadow-[0_0_0_4px_rgba(83,62,207,0.24)]">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-label-bold text-[12px] font-extrabold tracking-[0.05em] text-primary mb-1">
                PHASE 3 (AKTUELL)
              </span>
              <span className="font-h2 text-[18px] font-bold text-primary">
                Bürgerbeteiligung
              </span>
              <p className="font-body-sm text-[13px] text-on-surface-variant mt-2 max-w-[448px]">
                Aktuell läuft die Online-Umfrage und die Vorbereitungen für den Bürger-Workshop am 12. Juni sind im Gange.
              </p>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="relative">
            <div className="absolute -left-[35px] md:-left-[45px] top-0.5 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center border-4 border-surface">
            </div>
            <div className="flex flex-col">
              <span className="font-label-bold text-[12px] font-extrabold tracking-[0.05em] text-on-surface-variant mb-1">
                PHASE 4
              </span>
              <span className="font-body-lg text-[16px] text-on-surface">
                Konzeptentwurf
              </span>
            </div>
          </div>

          {/* Phase 5 */}
          <div className="relative">
            <div className="absolute -left-[35px] md:-left-[45px] top-0.5 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center border-4 border-surface">
            </div>
            <div className="flex flex-col">
              <span className="font-label-bold text-[12px] font-extrabold tracking-[0.05em] text-on-surface-variant mb-1">
                PHASE 5
              </span>
              <span className="font-body-lg text-[16px] text-on-surface">
                Finale Präsentation
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
