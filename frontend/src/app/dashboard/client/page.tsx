"use client";

import ProjectStatusTracker from "@/components/features/client-dashboard/ProjectStatusTracker";
import { Sparkles, UserPlus, FileText, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClientDashboard() {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is in guest mode via role or token check
    const role = localStorage.getItem("role");
    const guestId = localStorage.getItem("guest_session_id");
    if (!role || role === "guest" || guestId) {
      setIsGuest(true);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Guest Mode Alert Banner */}
      {isGuest && (
        <div className="bg-amber/10 border border-amber/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber/20 text-amber rounded-xl flex-shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-body-lg font-bold text-on-surface">Sie nutzen den Gast-Modus</h3>
              <p className="text-body-sm text-on-surface-variant">
                Ihr Fortschritt wird temporär gespeichert. Registrieren Sie sich kostenlos, um Ihre Projekte dauerhaft zu sichern.
              </p>
            </div>
          </div>

          <Link
            href="/register"
            className="px-4 py-2 bg-amber text-on-secondary-fixed font-bold text-body-sm rounded-xl hover:opacity-90 transition-opacity flex-shrink-0 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Konto erstellen</span>
          </Link>
        </div>
      )}

      {/* Main Project Status Component */}
      <ProjectStatusTracker />

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-surface p-6 rounded-2xl border border-line flex items-center justify-between hover:border-primary/40 transition-all">
          <div className="space-y-1">
            <h3 className="font-bold text-on-surface text-subheading">Neues Konzept starten</h3>
            <p className="text-body-sm text-on-surface-variant">Erstellen Sie ein neues Bürgerbeteiligungsverfahren</p>
          </div>
          <Link
            href="/dashboard/client/wizard"
            className="p-3 bg-primary-container text-on-secondary-container rounded-xl hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-5 h-5" />
          </Link>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-line flex items-center justify-between hover:border-primary/40 transition-all">
          <div className="space-y-1">
            <h3 className="font-bold text-on-surface text-subheading">Methoden-Handbuch</h3>
            <p className="text-body-sm text-on-surface-variant">Stöbern Sie im Katalog von 20 Beteiligungsformen</p>
          </div>
          <Link
            href="/dashboard/client/help"
            className="p-3 bg-surface-container-low text-on-surface rounded-xl hover:bg-surface-container-high transition-colors"
          >
            <FileText className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
