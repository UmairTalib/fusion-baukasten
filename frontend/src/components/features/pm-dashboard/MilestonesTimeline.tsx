"use client";

import React, { useEffect, useState } from "react";

interface Milestone {
  id: string;
  title: string;
  due_date: string;
  project_name: string;
}

export default function MilestonesTimeline() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/milestones", {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setMilestones(data);
        }
      } catch (err) {
        console.error("Failed to fetch milestones", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Geplant";
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-line p-[18px] transition-transform duration-300 hover:-translate-y-1 h-fit w-full" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
      <h3 className="text-[18px] font-bold text-on-surface mb-6">Kommende Meilensteine</h3>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <span className="animate-spin material-symbols-outlined text-[24px] text-primary">progress_activity</span>
        </div>
      ) : milestones.length === 0 ? (
        <div className="text-center p-4 text-on-surface-variant text-[13px]">
          Keine ausstehenden Meilensteine.
        </div>
      ) : (
        <div className="relative border-l-2 border-line ml-3 space-y-6">
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="relative pl-6">
              {idx === 0 ? (
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-surface"></div>
              ) : (
                <div className="absolute w-3 h-3 bg-surface-container-highest border-2 border-primary rounded-full -left-[7px] top-1.5 ring-4 ring-surface"></div>
              )}
              <p className={`text-[11px] font-extrabold tracking-wider uppercase mb-1 ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                {formatDate(milestone.due_date)}
              </p>
              <p className="text-[13px] font-medium text-on-surface mb-0.5">{milestone.title}</p>
              <p className="text-[11px] text-on-surface-variant">{milestone.project_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
