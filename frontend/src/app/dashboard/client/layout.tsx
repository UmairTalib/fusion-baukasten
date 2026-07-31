import Sidebar from "@/components/shared/layout/Sidebar";
import Topbar from "@/components/shared/layout/Topbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-workspace-bg">
      <Sidebar role="client" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar role="client" title="Kunden- & Gast-Portal" />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
