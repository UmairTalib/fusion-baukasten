"use client";

import React, { useEffect, useState } from "react";
import StatCard from "../../shared/ui/StatCard";

interface DashboardStats {
  laufende_projekte: number;
  offene_aufgaben: number;
  budgetverbrauch: string;
  teamleistung: string;
}

export default function PMKPIs() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/stats", {
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
        value={stats?.laufende_projekte || 0}
        icon="folder_open"
        trendText="+2 diesen Monat"
        trendIcon="trending_up"
        trendType="positive"
      />
      <StatCard
        title="Offene Aufgaben"
        value={stats?.offene_aufgaben || 0}
        icon="assignment_turned_in"
        trendText="Konstant"
        trendIcon="remove"
        trendType="neutral"
      />
      <StatCard
        title="Budgetverbrauch"
        value={stats?.budgetverbrauch || "0%"}
        icon="account_balance_wallet"
        trendText="+5% vs. Plan"
        trendIcon="trending_up"
        trendType="negative"
      />
      <StatCard
        title="Teamleistung"
        value={stats?.teamleistung || "0%"}
        icon="groups"
        trendText="+1% diesen Monat"
        trendIcon="trending_up"
        trendType="positive"
      />
    </div>
  );
}
