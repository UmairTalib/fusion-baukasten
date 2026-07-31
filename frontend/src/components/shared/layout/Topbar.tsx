"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Bell } from "lucide-react";
import { useState } from "react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

interface TopbarProps {
  role: "project_manager" | "team_member" | "client";
  title?: string;
  userName?: string;
}

export default function Topbar({ role, title = "Dashboard", userName = "Max Mustermann" }: TopbarProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("guest_session_id");
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    document.cookie = "guest_session_id=; path=/; max-age=0";
    router.push("/login");
  };

  const roleBadgeMap = {
    project_manager: { label: "Projektmanager", variant: "primary" as const },
    team_member: { label: "Teammitglied", variant: "success" as const },
    client: { label: "Kunde / Gast", variant: "warning" as const },
  };

  const currentBadge = roleBadgeMap[role] || roleBadgeMap.client;

  return (
    <header className="h-16 border-b border-line bg-surface px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Title */}
      <h1 className="text-subheading text-on-surface font-bold">{title}</h1>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <Badge variant={currentBadge.variant}>{currentBadge.label}</Badge>

        {/* Notifications Icon (Placeholder) */}
        <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-surface-container-low transition-colors"
          >
            <Avatar name={userName} size="md" />
            <span className="text-body-sm font-medium text-on-surface hidden md:inline-block">
              {userName}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl border border-line shadow-lg py-2 z-20">
              <div className="px-4 py-2 border-b border-line">
                <p className="text-body-sm font-semibold text-on-surface truncate">{userName}</p>
                <p className="text-caption-tiny text-on-surface-variant capitalize">{role.replace("_", " ")}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-error hover:bg-error-container/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Abmelden</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
