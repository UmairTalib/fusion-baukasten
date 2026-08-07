"use client";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  next_step: string;
  is_at_risk: boolean;
  role: string;
}

export default function TeamMemberProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/projects", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="bg-surface rounded-xl border border-border ambient-shadow p-[24px]">
      <h3 className="font-h2 text-[18px] font-bold m-0 mb-[16px]">Meine Projekte</h3>
      <div className="flex flex-col gap-[16px]">
        {loading ? (
          <div className="text-on-surface-variant">Laden...</div>
        ) : projects.length === 0 ? (
          <div className="text-on-surface-variant">Keine Projekte gefunden.</div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="flex flex-col gap-[12px]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-[12px]">
                  <span className="font-body-md text-[14px] font-bold">{project.name}</span>
                  <span className="px-2 py-0.5 bg-tertiary-container/10 text-tertiary-container rounded text-[11px] font-bold tracking-wider">
                    {project.status}
                  </span>
                </div>
                <span className="font-body-sm text-[13px] text-on-surface-variant">
                  Meine Rolle: {project.role}
                </span>
              </div>
              <div 
                className="w-full h-2 bg-surface-container rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div 
                  className={`h-full ${project.is_at_risk ? 'bg-error' : 'bg-primary'}`} 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
