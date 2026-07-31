import { mockActivities } from "@/services/mockData";
import Avatar from "@/components/shared/ui/Avatar";
import { Activity } from "lucide-react";

export default function RecentActivityFeed() {
  return (
    <div className="bg-surface rounded-2xl border border-line p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-line">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-subheading text-on-surface font-semibold">Letzte Aktivitäten</h2>
      </div>

      <div className="space-y-4">
        {mockActivities.map((act) => (
          <div key={act.id} className="flex items-start gap-3 text-body-sm">
            <Avatar name={act.user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-on-surface">
                <span className="font-semibold">{act.user}</span> {act.action}{" "}
                <span className="font-semibold text-primary">{act.target}</span>
              </p>
              <span className="text-caption-tiny text-on-surface-variant">{act.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
