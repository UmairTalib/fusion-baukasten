'use client';

import TeamMemberKPIs from '@/components/features/team-member-dashboard/TeamMemberKPIs';
import MyTasksTable from '@/components/features/team-member-dashboard/MyTasksTable';
import MyProjectsCard from '@/components/features/team-member-dashboard/MyProjectsCard';
import ActivityFeed from '@/components/features/pm-dashboard/ActivityFeed';

export default function TeamMemberDashboard() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-y-auto">
      <div className="p-4 md:p-[28px] max-w-[1400px] mx-auto w-full flex flex-col gap-[28px]">
        {/* Header */}
        <div>
          <h1 className="text-h1 text-on-surface">Meine Übersicht</h1>
          <p className="text-outline mt-1 text-body-md">Willkommen zurück! Hier ist dein Aufgaben-Überblick.</p>
        </div>

        {/* KPIs */}
        <TeamMemberKPIs />

        {/* Main Content Grid: 2/3 My Tasks + 1/3 Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[28px]">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 flex flex-col min-h-[500px]">
            <MyTasksTable />
          </div>
          
          {/* Right Column (1/3) */}
          <div className="flex flex-col gap-[28px]">
            <MyProjectsCard />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
