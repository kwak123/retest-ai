# Implementation Plan: Prompt Database Layer

## Goal Description
To align with the legacy Persona architecture, we need to replace the simple string-hashing of prompts in `TestStore` with a dedicated, versionable **Prompt Database Layer**. This layer will be responsible for storing prompts as structured entities (with IDs, content, parent IDs, tags, and metrics) so that an external agent (like Copilot/Claude Code) or a future internal persona can query the full history and tuning of prompts.

## Proposed Changes

### 1. Define the Interface
We will create a heavily decoupled Prompt Manager interface based on the legacy design (`04_prompt_db_plugin.md`).

#### [NEW] `src/prompt/interface.ts`
- Define `PromptVersion` interface: `{ id, content, parentId, createdAt, tags, metrics }`.
- Define `IPromptManager` interface:
  - `getPrompt(id: string): Promise<PromptVersion>`
  - `saveNewVersion(content: string, parentId?: string, metadata?: any): Promise<string>`
  - `findPrompts(query: string): Promise<PromptVersion[]>`

### 2. Implement the Storage Backend
To avoid native compilation issues (e.g., `better-sqlite3` on Windows) while maintaining the structural intent of the SQLite database, we will implement the interface using a dedicated JSON backed store first.

#### [NEW] `src/prompt/json_manager.ts`
- Implement `JsonPromptManager` satisfying `IPromptManager`.
- Manage a standalone `.retest/prompts.json` file (separated from the test index).

### 3. Refactor the Core Store
The `TestStore` will no longer blindly hash prompts. It will delegate prompt management to the new layer.

#### [MODIFY] `src/store.ts`
- Inject `IPromptManager` into the `TestStore` constructor.
- In `recordTest()`, instead of hashing the string and appending to the monolithic `retest-ai.index.json`, call `promptManager.saveNewVersion(prompt)` if the prompt is novel.
- Update the `TestDefinition` schema to link to the new Prompt ID rather than just a SHA-256 string hash.

### 4. Update the MCP Tools
The MCP server needs to expose the prompt context.

#### [MODIFY] `src/index.ts`
- Initialize `JsonPromptManager` alongside `TestStore`.
- Update `record_test_generation` to utilize the new manager (passing `parentId` if the agent provides one for iteration).
- **[NEW TOOL]** Add `list_prompts()` tool to allow the external agent to query the available context and history.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure all TypeScript compiles successfully with the new interfaces.
- Run `npm test` to verify existing tests pass.

### Manual Verification
- Start the server using `npm run dev`.
- Connect an MCP client (like the Claude Desktop MCP Inspector or Cursor).
- Call `record_test_generation` with a new prompt and verify `.retest/prompts.json` is created with structured metadata (ID, timestamp, parent tracking).
- Call the new `list_prompts` tool to verify the context is successfully retrievable.
