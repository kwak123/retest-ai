# Phase 3: Iteration & Tuning (The "Learning" Loop)

## Goal
To allow the agent to evolve its system prompts based on natural language feedback from the user. This is where "Self-Learning" happens.

## 1. The `refine` Workflow
Command: `retest refine [feedback-string]`

### 1.1. Input Analysis
User input: `"You are mocking the DB connection but in this project we use an in-memory test DB."`

The **Intent Parser** analyzes this input against the current context:
1.  Is this a request to **Regenerate** the last run only?
2.  Is this a request to **Modify the Prompt** for future runs? (Classification: `PROMPT_UPDATE`)

### 1.2. The Learner Module
If intent is `PROMPT_UPDATE`, the "Learner" module is invoked.

*   **Inputs**:
    *   Current Prompt (v1.0.4)
    *   User Feedback ("Don't mock DB...")
    *   (Optional) The failing test code or the user's manual correction.
*   **Process**:
    *   The Learner asks an LLM to rewrite the Prompt Instructions to incorporate the new rule.
    *   *Constraint*: "Add this rule without removing existing safety guidelines."

### 1.3. Versioning
1.  **New Version**: The modified prompt is saved to the DB as `v1.0.5`.
2.  **Lineage**: `parent_id` is set to `v1.0.4`.
3.  **Active**: The new version is marked as `active`.

### 1.4. Regression Testing (Advanced)
Before verifying the new prompt, the agent can optionally run a "Regression Suite" — generating tests for a known simple file to ensure the new instruction didn't break basic generation capabilities (e.g., ensure it still generates import statements).

## 2. Manual Forking
Users can also explicitly branch strategies.
```bash
retest refine --fork "integration-heavy" "Focus on integration tests."
```
This creates a new branch of prompts tagged `integration-heavy` distinct from the `default` lineage.
