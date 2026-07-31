"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface UserSession {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  system_role: string;
}

export default function Topbar({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    // Fetch the current user session from the backend
    const fetchSession = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/auth/session", {
          credentials: "include"
        });

        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
      }
    };

    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.error(e);
    }
    
    localStorage.removeItem("role");
    localStorage.removeItem("guest_session_id");
    document.cookie = "role=; path=/; max-age=0";
    
    router.push("/login");
  };

  // Format the role for display
  const displayRole = session?.system_role === "project_manager" 
    ? "Projektmanager" 
    : session?.system_role === "team_member" 
      ? "Teammitglied" 
      : "Gast / Kunde";

  const displayName = session ? `${session.first_name} ${session.last_name}` : "Gast";

  return (
    <header className="flex justify-between items-center h-16 px-4 md:px-8 w-full backdrop-blur-md bg-surface/92 border-b border-outline-variant shadow-sm z-40 sticky top-0">
      {/* Dynamic Title & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobileMenu}
          className="md:hidden text-on-surface-variant hover:text-primary p-1 -ml-1"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <h2 className="text-[18px] font-semibold text-on-surface">Übersicht</h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Role Badge */}
        {session && (
          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-surface-container border border-line text-[11px] font-normal text-[#2d375b]">
            {displayRole}
          </span>
        )}

        {/* Notification Bell */}
        <button className="relative text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95 duration-200">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#f05a5a] rounded-full animate-ping"></span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#f05a5a] rounded-full"></span>
        </button>

        {/* Profile Avatar & Dropdown Trigger */}
        <div 
          className="flex items-center gap-3 cursor-pointer pl-4 border-l border-line relative"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img 
            alt="User Avatar" 
            className="w-8 h-8 rounded-full object-cover border border-line" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPH5QJBEViVRFwLZTO00fDDa75xdvOYpqagQbZ7ibCH-O5A-mVArRMiypdgxBD7Tv_nOb8W0-i4YlOLjlMi-8wbBhgs-W2aEoVhae45qh2mk3Y0_pJvizZ74WLWPWtCTFsSlujFfNCYcp5nA-R6nsX_kK4UiCcngUtiBN0iFq5bPD5ea4V842jdGaFvUU-zDH_eVrfSDf3rvqWvdZql_c4vccDuskpTcRWmq4l55HfYfD6ViJdioqEFg" 
          />
          <div className="hidden md:block">
            <p className="text-[13px] font-medium text-[#0a1230]">{displayName}</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            expand_more
          </span>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-line py-2">
              <div className="px-4 py-2 mb-1 border-b border-line">
                <p className="text-[12px] text-on-surface-variant truncate">{session?.email}</p>
              </div>
              <a className="block px-4 py-2 text-[13px] text-on-surface hover:bg-surface-container-low" href="#">
                Profil bearbeiten
              </a>
              <button 
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-[13px] text-[#f05a5a] hover:bg-error-container"
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
