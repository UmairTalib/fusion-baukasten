"use client";

import StatCard from "@/components/shared/ui/StatCard";

export default function ProjectManagerDashboard() {
  return (
    <div>
      {/* KPI Cards Row (Bento/Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px] mb-8">
        <StatCard 
          title="Laufende Projekte" 
          value="12" 
          icon="folder_open" 
          trendText="+2 diesen Monat" 
          trendIcon="trending_up" 
          trendType="positive" 
        />
        <StatCard 
          title="Offene Aufgaben" 
          value="45" 
          icon="assignment_turned_in" 
          trendText="Konstant" 
          trendIcon="remove" 
          trendType="neutral" 
        />
        <StatCard 
          title="Budgetverbrauch" 
          value="64%" 
          icon="account_balance_wallet" 
          trendText="+5% vs. Plan" 
          trendIcon="trending_up" 
          trendType="negative" 
        />
        <StatCard 
          title="Teamleistung" 
          value="92%" 
          icon="groups" 
          trendText="+1% diesen Monat" 
          trendIcon="trending_up" 
          trendType="positive" 
        />
      </div>

      {/* Additional Content Area (Placeholder for actual bento grid/tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[18px]">
        <div className="lg:col-span-2 bg-surface rounded-lg shadow-sm border border-line h-64 p-[18px] flex items-center justify-center text-on-surface-variant text-[14px]" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
          Diagramm-Platzhalter (Project Manager)
        </div>
        <div className="bg-surface rounded-lg shadow-sm border border-line h-64 p-[18px] flex items-center justify-center text-on-surface-variant text-[14px]" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
          Aktivitäts-Feed (Project Manager)
        </div>
      </div>
    </div>
  );
}
