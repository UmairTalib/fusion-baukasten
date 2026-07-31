export interface MockProject {
  id: string;
  title: string;
  category: string;
  status: "Entwurf" | "Aktiv" | "Abgeschlossen";
  progress: number;
  dueDate: string;
  budget: string;
  owner: string;
  teamCount: number;
}

export interface MockTask {
  id: string;
  title: string;
  projectTitle: string;
  priority: "Hoch" | "Mittel" | "Niedrig";
  status: "Offen" | "In Bearbeitung" | "Erledigt";
  dueDate: string;
  assignee: string;
}

export interface MockActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export const mockProjects: MockProject[] = [
  {
    id: "proj_1",
    title: "Neugestaltung Stadtpark Mitte",
    category: "Stadtplanung & Grünflächen",
    status: "Aktiv",
    progress: 65,
    dueDate: "15.11.2026",
    budget: "45.000 €",
    owner: "Max Mustermann",
    teamCount: 4,
  },
  {
    id: "proj_2",
    title: "Bürgerhaushalt 2027",
    category: "Finanzen & Partizipation",
    status: "Entwurf",
    progress: 20,
    dueDate: "01.03.2027",
    budget: "100.000 €",
    owner: "Laura Schmidt",
    teamCount: 6,
  },
  {
    id: "proj_3",
    title: "Radverkehrskonzept Weststadt",
    category: "Mobilität",
    status: "Aktiv",
    progress: 85,
    dueDate: "30.09.2026",
    budget: "25.000 €",
    owner: "Max Mustermann",
    teamCount: 3,
  },
  {
    id: "proj_4",
    title: "Klimaschutzinitiative Jugend",
    category: "Umwelt & Jugend",
    status: "Abgeschlossen",
    progress: 100,
    dueDate: "01.06.2026",
    budget: "12.000 €",
    owner: "Felix Weber",
    teamCount: 2,
  },
];

export const mockTasks: MockTask[] = [
  {
    id: "task_1",
    title: "Methoden-Katalog für Block D freigeben",
    projectTitle: "Neugestaltung Stadtpark Mitte",
    priority: "Hoch",
    status: "In Bearbeitung",
    dueDate: "Morgen",
    assignee: "Max Mustermann",
  },
  {
    id: "task_2",
    title: "Zielgruppen-Fragebogen (Block C) prüfen",
    projectTitle: "Bürgerhaushalt 2027",
    priority: "Mittel",
    status: "Offen",
    dueDate: "In 3 Tagen",
    assignee: "Laura Schmidt",
  },
  {
    id: "task_3",
    title: "PDF-Abschlussbericht exportieren",
    projectTitle: "Klimaschutzinitiative Jugend",
    priority: "Niedrig",
    status: "Erledigt",
    dueDate: "Gestern",
    assignee: "Felix Weber",
  },
];

export const mockActivities: MockActivity[] = [
  {
    id: "act_1",
    user: "Laura Schmidt",
    action: "hat Block C (Zielgruppen) ausgefüllt in",
    target: "Bürgerhaushalt 2027",
    time: "Vor 15 Min",
  },
  {
    id: "act_2",
    user: "Max Mustermann",
    action: "hat die Methode 'Online-Ideenkarte' hinzugefügt zu",
    target: "Neugestaltung Stadtpark Mitte",
    time: "Vor 1 Std",
  },
  {
    id: "act_3",
    user: "System",
    action: "hat ein Backup erstellt für",
    target: "Radverkehrskonzept Weststadt",
    time: "Vor 3 Std",
  },
];
