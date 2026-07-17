# Fusion-Baukasten (deliberAIde) — Full Project Analysis & Implementation Plan

## 🔍 What Is This Project?

**Fusion-Baukasten** (also referenced as **deliberAIde**) is an AI-powered, browser-based **civic participation planning tool**, developed for and by **Universität Siegen**. Its German name means "Fusion Construction Kit."

### Core Problem It Solves
Municipalities, NGOs, and civic organizers have no structured digital tool to **plan** participation events (workshops, citizens' dialogues, public hearings). Existing tools (DIPAS, CitizenLab, Consul) are about **running** events, not **planning** them. Fusion fills this gap.

### What the Product Does (End-to-End)
1. **User opens the app** — optionally logs in, or continues as guest (no forced registration).
2. **Starts a new project** → the AI Co-Pilot (Planungs-Agent) guides them through **7 dialogue blocks (A–G)**:
   - A: Occasion & background
   - B: Goals & thematic focus
   - C: Target groups → triggers **Zielgruppen-Agent** (audience profiler)
   - D: Content & method planning → triggers **Strategie-Agent** (method recommender from 113-format catalogue)
   - E: Organisation & resources
   - F: Communication & outreach
   - G: Evaluation & documentation
3. The **Kontext-Agent** analyses uploaded documents and web research, tagging each extracted fact as `VORSCHLAG → ÜBERNOMMEN → KONFLIKT` (Human-in-the-Loop).
4. At the end, the system auto-generates a **Werkzeugkasten** (toolkit PDF/Word export) — a ready-to-use participation planning document.
5. A **Project Management Dashboard** layer manages tasks, teams, timelines, communication, and file sharing — modelled closely on the V.05 HTML prototype.

### Who Uses It
- **Primary**: Civic planners, municipal employees, NGO project managers, university researchers
- **Secondary**: Moderators, consultants, participation experts, citizen groups

---

## 📁 Your Files — What Each Folder Contains

| Folder | Contents |
|---|---|
| `09_Konzept + Businesslogik` | Full Business Logic spec (Business-Logik_Projekt-Planungsassistent.docx) — the **master requirements document** |
| `10_Überblick` | Strategic overview, curated-knowledge-vs-AI analysis (July 2026), methods overview PDF |
| `11_Backend/Backend-Services` | Backend services architecture, PM diagram specs |
| `11_Backend/Copilot-Modell` | Full Copilot model spec, agentic backend impact docs, orchestration layer, Context Enrichment Service |
| `11_Backend/Datenbankstruktur` | 8-area database schema across: Stammdaten, Projekte, Dialog, Kontext, Zielgruppen, Methoden, Outputs, Evaluation |
| `11_Backend/KI-Agenten` | 4 agent specs: Planungs-Agent, Zielgruppen-Agent, Strategie-Agent, Kontext-Agent |
| `12_Kuratierte Wissensbasis` | Knowledge base architecture, format catalogues (v1–v3), exchange formats Excel |
| `04_Integration in KI` | AI learning process, question prioritization, GPT integration instructions |
| `Frontend Design/Prototypen` | **5 iterations** of the HTML/CSS/JS prototype — V.05 is the latest (1660-line index.html with full dashboard) |
| `Business Logic Shared Version.png` | Visual business logic diagram |

---

## 🏗️ Recommended Tech Stack

> [!IMPORTANT]
> This is a **commercial-grade, containerizable, scalable** system. Every choice below is made with Docker/Kubernetes readiness, DSGVO compliance, and long-term maintainability in mind.

### Frontend
| Choice | Technology | Rationale |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR for SEO, React ecosystem, built-in routing, excellent TypeScript support |
| Language | **TypeScript** | Type safety critical for complex agent state management |
| Styling | **Tailwind CSS** | Rapid iteration, design tokens, responsive — matches the dashboard-heavy UI |
| UI Components | **shadcn/ui** | Composable, accessible, unstyled-first components |
| State Management | **Zustand** | Lightweight, perfect for co-pilot/agent state |
| Real-time | **Socket.IO client** | Agent progress streaming, live co-pilot updates |
| Forms | **React Hook Form + Zod** | Complex multi-block dialogue forms |
| Charts/KPI | **Recharts** | KPI dashboard panels |
| Export | **react-pdf** + **docx** library | PDF/Word Werkzeugkasten exports |

### Backend
| Choice | Technology | Rationale |
|---|---|---|
| Framework | **FastAPI** (Python) | Async, OpenAPI auto-docs, perfect for AI/LLM integration, async job queues |
| Language | **Python 3.12** | Native LangChain/LangGraph, OpenAI SDK, best AI ecosystem |
| Agent Orchestration | **LangGraph** | Stateful multi-agent workflows, exactly matches your 4-agent design with triggers |
| LLM | **OpenAI GPT-4o** (primary) + **GPT-4o-mini** (cost optimization) | Specified in your docs |
| Task Queue | **Celery + Redis** | Async agent calls (2–30s latency), exactly as specified in your backend docs |
| WebSockets | **FastAPI WebSockets** | Real-time agent status streaming to frontend |
| Auth | **FastAPI-Users + JWT** | DSGVO-compliant, guest mode support |
| File Processing | **LangChain Document Loaders** + **PyMuPDF** | PDF/DOCX context extraction for Kontext-Agent |

### Database
| Choice | Technology | Rationale |
|---|---|---|
| Primary DB | **PostgreSQL 16** | Specified in your documents; JSONB for agent snapshots, PostGIS-ready |
| Cache / Queue Broker | **Redis 7** | Celery broker + frontend polling cache |
| Vector DB | **pgvector** (PostgreSQL extension) | Semantic search over the 113-method knowledge base |
| ORM | **SQLAlchemy 2.0 + Alembic** | Async ORM, migration management |

### Infrastructure & DevOps
| Choice | Technology | Rationale |
|---|---|---|
| Containerization | **Docker + Docker Compose** | All services containerized from Day 1 |
| Orchestration | **Kubernetes** (production) | Scale-ready; use Docker Compose for dev |
| CI/CD | **GitHub Actions** | Build → test → push to registry → deploy |
| Container Registry | **GitHub Container Registry (GHCR)** | Free with GitHub, integrated |
| Secrets | **.env files** (dev) → **Kubernetes Secrets** (prod) | Never hardcode |
| Cloud (optional) | **Open Telekom Cloud** or **Hetzner** | Both are DSGVO-compliant EU options your docs mention |

### Knowledge Base
| Choice | Technology | Rationale |
|---|---|---|
| Method Catalogue | **PostgreSQL + pgvector** | 113 formats from `Austauschformate-v2.xlsx` embedded and searchable |
| Knowledge Versioning | **YAML files in Git** | Agent prompts and curated anchors versioned in repo (as specified in backend docs) |

---

## 📂 Recommended Repository Structure

```
fusion-baukasten/
├── .github/
│   └── workflows/
│       ├── ci.yml            # lint, test, build
│       └── deploy.yml        # deploy to staging/prod
│
├── apps/
│   ├── web/                  # Next.js 14 frontend
│   │   ├── app/              # App Router pages
│   │   │   ├── (auth)/       # login, register, guest
│   │   │   ├── dashboard/    # main dashboard (V.05 design)
│   │   │   ├── projects/     # project list + detail
│   │   │   ├── core-flow/    # 7-block AI dialogue
│   │   │   ├── toolkit/      # Werkzeugkasten viewer
│   │   │   ├── reporting/    # KPI + reporting
│   │   │   └── api/          # Next.js API routes (thin BFF layer)
│   │   ├── components/
│   │   │   ├── copilot/      # Co-Pilot sidebar components
│   │   │   ├── agents/       # Agent status cards
│   │   │   ├── core-flow/    # Dialogue block components
│   │   │   ├── dashboard/    # Stats, KPI, timeline components
│   │   │   └── ui/           # shadcn/ui base components
│   │   ├── lib/
│   │   │   ├── api/          # API client (typed fetch wrappers)
│   │   │   ├── store/        # Zustand stores (copilot, project, agent)
│   │   │   └── types/        # Shared TypeScript types
│   │   ├── public/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── api/                  # FastAPI backend
│       ├── app/
│       │   ├── agents/       # LangGraph agent implementations
│       │   │   ├── planning_agent.py
│       │   │   ├── audience_agent.py
│       │   │   ├── strategy_agent.py
│       │   │   └── context_agent.py
│       │   ├── api/          # FastAPI routers
│       │   │   ├── auth.py
│       │   │   ├── projects.py
│       │   │   ├── dialog.py
│       │   │   ├── context.py
│       │   │   └── outputs.py
│       │   ├── core/         # Config, DB session, dependencies
│       │   ├── models/       # SQLAlchemy ORM models (8 database areas)
│       │   ├── schemas/      # Pydantic schemas (input/output validation)
│       │   ├── services/     # Business logic services
│       │   │   ├── dialog_engine.py      # Orchestration layer
│       │   │   ├── context_enrichment.py # Status-label system
│       │   │   ├── back_propagation.py   # Dependency change cascade
│       │   │   └── export_service.py     # PDF/DOCX generation
│       │   ├── workers/      # Celery tasks
│       │   │   └── agent_workers.py
│       │   └── prompts/      # Versioned YAML agent prompts
│       │       ├── planning_agent.yaml
│       │       ├── audience_agent.yaml
│       │       ├── strategy_agent.yaml
│       │       └── context_agent.yaml
│       ├── migrations/       # Alembic migrations
│       ├── tests/
│       ├── Dockerfile
│       └── requirements.txt
│
├── packages/
│   └── shared-types/         # Shared TypeScript types (if using monorepo)
│
├── data/
│   ├── knowledge-base/
│   │   ├── methods/          # Austauschformate-v2.xlsx → JSON/YAML
│   │   ├── legal-anchors/    # Curated legal/funding data
│   │   └── seeds/            # DB seed scripts
│   └── prompts/              # Prompt templates
│
├── infra/
│   ├── docker-compose.yml         # Full local dev stack
│   ├── docker-compose.prod.yml    # Production overrides
│   ├── nginx/
│   │   └── nginx.conf             # Reverse proxy config
│   └── k8s/                       # Kubernetes manifests (Phase 2+)
│       ├── deployments/
│       ├── services/
│       └── ingress/
│
├── docs/
│   ├── architecture.md
│   ├── agent-design.md
│   ├── api.md
│   └── deployment.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🐳 Docker Architecture (Containerization Strategy)

```
docker-compose.yml services:
┌─────────────────────────────────────────────┐
│  nginx (reverse proxy, port 80/443)          │
│    → /api  → api:8000                        │
│    → /     → web:3000                        │
├─────────────────────────────────────────────┤
│  web (Next.js, port 3000)                    │
│  api (FastAPI + uvicorn, port 8000)          │
│  worker (Celery worker — agent jobs)         │
│  postgres (PostgreSQL 16, port 5432)         │
│  redis (Redis 7, port 6379)                  │
│  pgadmin (optional dev UI, port 5050)        │
└─────────────────────────────────────────────┘
```

Each service has its own **Dockerfile**. All secrets via `.env`. **Zero hardcoded credentials**.

---

## 🗄️ Database Schema (8 Areas — from your docs)

| Area | Key Tables |
|---|---|
| 1. Stammdaten | `users`, `organizations`, `roles` |
| 2. Projekte | `projects`, `project_versions`, `project_permissions` |
| 3. Dialog | `question_catalogue`, `dialog_answers`, `block_summaries`, `dialog_snapshots` |
| 4. Kontext | `context_files`, `context_entries` (with `status_label` ENUM: VORSCHLAG/ÜBERNOMMEN/KONFLIKT), `conflict_resolutions` |
| 5. Zielgruppen | `audience_profiles`, `audience_traits`, `barriers`, `needs` |
| 6. Methoden | `methods` (from 113-format catalogue), `method_filters`, `strategy_runs`, `strategy_recommendations` |
| 7. Outputs | `toolkits`, `praxis_plans`, `exports` |
| 8. Evaluation | `system_logs`, `agent_calls` (with status: pending/running/done), `block_status`, `metrics` |

---

## 🤖 Agent Architecture (LangGraph)

```
User Input
    │
    ▼
┌──────────────────────┐
│   Planungs-Agent     │ ← Central Orchestrator
│   (Dialog Engine)    │   Manages 7 blocks A–G
└──────┬───────────────┘
       │ triggers
       ├──────────────────► Zielgruppen-Agent (audience profiler)
       │                    → writes AudienceProfile to DB
       │
       ├──────────────────► Strategie-Agent (method matcher)
       │                    → reads 113-format knowledge base
       │                    → outputs StrategyPaket to DB
       │
       └──────────────────► Kontext-Agent (document/web analyzer)
                            → extracts facts, tags as VORSCHLAG
                            → back-propagates KONFLIKT flags
```

Each agent call is:
1. Written to `agent_calls` table with status `pending`
2. Picked up by **Celery worker**
3. Processed asynchronously (2–30s)
4. Frontend receives updates via **WebSocket** (real-time) or polling `/dialog/agent-status/{project_id}` every 2s

---

## 📅 6-Month Roadmap

> [!NOTE]
> You have until ~January 2027. This plan is aggressive but achievable solo or in a small team (2–3 devs).

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Initialize Git monorepo with the folder structure above
- [ ] Docker Compose with postgres + redis + placeholder services running
- [ ] Next.js app scaffolded with Tailwind + shadcn/ui
- [ ] FastAPI app scaffolded with SQLAlchemy + Alembic
- [ ] Database migrations for all 8 schema areas
- [ ] Seed script: import 113 methods from `Austauschformate-v2.xlsx` into PostgreSQL
- [ ] Auth: JWT login + guest mode

### Phase 2 — Core Flow (Weeks 4–7)
- [ ] Implement Planungs-Agent (LangGraph) — 7 blocks, Express + Detailed mode
- [ ] Block-summary logic after each block
- [ ] Frontend: Core Flow view with conversational UI (dialogue chips, single question per screen)
- [ ] Database: save all dialog answers, block summaries, snapshots

### Phase 3 — Sub-Agents (Weeks 8–11)
- [ ] Zielgruppen-Agent — audience profiler with barrier/need matrix
- [ ] Strategie-Agent — method matching against 113-format knowledge base
- [ ] Kontext-Agent — PDF/DOCX upload parsing + VORSCHLAG/ÜBERNOMMEN/KONFLIKT labels
- [ ] Back-propagation engine — cascading change detection
- [ ] Celery workers for all async agent calls
- [ ] WebSocket real-time agent progress streaming

### Phase 4 — Dashboard & PM Layer (Weeks 12–16)
- [ ] Dashboard view (match V.05 prototype: stats, AI timeline, projects, tasks, KPI)
- [ ] Projects CRUD + versioning
- [ ] Task management (Kanban / list)
- [ ] Calendar view
- [ ] File manager
- [ ] Team / Persons management
- [ ] Communication center (in-app chat)
- [ ] Werkzeugkasten viewer

### Phase 5 — Outputs & Export (Weeks 17–19)
- [ ] PDF export of Werkzeugkasten (react-pdf)
- [ ] Word/DOCX export
- [ ] Reporting + KPI dashboard
- [ ] Email notifications (agent_fertig, confirmation_pending)

### Phase 6 — Polish, Security & Deploy (Weeks 20–24)
- [ ] WCAG 2.1 AA accessibility audit
- [ ] DSGVO compliance review (data minimization, consent, deletion)
- [ ] Performance tuning (< 200ms API response target)
- [ ] Kubernetes manifests for production deployment
- [ ] GitHub Actions CI/CD pipeline
- [ ] End-to-end tests (Playwright)
- [ ] Load testing
- [ ] Documentation (API docs via FastAPI's built-in Swagger, user manual)

---

## 🚀 Where to Start RIGHT NOW

**Day 1 actions:**
1. `git init fusion-baukasten` → push to GitHub
2. Copy the folder structure above
3. `docker-compose.yml` with postgres + redis
4. `npx create-next-app@latest apps/web --typescript --tailwind`
5. `fastapi` + `uvicorn` scaffolded in `apps/api`
6. First Alembic migration with `users` + `projects` tables

---

## ❓ Open Questions (Need Your Input)

> [!IMPORTANT]
> Please review and answer these before we begin implementation:

1. **Team size**: Are you building this alone or with a team? This impacts how we split work (monorepo vs multi-repo, CI complexity).

2. **LLM API**: Do you have access to an OpenAI API key for GPT-4o? Or should we plan for an alternative (Anthropic Claude, open-source Mistral, or Azure OpenAI)?

3. **Hosting target**: Open Telekom Cloud, Hetzner, AWS, or University Siegen servers? This affects the Kubernetes/deployment config.

4. **Language**: The UI is in German (as seen in prototype). Should the **codebase** (variable names, comments) be in German or English?

5. **Knowledge base import**: Do you have the `Austauschformate-v2.xlsx` file (113 participation formats) available to seed the database? I see references to it in `12_Kuratierte Wissensbasis/`.

6. **Authentication depth**: The V.05 prototype mentions guest mode. Should guest sessions be persistent (stored in DB) or ephemeral (local storage only)?

7. **Figma connection**: Your previous conversation mentions a Figma access token. Do you want the final implementation to pull designs from Figma, or use the V.05 HTML/CSS prototype as the design reference?
