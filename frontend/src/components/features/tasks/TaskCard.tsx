"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "review" | "completed";
  current_deadline: string | null;
  assignee_name: string | null;
  assignee_avatar?: string | null;
}

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return { bg: "bg-error-container", text: "text-on-error-container", dot: "bg-error", label: "Hoch" };
      case "medium":
        return { bg: "bg-warning/20", text: "text-warning", dot: "bg-warning", label: "Mittel" };
      default:
        return { bg: "bg-success/20", text: "text-success", dot: "bg-success", label: "Niedrig" };
    }
  };

  const pStyles = getPriorityStyles(task.priority);

  // If task is completed, use the disabled/completed style from Stitch
  if (task.status === "completed") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="task-card bg-surface/60 p-md rounded-DEFAULT border border-border flex flex-col gap-sm cursor-grab opacity-75 hover:opacity-100 transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-xs">
            <span className="px-2 py-0.5 rounded-full bg-success/20 text-success font-label-bold text-[10px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">done</span>
              Erledigt
            </span>
          </div>
          <span className="material-symbols-outlined text-success text-[16px]">check_circle</span>
        </div>
        <div>
          <h3 className="font-body-md text-body-md font-bold text-on-surface leading-snug line-through text-on-surface-variant">
            {task.title}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card bg-surface p-md pl-8 rounded-DEFAULT flex flex-col gap-sm cursor-grab group relative hover:-translate-y-[2px] hover:shadow-[0_14px_36px_rgba(45,55,95,0.08)] transition-all duration-200 ${
        task.status === "in_progress" 
          ? "border border-primary/30 shadow-[0_4px_12px_rgba(83,62,207,0.12)]" 
          : "border border-border"
      }`}
    >
      {task.status === "in_progress" && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-[#5c3be0] to-[#4478e8] rounded-t-DEFAULT"></div>
      )}

      <div className="drag-handle absolute left-1.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex flex-wrap gap-xs">
          <span className={`px-2 py-0.5 rounded-full ${pStyles.bg} ${pStyles.text} font-label-bold text-[10px] flex items-center gap-1`}>
            <div className={`w-1.5 h-1.5 rounded-full ${pStyles.dot}`}></div>
            {pStyles.label}
          </span>
          {task.status === "in_progress" && (
            <span className="px-2 py-0.5 rounded-full bg-surface-tint/10 text-primary font-label-bold text-[10px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
              Aktiv
            </span>
          )}
        </div>
        <span className="material-symbols-outlined text-outline text-[16px]">check_circle</span>
      </div>

      <div>
        <h3 className="font-body-md text-body-md font-bold text-on-surface leading-snug">
          {task.title}
        </h3>
        {task.description && (
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-xs pt-xs border-t border-border/50">
        <div className={`flex items-center gap-xs font-body-sm text-[11px] ${
          task.priority === "high" ? "text-error" : "text-on-surface-variant"
        }`}>
          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
          <span>
            {task.current_deadline
              ? new Date(task.current_deadline).toLocaleDateString("de-DE", { day: "numeric", month: "short" })
              : "Kein Datum"}
          </span>
        </div>
        
        {task.assignee_name && (
          <div className="flex items-center gap-1">
            {task.assignee_avatar ? (
              <img 
                src={task.assignee_avatar} 
                alt="Assignee" 
                className="w-6 h-6 rounded-full border border-surface object-cover" 
              />
            ) : (
              <div className="w-6 h-6 rounded-full border border-border bg-surface-container flex items-center justify-center font-label-bold text-[10px] text-on-surface" title={task.assignee_name}>
                {task.assignee_name.substring(0, 2).toUpperCase()}
              </div>
            )}
            {task.status === "in_progress" && (
              <div className="w-6 h-6 rounded-full border border-surface bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold" title="AI Agent Assigned">
                <span className="material-symbols-outlined text-[12px]">smart_toy</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
