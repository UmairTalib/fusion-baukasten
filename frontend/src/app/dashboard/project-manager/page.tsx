"use client";

import StatCard from "@/components/shared/ui/StatCard";
import ProjectListTable from "@/components/features/pm-dashboard/ProjectListTable";
import RecentActivityFeed from "@/components/features/pm-dashboard/RecentActivityFeed";
import { FolderKanban, CheckSquare, Users, Award } from "lucide-react";

export default function ProjectManagerDashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Aktive Projekte"
          value={3}
          icon={FolderKanban}
          trend="+1 diesen Monat"
          trendType="positive"
        />
        <StatCard
          title="Offene Aufgaben"
          value={8}
          icon={CheckSquare}
          trend="2 fällig heute"
          trendType="negative"
        />
        <StatCard
          title="Teammitglieder"
          value={12}
          icon={Users}
          trend="In 4 Projekten"
          trendType="neutral"
        />
        <StatCard
          title="Abgeschlossen"
          value={15}
          icon={Award}
          trend="100% Quote"
          trendType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProjectListTable />
        </div>
        <div>
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
}
