# Fusion-Baukasten: Master Project Overview

## What is the Fusion-Baukasten?
The **Fusion-Baukasten** is an AI-powered web application designed to help municipalities and project managers plan "Civic Participation" (*Bürgerbeteiligung*) events. 

Planning these events is complex. Planners must consider legal requirements, budgets, target demographics, and hundreds of potential event formats (like Town Halls, Citizen Juries, or Online Surveys). 
The Fusion-Baukasten simplifies this by pairing the user with an **AI Copilot**. The AI asks the user targeted questions, fills out a planning canvas, and ultimately recommends the best participation formats for their specific situation.

---

## The Core User Workflow (The "Happy Path")
Here is the step-by-step journey a user will take when using the finished application:

### 1. Onboarding & Dashboard
- **Login:** The user logs into the web app (or continues as a Guest).
- **Dashboard:** They arrive at the main dashboard, which shows their active projects and tasks.
- **Creation:** They click "New Participation Project" and give it a name (e.g., "Redesign of Central Park").

### 2. The 7-Block AI Dialogue
The core of the app is a side-by-side interface. On the left is the AI Chat (Copilot); on the right is a dynamic Form (The Workspace). The AI guides the user through 7 sequential "Blocks":
- **Block A (Background):** AI asks *Why are we doing this?* (e.g., Legal requirement vs. voluntary).
- **Block B (Goals):** AI asks *What do we want to achieve?* 
- **Block C (Target Group):** AI asks *Who needs to be involved?* (e.g., Seniors, Youth, Businesses).
- **Block D (Methods):** Based on A, B, and C, the AI dives into its database and **recommends specific participation methods** (e.g., "Since you have a low budget and want to reach youths, we recommend an Online Idea Board").
- **Block E (Resources):** AI asks about budget and staff availability.
- **Block F (Communication):** AI asks how the public will be invited.
- **Block G (Evaluation):** AI asks how the success of the project will be measured.

### 3. Collaboration & Refinement
- If the user gets stuck, they can tag team members to answer specific questions.
- The user can chat freely with the AI (e.g., *"Can you suggest a cheaper alternative to the method you just recommended?"*), and the AI will update the workspace in real-time.

### 4. Final Export
- Once all 7 blocks are completed, the user clicks "Generate Concept".
- The system compiles all answers, AI recommendations, and cost estimates into a beautiful, printable PDF document that the user can hand to their boss or the city council for approval.

---

## Technical Feature Breakdown
To achieve this workflow, we are building the application feature-by-feature. Here is exactly what each feature contains:

### Feature 1: Authentication & Identity
* **What it is:** The login system.
* **Backend:** Secure password hashing and database storage for User Accounts.
* **Frontend:** The Login, Registration, and "Continue as Guest" screens.

### Feature 2: Project Management
* **What it is:** The Dashboard.
* **Backend:** Database tables for Projects and Teams. APIs to Create/Read/Update/Delete projects.
* **Frontend:** A dashboard showing project cards, progress bars, and navigation.

### Feature 3: The Workspace Engine (The 7 Blocks)
* **What it is:** The interactive forms on the right side of the screen.
* **Backend:** Database architecture to save drafts of Block A through G instantly.
* **Frontend:** The complex UI where users can check boxes, write text, and pick dates for all 7 planning blocks.

### Feature 4: The AI Copilot Integration
* **What it is:** The Chat interface on the left side of the screen.
* **Backend:** The AI engine. We use prompts to connect to OpenAI/Gemini, load the "Domain Expert Knowledge", and generate smart responses based on the user's current Block.
* **Frontend:** A real-time chat window that uses **Zustand** (state management) to magically update the Workspace forms whenever the AI makes a suggestion.

### Feature 5: Task Management & Inbox
* **What it is:** The collaboration tools.
* **Backend:** Database tables tracking To-Do lists and Notifications.
* **Frontend:** A sidebar inbox showing alerts like "John assigned you to answer Block C".

### Feature 6: PDF Export & Reporting
* **What it is:** The final deliverable generation.
* **Backend:** A rendering engine that converts the database answers into a polished PDF document.
* **Frontend:** A "Download Concept" button and progress indicator.
