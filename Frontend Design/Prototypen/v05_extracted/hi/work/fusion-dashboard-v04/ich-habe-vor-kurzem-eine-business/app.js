const navButtons = document.querySelectorAll("[data-view]");
const screens = document.querySelectorAll(".screen");
const copilot = document.querySelector("#copilot");
const copilotToggle = document.querySelector("#copilotToggle");
const agentForm = document.querySelector("#agentForm");
const agentInput = document.querySelector("#agentInput");
const agentChat = document.querySelector("#agentChat");
const modeButtons = document.querySelectorAll("[data-mode]");
const modeLabel = document.querySelector("#modeLabel");
const modeDescription = document.querySelector("#modeDescription");
const toast = document.querySelector("#toast");
const taskList = document.querySelector("#taskList");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const guestLogin = document.querySelector("#guestLogin");
const modalBackdrop = document.querySelector("#modalBackdrop");
const modalForm = document.querySelector("#modalForm");
const modalClose = document.querySelector("#modalClose");
const modalCancel = document.querySelector("#modalCancel");
const modalTitle = document.querySelector("#modalTitle");
const modalEyebrow = document.querySelector("#modalEyebrow");
const modalType = document.querySelector("#modalType");
const modalName = document.querySelector("#modalName");
const modalDate = document.querySelector("#modalDate");
const modalTime = document.querySelector("#modalTime");
const modalProject = document.querySelector("#modalProject");
const modalDescription = document.querySelector("#modalDescription");
const coreDialogueStream = document.querySelector("#coreDialogueStream");
const coreInput = document.querySelector("#coreInput");
const coreSend = document.querySelector("#coreSend");
const coreChoiceRow = document.querySelector("#coreChoiceRow");
const coreProgressText = document.querySelector("#coreProgressText");
const coreProgressBar = document.querySelector("#coreProgressBar");
const coreBlockCounter = document.querySelector("#coreBlockCounter");
const coreSaveTime = document.querySelector("#coreSaveTime");
const coreSavedStatus = document.querySelector("#coreSavedStatus");
const coreContextStatus = document.querySelector("#coreContextStatus");
const coreCollabStatus = document.querySelector("#coreCollabStatus");
const coreStatusBox = document.querySelector("#coreStatusBox");
const coreBack = document.querySelector("#coreBack");
const coreSave = document.querySelector("#coreSave");
const coreNext = document.querySelector("#coreNext");
const generatedToolkit = document.querySelector("#generatedToolkit");
const generatedToolkitText = document.querySelector("#generatedToolkitText");
const downloadToolkit = document.querySelector("#downloadToolkit");
const startDemo = document.querySelector("#startDemo");
const aiActivityTimeline = document.querySelector("#aiActivityTimeline");
const taskTableBody = document.querySelector("#taskTableBody");
const kanbanOpen = document.querySelector("#kanbanOpen");
const generatedCalendarCell = document.querySelector("#generatedCalendarCell");
const reportsTable = document.querySelector("#reportsTable");
const toolkitChecklistColumns = document.querySelector("#toolkitChecklistColumns");
const toolkitRecommendationCards = document.querySelector("#toolkitRecommendationCards");

let activeAgentMode = "quick";
let activeCalendarMonth = 4;
let activeCalendarYear = 2025;
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const coreSteps = [
  {
    title: "Zielgruppe definieren",
    question: "Welche Zielgruppe ist für dein Projekt am wichtigsten? Nenne bitte Alter, Rolle oder Organisation.",
    hint: "Beispiel: Jugendliche zwischen 15 und 25 Jahren, Schulen und Jugendzentren.",
  },
  {
    title: "Ausgangslage & Kontext",
    question: "Was ist die aktuelle Ausgangslage und warum ist das Projekt jetzt relevant?",
    hint: "Beispiel: Es gibt wenig Beteiligung und Nachhaltigkeit soll praktisch erlebbar werden.",
  },
  {
    title: "Ziele & Anforderungen",
    question: "Welche konkreten Ziele soll das Projekt erreichen?",
    hint: "Beispiel: 40 Teilnehmende, 3 Workshop-Termine, konkrete Ideen am Ende.",
  },
  {
    title: "Rahmenbedingungen",
    question: "Welche Rahmenbedingungen gelten: Zeitraum, Budget, Ort, Format oder Ressourcen?",
    hint: "Beispiel: Präsenz-Workshop in Berlin, Budget 25.000 Euro, Mai bis Juli.",
  },
  {
    title: "Risiken & Annahmen",
    question: "Welche Risiken, Unsicherheiten oder Abhängigkeiten sollen wir berücksichtigen?",
    hint: "Beispiel: geringe Teilnahme, knappe Ressourcen, fehlende Freigaben.",
  },
  {
    title: "Planung & Umsetzung",
    question: "Welche konkreten Schritte, Methoden oder Termine brauchst du für die Umsetzung?",
    hint: "Beispiel: Einladung, Agenda, Material, Durchführung, Feedback-Auswertung.",
  },
  {
    title: "Zusammenfassung & Übergabe",
    question: "Was soll Fusion am Ende für dich erzeugen: Agenda, Checkliste, Aufgabenpakete oder Report?",
    hint: "Beispiel: Werkzeugkasten mit Methoden, Checklisten, Timeline und PDF-Export.",
  },
];
let coreCurrentStep = 0;
const coreAnswers = [];
let toolkitGenerated = false;
let generatedOutputsApplied = false;
let demoRunning = false;

function enterDemoPlatform(email = "") {
  if (email) {
    localStorage.setItem("fusionDemoEmail", email);
  }

  document.body.classList.remove("auth-active");
  setView("dashboard", { scroll: true });
  showToast("Willkommen bei Fusion.");
}

