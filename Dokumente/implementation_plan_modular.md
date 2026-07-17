# Fusion-Baukasten: Modular Implementation Plan (Vertical Slicing)

## 1. Overview and Rationale
Based on your feedback, we are pivoting from a "horizontal" phase-based approach (building all frontend, then all backend) to a **Vertical Feature-by-Feature Approach**. 

This means we will build the application in isolated modules. For every feature we build, we will implement both the **Database/Backend API** and the **Next.js Frontend UI** at the exact same time. This ensures every piece of code we write is immediately functional, testable, and modular.

---

## 2. Feature Roadmap (Implementation Order)

### Feature 1: Authentication & Identity Management
*Dependency: None*
* **Backend:** Validate JWT tokens, manage guest sessions (UUIDs), and expose `/api/v1/users/me`.
* **Frontend:** Build the NextAuth integration and the Login/Registration screens.
* **Goal:** A user can log in to the Next.js app and retrieve their data from the Postgres database.

### Feature 2: Project Dashboard (The Hub)
*Dependency: Feature 1*
* **Backend:** CRUD operations for `Projects` (Domain 2).
* **Frontend:** The main `/dashboard` route. A grid of user projects and a "Create New Project" button.
* **Goal:** A user can view and create new participation projects.

### Feature 3: Core Flow Engine (Block A)
*Dependency: Feature 2*
* **Backend:** API endpoints to save and load `CoreFlowProgress` and `BlockAnswers` (Domain 3).
* **Frontend:** The `/project/[id]/flow` route. Implement the specific forms for Block A (Goals & Target Audience).
* **Goal:** A user can type in the frontend form and it saves directly to the database in real-time.

### Feature 4: AI Copilot Chat
*Dependency: Feature 3*
* **Backend:** Implement the Agent endpoints connecting to Gemini/OpenAI (Domain 5).
* **Frontend:** The middle Chat Pane (`Copilot.tsx`). Integrate `Zustand` to sync chat state with the Block A form.
* **Goal:** The AI can ask the user questions, and based on the user's answer, automatically fill in the Block A form fields on the right.

### Feature 5: Task Management & Inbox
*Dependency: Feature 2*
* **Backend:** Endpoints for Tasks and Activity Logs (Domain 4).
* **Frontend:** The `/tasks` and `/inbox` sidebar routes.
* **Goal:** Users can assign tasks to team members and view project notifications.

---

## 3. Development Workflow

For every feature listed above, the agent will follow this strict cycle:
1. **Design:** Review the Figma prototype for the specific feature.
2. **Backend Code:** Create the FastAPI endpoints and test them.
3. **Frontend Code:** Build the React components.
4. **Integration:** Connect the frontend to the backend.
5. **Commit:** Push the completed, working feature to GitHub.

## User Review Required

> [!IMPORTANT]
> 1. **Modular Approach:** Does this feature-by-feature ordering align better with your expectations?
> 2. **UI Design:** You mentioned the previous UI did not look good. Moving forward, I will strictly follow the pixel-perfect styling from your Figma exports, focusing on one single page at a time. Do you have any specific aesthetic guidelines you want me to prioritize?
