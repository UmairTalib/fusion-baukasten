"use client";

import React, { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  next_step: string;
  is_at_risk?: boolean;
}

export default function ActiveProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/projects", {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-line p-[18px] transition-transform duration-300 hover:-translate-y-1 w-full" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-on-surface">Aktive Projekte</h3>
        <button className="text-primary hover:text-primary-fixed-variant text-[13px] font-medium transition-colors">
          Alle ansehen
        </button>
      </div>
      <div className="overflow-x-auto w-full">
        {loading ? (
          <div className="flex justify-center p-8">
            <span className="animate-spin material-symbols-outlined text-[24px] text-primary">progress_activity</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center p-4 text-on-surface-variant text-[13px]">
            Keine aktiven Projekte gefunden.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-line text-on-surface-variant text-[11px] font-extrabold uppercase tracking-wider">
                <th className="pb-3">Projektname</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Fortschritt</th>
                <th className="pb-3">Nächster Schritt</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {projects.map((project, index) => (
                <tr key={project.id} className={`${index !== projects.length - 1 ? 'border-b border-line' : ''} hover:bg-surface-container-low transition-colors`}>
                  <td className="py-4 font-medium text-on-surface">{project.name}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 font-medium rounded text-[11px] ${
                        project.status === 'Entwurf' ? 'bg-surface-container text-on-surface-variant' : 'bg-surface-container-highest text-primary'
                      }`}>
                        {project.status}
                      </span>
                      {project.is_at_risk && (
                        <span className="inline-flex px-2 py-1 font-medium rounded text-[11px] bg-[#ffdad6] text-[#ba1a1a]">
                          Verzögert
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${project.progress < 50 ? 'bg-[#f0a12a]' : project.progress >= 90 ? 'bg-[#28a86f]' : 'bg-primary'}`} 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-on-surface-variant">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-on-surface-variant">{project.next_step}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