function setView(viewId, options = {}) {
  const currentView = document.querySelector(".screen.active")?.id;
  const shouldScroll = options.scroll === true || (options.scroll !== false && currentView !== viewId);

  screens.forEach((screen) => screen.classList.toggle("active", screen.id === viewId));
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === viewId);
  });

  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function addMessage(text, type = "agent") {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  agentChat.append(message);
  agentChat.scrollTop = agentChat.scrollHeight;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function flashElement(element) {
  if (!element) return;
  element.classList.remove("interactive-highlight");
  void element.offsetWidth;
  element.classList.add("interactive-highlight");
}

function currentViewId() {
  return document.querySelector(".screen.active")?.id || "dashboard";
}

function openCreateModal(type = "auto") {
  const view = currentViewId();
  const resolvedType = type === "auto"
    ? view === "calendar" ? "event" : view === "tasks" ? "task" : view === "files" ? "file" : view === "projects" ? "project" : "task"
    : type === "deadline" || type === "recurring" ? "event" : type;

  modalType.value = resolvedType;
  modalTitle.textContent = {
    project: "Neues Projekt erstellen",
    task: type === "deadline" ? "Deadline setzen" : "Neue Aufgabe erstellen",
    event: type === "recurring" ? "Wiederkehrenden Termin erstellen" : "Neuen Termin erstellen",
    file: "Datei hochladen",
  }[resolvedType] || "Neues Element erstellen";
  modalEyebrow.textContent = type === "auto" ? "Fusion Schnellaktion" : "Interaktive Demo";
  modalName.value = {
    project: "Neues Beteiligungsprojekt",
    task: "Neue Aufgabe prüfen",
    event: "Projektmeeting",
    file: "Neues_Dokument.pdf",
  }[resolvedType] || "";
  modalDate.value = "2025-05-16";
  modalTime.value = resolvedType === "event" ? "14:00" : "";
  modalDescription.value = "";
  modalBackdrop.classList.add("open");
  modalBackdrop.setAttribute("aria-hidden", "false");
  modalName.focus();
}

function closeCreateModal() {
  modalBackdrop.classList.remove("open");
  modalBackdrop.setAttribute("aria-hidden", "true");
}

function addProjectFromModal(name) {
  const grid = document.querySelector("#projects .project-card-grid");
  if (!grid) return;
  const card = document.createElement("article");
  card.className = "project-work-card interactive-highlight";
  card.innerHTML = `
    <div class="project-card-top"><span class="project-dot blue"></span><span class="badge amber">In Planung</span></div>
    <h2>${name}</h2>
    <p>${modalDescription.value || "Neu angelegtes Demo-Projekt mit KI-gestütztem Planungsstart."}</p>
    <div class="bar"><span style="width: 8%"></span></div>
    <div class="project-meta"><span>8% Fortschritt</span><span>${modalDate.value || "Neu"}</span></div>
    <div class="project-card-bottom"><div class="faces"><span></span><b>+1</b></div><span class="badge amber">Mittel</span></div>
  `;
  grid.prepend(card);
}

function addTaskFromModal(name) {
  const table = document.querySelector("#tasks .work-table tbody");
  if (table) {
    const row = document.createElement("tr");
    row.className = "interactive-highlight";
    row.innerHTML = `<td><strong>${name}</strong><span>${modalDescription.value || "Neue Demo-Aufgabe"}</span></td><td><span class="badge amber">Mittel</span></td><td><span class="badge purple">Offen</span></td><td>${modalDate.value || "Offen"}</td><td>Alex Müller</td><td>${modalProject.value}</td>`;
    table.prepend(row);
  }
  createTask(name);
}

function addEventFromModal(name) {
  const targetCell = document.querySelector(".today-cell") || document.querySelector(".day-cell");
  if (!targetCell) return;
  const event = document.createElement("article");
  event.className = "cal-event project-blue interactive-highlight";
  event.innerHTML = `<strong>${name}</strong><span>${modalTime.value || "Ganztägig"} · Alex</span><em>${modalProject.value}</em>`;
  targetCell.append(event);
}

function addFileFromModal(name) {
  const table = document.querySelector("#files .work-table tbody");
  if (!table) return;
  const row = document.createElement("tr");
  row.className = "interactive-highlight";
  row.innerHTML = `<td><strong>${name}</strong><span>${modalDescription.value || "Neu hochgeladen"}</span></td><td>Demo</td><td>${modalProject.value}</td><td>Heute</td><td><span class="badge purple">KI bereit</span></td><td>Alex Müller</td>`;
  table.prepend(row);
}

function saveModalItem() {
  const name = modalName.value.trim() || "Neues Element";
  const type = modalType.value;

  if (type === "project") {
    setView("projects");
    addProjectFromModal(name);
    showToast("Projekt wurde im Prototyp erstellt.");
  } else if (type === "task") {
    setView("tasks");
    addTaskFromModal(name);
    showToast("Aufgabe wurde im Prototyp erstellt.");
  } else if (type === "event") {
    setView("calendar");
    addEventFromModal(name);
    showToast("Termin wurde im Kalender eingetragen.");
  } else if (type === "file") {
    setView("files");
    addFileFromModal(name);
    showToast("Datei wurde in der Übersicht ergänzt.");
  }

  addMessage(`Ich habe „${name}“ als ${modalType.options[modalType.selectedIndex].text} angelegt.`);
  closeCreateModal();
}

function timeNow() {
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function addCoreMessage(text, type = "ai", strongText = "") {
  const article = document.createElement("article");
  article.className = `dialogue-message ${type === "user" ? "user-message" : "ai-message"}`;
  const card = `
    <div class="dialogue-card">
      <p>${text}</p>
      ${strongText ? `<strong>${strongText}</strong>` : ""}
      <span>${timeNow()}</span>
    </div>
  `;
  article.innerHTML = type === "user"
    ? `${card}<div class="dialogue-avatar user">AM</div>`
    : `<div class="dialogue-avatar">AI</div>${card}`;
  coreDialogueStream.append(article);
  coreDialogueStream.scrollTop = coreDialogueStream.scrollHeight;
}

function updateCoreProgress() {
  const percent = Math.min(100, Math.round(((coreCurrentStep + 1) / coreSteps.length) * 100));
  coreProgressText.textContent = `${percent}%`;
  coreProgressBar.style.width = `${percent}%`;
  coreBlockCounter.textContent = `${Math.min(coreCurrentStep + 1, coreSteps.length)} / ${coreSteps.length}`;
  coreSaveTime.textContent = "Letzte Speicherung: gerade eben";

  document.querySelectorAll("[data-core-step]").forEach((item, index) => {
    item.classList.toggle("completed", index < coreCurrentStep);
    item.classList.toggle("active", index === coreCurrentStep && !toolkitGenerated);
    const label = item.querySelector("span");
    if (label) {
      label.textContent = index < coreCurrentStep ? "Abgeschlossen" : index === coreCurrentStep && !toolkitGenerated ? "In Bearbeitung" : "Offen";
    }
  });

  if (coreCurrentStep >= 3) {
    coreContextStatus.classList.add("done");
    coreContextStatus.classList.remove("info");
    coreContextStatus.textContent = "Kontext erweitert";
  }
  if (coreCurrentStep >= 5) {
    coreCollabStatus.classList.add("done");
    coreCollabStatus.textContent = "Kollaboration bereit";
  }
}

function generatedBadge() {
  return `<span class="generated-label">Generated from Core Flow</span>`;
}

function addActivity(title, detail) {
  if (!aiActivityTimeline) return;
  const item = document.createElement("article");
  item.className = "generated-from-core interactive-highlight";
  item.innerHTML = `<strong>${title}</strong><span>${detail}</span>${generatedBadge()}`;
  aiActivityTimeline.prepend(item);
}

function appendGenerated(parent, key, builder) {
  if (!parent || parent.querySelector(`[data-generated-key="${key}"]`)) return null;
  const element = builder();
  element.dataset.generatedKey = key;
  element.classList.add("generated-from-core", "interactive-highlight");
  parent.append(element);
  return element;
}

function prependGenerated(parent, key, builder) {
  if (!parent || parent.querySelector(`[data-generated-key="${key}"]`)) return null;
  const element = builder();
  element.dataset.generatedKey = key;
  element.classList.add("generated-from-core", "interactive-highlight");
  parent.prepend(element);
  return element;
}

function applyGeneratedOutputsFromCore() {
  if (generatedOutputsApplied) return;
  generatedOutputsApplied = true;

  prependGenerated(taskTableBody, "core-task-agenda", () => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>Workshop-Agenda aus Core Flow prüfen</strong><span>Planungs-Agent hat Struktur und Zeitblöcke erstellt ${generatedBadge()}</span></td>
      <td><span class="badge red">Hoch</span></td>
      <td><span class="badge purple">Offen</span></td>
      <td>18. Mai 2025</td>
      <td>Lisa Hoffmann</td>
      <td>Nachhaltigkeits-Workshop</td>
    `;
    return row;
  });
  prependGenerated(taskTableBody, "core-task-stakeholder", () => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>Stakeholderliste ergänzen</strong><span>Zielgruppen-Agent empfiehlt Schulen, Jugendzentren und Partner ${generatedBadge()}</span></td>
      <td><span class="badge amber">Mittel</span></td>
      <td><span class="badge amber">In Bearbeitung</span></td>
      <td>20. Mai 2025</td>
      <td>Anna Weber</td>
      <td>Nachhaltigkeits-Workshop</td>
    `;
    return row;
  });
  prependGenerated(taskTableBody, "core-task-risk", () => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>Risikoplan für Teilnahmequote erstellen</strong><span>Risiko-Agent hat Gegenmaßnahmen vorgeschlagen ${generatedBadge()}</span></td>
      <td><span class="badge red">Hoch</span></td>
      <td><span class="badge purple">Offen</span></td>
      <td>21. Mai 2025</td>
      <td>Alex Müller</td>
      <td>Nachhaltigkeits-Workshop</td>
    `;
    return row;
  });
  appendGenerated(kanbanOpen, "core-kanban-agenda", () => {
    const card = document.createElement("div");
    card.innerHTML = `KI-Agenda finalisieren ${generatedBadge()}`;
    return card;
  });

  appendGenerated(generatedCalendarCell, "core-calendar-review", () => {
    const event = document.createElement("article");
    event.className = "cal-event project-purple";
    event.innerHTML = `<strong>Core Flow Review</strong><span>08:00 - 09:00 · Lisa, Alex</span>${generatedBadge()}`;
    return event;
  });
  appendGenerated(generatedCalendarCell, "core-calendar-stakeholder", () => {
    const event = document.createElement("article");
    event.className = "cal-event project-green";
    event.innerHTML = `<strong>Stakeholder-Abstimmung</strong><span>09:30 - 10:15 · Projektteam</span>${generatedBadge()}`;
    return event;
  });

  if (toolkitChecklistColumns) {
    toolkitChecklistColumns.innerHTML = `
      <div class="generated-from-core interactive-highlight"><strong>1. Vorbereitung</strong><p>Ziele prüfen, Zielgruppe validieren, Räume und Material sichern.</p>${generatedBadge()}</div>
      <div class="generated-from-core interactive-highlight"><strong>2. Durchführung</strong><p>Begrüßung, Aktivierung, Gruppenarbeit, Ergebnisdokumentation.</p>${generatedBadge()}</div>
      <div class="generated-from-core interactive-highlight"><strong>3. Nachbereitung</strong><p>Feedback auswerten, Report erstellen, nächste Schritte kommunizieren.</p>${generatedBadge()}</div>
    `;
  }

  if (toolkitRecommendationCards) {
    toolkitRecommendationCards.innerHTML = `
      <article class="generated-from-core interactive-highlight"><strong>Methoden</strong><p>Design Thinking, World Cafe und kurze Reflexionsrunden.</p>${generatedBadge()}</article>
      <article class="generated-from-core interactive-highlight"><strong>Kommunikation</strong><p>Einladung mit klarer Erwartung, Reminder und kurze Ergebnisupdates.</p>${generatedBadge()}</article>
      <article class="generated-from-core interactive-highlight"><strong>Risiken</strong><p>Teilnahmequote, Ressourcenknappheit und verspätete Freigaben beobachten.</p>${generatedBadge()}</article>
    `;
  }

  if (reportsTable && !reportsTable.querySelector('[data-generated-key="core-report-draft"]')) {
    const row = document.createElement("tr");
    row.dataset.generatedKey = "core-report-draft";
    row.className = "generated-from-core interactive-highlight";
    row.innerHTML = `
      <td>Core Flow Ergebnisbericht ${generatedBadge()}</td>
      <td>Projektteam und Stakeholder</td>
      <td>PDF</td>
      <td><span class="badge amber">Entwurf</span></td>
    `;
    reportsTable.append(row);
  }

  if (generatedToolkitText) {
    generatedToolkitText.textContent = "Aus dem Core Flow generiert: Aufgaben, Kalendertermine, Agenda, Checklisten, Empfehlungen und ein Reporting-Entwurf.";
  }

  addActivity("Zielgruppen-Agent", "hat Zielgruppen, Stakeholder und relevante Projektkontexte strukturiert.");
  addActivity("Planungs-Agent", "hat Aufgabenpakete, Agenda-Bausteine und Kalendertermine erstellt.");
  addActivity("Risiko-Agent", "hat Teilnahme-, Ressourcen- und Freigaberisiken erkannt.");
  addActivity("Reporting-Agent", "hat einen ersten Ergebnisbericht für Reporting vorbereitet.");
}

function generateToolkitFromCore() {
  toolkitGenerated = true;
  coreCurrentStep = coreSteps.length - 1;
  updateCoreProgress();
  coreProgressText.textContent = "100%";
  coreProgressBar.style.width = "100%";
  coreStatusBox.textContent = "Core Flow abgeschlossen. Werkzeugkasten, Empfehlungen und Checklisten wurden generiert.";
  coreSavedStatus.textContent = "Übergabe gespeichert";
  coreChoiceRow.style.display = "none";
  document.querySelector(".dialogue-input")?.classList.add("is-complete");
  coreInput.value = "";
  coreInput.placeholder = "Core Flow abgeschlossen. Öffne den Werkzeugkasten für die generierten Ergebnisse.";

  applyGeneratedOutputsFromCore();
  generatedToolkit.classList.add("interactive-highlight", "generated-from-core");
  generatedToolkitText.textContent = "Aus dem Core Flow generiert: Methodenempfehlungen, Checklisten, Agenda-Struktur, Aufgabenpakete, Timeline und Risiko-Hinweise.";
  addCoreMessage("Der Core Flow ist abgeschlossen. Ich habe den Werkzeugkasten vorbereitet.", "ai", "Du kannst jetzt zum Werkzeugkasten wechseln oder die Ergebnisse herunterladen.");
  showToast("Werkzeugkasten wurde generiert.");
}

function advanceCoreFlow(answer, options = {}) {
  const cleanAnswer = answer.trim();
  if (!cleanAnswer && !options.force) return;
  if (toolkitGenerated) {
    addCoreMessage("Der Core Flow ist bereits abgeschlossen. Ich kann dich jetzt zum Werkzeugkasten bringen.", "ai");
    return;
  }

  if (cleanAnswer) {
    coreAnswers[coreCurrentStep] = cleanAnswer;
    addCoreMessage(cleanAnswer, "user");
  }

  if (coreCurrentStep >= coreSteps.length - 1) {
    generateToolkitFromCore();
    return;
  }

  coreCurrentStep += 1;
  updateCoreProgress();
  const step = coreSteps[coreCurrentStep];
  addCoreMessage(`Danke, ich habe Block ${coreCurrentStep} gespeichert. Als nächstes geht es um „${step.title}“.`, "ai", step.question);
  coreInput.value = "";
}

function goBackCoreStep() {
  if (coreCurrentStep === 0) {
    showToast("Du bist bereits im ersten Block.");
    return;
  }
  toolkitGenerated = false;
  coreCurrentStep -= 1;
  updateCoreProgress();
  addCoreMessage(`Ich bin zurück zu „${coreSteps[coreCurrentStep].title}“.`, "ai", coreSteps[coreCurrentStep].question);
}

function saveCoreFlow() {
  localStorage.setItem("fusionCoreAnswers", JSON.stringify(coreAnswers));
  coreSaveTime.textContent = "Letzte Speicherung: gerade eben";
  showToast("Core Flow wurde zwischengespeichert.");
}

function downloadGeneratedToolkit() {
  const content = [
    "Fusion Werkzeugkasten - generierter Demo-Export",
    "",
    "Projekt: Nachhaltigkeits-Workshop",
    `Fortschritt: ${coreProgressText.textContent}`,
    "",
    "Core Flow Antworten:",
    ...coreSteps.map((step, index) => `${index + 1}. ${step.title}: ${coreAnswers[index] || "Noch nicht ausgefüllt"}`),
    "",
    "Empfehlungen:",
    "- Design Thinking Workshop",
    "- World Cafe für Beteiligung",
    "- Feedbackrunde am Ende einplanen",
    "- Risiken: Teilnahmequote, Ressourcen, Budgetfreigabe",
    "",
    "Checklisten:",
    "- Vorbereitung: Ziele, Zielgruppe, Material, Kommunikation",
    "- Durchführung: Agenda, Moderation, Dokumentation",
    "- Nachbereitung: Feedback, Report, nächste Schritte",
    "",
    "Generated from Core Flow:",
    "- Aufgaben: Agenda prüfen, Stakeholder ergänzen, Risikoplan erstellen",
    "- Kalender: Core Flow Review, Stakeholder-Abstimmung",
    "- Reporting: Core Flow Ergebnisbericht als Entwurf",
    "- AI Activity Timeline: Zielgruppen-, Planungs-, Risiko- und Reporting-Agent",
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fusion-werkzeugkasten-demo.txt";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Werkzeugkasten-Export wurde vorbereitet.");
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function runDemoFlow() {
  if (demoRunning) return;
  demoRunning = true;
  document.body.classList.remove("auth-active");
  setView("dashboard", { scroll: true });
  startDemo?.classList.add("demo-pulse");
  addMessage("Ich starte die Fusion Demo und zeige, wie aus dem Core Flow automatisch Plattform-Ergebnisse entstehen.");
  showToast("Demo gestartet.");
  await wait(850);

  setView("coreflow", { scroll: true });
  addCoreMessage("Ich führe dich jetzt im Schnelllauf durch den Core Flow.", "ai", "Danach übergebe ich die Ergebnisse an Aufgaben, Kalender, Werkzeugkasten und Reporting.");
  await wait(850);

  const demoAnswers = [
    "Jugendliche zwischen 15 und 25 Jahren, Schulen und Jugendzentren.",
    "Es gibt wenig Beteiligung und Nachhaltigkeit soll praktisch erlebbar werden.",
    "40 Teilnehmende, drei Workshop-Termine und konkrete Ideen am Ende.",
    "Präsenz in Berlin, Budget 25.000 Euro, Zeitraum Mai bis Juli.",
    "Risiken sind geringe Teilnahme, knappe Ressourcen und fehlende Freigaben.",
    "Wir brauchen Einladung, Agenda, Material, Durchführung und Feedback-Auswertung.",
    "Bitte generiere Werkzeugkasten, Aufgaben, Kalendertermine und einen Bericht.",
  ];

  for (const answer of demoAnswers) {
    if (toolkitGenerated) break;
    coreInput.value = answer;
    advanceCoreFlow(answer);
    await wait(650);
  }

  if (!toolkitGenerated) {
    generateToolkitFromCore();
  }

  await wait(850);
  setView("toolkit", { scroll: true });
  generatedToolkit?.classList.add("demo-pulse");
  showToast("Werkzeugkasten wurde aus dem Core Flow aktualisiert.");
  await wait(850);

  setView("tasks", { scroll: true });
  taskTableBody?.querySelector('[data-generated-key="core-task-agenda"]')?.classList.add("demo-pulse");
  showToast("Aufgaben wurden generiert.");
  await wait(850);

  setView("calendar", { scroll: true });
  generatedCalendarCell?.classList.add("demo-pulse");
  showToast("Kalendertermine wurden geplant.");
  await wait(850);

  setView("reporting", { scroll: true });
  reportsTable?.querySelector('[data-generated-key="core-report-draft"]')?.classList.add("demo-pulse");
  showToast("Reporting-Entwurf wurde erstellt.");
  await wait(850);

  setView("dashboard", { scroll: true });
  aiActivityTimeline?.classList.add("demo-pulse");
  showToast("Demo abgeschlossen: Agenten-Timeline zeigt die erzeugten Ergebnisse.");
  demoRunning = false;
}

function createTask(text) {
  if (!taskList) return;
  const item = document.createElement("li");
  item.innerHTML = `<input type="checkbox" /> ${text} <span class="badge purple">Neu</span>`;
  taskList.prepend(item);
}

function badge(label, tone = "purple") {
  return `<span class="badge ${tone}">${label}</span>`;
}

function livePanel(containerSelector, title, body, actions = "") {
  const container = document.querySelector(containerSelector);
  if (!container) return null;
  let panel = container.querySelector(".live-detail-card");
  if (!panel) {
    panel = document.createElement("section");
    panel.className = "panel side-panel live-detail-card interactive-highlight";
    container.prepend(panel);
  }
  panel.innerHTML = `<h2>${title}</h2><p>${body}</p>${actions}`;
  flashElement(panel);
  return panel;
}

function markSelected(element) {
  if (!element) return;
  document.querySelectorAll(".is-selected").forEach((item) => item.classList.remove("is-selected"));
  element.classList.add("is-selected");
  flashElement(element);
}

function addDashboardActivity(title, detail) {
  addActivity(title, detail);
  setView("dashboard");
  aiActivityTimeline?.classList.add("demo-pulse");
}

function addReportRow(title = "KI-generierter Projektbericht", status = "Bereit") {
  if (!reportsTable) return;
  const row = document.createElement("tr");
  row.className = "interactive-highlight";
  row.innerHTML = `<td>${title} ${generatedBadge()}</td><td>Projektteam</td><td>PDF</td><td>${badge(status, status === "Aktuell" ? "green" : "purple")}</td>`;
  reportsTable.append(row);
  flashElement(row);
}

function updateTaskRow(row, status = "Erledigt", tone = "green") {
  if (!row) return;
  const cells = row.querySelectorAll("td");
  if (cells[2]) cells[2].innerHTML = badge(status, tone);
  row.classList.toggle("task-done", status === "Erledigt");
  flashElement(row);
}

function createVisibleTask(title, description = "Vom Co-Pilot erzeugt", priority = "Mittel", project = "Nachhaltigkeits-Workshop") {
  const table = document.querySelector("#tasks .work-table tbody");
  if (table) {
    const row = document.createElement("tr");
    row.className = "interactive-highlight";
    row.innerHTML = `<td><strong>${title}</strong><span>${description}</span></td><td>${badge(priority, priority === "Hoch" ? "red" : "amber")}</td><td>${badge("Offen", "purple")}</td><td>Heute</td><td>Lisa Hoffmann</td><td>${project}</td>`;
    table.prepend(row);
  }
  const kanban = document.querySelector("#kanbanOpen");
  if (kanban) {
    const card = document.createElement("div");
    card.className = "kanban-card interactive-highlight";
    card.textContent = title;
    kanban.append(card);
  }
  createTask(title);
}

function moveKanbanCard(card) {
  const column = card.closest(".kanban-preview article");
  if (!column) return;
  const next = column.id === "kanbanOpen"
    ? document.querySelector("#kanbanProgress")
    : column.id === "kanbanProgress"
      ? document.querySelector("#kanbanDone")
      : document.querySelector("#kanbanOpen");
  if (!next) return;
  next.append(card);
  card.classList.add("interactive-highlight");
  if (next.id === "kanbanDone") card.classList.add("task-done");
}

function addChatMessage(text, note = false) {
  const conversation = document.querySelector(".comm-conversation");
  if (!conversation || !text.trim()) return;
  const article = document.createElement("article");
  article.className = "chat-message me interactive-highlight";
  article.innerHTML = `
    <div>
      <div class="message-meta"><time>${timeNow()}</time></div>
      <p class="bubble right">${note ? `<strong>Interne Notiz:</strong> ` : ""}${text}</p>
      <small class="status-hint">Gesendet · im Projektkontext gespeichert</small>
    </div>
  `;
  conversation.append(article);
  conversation.scrollTop = conversation.scrollHeight;
}

function updateDocumentPreview(title, body) {
  const preview = document.querySelector(".preview-page");
  const analysis = document.querySelector("#files .work-side .side-panel p");
  if (preview) {
    preview.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
    flashElement(preview);
  }
  if (analysis) {
    analysis.textContent = body;
    flashElement(analysis.closest(".panel"));
  }
}

function updateToolkitVisible() {
  generateToolkitFromCore();
  setView("toolkit");
  generatedToolkit?.classList.add("demo-pulse");
}

function runAgentCommand(rawCommand) {
  const command = rawCommand.trim();
  if (!command) return;

  addMessage(command, "user");
  const normalized = command.toLowerCase();
  const modePrefix = activeAgentMode === "deep" ? "Im Denkmodus analysiere ich tiefer: " : "";

  if (normalized.includes("tagesbriefing")) {
    addDashboardActivity("Tagesbriefing erstellt", "fasst 3 offene Aufgaben, 2 Risiken und den nächsten Workshop-Meilenstein zusammen.");
    return;
  }

  if (normalized.includes("zusammenfassung aktualisieren")) {
    const summary = document.querySelector("#reporting .side-panel p");
    if (summary) {
      summary.textContent = `Aktualisiert ${timeNow()}: Core Flow, Aufgaben, Kalender und Kommunikation wurden in die Zusammenfassung übernommen.`;
      flashElement(summary.closest(".panel"));
    }
    setView("reporting");
    return;
  }

  if (normalized.includes("antwortvorschlag")) {
    setView("communication");
    const input = document.querySelector(".composer-box input");
    if (input) {
      input.value = "Danke für dein Update. Ich fasse die offenen Punkte zusammen und schicke dir die Agenda bis heute Nachmittag.";
      input.focus();
      flashElement(input.closest(".composer-box"));
    }
    addMessage("Ich habe einen Antwortvorschlag direkt in das Nachrichtenfeld gelegt.");
    return;
  }

  if (normalized.includes("offene punkte")) {
    setView("communication");
    addChatMessage("Co-Pilot: Offene Punkte erkannt: Agenda finalisieren, Feedbackblock ergänzen, Budgetfreigabe prüfen.", true);
    createVisibleTask("Offene Punkte aus Chat prüfen", "Aus Kommunikationszentrum erzeugt", "Hoch");
    return;
  }

  if (normalized.includes("chat zusammenfassen") || normalized.includes("gespräch zusammenfassen")) {
    setView("communication");
    addChatMessage("Co-Pilot-Zusammenfassung: Dokument ist geteilt, zwei Agenda-Fragen bleiben offen, Meeting ist sinnvoll.", true);
    return;
  }

  if (normalized.includes("aus chat aufgabe")) {
    setView("tasks");
    createVisibleTask("Agenda-Fragen aus Chat klären", "Aus Nachricht im Kommunikationszentrum erstellt", "Hoch");
    return;
  }

  if (normalized.includes("vorlage") || normalized.includes("template")) {
    setView("templates");
    if (normalized.includes("core flow") || normalized.includes("erzeugen")) {
      const grid = document.querySelector("#templates .template-card-grid");
      if (grid && !grid.querySelector('[data-generated-key="template-core-flow"]')) {
        const card = document.createElement("article");
        card.className = "project-work-card template-card generated-from-core interactive-highlight";
        card.dataset.generatedKey = "template-core-flow";
        card.innerHTML = `
          <div class="project-card-top"><span class="project-dot violet"></span>${badge("Core Flow", "purple")}</div>
          <h2>Core Flow Beteiligungsformat</h2>
          <p>Automatisch erzeugte Vorlage aus Zielgruppe, Risiken, Agenda und Checkliste.</p>
          <div class="template-meta-grid"><span>Aktualisiert: gerade eben</span><span>1x genutzt</span></div>
          <div class="project-card-bottom">${badge("Generated from Core Flow", "purple")}<button data-command="Vorlage anpassen lassen" type="button">Anpassen</button></div>
        `;
        grid.prepend(card);
      }
      addMessage(`${modePrefix}Ich erstelle eine neue Vorlage aus den Core-Flow-Antworten: Zielgruppe, Agenda, Risiken und Checkliste werden als wiederverwendbare Struktur vorbereitet.`);
      return;
    }
    const firstTemplate = document.querySelector("#templates .template-card");
    firstTemplate?.classList.add("is-selected", "interactive-highlight");
    livePanel("#templates .work-side", "Vorlage angepasst", "Der Co-Pilot hat Zielgruppe, Dauer und Ergebnisstruktur für den Nachhaltigkeits-Workshop übernommen.");
    addMessage(`${modePrefix}Ich öffne die Vorlagenbibliothek und passe die ausgewählte Vorlage an Projektziel, Zielgruppe und Format an.`);
    return;
  }

  if (normalized.includes("timeline") || normalized.includes("roadmap") || normalized.includes("meilenstein") || normalized.includes("projektzeitplan")) {
    setView("timeline");
    document.querySelectorAll("#timeline .milestone-card.risk").forEach((item) => item.classList.add("demo-pulse"));
    livePanel("#timeline .work-side", "Risiko-Agent Update", "Workshop-Termin und Budget-Freigabe wurden markiert. Empfohlene Aktion: Reminder senden und Budgetentscheidung terminieren.");
    addMessage(`${modePrefix}Ich öffne den Projektzeitplan und prüfe Meilensteine, Abhängigkeiten und At-Risk Punkte für Nachhaltigkeits-Workshop und Team-Event Q2.`);
    return;
  }

  if (normalized.includes("zusammenfassung erstellen") || normalized.includes("risiken erkennen") || normalized.includes("wichtige inhalte")) {
    setView("files");
    updateDocumentPreview("KI-Analyse abgeschlossen", "Erkannt: 3 Zielgruppen, 5 Aufgaben, 2 Risiken, 1 fehlender Feedbackblock und zentrale Stakeholder.");
    addMessage(`${modePrefix}Ich öffne die Dokumentenplattform und bereite KI-Analyse, Zusammenfassung und extrahierte Inhalte vor.`);
    return;
  }

  if (normalized.includes("report")) {
    setView("reporting");
    addReportRow("Aktualisierter KI-Report", "Bereit");
    livePanel("#reporting .report-grid", "Report geöffnet", "Der neue Bericht wurde als sichtbarer Entwurf in der Reportliste ergänzt und kann weiterbearbeitet werden.");
    addMessage(`${modePrefix}Ich habe den Reporting-Bereich geöffnet und einen aktualisierten Projektbericht vorbereitet.`);
    return;
  }

  if (normalized.includes("risiko") || normalized.includes("risiken")) {
    setView(normalized.includes("projekt") ? "projects" : "dashboard");
    document.querySelectorAll(".risk-list p, #timeline .milestone-card.risk, .project-work-card .badge.red").forEach((item) => item.classList.add("demo-pulse"));
    addDashboardActivity("Risiko-Agent Update", "hat Teilnahmequote und Budgetfreigabe als sichtbare Risiken markiert.");
    addMessage(`${modePrefix}Ich habe 2 kritische Hinweise gefunden: Workshop-Deadline und Teilnahmequote. Der Risiko-Agent empfiehlt Partnerkanäle und Budgetfreigabe zu priorisieren.`);
    return;
  }

  if (normalized.includes("projektstatus") || normalized.includes("status bewerten")) {
    setView("projects");
    const project = document.querySelector("#projects .project-work-card");
    markSelected(project);
    livePanel("#projects .work-side", "Projektstatus bewertet", "Nachhaltigkeits-Workshop: 75% Fortschritt, hohe Priorität, kritischer nächster Schritt ist Agenda-Freigabe.");
    addMessage(`${modePrefix}Ich bewerte den Projektstatus: Nachhaltigkeits-Workshop ist aktiv, aber wegen Deadline und Teilnahmequote kritisch.`);
    return;
  }

  if (normalized.includes("nächste schritte") || normalized.includes("naechste schritte")) {
    setView("projects");
    const list = document.querySelector("#projects .calendar-task-list");
    if (list) {
      const item = document.createElement("li");
      item.className = "interactive-highlight";
      item.innerHTML = "<strong>Teilnahme-Reminder versenden</strong><span>Owner: Sophie · heute</span>";
      list.prepend(item);
    }
    addMessage(`${modePrefix}Ich generiere nächste Schritte: Agenda finalisieren, Stakeholder informieren und Risiko-Review einplanen.`);
    return;
  }

  if (normalized.includes("kommunikation") || normalized.includes("chat") || normalized.includes("nachricht")) {
    setView("communication");
    addChatMessage("Ich bin im Kommunikationszentrum und kann daraus direkt Aufgaben oder Antwortvorschläge erzeugen.", true);
    addMessage("Ich öffne das Kommunikationszentrum. Du kannst jetzt eine Nachricht zusammenfassen oder daraus eine Aufgabe erstellen.");
    return;
  }

  if (normalized.includes("meeting") || normalized.includes("termin") || normalized.includes("kalender")) {
    setView("calendar");
    addEventFromModal("Co-Pilot Meetingvorschlag");
    addMessage(`${modePrefix}Ich öffne den Kalender und bereite einen passenden Termin mit Projektbezug und Teilnehmern vor.`);
    return;
  }

  if (normalized.includes("frei") || normalized.includes("verfügbar")) {
    setView("calendar");
    livePanel("#calendar .calendar-sidebar", "Freier Termin gefunden", "Donnerstag, 14:00-15:00 ist konfliktarm. Lisa, Alex und Sophie sind verfügbar.");
    addMessage(`${modePrefix}Ich prüfe Team-Verfügbarkeit und schlage Donnerstag 14:00 als konfliktarmen Slot vor.`);
    return;
  }

  if (normalized.includes("teilnehmer")) {
    setView("calendar");
    livePanel("#calendar .calendar-sidebar", "Teilnehmer vorgeschlagen", "Empfohlen: Lisa Hoffmann, Sophie Wagner und Anna Weber wegen Aufgaben- und Projektbezug.");
    addMessage(`${modePrefix}Ich schlage Lisa, Sophie und Anna als Teilnehmer vor, weil sie im Projekt und in den offenen Aufgaben verknüpft sind.`);
    return;
  }

  if (normalized.includes("konflikt")) {
    setView("calendar");
    document.querySelectorAll(".cal-event.priority-high, #timeline .milestone-card.risk").forEach((item) => item.classList.add("demo-pulse"));
    livePanel("#calendar .calendar-sidebar", "Konflikte erkannt", "2 Konflikte: Workshop-Deadline liegt nah am Review und Team Marketing ist teilweise belegt.");
    addMessage(`${modePrefix}Ich erkenne 2 Planungskonflikte: Team Marketing ist teilweise belegt und die Workshop-Deadline liegt nahe am Meeting.`);
    return;
  }

  if (normalized.includes("core") || normalized.includes("frage") || normalized.includes("zielgruppe")) {
    setView("coreflow");
    addMessage("Ich öffne den Core Flow und setze den Fokus auf den aktuellen Dialogblock.");
    showToast("Core Flow geöffnet.");
    return;
  }

  if (normalized.includes("werkzeug") || normalized.includes("plan") || normalized.includes("agenda")) {
    if (!toolkitGenerated || normalized.includes("gener") || normalized.includes("agenda")) updateToolkitVisible();
    setView("toolkit");
    addMessage(`${modePrefix}Ich öffne den Werkzeugkasten. Der Planungs-Agent bereitet Agenda, Checklisten und Aufgabenpakete vor.`);
    return;
  }

  if (normalized.includes("aufgabe priorisieren") || normalized.includes("deadline vorschlagen") || normalized.includes("verantwortliche person") || normalized.includes("aufgabe zusammenfassen")) {
    setView("tasks");
    const firstRow = document.querySelector("#tasks .work-table tbody tr");
    if (normalized.includes("priorisieren")) {
      firstRow?.querySelectorAll("td")[1] && (firstRow.querySelectorAll("td")[1].innerHTML = badge("Hoch", "red"));
    }
    if (normalized.includes("deadline")) {
      firstRow?.querySelectorAll("td")[3] && (firstRow.querySelectorAll("td")[3].textContent = "18. Mai 2025");
    }
    firstRow?.classList.add("interactive-highlight");
    livePanel("#tasks .work-side", "Aufgabe aktualisiert", "Co-Pilot hat Priorität, Deadline und Verantwortlichkeit sichtbar am ersten Task angepasst.");
    addMessage(`${modePrefix}Ich öffne den Aufgabenbereich und priorisiere die Workshop-Agenda als hoch, mit Lisa als empfohlener Verantwortlicher.`);
    return;
  }

  if (normalized.includes("projekt") && (normalized.includes("neu") || normalized.includes("plane") || normalized.includes("planen"))) {
    setView("projects");
    addProjectFromModal("KI-geplantes Beteiligungsprojekt");
    createVisibleTask("Projektbriefing mit Co-Pilot vervollständigen", "Aus Co-Pilot Aktion erstellt", "Hoch");
    addMessage(`${modePrefix}Ich starte ein neues Projektbriefing im Core Flow und sammle Ziel, Zielgruppe, Zeitraum und benötigte Dateien.`);
    return;
  }

  if (normalized.includes("zusammenfass")) {
    setView(normalized.includes("dokument") ? "files" : normalized.includes("projekt") ? "projects" : "dashboard");
    addMessage(`${modePrefix}Kurzfassung: Projektfortschritt 68%, wichtigster Blocker ist die Budgetfreigabe, nächster sinnvoller Schritt ist Agenda finalisieren.`);
    showToast("Projektzusammenfassung erstellt.");
    return;
  }

  if (normalized.includes("stakeholder")) {
    setView("tasks");
    createVisibleTask("Stakeholderliste prüfen und ergänzen", "Zielgruppen-Agent hat Schulen, Jugendzentren und Partner vorgeschlagen", "Mittel");
    addMessage(`${modePrefix}Ich öffne den Kontextbereich und bereite ein Stakeholder-Segment für Schulen, Jugendzentren und externe Partner vor.`);
    return;
  }

  if (normalized.includes("datei")) {
    setView("files");
    addFileFromModal("Co-Pilot_Kontextnotiz.pdf");
    addMessage("Ich öffne die Dateiübersicht. Danach kann ich Dokumente analysieren und mit dem Projektkontext verknüpfen.");
    return;
  }

  if (normalized.includes("dokument") || normalized.includes("wichtige inhalte") || normalized.includes("extrahieren")) {
    setView("files");
    updateDocumentPreview("Wichtige Inhalte extrahiert", "Ziele, Zielgruppen, offene Aufgaben, Risiken und beteiligte Personen wurden aus dem Dokument gezogen.");
    addMessage(`${modePrefix}Ich analysiere das ausgewählte Dokument und extrahiere Ziele, Aufgaben, Risiken und beteiligte Personen.`);
    return;
  }

  if (normalized.includes("sprache")) {
    addMessage("Spracheingabe wäre jetzt aktiv. Gesprochene Ziele würden in Projektaktionen übersetzt.");
    showToast("Spracheingabe gestartet.");
    return;
  }

  if (normalized.includes("websuche") || normalized.includes("internet")) {
    addMessage("Ich würde eine Websuche starten und relevante Quellen als Kontext zum Projekt hinzufügen.");
    showToast("Websuche vorbereitet.");
    return;
  }

  if (normalized.includes("screenshot")) {
    addMessage("Ich würde den Screenshot analysieren, Inhalte erkennen und daraus Aufgaben oder Hinweise ableiten.");
    showToast("Screenshot-Analyse vorbereitet.");
    return;
  }

  if (normalized.includes("aufgabe") || normalized.includes("task") || normalized.includes("erstellen")) {
    setView("tasks");
    createVisibleTask("Neue Co-Pilot Aufgabe prüfen", "Direkt aus dem Co-Pilot erzeugt", "Mittel");
    addMessage("Ich habe eine neue Aufgabe erstellt und sie oben in der Aufgaben-Übersicht abgelegt.");
    return;
  }

  if (normalized.includes("analys")) {
    setView("dashboard");
    addMessage("Ich habe den aktuellen Projektstatus analysiert: Fortschritt 68%, Risiko hoch, nächste Aktion ist Budgetfreigabe einholen.");
    showToast("Projektstatus analysiert.");
    return;
  }

  addMessage("Ich kann diese Aktion vorbereiten. Vorschlag: Ich öffne den passenden Bereich oder erstelle daraus eine Aufgabe.");
  showToast("Co-Pilot hat einen Vorschlag vorbereitet.");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const viewId = button.dataset.view;
    if (viewId) setView(viewId);
  });
});

copilotToggle.addEventListener("click", () => {
  const isOpen = copilot.classList.toggle("open");
  document.body.classList.toggle("copilot-collapsed", !isOpen);
  copilotToggle.textContent = isOpen ? "‹" : "›";
  copilotToggle.setAttribute("aria-label", isOpen ? "Co-Pilot einklappen" : "Co-Pilot ausklappen");
});

agentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const command = agentInput.value;
  agentInput.value = "";
  runAgentCommand(command);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-command]");
  if (!button) return;
  event.preventDefault();
  runAgentCommand(button.dataset.command);
});

document.querySelectorAll("[data-create]").forEach((button) => {
  button.addEventListener("click", () => openCreateModal(button.dataset.create));
});

modalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveModalItem();
});

modalClose.addEventListener("click", closeCreateModal);
modalCancel.addEventListener("click", closeCreateModal);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeCreateModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalBackdrop.classList.contains("open")) {
    closeCreateModal();
  }
});

document.querySelectorAll(".work-tabs, .tabs, .chat-filters, .calendar-view-switch").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    group.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));

    if (group.classList.contains("calendar-view-switch")) {
      const view = button.textContent.trim().toLowerCase();
      const calendar = document.querySelector(".calendar-main");
      if (calendar) {
        calendar.dataset.view = view.includes("tag") ? "day" : view.includes("monat") ? "month" : "week";
      }
      showToast(`Kalenderansicht: ${button.textContent.trim()}`);
      return;
    }

    const panel = group.closest(".panel") || group.closest(".screen");
    const filter = button.textContent.trim().split(" ")[0].toLowerCase();
    if (panel?.classList.contains("work-main")) {
      panel.querySelectorAll(".project-work-card, .template-card, .work-table tbody tr").forEach((item) => {
        const text = item.textContent.toLowerCase();
        const show = filter === "alle" || text.includes(filter) || (filter === "kritisch" && text.includes("hoch"));
        item.classList.toggle("is-filtered-out", !show);
      });
    }
    flashElement(panel);
  });
});

document.querySelectorAll(".calendar-nav button").forEach((button) => {
  button.addEventListener("click", () => {
    const label = document.querySelector(".calendar-nav strong");
    const text = button.textContent.trim();

    if (text === "‹") activeCalendarMonth -= 1;
    if (text === "›") activeCalendarMonth += 1;
    if (text === "Heute") {
      activeCalendarMonth = 4;
      activeCalendarYear = 2025;
    }

    if (activeCalendarMonth < 0) {
      activeCalendarMonth = 11;
      activeCalendarYear -= 1;
    }
    if (activeCalendarMonth > 11) {
      activeCalendarMonth = 0;
      activeCalendarYear += 1;
    }

    label.textContent = `${monthNames[activeCalendarMonth]} ${activeCalendarYear}`;
    flashElement(document.querySelector(".calendar-main"));
  });
});

document.addEventListener("click", (event) => {
  const kanbanCard = event.target.closest(".kanban-preview article > div");
  if (kanbanCard) {
    moveKanbanCard(kanbanCard);
    return;
  }

  const projectCard = event.target.closest("#projects .project-work-card");
  if (projectCard && !event.target.closest("button")) {
    markSelected(projectCard);
    livePanel("#projects .work-side", projectCard.querySelector("h2")?.textContent || "Projekt geöffnet", "Detailansicht geöffnet: Fortschritt, Risiko, Team und nächste Schritte sind im Kontext geladen.");
    return;
  }

  const templateCard = event.target.closest("#templates .template-card");
  if (templateCard && !event.target.closest("button")) {
    markSelected(templateCard);
    livePanel("#templates .work-side", templateCard.querySelector("h2")?.textContent || "Vorlage geöffnet", "Vorlage ist geladen. Der Co-Pilot kann sie jetzt an Zielgruppe, Dauer und Projektformat anpassen.");
    return;
  }

  const taskRow = event.target.closest("#tasks .work-table tbody tr");
  if (taskRow) {
    markSelected(taskRow);
    livePanel("#tasks .work-side", taskRow.querySelector("strong")?.textContent || "Aufgabe geöffnet", "Aufgabendetails geladen. Klick auf die Status-Badge oder nutze Co-Pilot Aktionen, um Priorität und Deadline sichtbar zu ändern.");
    return;
  }

  const fileRow = event.target.closest("#files .work-table tbody tr");
  if (fileRow) {
    markSelected(fileRow);
    const title = fileRow.querySelector("strong")?.textContent || "Dokument geöffnet";
    updateDocumentPreview(title, "Dokumentvorschau geladen. KI-Analyse, erkannte Themen und Schlagwörter wurden aktualisiert.");
    return;
  }

  const reportRow = event.target.closest("#reporting table tr:not(:first-child)");
  if (reportRow) {
    markSelected(reportRow);
    livePanel("#reporting .report-grid", reportRow.cells[0]?.textContent || "Report geöffnet", "Report-Vorschau geöffnet. Exportstatus, Zielgruppe und Zusammenfassung sind im rechten Panel sichtbar.");
    return;
  }

  const eventCard = event.target.closest(".cal-event");
  if (eventCard) {
    markSelected(eventCard);
    livePanel("#calendar .calendar-sidebar", eventCard.querySelector("strong")?.textContent || "Termin geöffnet", "Termindetails geladen: Projektbezug, Verantwortliche und mögliche Konflikte sind sichtbar.");
    return;
  }

  const milestone = event.target.closest("#timeline .milestone-card");
  if (milestone) {
    markSelected(milestone);
    livePanel("#timeline .work-side", milestone.querySelector("strong")?.textContent || "Meilenstein geöffnet", "Meilenstein geladen. Status, Datum und Risiko-Kontext sind jetzt im Fokus.");
    return;
  }

  const chatItem = event.target.closest(".chat-list article");
  if (chatItem) {
    markSelected(chatItem);
    const name = chatItem.querySelector("strong")?.textContent || "Gespräch";
    document.querySelector(".comm-chat-header strong").textContent = name;
    addChatMessage(`Gespräch „${name}“ geöffnet.`, true);
  }
});

coreSend.addEventListener("click", () => advanceCoreFlow(coreInput.value));

coreInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    advanceCoreFlow(coreInput.value);
  }
});

document.querySelectorAll("[data-core-choice]").forEach((button) => {
  button.addEventListener("click", () => advanceCoreFlow(button.dataset.coreChoice));
});

document.querySelectorAll("[data-core-tool]").forEach((button) => {
  button.addEventListener("click", () => {
    const tool = button.dataset.coreTool;
    const step = coreSteps[coreCurrentStep];
    if (tool === "examples") {
      addCoreMessage("Hier ist ein Beispiel, das du anpassen kannst:", "ai", step.hint);
      coreInput.value = step.hint.replace("Beispiel: ", "");
      coreInput.focus();
      return;
    }
    if (tool === "explain") {
      addCoreMessage(`Warum frage ich das? Dieser Block hilft Fusion, später passende Empfehlungen, Aufgaben und Checklisten für „${step.title}“ zu erzeugen.`, "ai");
      return;
    }
    if (tool === "suggest") {
      coreInput.value = step.hint.replace("Beispiel: ", "");
      addCoreMessage("Ich habe einen Vorschlag in das Eingabefeld gelegt. Du kannst ihn übernehmen oder bearbeiten.", "ai");
      coreInput.focus();
    }
  });
});

coreNext.addEventListener("click", () => {
  advanceCoreFlow(coreInput.value || coreSteps[coreCurrentStep].hint.replace("Beispiel: ", ""), { force: true });
});

coreBack.addEventListener("click", goBackCoreStep);
coreSave.addEventListener("click", saveCoreFlow);
downloadToolkit.addEventListener("click", downloadGeneratedToolkit);
startDemo?.addEventListener("click", runDemoFlow);

function sendComposerMessage() {
  const input = document.querySelector(".composer-box input");
  const activeTab = document.querySelector(".composer-tabs button.active")?.textContent.trim();
  if (!input || !input.value.trim()) return;
  addChatMessage(input.value.trim(), activeTab === "Interne Notiz");
  input.value = "";
}

document.querySelector(".message-composer .send-btn")?.addEventListener("click", sendComposerMessage);
document.querySelector(".composer-box input")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendComposerMessage();
  }
});

document.querySelectorAll(".composer-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".composer-tabs button").forEach((item) => item.classList.toggle("active", item === button));
    const input = document.querySelector(".composer-box input");
    if (input) input.placeholder = button.textContent.includes("Notiz") ? "Interne Notiz schreiben..." : "Nachricht schreiben...";
  });
});

document.addEventListener("click", (event) => {
  const statusBadge = event.target.closest("#tasks .work-table tbody .badge, #reportsTable .badge");
  if (!statusBadge) return;
  const row = statusBadge.closest("tr");
  if (row?.closest("#tasks")) {
    updateTaskRow(row, "Erledigt", "green");
  } else if (row?.closest("#reportsTable")) {
    statusBadge.className = "badge green";
    statusBadge.textContent = "Aktuell";
    flashElement(row);
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (
    button.dataset.view ||
    button.dataset.command ||
    button.dataset.create ||
    button.dataset.mode ||
    button.dataset.coreChoice ||
    button.dataset.coreTool ||
    button.id.startsWith("core") ||
    button.id === "downloadToolkit" ||
    button.id === "startDemo" ||
    button.closest(".mode-switch") ||
    button.closest(".work-tabs") ||
    button.closest(".tabs") ||
    button.closest(".chat-filters") ||
    button.closest(".calendar-view-switch") ||
    button.closest(".calendar-nav") ||
    button.closest(".modal-backdrop") ||
    button.closest(".login-form") ||
    button.id === "copilotToggle"
  ) {
    return;
  }

  const label = button.textContent.trim() || button.getAttribute("title") || "Aktion";
  const view = currentViewId();

  if (label === "?" || label === "12") {
    let popover = document.querySelector(".topbar-popover");
    if (!popover) {
      popover = document.createElement("div");
      popover.className = "topbar-popover interactive-highlight";
      document.querySelector(".top-icons")?.append(popover);
    }
    popover.innerHTML = label === "?"
      ? "<strong>Help Center</strong><span>Onboarding, Support und Demo-Hinweise sind geöffnet.</span>"
      : "<strong>Benachrichtigungen</strong><span>3 neue Aufgaben, 2 Risiken, 1 Core-Flow Update.</span>";
    flashElement(popover);
    return;
  }

  if (label.includes("Modus")) {
    button.parentElement?.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    const status = document.querySelector("#coreStatusBox");
    if (status) {
      status.textContent = `${label} aktiviert. Der Dialog passt Fragen und Vorschläge sichtbar an.`;
      flashElement(status);
    }
    return;
  }

  if (label.includes("Download")) {
    button.textContent = "Heruntergeladen";
    button.classList.add("is-confirmed");
    flashElement(button);
    return;
  }

  if (label.includes("Hinzufügen")) {
    const section = button.closest(".detail-section");
    const item = document.createElement("div");
    item.className = "participant interactive-highlight";
    item.innerHTML = `<div class="person"></div><div><strong>Neues Teammitglied</strong><span>gerade hinzugefügt</span></div>`;
    section?.append(item);
    return;
  }

  if ((label.includes("Alle") && label.includes("anzeigen")) || label.includes("Statusverlauf")) {
    const panel = button.closest(".panel");
    const note = document.createElement("div");
    note.className = "inline-result interactive-highlight";
    note.textContent = label.includes("Statusverlauf") ? "Statusverlauf: Offen → In Bearbeitung → Review geplant" : "Weitere Einträge wurden geladen.";
    panel?.append(note);
    return;
  }

  if (view === "coreflow") {
    if (label.includes("Datei")) addCoreMessage("Datei wurde als Kontext hinzugefügt.", "ai", "Workshop_Dokument_v2.docx ist jetzt mit dem Core Flow verbunden.");
    if (label.includes("Websuche")) addCoreMessage("Websuche ergänzt.", "ai", "3 externe Inspirationsquellen wurden als Kontext markiert.");
    if (label.includes("Dokument")) addCoreMessage("Dokument analysiert.", "ai", "Ich habe Zielgruppen, Risiken und Aufgaben aus dem Dokument erkannt.");
    if (label.includes("Kontext")) addCoreMessage("Kontext hinzugefügt.", "ai", "Der aktuelle Projektkontext wurde erweitert.");
    if (label.includes("Zwischenstand")) addCoreMessage("Zwischenstand geteilt.", "ai", "Ein Review-Link wurde für das Team vorbereitet.");
    if (label.includes("Feedback")) addCoreMessage("Feedback-Prozess aktualisiert.", "ai", "Feedback wurde angefragt oder in den Dialog integriert.");
    return;
  }

  if (view === "communication") {
    addChatMessage(`${label}: Aktion direkt im Gespräch ausgeführt.`, true);
    return;
  }

  flashElement(button.closest(".panel") || button);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  enterDemoPlatform(loginEmail.value.trim());
});

guestLogin.addEventListener("click", () => {
  localStorage.setItem("fusionDemoEmail", "gast@fusion.demo");
  enterDemoPlatform("gast@fusion.demo");
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeAgentMode = button.dataset.mode;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));

    if (activeAgentMode === "deep") {
      modeLabel.textContent = "Denkmodus aktiv";
      modeDescription.textContent = "Ich analysiere Kontext, Abhängigkeiten, Risiken und plane mehrere Schritte voraus.";
      addMessage("Denkmodus aktiviert. Ich prüfe jetzt nicht nur die Aktion, sondern auch Auswirkungen und nächste Schritte.");
      return;
    }

    modeLabel.textContent = "Schnellmodus aktiv";
    modeDescription.textContent = "Ich führe direkte Plattformaktionen aus und öffne die passenden Bereiche.";
    addMessage("Schnellmodus aktiviert. Ich fokussiere mich auf direkte Aktionen und schnelle Navigation.");
  });
});
