"use client";

import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("guest_session_id");
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    document.cookie = "guest_session_id=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-workspace-bg p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-page-title text-on-surface">Client Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-error-container text-on-error-container rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Logout
        </button>
      </div>
      <p className="text-body-lg text-on-surface-variant mt-4">
        Welcome to the Client view. This page is currently a placeholder.
      </p>
    </div>
  );
}
