import { mockProjects } from "@/services/mockData";
import Badge from "@/components/shared/ui/Badge";
import { Sparkles, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default function ProjectStatusTracker() {
  const currentProject = mockProjects[0]; // Active project example

  return (
    <div className="bg-surface rounded-2xl border border-line p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div>
          <span className="text-caption-tiny text-primary font-bold uppercase tracking-wider">Aktuelles Projekt</span>
          <h2 className="text-subheading text-on-surface font-bold mt-1">{currentProject.title}</h2>
        </div>
        <Badge variant="success">{currentProject.status}</Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-body-sm">
          <span className="text-on-surface-variant font-medium">Gesamtfortschritt (7 Blöcke)</span>
          <span className="font-bold text-primary">{currentProject.progress}%</span>
        </div>
        <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
            style={{ width: `${currentProject.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 bg-surface-container-low rounded-xl border border-line">
          <span className="text-caption-tiny text-on-surface-variant block mb-1">Kategorie</span>
          <span className="font-semibold text-on-surface text-body-sm">{currentProject.category}</span>
        </div>
        <div className="p-4 bg-surface-container-low rounded-xl border border-line">
          <span className="text-caption-tiny text-on-surface-variant block mb-1">Geplante Fertigstellung</span>
          <div className="flex items-center gap-1.5 font-semibold text-on-surface text-body-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>{currentProject.dueDate}</span>
          </div>
        </div>
        <div className="p-4 bg-surface-container-low rounded-xl border border-line">
          <span className="text-caption-tiny text-on-surface-variant block mb-1">Budgetrahmen</span>
          <span className="font-semibold text-on-surface text-body-sm">{currentProject.budget}</span>
        </div>
      </div>

      {/* CTA Button to open Core Flow / Wizard */}
      <div className="pt-2">
        <Link
          href="/dashboard/client/wizard"
          className="btn-primary w-full py-3 px-6 text-body-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span>Beteiligungskonzept weiterbearbeiten</span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
