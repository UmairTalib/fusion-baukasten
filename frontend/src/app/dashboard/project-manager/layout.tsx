import Sidebar from "@/components/shared/layout/Sidebar";
import Topbar from "@/components/shared/layout/Topbar";

export default function ProjectManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-workspace-bg">
      <Sidebar role="project_manager" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar role="project_manager" title="Projekt-Manager Übersicht" />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
