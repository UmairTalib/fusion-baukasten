"use client";

import StatCard from "@/components/shared/ui/StatCard";

export default function ClientDashboard() {
  return (
    <div>
      {/* KPI Cards Row (Bento/Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px] mb-8">
        <StatCard 
          title="Projektstatus" 
          value="Aktiv" 
          icon="autorenew" 
          trendText="Phase 2 von 5" 
          trendIcon="info" 
          trendType="neutral" 
        />
        <StatCard 
          title="Neue Nachrichten" 
          value="2" 
          icon="mail" 
          trendText="Ungelesen" 
          trendIcon="warning" 
          trendType="negative" 
        />
        <StatCard 
          title="Letztes Update" 
          value="Gestern" 
          icon="update" 
          trendText="Projektmanager" 
          trendIcon="person" 
          trendType="neutral" 
        />
        <StatCard 
          title="Fortschritt" 
          value="45%" 
          icon="incomplete_circle" 
          trendText="Im Zeitplan" 
          trendIcon="check_circle" 
          trendType="positive" 
        />
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-line h-64 p-[18px] flex items-center justify-center text-on-surface-variant text-[14px]" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
        7-Block Status Tracker (Gast/Kunde)
      </div>
    </div>
  );
}
