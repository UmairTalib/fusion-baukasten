'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/shared/ui/StatCard';

interface DashboardStats {
  meine_aufgaben: number;
  zugewiesene_projekte: number;
  arbeitsstunden: string;
  erledigt: number;
}

export default function TeamMemberKPIs() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/v1/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch team member stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] bg-surface/50 animate-pulse rounded-2xl border border-white" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
      <StatCard
        title="Meine Aufgaben"
        value={stats?.meine_aufgaben?.toString() || "0"}
        icon="task"
        trendText="+2 diese Woche"
        trendType="positive"
        trendIcon="trending_up"
      />
      <StatCard
        title="In Bearbeitung"
        value={(stats?.meine_aufgaben ? Math.floor(stats.meine_aufgaben / 2).toString() : "0")}
        icon="hourglass_empty"
        trendText="Aktiv"
        trendType="neutral"
      />
      <StatCard
        title="Abgeschlossen diese Woche"
        value={stats?.erledigt?.toString() || "0"}
        icon="check_circle"
        trendText="Top Leistung!"
        trendType="positive"
        trendIcon="star"
      />
      <StatCard
        title="Zugewiesene Projekte"
        value={stats?.zugewiesene_projekte?.toString() || "0"}
        icon="folder"
        trendText="Laufend"
        trendType="neutral"
      />
    </div>
  );
}
