"use client";

import React from "react";

export default function MilestonesTimeline() {
  return (
    <div className="bg-surface rounded-lg shadow-sm border border-line p-[18px] transition-transform duration-300 hover:-translate-y-1 h-fit w-full" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
      <h3 className="text-[18px] font-bold text-on-surface mb-6">Kommende Meilensteine</h3>
      <div className="relative border-l-2 border-line ml-3 space-y-6">
        <div className="relative pl-6">
          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-surface"></div>
          <p className="text-[11px] font-extrabold tracking-wider uppercase text-primary mb-1">15. Mai</p>
          <p className="text-[13px] font-medium text-on-surface">Kickoff</p>
        </div>
        <div className="relative pl-6">
          <div className="absolute w-3 h-3 bg-surface-container-highest border-2 border-primary rounded-full -left-[7px] top-1.5 ring-4 ring-surface"></div>
          <p className="text-[11px] font-extrabold tracking-wider uppercase text-on-surface-variant mb-1">18. Mai</p>
          <p className="text-[13px] font-medium text-on-surface">Agenda-Finalisierung</p>
        </div>
        <div className="relative pl-6">
          <div className="absolute w-3 h-3 bg-surface-container-highest border-2 border-primary rounded-full -left-[7px] top-1.5 ring-4 ring-surface"></div>
          <p className="text-[11px] font-extrabold tracking-wider uppercase text-on-surface-variant mb-1">20. Mai</p>
          <p className="text-[13px] font-medium text-on-surface">Stakeholder-Meeting</p>
        </div>
      </div>
    </div>
  );
}
