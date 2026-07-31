"use client";

import React, { useEffect, useState } from "react";
import StatCard from "../../shared/ui/StatCard";

interface DashboardStats {
  active_projects: number;
  open_tasks: number;
  completed_tasks: number;
  total_budget: number;
  team_members_count: number;
}

export default function PMKPIs() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/dashboard/stats", {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="animate-spin material-symbols-outlined text-[32px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <StatCard
        title="Laufende Projekte"
        value={stats?.active_projects || 0}
        icon="folder_open"
        trendText="+2 diesen Monat"
        trendIcon="trending_up"
        trendType="positive"
      />
      <StatCard
        title="Offene Aufgaben"
        value={stats?.open_tasks || 0}
        icon="assignment_turned_in"
        trendText="Konstant"
        trendIcon="remove"
        trendType="neutral"
      />
      <StatCard
        title="Budgetverbrauch"
        value={stats?.total_budget ? "64%" : "0%"}
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
  );
}
