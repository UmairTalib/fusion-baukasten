"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  CheckSquare, 
  FileText, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  role: "project_manager" | "team_member" | "client";
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const roleNavItems: Record<SidebarProps["role"], NavItem[]> = {
    project_manager: [
      { label: "Übersicht", href: "/dashboard/project-manager", icon: LayoutDashboard },
      { label: "Projekte", href: "/dashboard/project-manager/projects", icon: FolderKanban },
      { label: "Team", href: "/dashboard/project-manager/team", icon: Users },
      { label: "Aufgaben", href: "/dashboard/project-manager/tasks", icon: CheckSquare },
      { label: "Berichte", href: "/dashboard/project-manager/reports", icon: FileText },
    ],
    team_member: [
      { label: "Meine Aufgaben", href: "/dashboard/team-member", icon: CheckSquare },
      { label: "Projekte", href: "/dashboard/team-member/projects", icon: FolderKanban },
      { label: "Dateien & Notizen", href: "/dashboard/team-member/docs", icon: FileText },
    ],
    client: [
      { label: "Mein Projekt", href: "/dashboard/client", icon: FolderKanban },
      { label: "Projekt starten", href: "/dashboard/client/wizard", icon: LayoutDashboard },
      { label: "Hilfe & Support", href: "/dashboard/client/help", icon: HelpCircle },
    ],
  };

  const navItems = roleNavItems[role] || roleNavItems.client;

  return (
    <aside
      className={`relative flex flex-col h-screen bg-surface border-r border-line transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 p-5 border-b border-line">
        <div className="brand-box flex-shrink-0">F</div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-extrabold text-on-surface text-lg leading-tight truncate">
              Fusion
            </span>
            <span className="text-caption-tiny text-on-surface-variant uppercase tracking-wider font-semibold">
              Baukasten
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-body-lg transition-all ${
                isActive
                  ? "bg-primary-container text-on-secondary-container shadow-sm font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle Button */}
      <div className="p-3 border-t border-line flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-caption-tiny text-outline px-2">v0.1.0 MVP</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors ml-auto"
          title={isCollapsed ? "Menü ausklappen" : "Menü einklappen"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
