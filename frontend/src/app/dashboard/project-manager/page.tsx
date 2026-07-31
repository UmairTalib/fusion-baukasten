"use client";

import React from "react";
import PMKPIs from "@/components/features/pm-dashboard/PMKPIs";
import ActiveProjectsTable from "@/components/features/pm-dashboard/ActiveProjectsTable";
import ActivityFeed from "@/components/features/pm-dashboard/ActivityFeed";
import MilestonesTimeline from "@/components/features/pm-dashboard/MilestonesTimeline";

export default function ProjectManagerDashboard() {
  return (
    <div className="w-full">
      <PMKPIs />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-[18px]">
        {/* Main Content Area (Active Projects & Activity) */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-[18px]">
          <ActiveProjectsTable />
          <ActivityFeed />
        </div>
        
        {/* Right Sidebar Area (Milestones) */}
        <div className="lg:col-span-1">
          <MilestonesTimeline />
        </div>
      </div>
    </div>
  );
}
