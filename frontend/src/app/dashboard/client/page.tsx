"use client";

import React from "react";
import ClientKPIs from "@/components/features/client-dashboard/ClientKPIs";
import ClientMilestones from "@/components/features/client-dashboard/ClientMilestones";
import ClientDocuments from "@/components/features/client-dashboard/ClientDocuments";

export default function ClientDashboard() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-[28px] py-8 md:py-[32px]">
      
      {/* Page Header */}
      <div className="mb-8 md:mb-[32px]">
        <h1 className="font-h1 text-[30px] font-bold tracking-tight text-on-surface mb-3 md:mb-[12px]">
          Projekt-Dashboard: Klimakonzept Siegen
        </h1>
        <p className="font-body-lg text-[16px] text-on-surface-variant">
          Ihr aktueller Projektstatus im Überblick
        </p>
      </div>

      {/* KPI Row */}
      <ClientKPIs />

      {/* Main Layout (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-[24px]">
        
        {/* Left Column: Projekt-Meilensteine */}
        <ClientMilestones />
        
        {/* Right Column: Dokumente & Berichte */}
        <ClientDocuments />

      </div>

    </div>
  );
}
