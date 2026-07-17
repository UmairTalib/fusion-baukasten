const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const screens = $$(".screen");
const toast = $("#toast");
const agentChat = $("#agentChat");
const agentInput = $("#agentInput");
const taskList = $("#taskList");

let activeAgentMode = "quick";
let calendarMonth = 4;
let calendarYear = 2025;
const monthNames = ["Januar", "Februar", "Maerz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const coreSteps = [
  ["Zielgruppe definieren", "Welche Zielgruppe ist fuer dein Projekt am wichtigsten?", "Jugendliche zwischen 15 und 25 Jahren, Schulen und Jugendzentren."],
  ["Ausgangslage & Kontext", "Was ist die aktuelle Ausgangslage und warum ist das Projekt relevant?", "Es gibt wenig Beteiligung und Nachhaltigkeit soll praktisch erlebbar werden."],
  ["Ziele & Anforderungen", "Welche konkreten Ziele soll das Projekt erreichen?", "40 Teilnehmende, 3 Workshop-Termine und konkrete Ideen am Ende."],
  ["Rahmenbedingungen", "Welche Rahmenbedingungen gelten: Zeitraum, Budget, Ort oder Format?", "Praesenz-Workshop in Berlin, Budget 25.000 Euro, Mai bis Juli."],
  ["Risiken & Annahmen", "Welche Risiken oder Unsicherheiten sollen wir beruecksichtigen?", "Geringe Teilnahme, knappe Ressourcen und fehlende Freigaben."],
  ["Planung & Umsetzung", "Welche Schritte, Methoden oder Termine brauchst du fuer die Umsetzung?", "Einladung, Agenda, Material, Durchfuehrung und Feedback-Auswertung."],
  ["Zusammenfassung & Uebergabe", "Was soll Fusion am Ende fuer dich erzeugen?", "Werkzeugkasten mit Methoden, Checklisten, Timeline und Export."],
];
let coreStep = 0;
const coreAnswers = [];
let toolkitGenerated = false;

function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function flash(element) {
  if (!element) return;
  element.classList.remove("interactive-highlight");
  void element.offsetWidth;
  element.classList.add("interactive-highlight");
}

function setView(viewId, options = {}) {
  const current = $(".screen.active")?.id;
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === viewId));
  $$(".nav").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  if (options.scroll === true || (options.scroll !== false && current !== viewId)) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function addAgentMessage(text, type = "ai") {
  if (!agentChat) return;
  const message = document.createElement("div");
  message.className = `msg ${type === "user" ? "user-msg" : "ai-msg"}`;
  message.textContent = text;
  agentChat.append(message);
  agentChat.scrollTop = agentChat.scrollHeight;
}

function enterDemo(email = "") {
  if (email) localStorage.setItem("fusionDemoEmail", email);
  document.body.classList.remove("auth-active");
  setView("dashboard", { scroll: true });
  showToast("Willkommen bei Fusion.");
}

