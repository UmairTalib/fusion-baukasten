"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard, { Task } from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export default function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  const getBadgeColor = (colId: string) => {
    switch (colId) {
      case "open": return "bg-surface-container-high text-on-surface-variant";
      case "in_progress": return "bg-primary/10 text-primary";
      case "review": return "bg-surface-container-high text-on-surface-variant";
      case "completed": return "bg-success/20 text-success";
      default: return "bg-surface-container-high text-on-surface-variant";
    }
  };

  return (
    <div className="kanban-col min-w-[320px] max-w-[320px] flex flex-col max-h-full bg-surface-variant/40 rounded-lg border border-border">
      <div className="p-md border-b border-border/50 flex items-center justify-between sticky top-0 bg-surface-variant/40 backdrop-blur-sm rounded-t-lg z-10">
        <div className="flex items-center gap-sm">
          <h2 className="font-label-caps text-label-caps text-on-surface uppercase">{title}</h2>
          <span className={`px-2 py-0.5 rounded-full font-label-bold text-[10px] ${getBadgeColor(id)}`}>
            {tasks.length}
          </span>
        </div>
        <button className="text-outline hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className="p-sm flex flex-col gap-sm overflow-y-auto flex-1 min-h-[200px] custom-scrollbar"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="p-lg border-2 border-dashed border-border rounded-DEFAULT flex flex-col items-center justify-center text-center gap-sm mt-sm">
            <span className="material-symbols-outlined text-outline text-[24px]">
              {id === "review" ? "check_circle_outline" : "inventory_2"}
            </span>
            <p className="font-body-sm text-on-surface-variant text-[12px]">
              {id === "review" 
                ? "Ziehe Aufgaben hierher für den Review-Prozess." 
                : `Keine Aufgaben in ${title}.`}
            </p>
          </div>
        )}
      </div>

      {id === "open" && (
        <div className="p-sm pt-0">
          <button className="w-full flex items-center justify-center gap-xs py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-DEFAULT transition-colors font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Aufgabe hinzufügen
          </button>
        </div>
      )}
    </div>
  );
}
