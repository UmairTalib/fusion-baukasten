"use client";

import StatCard from "@/components/shared/ui/StatCard";
import AssignedTaskList from "@/components/features/team-dashboard/AssignedTaskList";
import { CheckSquare, Clock, FolderKanban } from "lucide-react";

export default function TeamMemberDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Zugewiesene Aufgaben"
          value={3}
          icon={CheckSquare}
          trend="1 hohe Priorität"
          trendType="negative"
        />
        <StatCard
          title="Fällig diese Woche"
          value={2}
          icon={Clock}
          trend="Pünktlich"
          trendType="positive"
        />
        <StatCard
          title="Meine Projekte"
          value={2}
          icon={FolderKanban}
          trend="Aktiv"
          trendType="neutral"
        />
      </div>

      {/* Task List */}
      <AssignedTaskList />
    </div>
  );
}
