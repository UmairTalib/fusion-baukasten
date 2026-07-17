# Phase 2: Frontend Implementation Plan

This plan details how we will translate the static HTML/CSS prototypes (`05_extracted`) into a dynamic, production-ready **Next.js 15 App Router** frontend.

## 🎨 Design System & Styling (TailwindCSS)
The original `styles.css` uses plain CSS variables and custom classes. We will migrate these to **TailwindCSS** configuration (`tailwind.config.ts`) for utility-first styling while maintaining the exact pixel-perfect premium design from the prototype.

**Extracted Color Palette:**
- Primary (Purple): `#5c3be0`
- Background: `#f8faff`
- Panel: `#ffffff`
- Text (Dark): `#0a1230`

## 🧩 React Component Architecture
We will break down the monolith `index.html` into reusable React Server Components and Client Components in Next.js:

1. **`app/layout.tsx`**: Global wrapper, loads Google Font "Inter", injects Tailwind globals.
2. **`components/layout/Sidebar.tsx`**: The left navigation pane (Home, Flow, KI-Agenten).
3. **`components/layout/Copilot.tsx`**: The middle conversational agent panel that drives the logic.
4. **`components/layout/Workspace.tsx`**: The main right pane where Blocks A-G are rendered dynamically.
5. **`components/ui/`**: Reusable generic atoms (Buttons, Inputs, Cards, ChatBubbles).

## 🔀 Routing Strategy (App Router)
- `/login` -> The auth screen (NextAuth integration).
- `/` -> Main Dashboard (Overview of Projects).
- `/project/[id]` -> The specific project workspace view.
- `/project/[id]/flow/[blockId]` -> The specific block (A, B, C, etc.) being worked on.

## 💾 State Management
We will use **Zustand** (or React Context) for the frontend state to manage:
- The currently active chat history in the Copilot.
- The real-time draft answers for the current Block.
- Syncing state between the Copilot (middle pane) and Workspace (right pane) so that when the AI updates a value, the Workspace UI updates instantly.

## User Review Required

> [!IMPORTANT]  
> 1. **Tailwind vs Plain CSS:** The prototype uses 3500 lines of plain CSS. I plan to refactor this into **TailwindCSS** to follow Next.js modern best practices. Do you approve of this, or do you strictly want me to just copy-paste the raw `styles.css` file?
> 2. **State Management:** I plan to use `Zustand` to handle the complex state syncing between the AI Chat and the Form fields. Is this acceptable?

## Verification Plan
1. Convert `styles.css` tokens to Tailwind config.
2. Build the `/login` screen and verify NextAuth integration.
3. Build the main 3-pane layout (Sidebar, Copilot, Workspace).
4. Demonstrate a visual walkthrough using screenshots.
