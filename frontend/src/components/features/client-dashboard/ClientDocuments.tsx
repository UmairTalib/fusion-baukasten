"use client";

import React from "react";

export default function ClientDocuments() {
  return (
    <div className="bg-surface rounded-lg shadow-[0_14px_36px_rgba(45,55,95,0.08)] border border-border flex flex-col h-full">
      <div className="p-4 md:p-[24px] border-b border-border flex justify-between items-center">
        <h2 className="font-h2 text-[18px] font-bold text-on-surface">Dokumente & Berichte</h2>
        <span className="material-symbols-outlined text-on-surface-variant">folder</span>
      </div>

      <div className="p-0 flex-1 flex flex-col">
        <div className="divide-y divide-border">
          
          {/* File 1 */}
          <div className="p-4 md:p-[16px] hover:bg-bg-subtle transition-colors flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4 md:gap-[16px]">
              <div className="w-10 h-10 rounded bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">picture_as_pdf</span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-md text-[14px] text-on-surface font-medium group-hover:text-primary transition-colors">
                  Zwischenbericht_Q1.pdf
                </span>
                <span className="font-body-sm text-[13px] text-on-surface-variant">2.4 MB</span>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>

          {/* File 2 */}
          <div className="p-4 md:p-[16px] hover:bg-bg-subtle transition-colors flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4 md:gap-[16px]">
              <div className="w-10 h-10 rounded bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">picture_as_pdf</span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-md text-[14px] text-on-surface font-medium group-hover:text-primary transition-colors">
                  Analyseergebnisse.pdf
                </span>
                <span className="font-body-sm text-[13px] text-on-surface-variant">5.1 MB</span>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>

          {/* File 3 */}
          <div className="p-4 md:p-[16px] hover:bg-bg-subtle transition-colors flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4 md:gap-[16px]">
              <div className="w-10 h-10 rounded bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">picture_as_pdf</span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-md text-[14px] text-on-surface font-medium group-hover:text-primary transition-colors">
                  Workshop_Agenda.pdf
                </span>
                <span className="font-body-sm text-[13px] text-on-surface-variant">1.1 MB</span>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>

        </div>
      </div>

      <div className="p-4 md:p-[16px] border-t border-border mt-auto">
        <a className="flex items-center justify-center gap-2 font-body-md text-[14px] text-primary font-medium hover:text-primary-container transition-colors py-2 px-4 rounded hover:bg-surface-tint w-full" href="#">
          Zum Dokumentenarchiv
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
