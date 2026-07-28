"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Icons as inline SVGs to avoid icon library dependency for now
const Icon = {
  projects: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  tasks:    () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  comms:    () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  settings: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  logout:   () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  risk:     () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  report:   () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
};

// ── Types ──────────────────────────────────────────────────────
type Project = { id: string; name: string; status: string; progress: number; owner: string; deadline: string; };
type Task    = { id: string; title: string; project: string; priority: "high"|"low"; status: string; assignee: string; };

// ── Mock data (will be replaced by API calls) ──────────────────
const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Bürgerbeteiligung Stadtpark",  status: "active_execution", progress: 65, owner: "Umair Talib",   deadline: "2026-09-30" },
  { id: "2", name: "Workshop Jugendstrategie",     status: "idea_draft",       progress: 20, owner: "Maria Schmidt", deadline: "2026-10-15" },
  { id: "3", name: "Planungszelle Verkehrskonzept",status: "active_execution", progress: 82, owner: "Klaus Weber",   deadline: "2026-08-20" },
  { id: "4", name: "Online-Konsultation ÖPNV",     status: "paused",           progress: 40, owner: "Anna Müller",   deadline: "2026-11-01" },
];
const MOCK_TASKS: Task[] = [
  { id: "t1", title: "Finalize venue contract",     project: "Stadtpark",     priority: "high", status: "open",        assignee: "Umair" },
  { id: "t2", title: "Send invitations",            project: "Jugendstrategie",priority: "high", status: "in_progress", assignee: "Maria" },
  { id: "t3", title: "Prepare moderator brief",    project: "Verkehrskonzept",priority: "low",  status: "open",        assignee: "Klaus" },
  { id: "t4", title: "DSGVO consent forms",        project: "ÖPNV",          priority: "low",  status: "completed",   assignee: "Anna" },
];

const statusLabel: Record<string, { label: string; className: string }> = {
  active_execution: { label: "Active",    className: "badge-green"  },
  idea_draft:       { label: "Draft",     className: "badge-yellow" },
  paused:           { label: "Paused",    className: "badge-red"    },
  completed:        { label: "Completed", className: "badge-accent" },
};

// ─────────────────────────────────────────────────────────────
// Manager Dashboard
// Business_Logic documentation.docx, Section 3 — "Project Manager Dashboard"
// Purpose: overview, control, and decision-making across ALL projects.
// ─────────────────────────────────────────────────────────────
export default function ManagerDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("projects");
  const [copilotMode, setCopilotMode] = useState<"quick"|"thinking">("quick");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I'm your Fusion Co-Pilot. I can help you check project status, identify risks, review resources, or generate reports. What do you need?" }
  ]);

  function logout() {
    localStorage.clear();
    router.push("/login");
  }

  function sendMessage() {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    // AI response placeholder
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: "I'm analysing your projects… (AI response will be connected to the backend in Feature 4)" }]);
    }, 800);
  }

  const activeCount   = MOCK_PROJECTS.filter(p => p.status === "active_execution").length;
  const criticalTasks = MOCK_TASKS.filter(t => t.priority === "high" && t.status !== "completed").length;

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, background: "var(--role-manager)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", color: "#fff" }}>F</div>
            <div>
              <h2 style={{ fontSize: "0.95rem" }}>Fusion-Baukasten</h2>
              <span style={{ fontSize: "0.7rem", color: "var(--role-manager)" }}>Project Manager</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Overview</span>
          {[
            { key: "projects", label: "All Projects",       icon: Icon.projects },
            { key: "tasks",    label: "Tasks & Control",    icon: Icon.tasks    },
            { key: "risks",    label: "Risks & Bottlenecks",icon: Icon.risk     },
            { key: "reports",  label: "Reports",            icon: Icon.report   },
          ].map(item => (
            <button key={item.key} className={`nav-item ${activeNav === item.key ? "active" : ""}`} onClick={() => setActiveNav(item.key)}>
              <item.icon />{item.label}
            </button>
          ))}

          <span className="nav-section-title" style={{ marginTop: 12 }}>Communication</span>
          <button className={`nav-item ${activeNav === "comms" ? "active" : ""}`} onClick={() => setActiveNav("comms")}>
            <Icon.comms />Communication Center
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" style={{ color: "var(--red)" }} onClick={logout}>
            <Icon.logout />Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content" style={{ marginRight: 340 }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1>Project Manager Dashboard</h1>
              <p style={{ marginTop: 4 }}>Full overview of all projects, teams, and decisions.</p>
            </div>
            <button id="new-project-btn" className="btn btn-primary" onClick={() => router.push("/project/new")}>
              + New Project
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: "Active Projects",   value: activeCount,                         sub: `${MOCK_PROJECTS.length} total` },
            { label: "Critical Tasks",    value: criticalTasks,                       sub: "High priority, open"           },
            { label: "Completion Rate",   value: "74%",                               sub: "Across all projects"           },
            { label: "Avg. Duration",     value: "8 wks",                             sub: "Per project"                   },
          ].map((stat, i) => (
            <div key={i} className="stat-box animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* All Projects */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3>All Projects</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {["All", "Active", "Draft", "Paused"].map(f => (
                <button key={f} className="btn btn-ghost btn-sm">{f}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MOCK_PROJECTS.map(project => (
              <div key={project.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "var(--bg-raised)", borderRadius: "var(--radius)", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onClick={() => router.push(`/project/${project.id}`)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: "0.9rem" }}>{project.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Owner: {project.owner} · Due: {project.deadline}</div>
                </div>
                <div style={{ width: 120 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>{project.progress}%</div>
                </div>
                <span className={`badge ${statusLabel[project.status]?.className}`}>
                  {statusLabel[project.status]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks & Control */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Tasks Across All Projects</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_TASKS.map(task => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-raised)", borderRadius: "var(--radius)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: "0.88rem", marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{task.project} · {task.assignee}</div>
                </div>
                <span className={`badge ${task.priority === "high" ? "badge-red" : "badge-accent"}`}>{task.priority}</span>
                <span className={`badge ${task.status === "completed" ? "badge-green" : task.status === "in_progress" ? "badge-yellow" : "badge-accent"}`}>
                  {task.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Fusion Co-Pilot Panel (Business Logic Section 4) ── */}
      <aside className="copilot-panel">
        <div className="copilot-header">
          <div>
            <h3>Fusion Co-Pilot</h3>
            <span style={{ fontSize: "0.72rem", color: "var(--role-manager)" }}>Manager Mode</span>
          </div>
          <div className="copilot-mode-toggle">
            <button className={`mode-btn ${copilotMode === "quick" ? "active" : ""}`} onClick={() => setCopilotMode("quick")}>Quick</button>
            <button className={`mode-btn ${copilotMode === "thinking" ? "active" : ""}`} onClick={() => setCopilotMode("thinking")}>Thinking</button>
          </div>
        </div>

        <div className="copilot-messages" id="copilot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg msg-${msg.role} animate-in`}>
              <div className="msg-bubble">{msg.content}</div>
            </div>
          ))}
        </div>

        <div className="copilot-input-area">
          <div style={{ display: "flex", gap: 8 }}>
            <input id="copilot-input" className="form-input" placeholder="Ask about risks, resources, status…" value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()} />
            <button id="copilot-send" className="btn btn-primary" onClick={sendMessage} style={{ flexShrink: 0 }}>→</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
