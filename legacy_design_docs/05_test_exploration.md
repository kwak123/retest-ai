# Phase 5: Test Exploration & UI

## Goal
To provide a friendlier, visual interface for developers to browse generated tests, audit their provenance (which prompt created them), and trigger manual regenerations without remembering CLI flags.

## 1. The Concept
While the CLI is great for automation, a "Dashboard" view allows for better understanding of the *history* of testing in the project.

## 2. Implementation Options

### 2.1. Simple HTML Report (`retest report`)
Generates a static `retest-report.html` file in the project root.
*   **Features**:
    *   Table of all test files.
    *   Breakdown of "Test Cases by Prompt Version" (e.g., "80% of tests are from obsolete v1.0").
    *   Clickable diffs showing recent changes.
*   **Pros**: Zero runtime dependency, easy to share.
*   **Cons**: Read-only.

### 2.2. Local Server (`retest ui`)
Spins up a localhost server (e.g., `http://localhost:3333`).
*   **Tech Stack**: Lightweight Node/Express server serving a React/Vite frontend.
*   **Features**:
    *   **Live Audit**: Scans source files and parses `@prompt-id` tags in real-time.
    *   **Interactive Refinement**:
        *   User clicks a specific test case.
        *   Clicks "Regenerate with stricter settings".
        *   The UI calls the backend agent API.
    *   **Prompt Diff Viewer**: Visually comparing Prompt v1 vs v2 to see what changed in the instructions.

## 3. Workflow for Iteration (UI Driven)
1.  Run `retest ui`.
2.  Open browser.
3.  Navigate to `AuthService.test.ts`.
4.  See that 3 tests are failing.
5.  Select those 3 tests in the UI.
6.  Type "Handle null inputs correctly" in the refined prompt box.
7.  Click "Regenerate".
8.  The UI updates the file on disk automatically.

## 4. MVP Strategy
Start with **2.1 (Static HTML)** for the MVP to provide visibility. Move to **2.2 (Local Server)** once the core agent logic is stable.
