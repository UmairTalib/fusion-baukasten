"use client";

import React, { useEffect, useState } from "react";

interface ActivityLog {
  id: string;
  project_name: string;
  action: string;
  details: string;
  created_at: string;
  actor_name: string;
}

export default function ActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/activity", {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch activity logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Vor ${diffMins} Min`;
    if (diffHours < 24) return `Vor ${diffHours} Std`;
    if (diffDays === 1) return `Gestern`;
    return `Vor ${diffDays} Tagen`;
  };

  const mapActionToIcon = (action: string) => {
    if (action.includes("task")) return "task_alt";
    if (action.includes("project")) return "rocket_launch";
    if (action.includes("message")) return "chat";
    return "history";
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-line p-6 flex items-center justify-center min-h-[300px]">
        <span className="animate-spin material-symbols-outlined text-primary text-3xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-line flex flex-col h-full">
      <div className="p-5 border-b border-line flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-on-surface">Letzte Aktivitäten</h2>
        <span className="material-symbols-outlined text-outline">history</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 max-h-[400px]">
        {logs.length === 0 ? (
          <div className="text-center text-outline py-8">Keine Aktivitäten gefunden.</div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-line">
            {logs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant shrink-0 z-10 border-4 border-surface">
                  <span className="material-symbols-outlined text-[18px]">
                    {mapActionToIcon(log.action)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-[14px] text-on-surface">
                    <span className="font-semibold">{log.actor_name}</span>{" "}
                    hat im Projekt <span className="font-medium text-primary">{log.project_name}</span> gearbeitet.
                  </div>
                  <div className="text-[13px] text-outline mt-1">{log.details}</div>
                  <div className="text-[12px] text-outline/80 mt-1 font-medium">
                    {formatTimeAgo(log.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
