"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/shared/ui/StatCard";
import TeamMemberTasks from "@/components/features/team-member-dashboard/TeamMemberTasks";
import TeamMemberProjects from "@/components/features/team-member-dashboard/TeamMemberProjects";
import UpcomingDeadlines from "@/components/features/team-member-dashboard/UpcomingDeadlines";
import TeamActivityFeed from "@/components/features/team-member-dashboard/TeamActivityFeed";

export default function TeamMemberDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/stats", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch team member stats", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-[24px] p-4 md:p-[34px]">
      {/* Header */}
      <header className="flex justify-between items-end mb-[12px]">
        <div>
          <h2 className="font-h1 text-[30px] font-bold text-on-background m-0">Guten Morgen, Sarah 👋</h2>
          <p className="font-body-lg text-[16px] text-on-surface-variant mt-[4px] m-0">
            Du hast heute {stats?.meine_aufgaben || 0} fällige Aufgaben
          </p>
        </div>
        <button className="px-[16px] py-[12px] bg-transparent border border-outline-variant text-on-surface-variant rounded-lg font-body-md text-[14px] font-bold hover:bg-bg-subtle smooth-transition active:scale-95">
          Alle Aufgaben ansehen
        </button>
      </header>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <StatCard 
          title="Meine offenen Aufgaben" 
          value={stats?.meine_aufgaben?.toString() || "0"} 
          icon="task_alt" 
          trendText="+2 diese Woche" 
          trendIcon="warning" 
          trendType="negative" 
        />
        <StatCard 
          title="Zugeordnete Projekte" 
          value={stats?.zugewiesene_projekte?.toString() || "0"} 
          icon="folder_open" 
          trendText="Aktiv" 
          trendIcon="check_circle" 
          trendType="positive" 
        />
        <StatCard 
          title="Diesen Monat erledigt" 
          value={stats?.erledigt?.toString() || "0"} 
          icon="check_circle" 
          trendText="+4 vs. Vormonat" 
          trendIcon="trending_up" 
          trendType="positive" 
        />
        <StatCard 
          title="Überfällig" 
          value="1" // Mocked for now, backend could provide this
          icon="warning" 
          trendText="Handlung erforderlich" 
          trendIcon="warning" 
          trendType="negative" 
        />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-[16px] flex-1">
        {/* Left Column */}
        <div className="flex flex-col gap-[16px]">
          <TeamMemberTasks />
          <TeamMemberProjects />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[16px]">
          <UpcomingDeadlines />
          <TeamActivityFeed />
        </div>
      </div>
    </div>
  );
}
