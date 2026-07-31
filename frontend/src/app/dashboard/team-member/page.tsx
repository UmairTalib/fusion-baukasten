"use client";

import StatCard from "@/components/shared/ui/StatCard";

export default function TeamMemberDashboard() {
  return (
    <div>
      {/* KPI Cards Row (Bento/Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px] mb-8">
        <StatCard 
          title="Meine Aufgaben" 
          value="14" 
          icon="assignment" 
          trendText="5 fällig heute" 
          trendIcon="warning" 
          trendType="negative" 
        />
        <StatCard 
          title="Zugewiesene Projekte" 
          value="3" 
          icon="folder_shared" 
          trendText="Alle aktiv" 
          trendIcon="check_circle" 
          trendType="positive" 
        />
        <StatCard 
          title="Arbeitsstunden" 
          value="32h" 
          icon="schedule" 
          trendText="Diese Woche" 
          trendIcon="info" 
          trendType="neutral" 
        />
        <StatCard 
          title="Erledigt" 
          value="8" 
          icon="task_alt" 
          trendText="Letzte 7 Tage" 
          trendIcon="trending_up" 
          trendType="positive" 
        />
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-line h-64 p-[18px] flex items-center justify-center text-on-surface-variant text-[14px]" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
        Meine Aufgabenliste (Teammitglied)
      </div>
    </div>
  );
}
