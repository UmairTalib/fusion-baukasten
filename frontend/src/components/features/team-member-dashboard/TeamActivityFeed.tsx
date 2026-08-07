"use client";
import { useEffect, useState } from "react";

interface ActivityLog {
  id: string;
  project_name: string;
  action: string;
  details: string;
  created_at: string;
  actor_name: string;
}

export default function TeamActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/activity", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch activity logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `vor ${diffMins} Minuten`;
    if (diffHours < 24) return `vor ${diffHours} Stunden`;
    if (diffDays === 1) return `Gestern`;
    return `vor ${diffDays} Tagen`;
  };

  const mapActionToIconAndColor = (action: string) => {
    if (action.includes("completed")) return { icon: "done", bg: "bg-success/10", text: "text-success" };
    if (action.includes("comment")) return { icon: "comment", bg: "bg-tertiary-container/10", text: "text-tertiary-container" };
    if (action.includes("assigned")) return { icon: "add_task", bg: "bg-primary/10", text: "text-primary" };
    if (action.includes("file") || action.includes("attachment")) return { icon: "attachment", bg: "bg-surface-container-high", text: "text-on-surface-variant" };
    return { icon: "history", bg: "bg-surface-container-high", text: "text-on-surface-variant" };
  };

  return (
    <div className="bg-surface rounded-xl border border-border ambient-shadow p-[24px]">
      <h3 className="font-h2 text-[18px] font-bold m-0 mb-[16px]">Letzte Aktivitäten</h3>
      <div className="flex flex-col gap-[16px]">
        {loading ? (
          <div className="text-on-surface-variant">Laden...</div>
        ) : logs.length === 0 ? (
          <div className="text-on-surface-variant">Keine Aktivitäten gefunden.</div>
        ) : (
          logs.map((log) => {
            const { icon, bg, text } = mapActionToIconAndColor(log.action);
            
            return (
              <div key={log.id} className="flex items-start gap-[12px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg} ${text}`}>
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                </div>
                <div>
                  <p className="font-body-md text-[14px] m-0">
                    <span className="font-bold">{log.actor_name}</span>{" "}
                    {log.details || "hat eine Aktion durchgeführt."}
                  </p>
                  <p className="font-body-sm text-[13px] text-on-surface-variant mt-0.5 m-0">
                    {formatTimeAgo(log.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
