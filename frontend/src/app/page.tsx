import { Sidebar } from "@/components/layout/Sidebar";
import { Copilot } from "@/components/layout/Copilot";
import { Workspace } from "@/components/layout/Workspace";

export default function Dashboard() {
  return (
    <div className="flex bg-fusion-bg min-h-screen">
      <Sidebar />
      <Copilot />
      <Workspace />
    </div>
  );
}