function openModal(type = "auto") {
  const view = $(".screen.active")?.id || "dashboard";
  const resolved = type === "auto" ? (view === "calendar" ? "event" : view === "files" ? "file" : view === "projects" ? "project" : "task") : type;
  $("#modalType").value = resolved === "deadline" || resolved === "recurring" ? "event" : resolved;
  $("#modalName").value = { project: "Neues Projekt", task: "Neue Aufgabe", event: "Projektmeeting", file: "Neues_Dokument.pdf" }[$("#modalType").value] || "Neues Element";
  $("#modalDate").value = "2025-05-16";
  $("#modalTime").value = $("#modalType").value === "event" ? "14:00" : "";
  $("#modalDescription").value = "";
  $("#modalBackdrop").classList.add("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "false");
  $("#modalName").focus();
}

function closeModal() {
  $("#modalBackdrop")?.classList.remove("open");
  $("#modalBackdrop")?.setAttribute("aria-hidden", "true");
}

function createTask(title) {
  if (taskList) {
    const li = document.createElement("li");
    li.innerHTML = `${title} <span class="badge purple">Neu</span>`;
    taskList.prepend(li);
    flash(li);
  }
  const rowContainer = $("#taskRows");
  if (rowContainer) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${title}</td><td><span class="badge amber">Mittel</span></td><td>Alex</td>`;
    rowContainer.prepend(row);
    flash(row);
  }
}

function saveModal() {
  const type = $("#modalType").value;
  const title = $("#modalName").value.trim() || "Neues Element";
  if (type === "project") {
    setView("projects");
    const card = document.createElement("article");
    card.className = "panel interactive-highlight";
    card.innerHTML = `<h2>${title}</h2><p>8% Fortschritt</p><span class="badge amber">In Planung</span>`;
    $("#projectCards")?.prepend(card);
    showToast("Projekt wurde erstellt.");
  }
  if (type === "task") {
    setView("tasks");
    createTask(title);
    showToast("Aufgabe wurde erstellt.");
  }
  if (type === "event") {
    setView("calendar");
    const event = document.createElement("article");
    event.className = "event interactive-highlight";
    event.innerHTML = `${title} <span>${$("#modalDate").value || "Heute"}, ${$("#modalTime").value || "ganztags"}</span>`;
    $("#calendarEvents")?.prepend(event);
    showToast("Termin wurde eingetragen.");
  }
  if (type === "file") {
    setView("files");
    const row = document.createElement("tr");
    row.className = "interactive-highlight";
    row.innerHTML = `<td>${title}</td><td>${$("#modalProject").value}</td><td><span class="badge purple">KI bereit</span></td>`;
    $("#fileRows")?.prepend(row);
    showToast("Datei wurde hinzugefuegt.");
  }
  addAgentMessage(`Ich habe "${title}" angelegt.`);
  closeModal();
}

function nowTime() {
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function addCoreMessage(text, type = "ai", strong = "") {
  const stream = $("#coreDialogueStream");
  if (!stream) return;
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type === "user" ? "user-bubble" : "ai-bubble"}`;
  bubble.innerHTML = `<p>${text}</p>${strong ? `<strong>${strong}</strong>` : ""}<span>${nowTime()}</span>`;
  stream.append(bubble);
  stream.scrollTop = stream.scrollHeight;
}

function updateCoreProgress() {
  const percent = Math.min(100, Math.round(((coreStep + 1) / coreSteps.length) * 100));
  $("#coreProgressText").textContent = `${percent}%`;
  $("#coreProgressBar").style.width = `${percent}%`;
  $("#coreBlockCounter").textContent = `${Math.min(coreStep + 1, coreSteps.length)} / ${coreSteps.length}`;
  $("#coreSaveTime").textContent = "Letzte Speicherung: gerade eben";
  $$("[data-core-step]").forEach((item, index) => {
    item.classList.toggle("completed", index < coreStep);
    item.classList.toggle("active", index === coreStep && !toolkitGenerated);
    item.querySelector("span").textContent = index < coreStep ? "Abgeschlossen" : index === coreStep && !toolkitGenerated ? "In Bearbeitung" : "Offen";
  });
}

function generateToolkit() {
  toolkitGenerated = true;
  coreStep = coreSteps.length - 1;
  updateCoreProgress();
  $("#coreProgressText").textContent = "100%";
  $("#coreProgressBar").style.width = "100%";
  $("#coreStatusBox").textContent = "Core Flow abgeschlossen. Werkzeugkasten wurde generiert.";
  $("#generatedToolkitText").textContent = "Aus dem Core Flow generiert: Methoden, Checklisten, Agenda, Aufgabenpakete, Timeline und Risiko-Hinweise.";
  $("#coreChoiceRow").style.display = "none";
  addCoreMessage("Der Core Flow ist abgeschlossen. Ich habe den Werkzeugkasten vorbereitet.", "ai", "Du kannst jetzt zum Werkzeugkasten wechseln oder herunterladen.");
  showToast("Werkzeugkasten wurde generiert.");
}

function advanceCore(answer, force = false) {
  const value = answer.trim();
  if (!value && !force) return;
  if (toolkitGenerated) {
    addCoreMessage("Der Core Flow ist bereits abgeschlossen. Oeffne den Werkzeugkasten fuer die Ergebnisse.", "ai");
    return;
  }
  if (value) {
    coreAnswers[coreStep] = value;
    addCoreMessage(value, "user");
  }
  if (coreStep >= coreSteps.length - 1) {
    generateToolkit();
    return;
  }
  coreStep += 1;
  updateCoreProgress();
  addCoreMessage(`Danke, ich habe Block ${coreStep} gespeichert. Jetzt geht es um "${coreSteps[coreStep][0]}".`, "ai", coreSteps[coreStep][1]);
  $("#coreInput").value = "";
}

function downloadToolkit() {
  const content = [
    "Fusion Werkzeugkasten - Demo Export",
    "",
    ...coreSteps.map((step, index) => `${index + 1}. ${step[0]}: ${coreAnswers[index] || "Noch offen"}`),
    "",
    "Empfehlungen: Design Thinking, World Cafe, Feedbackrunde",
    "Checklisten: Vorbereitung, Durchfuehrung, Nachbereitung",
    "Risiken: Teilnahmequote, Ressourcen, Budgetfreigabe",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "fusion-werkzeugkasten-demo.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function runAgentCommand(command) {
  const text = command.trim();
  if (!text) return;
  addAgentMessage(text, "user");
  const lower = text.toLowerCase();
  if (lower.includes("core")) { setView("coreflow"); addAgentMessage("Ich oeffne den Core Flow."); return; }
  if (lower.includes("kalender") || lower.includes("meeting") || lower.includes("termin")) { setView("calendar"); addAgentMessage("Ich oeffne die Kalenderplanung."); return; }
  if (lower.includes("datei") || lower.includes("dokument")) { setView("files"); addAgentMessage("Ich oeffne die Dokumentenplattform."); return; }
  if (lower.includes("projekt")) { setView("projects"); addAgentMessage("Ich oeffne die Projektuebersicht."); return; }
  if (lower.includes("aufgabe")) { setView("tasks"); createTask("Neue Co-Pilot Aufgabe"); addAgentMessage("Ich habe eine Aufgabe vorbereitet."); return; }
  if (lower.includes("werkzeug") || lower.includes("agenda")) { if (!toolkitGenerated) generateToolkit(); setView("toolkit"); addAgentMessage("Ich oeffne den generierten Werkzeugkasten."); return; }
  addAgentMessage("Ich habe die Aktion im Prototyp vorbereitet.");
  showToast("Co-Pilot Aktion ausgefuehrt.");
}

$("#loginForm")?.addEventListener("submit", (event) => { event.preventDefault(); enterDemo($("#loginEmail").value.trim()); });
$("#guestLogin")?.addEventListener("click", () => enterDemo("gast@fusion.demo"));

$$("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
$$("[data-create]").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.create)));
$("#modalForm")?.addEventListener("submit", (event) => { event.preventDefault(); saveModal(); });
$("#modalClose")?.addEventListener("click", closeModal);
$("#modalCancel")?.addEventListener("click", closeModal);
$("#modalBackdrop")?.addEventListener("click", (event) => { if (event.target.id === "modalBackdrop") closeModal(); });

