import { mockProjects } from "@/services/mockData";
import Badge from "@/components/shared/ui/Badge";
import Avatar from "@/components/shared/ui/Avatar";
import { FolderKanban, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";

export default function ProjectListTable() {
  const statusBadgeVariant = {
    Aktiv: "success" as const,
    Entwurf: "warning" as const,
    Abgeschlossen: "neutral" as const,
  };

  return (
    <div className="bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 flex items-center justify-between border-b border-line">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-container/10 text-primary rounded-xl">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-subheading text-on-surface font-semibold">Aktuelle Projekte</h2>
            <p className="text-caption-tiny text-on-surface-variant">Übersicht aller Beteiligungsprozesse</p>
          </div>
        </div>

        <button className="btn-primary px-4 py-2 text-body-sm font-semibold flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Neues Projekt</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-caption-tiny uppercase text-on-surface-variant font-bold border-b border-line">
              <th className="py-3 px-6">Projektname</th>
              <th className="py-3 px-6">Kategorie</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Fortschritt</th>
              <th className="py-3 px-6">Verantwortlicher</th>
              <th className="py-3 px-6 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-body-sm">
            {mockProjects.map((proj) => (
              <tr key={proj.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6 font-semibold text-on-surface">
                  <Link href={`/dashboard/project-manager/projects/${proj.id}`} className="hover:underline hover:text-primary">
                    {proj.title}
                  </Link>
                </td>
                <td className="py-4 px-6 text-on-surface-variant">{proj.category}</td>
                <td className="py-4 px-6">
                  <Badge variant={statusBadgeVariant[proj.status]} size="sm">
                    {proj.status}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-caption-tiny font-bold text-on-surface-variant">{proj.progress}%</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Avatar name={proj.owner} size="sm" />
                    <span className="text-on-surface">{proj.owner}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
