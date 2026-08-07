"use client";
import { useEffect, useState } from "react";

interface Deadline {
  id: string;
  title: string;
  due_date: string;
  project_name: string;
}

export default function UpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeadlines() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/upcoming-deadlines", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setDeadlines(data);
        }
      } catch (err) {
        console.error("Failed to fetch upcoming deadlines", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeadlines();
  }, []);

  const getUrgency = (dateString: string) => {
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { color: "bg-error", text: "text-error", label: diffDays === 0 ? "Heute" : "Überfällig" };
    if (diffDays <= 2) return { color: "bg-warning", text: "text-warning", label: diffDays === 1 ? "Morgen" : `In ${diffDays} Tagen` };
    return { color: "bg-success", text: "text-on-surface-variant", label: due.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) };
  };

  return (
    <div className="bg-surface rounded-xl border border-border ambient-shadow p-[24px] flex-1">
      <h3 className="font-h2 text-[18px] font-bold m-0 mb-[16px]">Kommende Deadlines</h3>
      <div className="flex flex-col gap-[16px] relative before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
        {loading ? (
          <div className="text-on-surface-variant pl-[24px]">Laden...</div>
        ) : deadlines.length === 0 ? (
          <div className="text-on-surface-variant pl-[24px]">Keine anstehenden Deadlines.</div>
        ) : (
          deadlines.map((item) => {
            const urgency = getUrgency(item.due_date);
            
            return (
              <div key={item.id} className="flex gap-[16px] relative z-10">
                <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 border-2 border-surface ${urgency.color}`}></div>
                <div>
                  <p className="font-body-md text-[14px] font-bold m-0">{item.title}</p>
                  <p className={`font-body-sm text-[13px] mt-0.5 m-0 ${urgency.text}`}>
                    {urgency.label} &bull; {item.project_name}
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
