import { mockTasks } from "@/services/mockData";
import Badge from "@/components/shared/ui/Badge";
import { CheckSquare, Calendar, AlertCircle } from "lucide-react";

export default function AssignedTaskList() {
  const priorityVariant = {
    Hoch: "error" as const,
    Mittel: "warning" as const,
    Niedrig: "neutral" as const,
  };

  return (
    <div className="bg-surface rounded-2xl border border-line p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-line">
        <CheckSquare className="w-5 h-5 text-primary" />
        <h2 className="text-subheading text-on-surface font-semibold">Meine Aufgaben</h2>
      </div>

      <div className="space-y-4">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            className="p-4 rounded-xl border border-line bg-surface-container-lowest hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface text-body-lg">{task.title}</span>
                <Badge variant={priorityVariant[task.priority]} size="sm">
                  {task.priority}
                </Badge>
              </div>
              <p className="text-body-sm text-on-surface-variant">{task.projectTitle}</p>
            </div>

            <div className="flex items-center gap-4 text-caption-tiny text-on-surface-variant">
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-outline" />
                <span>{task.dueDate}</span>
              </div>

              <button className="px-3 py-1.5 bg-primary-container text-on-secondary-container rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Als erledigt markieren
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
