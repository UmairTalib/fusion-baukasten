"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project_name: string;
  assignee_avatar?: string | null;
}

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Offen", color: "text-on-surface-variant", bg: "bg-surface-container-high" },
  in_progress: { label: "In Bearbeitung", color: "text-warning", bg: "bg-warning/10" },
  review: { label: "Review", color: "text-tertiary-container", bg: "bg-tertiary-container/10" },
  completed: { label: "Erledigt", color: "text-success", bg: "bg-success/10" },
};

const priorityMap: Record<string, string> = {
  high: "bg-error",
  normal: "bg-warning",
  low: "bg-outline-variant",
};

export default function TeamMemberTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "overdue">("all");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard/tasks", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    
    if (!task.due_date) return filter === "all";
    const due = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    if (filter === "today") return due.getTime() === today.getTime();
    if (filter === "overdue") return due.getTime() < today.getTime() && task.status !== "completed";
    return true;
  });

  const getRelativeDate = (dateString: string | null) => {
    if (!dateString) return "";
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Heute";
    if (diffDays === 1) return "Morgen";
    if (diffDays === -1) return "Gestern";
    if (diffDays < 0) return "Überfällig";
    
    return due.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-surface rounded-xl border border-border ambient-shadow flex flex-col flex-1 h-full">
      <div className="p-[24px] border-b border-border flex justify-between items-center">
        <h3 className="font-h2 text-[18px] font-bold m-0">Meine Aufgaben</h3>
        <div className="flex bg-surface-container-low p-1 rounded-lg gap-1">
          <button 
            onClick={() => setFilter("all")}
            className={`px-[12px] py-1 rounded shadow-sm font-body-sm text-[13px] font-bold transition-all ${filter === "all" ? "bg-surface text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            Alle
          </button>
          <button 
            onClick={() => setFilter("today")}
            className={`px-[12px] py-1 rounded shadow-sm font-body-sm text-[13px] font-bold transition-all ${filter === "today" ? "bg-surface text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            Heute fällig
          </button>
          <button 
            onClick={() => setFilter("overdue")}
            className={`px-[12px] py-1 rounded shadow-sm font-body-sm text-[13px] font-bold transition-all ${filter === "overdue" ? "bg-surface text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            Überfällig
          </button>
        </div>
      </div>
      
      <div className="p-0 flex flex-col overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="p-4 text-center text-on-surface-variant">Laden...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-4 text-center text-on-surface-variant">Keine Aufgaben gefunden.</div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
            
            return (
              <div 
                key={task.id} 
                className={`flex items-center gap-[16px] p-[16px] border-b border-border hover:bg-bg-subtle smooth-transition cursor-pointer ${isCompleted ? 'opacity-70' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${priorityMap[task.priority] || priorityMap.low}`}></div>
                <div className="flex-1">
                  <p className={`font-body-md text-[14px] font-bold m-0 ${isCompleted ? 'line-through text-on-surface-variant' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-[12px] mt-1">
                    <span className="px-2 py-0.5 bg-surface-container rounded text-[11px] font-bold tracking-wider text-on-surface-variant">
                      {task.project_name}
                    </span>
                    {task.due_date && (
                      <span className={`font-body-sm text-[13px] ${isOverdue ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                        {getRelativeDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
                
                <span className={`px-[12px] py-1 rounded-full text-[11px] font-bold tracking-wider ${statusMap[task.status]?.bg || 'bg-surface-container-high'} ${statusMap[task.status]?.color || 'text-on-surface-variant'}`}>
                  {statusMap[task.status]?.label || task.status}
                </span>
                
                {task.assignee_avatar ? (
                  <Image 
                    src={task.assignee_avatar} 
                    alt="Assignee" 
                    width={32} 
                    height={32} 
                    className="rounded-full border border-border ml-[12px]" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-border ml-[12px] bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