$("#copilotToggle")?.addEventListener("click", () => {
  $("#copilot").classList.toggle("collapsed");
  document.body.classList.toggle("copilot-collapsed", $("#copilot").classList.contains("collapsed"));
});
$$("[data-mode]").forEach((button) => button.addEventListener("click", () => {
  activeAgentMode = button.dataset.mode;
  $$("[data-mode]").forEach((item) => item.classList.toggle("active", item === button));
  $("#modeLabel").textContent = activeAgentMode === "deep" ? "Denkmodus aktiv" : "Schnellmodus aktiv";
  $("#modeDescription").textContent = activeAgentMode === "deep" ? "Ich analysiere tiefer und plane mehrere Schritte voraus." : "Ich fuehre direkte Plattformaktionen aus.";
}));
$("#agentForm")?.addEventListener("submit", (event) => { event.preventDefault(); runAgentCommand(agentInput.value); agentInput.value = ""; });
$$("[data-command]").forEach((button) => button.addEventListener("click", () => runAgentCommand(button.dataset.command)));

$("#coreSend")?.addEventListener("click", () => advanceCore($("#coreInput").value));
$("#coreInput")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); advanceCore($("#coreInput").value); }
});
$$("[data-core-choice]").forEach((button) => button.addEventListener("click", () => advanceCore(button.dataset.coreChoice)));
$$("[data-core-tool]").forEach((button) => button.addEventListener("click", () => {
  const step = coreSteps[coreStep];
  if (button.dataset.coreTool === "examples") addCoreMessage("Beispiel:", "ai", step[2]);
  if (button.dataset.coreTool === "explain") addCoreMessage(`Dieser Block hilft Fusion, spaeter passende Planungselemente fuer "${step[0]}" zu erzeugen.`, "ai");
  if (button.dataset.coreTool === "suggest") { $("#coreInput").value = step[2]; $("#coreInput").focus(); addCoreMessage("Ich habe einen Vorschlag in das Eingabefeld gelegt.", "ai"); }
}));
$("#coreNext")?.addEventListener("click", () => advanceCore($("#coreInput").value || coreSteps[coreStep][2], true));
$("#coreBack")?.addEventListener("click", () => {
  if (coreStep > 0) { coreStep -= 1; toolkitGenerated = false; updateCoreProgress(); addCoreMessage(`Zurueck zu "${coreSteps[coreStep][0]}".`, "ai", coreSteps[coreStep][1]); }
});
$("#coreSave")?.addEventListener("click", () => { localStorage.setItem("fusionCoreAnswers", JSON.stringify(coreAnswers)); showToast("Core Flow gespeichert."); });
$("#downloadToolkit")?.addEventListener("click", downloadToolkit);

$$("[data-cal]").forEach((button) => button.addEventListener("click", () => {
  calendarMonth += button.dataset.cal === "next" ? 1 : -1;
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear += 1; }
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear -= 1; }
  $("#calendarLabel").textContent = `${monthNames[calendarMonth]} ${calendarYear}`;
}));
$$("[data-view-mode]").forEach((button) => button.addEventListener("click", () => {
  $$("[data-view-mode]").forEach((item) => item.classList.toggle("active", item === button));
  showToast(`Kalenderansicht: ${button.textContent}`);
}));

document.addEventListener("click", (event) => {
  const card = event.target.closest(".panel, .event, tr, li");
  if (card && !event.target.closest("button, input, textarea, select, form")) flash(card);
});
