"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import TaskCard, { Task } from "./TaskCard";

const COLUMNS = [
  { id: "open", title: "To Do" },
  { id: "in_progress", title: "In Bearbeitung" },
  { id: "review", title: "Review" },
  { id: "completed", title: "Abgeschlossen" },
];

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/tasks/projects/${projectId}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/tasks/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverColumn = COLUMNS.some((col) => col.id === overId);

    // If dropping a task over a column
    if (isActiveTask && isOverColumn) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== overId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: overId as Task["status"] } : t))
        );
        updateTaskStatus(taskId, overId);
      }
      return;
    }

    // If dropping a task over another task
    if (isActiveTask && over.data.current?.type === "Task") {
      const task = tasks.find((t) => t.id === taskId);
      const overTask = tasks.find((t) => t.id === overId);

      if (task && overTask) {
        if (task.status !== overTask.status) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, status: overTask.status } : t
            )
          );
          updateTaskStatus(taskId, overTask.status);
        } else {
          // Reordering in same column
          setTasks((prev) => {
            const oldIndex = prev.findIndex((t) => t.id === taskId);
            const newIndex = prev.findIndex((t) => t.id === overId);
            return arrayMove(prev, oldIndex, newIndex);
          });
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-gutter kanban-board">
        <div className="flex gap-lg h-full pb-sm items-start w-max">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks.filter((t) => t.status === col.id)}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
