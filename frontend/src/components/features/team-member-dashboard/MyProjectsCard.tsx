'use client';

import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  role: string;
}

export default function MyProjectsCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/v1/dashboard/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white shadow-[0_14px_36px_rgba(45,55,95,0.08)] flex flex-col mb-[24px]">
      <div className="p-[24px] border-b border-line flex justify-between items-center bg-white/50">
        <h2 className="text-h2 text-on-surface">Meine Projekte</h2>
        <span className="material-symbols-outlined text-outline">workspaces</span>
      </div>
      
      <div className="p-[24px] flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <span className="animate-spin material-symbols-outlined text-[24px] text-primary">progress_activity</span>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-outline text-sm text-center">Keine Projekte zugewiesen.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="group cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[14px] font-bold text-on-surface group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-[12px] text-outline mt-0.5">Rolle: {project.role}</p>
                </div>
                <span className="text-[12px] font-bold text-primary">{project.progress}%</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-ai-gradient h-2 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
