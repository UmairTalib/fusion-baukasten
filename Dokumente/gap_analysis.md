# Gap Analysis — What We Have vs. What We Need

## Short Answer

We can build **roughly 70% of the application right now** without anything from domain experts.
The remaining 30% requires **3 specific deliverables** from them — none of which are blockers for Phase 1 and 2.

---

## What We Have and Can Build Immediately

### Infrastructure (100% ready)
- Docker architecture, repo structure, CI/CD — fully defined, no domain knowledge needed
- Database schema across all 8 domains — fully specified in the backend docs
- Auth system (login, guest mode, JWT) — fully specified
- All project management features (tasks, teams, calendar, files, communication) — all visible in V.05 prototype

### Frontend (100% ready)
- The V.05 HTML prototype is detailed enough to build the entire UI from:
  - Dashboard, Co-Pilot sidebar, all navigation views
  - Core Flow dialogue view layout
  - Toolkit viewer, reporting, calendar, files, communication centre

### 113-Method Catalogue (EXISTS — needs extraction)
- `Austauschformate-v2.xlsx` exists in the project folder
- It has 22+ columns: Format, Zielgruppe, Inklusivität, Kosten, Vorbereitung, Teilnehmer, Wirkungsgrad, Konflikttyp, Phase, Rechtl. Verankerung, Digital möglich, Beschreibung, Output, Altersgruppe, Eignung, Quellen, Klasse, Vorlaufzeit, Räumlicher Bezug, Thematische Eignung, Verwaltungserfahrung, Finanzierung
- **This is complete and ready to import.** I can write the seed script from this directly.

### Agent Architecture (100% specified)
- All 4 agent specs are detailed: triggers, roles, inputs, outputs
- The 3-state status label system (SUGGESTION/ACCEPTED/CONFLICT) is fully defined
- Back-propagation dependency chain is documented
- Async workflow (Celery + WebSocket) is fully designed

### Question Flow (PARTIALLY exists — has gaps)
- `fragen Priorisierung.docx` has questions grouped by topic with Muss/Kann priority
- `Fragen Prio.xlsx` has a structured breakdown of topics: Anlass, Ziel, Zielgruppe, Rahmenbedingungen
- The branching logic concept (Regeln 30-40% + RAG 60-70%) is defined in `Kombinatorik REGEL & AUG.docx`
- **What's there:** Question topics, priority levels (Muss/Kann), rough branching direction
- **What's missing:** The complete, final, word-for-word question text for all 7 blocks with answer options (chips/dropdowns) and exact branching conditions

---

## What Is Genuinely Missing (Needs Domain Experts)

### GAP 1 — Complete Question Catalogue (CRITICAL for Phase 2)

> **Blocker for:** Core Flow dialogue — the heart of the product

**What we have:** Question topics and priority flags  
**What we need:** The final question list for all 7 blocks in exact order, with:
- Exact German question wording (ready to display to users)
- Answer options for each question (the clickable chips)
- Branching rule: "If user picks X, skip to question Y"
- Which questions are Muss (always shown) vs. Kann (conditional)

**Who provides this:** The participation planning domain expert on your team

**Workaround until delivered:** I can build the full dialogue engine, UI, and database using the draft questions from the docs as placeholders. The system is designed so questions are stored in the database — swapping them out later is just a data update, not a code change.

---

### GAP 2 — Curated Knowledge Anchors (IMPORTANT for Phase 3)

> **Blocker for:** Strategy Agent making accurate, legally safe recommendations

The `KI-Wissensarchitektur.docx` explicitly identifies what the AI **cannot invent** and must read from a curated database. This is the data that prevents the AI from recommending a "Planungszelle" (costs €50,000-150,000) to someone with a €2,000 budget.

**What is missing:**

| Data Point | Why AI Cannot Invent It | Status |
|---|---|---|
| Legal anchors per German state | BauGB §3, §4, Gemeindeordnungen differ by Bundesland | **Missing** |
| Funding programmes | "Demokratie leben!", Städtebauförderung, EU-Fonds — real names and eligibility rules | **Missing** |
| Real cost ranges per format | Planungszelle = €50k-150k. World Café = nearly free. | Partially in Excel |
| Minimum lead times per format | Planungszelle needs 3-6 months prep. World Café needs 1 week. | Partially in Excel |
| State-specific participation law | Which formats are legally mandatory vs. voluntary by Bundesland | **Missing** |

**Who provides this:** Legal/policy expert on your team, or a structured research session (1-2 days)

**Workaround until delivered:** Strategy Agent works with the data already in `Austauschformate-v2.xlsx`. Legal anchors and funding programmes return "please verify with your legal advisor" until the curated data exists. The architecture already supports adding this data later without code changes.

---

### GAP 3 — Agent System Prompts (IMPORTANT for Phase 3)

> **Blocker for:** Real LLM integration in Phase 3

Each agent needs a detailed YAML system prompt that tells the LLM:
- Its exact role and what it is NOT allowed to do
- The output JSON schema it must produce (for Pydantic validation)
- The tone and language register (plain German, WCAG-friendly, Flesch-Kincaid grade 8)
- Quality criteria for its responses

**What we have:** The agent specifications describe the role in prose  
**What we need:** The prompts written as structured YAML files, ready for LLM calls

**Who provides this:** Me (the developer) — this is engineering work, not domain expert work. I will write these based on the agent specs. But they need **review from a domain expert** before going live to check the German wording and participation planning accuracy.

---

## Summary Table

| Component | Status | Blocks Which Phase? |
|---|---|---|
| Infrastructure, Docker, DB, Auth | Ready to build | Nothing |
| Full frontend (all views) | Ready to build | Nothing |
| 113-method catalogue import | Ready to build (Excel exists) | Nothing |
| PM features (tasks, teams, calendar) | Ready to build | Nothing |
| Core Flow UI + dialogue engine | Ready to build | Nothing |
| Context enrichment (file upload, status labels) | Ready to build | Nothing |
| **Complete question catalogue** | **Missing — need domain experts** | **Phase 2** |
| Agent system prompts | I write them, domain expert reviews | Phase 3 |
| Legal anchors + funding programmes | Missing — need domain experts | Phase 3 |
| State-specific participation law | Missing — need domain experts | Phase 3 |

---

## Recommended Action

**Right now:** Start Phase 1 and 2 immediately. I build the full infrastructure, database, frontend, and dialogue engine using placeholder questions from the existing docs.

**In parallel (while I build):** Ask your domain experts to produce:
1. The final question list for all 7 blocks (a structured Word or Excel doc is fine)
2. A list of the key legal references and funding programmes they want the system to know about

Both of these are needed before Phase 3 (Week 8) — so there is 7 weeks for the team to produce them. That is realistic.

**For the agent prompts:** I write the first versions myself in Week 8-9. Domain experts review and correct the German wording and participation knowledge — estimated 2-3 hours of their time.
