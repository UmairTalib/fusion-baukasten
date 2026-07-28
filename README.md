# Fusion-Baukasten 🚀

> **A next-generation, AI-driven project management and collaboration platform for municipal participation projects.**

Fusion-Baukasten is a hybrid platform that seamlessly integrates a classical Project Management Dashboard with an intelligent, conversational Core Flow. It guides users through complex project planning using dynamic AI dialogue, rather than static forms.

---

## 🏗️ Architecture

The platform uses a modern, scalable stack:

- **Frontend:** Next.js 15 (App Router), React, TailwindCSS, TypeScript
- **Backend:** FastAPI (Python 3.13), SQLAlchemy, Pydantic
- **Database:** PostgreSQL (with `pgvector` for AI embeddings)
- **Caching & Queues:** Redis, Celery
- **Infrastructure:** Docker & Docker Compose

## 📁 Repository Structure

```text
.
├── frontend/           # Next.js application (React, Tailwind)
├── backend/            # FastAPI application (Python, Alembic, SQLAlchemy)
├── docker-compose.yml  # Local infrastructure (Postgres, Redis)
└── README.md           # You are here
```

## 🚀 Getting Started (Local Development)

This project uses a **hybrid development approach**: infrastructure runs in Docker, while the application code runs natively on your machine for maximum development speed.

### Prerequisites
- Node.js (v20+)
- Python (3.13+)
- Docker Desktop
- [uv](https://github.com/astral-sh/uv) (Extremely fast Python package manager)

### 1. Start the Infrastructure
```bash
docker-compose up -d
```
*Starts PostgreSQL on port 5432 and Redis on port 6379.*

### 2. Run the Backend
```bash
cd backend
uv venv
source .venv/bin/activate
uv run alembic upgrade head  # Apply database migrations
uv run uvicorn app.main:app --reload --port 8000
```
*API available at `http://localhost:8000` (Swagger UI at `/docs`).*

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Web app available at `http://localhost:3000`.*

---

## 🧠 Core Features & Module Status

1. **Authentication & Identity System (✅ Complete & Verified):**
   - **Role-Based Access Control:** Project Manager, Team Member, Client roles.
   - **Enterprise Security:** Min 8 chars, uppercase, lowercase, digit, and any special character (`[^a-zA-Z0-9]`). Case-insensitive email processing.
   - **Verification & Recovery:** Tokenized email verification via Resend API and self-service password reset.
   - **Guest Mode:** Frictionless trial access with local & cookie UUID session persistence.
   - **Server-Side Route Guarding:** Next.js Edge `middleware.ts` intercepting unauthorized navigation with zero UI flicker.

2. **Intelligent Dialogue System (Core Flow):** Guides users through 7 planning blocks (A-G) using conversational AI.
3. **Dynamic Project Dashboard:** Automatically adapts based on the user's role (Project Manager, Team Member, Client/Guest).
4. **Context Enrichment:** Automatically analyzes uploaded PDFs and Word documents to provide intelligent context.
5. **Werkzeugkasten (Toolkit):** Generates actionable timelines, checklists, and exported reports (via WeasyPrint).

## 📐 Architecture Principles
- **Modular Architecture:** All code (frontend components, backend APIs, services) is strictly modular and feature-isolated.
- **Open-Source Priority:** Open-source technologies are prioritized for all new dependencies.

## 🔒 License
Proprietary & Confidential. All rights reserved.
