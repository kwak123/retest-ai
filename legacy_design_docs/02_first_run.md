# Phase 2: First Run & Generation

## Goal
To generate the initial set of unit tests for a specific target file, ensuring that every generated test case is traceable to the prompt version that created it.

## 1. The `gen` Workflow
Command: `retest gen <target-file> [options]`

### 1.1. Context Assembly
The agent reads:
*   The **Target File** (e.g., `Calculator.ts`).
*   **Relevant Types/Interfaces** (via import scraping).
*   **Existing Tests** (if updating an existing test file).

### 1.2. Prompt Selection
The agent queries the [Prompt DB](./04_prompt_db_plugin.md).
*   Default: Latest version of the `active` prompt for this project.
*   Specified: `retest gen --prompt-id <uuid>` or `--tag strict-mode`.

### 1.3. LLM Interaction
The Context + Selected Prompt is sent to the LLM.
*   **Output Format**: We request strict Markdown or JSON output to easily parse separate test cases.

## 2. Granular Tagging & Output Parsing
The system does *not* just dump the text into a file. It parses distinct test blocks.

### 2.1. The Tagging Logic
For every parsed `it` or `test` block, the **Tagging Service** injects a JSDoc header.

**Generated Artifact:**
```typescript
import { add } from './Calculator';

/**
 * @retest-id: 7f8a9d
 * @prompt-version: v1.0.4
 * @generated-at: 2023-11-01T10:00:00Z
 */
test('adds two numbers correctly', () => {
  expect(add(1, 2)).toBe(3);
});
```

### 2.2. Validation
Before writing to disk, the agent:
1.  **Lints** the code (using project's ESLint config if available).
2.  **Compiles** (optional, dry-run tsc) to catch basic syntax errors.

## 3. Post-Run Report
CLI Output:
```text
✅ Generated 5 tests for Calculator.ts
   Prompt: v1.0.4 (Default)
   Saved to: Calculator.test.ts
   
   Run `retest refine` if you are unhappy with the quality.
```
