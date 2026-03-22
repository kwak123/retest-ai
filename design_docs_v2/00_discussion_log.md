# Design Discussion: 2026-02-18

**Participants:**
- **Product Manager (PM)**: focused on milestones, user experience, and extensibility.
- **Testing Expert (TE)**: focused on best practices, data structures, and test validity.
- **MCP Expert (ME)**: focused on MCP protocol, tools, and constraints.
- **Reviewer (REV)**: focused on identifying risks and edge cases.
- **Applied AI Orchestrator (AAO)**: focused on AI workflows and future automation.

## Initial Concept Review

**PM**: The goal is to pivot `retest-ai` from a standalone agent into an MCP server. This allows existing agents (Claude, Cursor, etc.) to use it as a tool. Key features: prompt hashing for tests, re-running tests with old prompts, and a basic visual history. MVP needs to be simple but extensible.

**TE**: For "hashing tests", we need to discuss granularity. Marking every single test function with a hash in the code comments is intrusive and hard to maintain if tests are manually edited. I propose we use a sidecar file (`retest-ai.index.json`) that maps test names (or suites) to hashes.

**ME**: Agreed. MCP tools can easily read/write to that JSON. We can have tools like `record_test_generation(test_file, prompt, code)` which generates the hash and updates the index.

**REV**: How do we ensure the hash matches the code? If the user manually edits the test, the hash is stale.
**TE**: We can store a hash of the *code* alongside the prompt hash. If the current code hash doesn't match the stored one, we know it's been manually modified.
**PM**: Good, but let's keep it simple for MVP. Just tracking "Last Prompt Used" is enough. If they edit it manually, the prompt is just "outdated" but still the historical record.

## Data Structure: `retest-ai.index.json`

**TE**: Proposal for the index file:
```json
{
  "version": 1,
  "tests": {
    "src/utils.test.ts": {
      "last_prompt_hash": "abc1234",
      "last_modified": "2026-02-18T...",
      "test_functions": [
        "should return true",
        "should throw error"
      ]
    }
  },
  "prompts": {
    "abc1234": {
      "text": "Write a test for the utils class...",
      "timestamp": "...",
      "agent": "claude-3-5-sonnet"
    }
  }
}
```
**ME**: This looks good. The "prompts" section can grow large, so maybe for MVP it's in-memory or a separate `.retest/prompts.json`?
**PM**: Let's keep it in one file for now for simplicity, or split if it gets >1MB. For MVP, one file is fine.

## MCP Tools Definition

**ME**: We need these tools:
1.  `get_test_info(file_path)`: Returns current hash/prompt info.
2.  `record_test_run(file_path, prompt, test_code?)`: Saves the prompt and generates a hash.
3.  `list_tests()`: Returns all tracked tests.
4.  `get_prompt(hash)`: Returns the full prompt text.

**AAO**: What about "re-run"? The user wants to "target individual tests and re-run them".
**ME**: The MCP server can expose a `run_test_command(command)` tool. But the *Agent* usually runs the command in its own terminal.
**PM**: The user said "Users should be able to target individual tests and re-run them... from a localhost page". This implies the MCP server needs a backend execution capability.
**TE**: Yes, the MCP server should spawn a child process to run `npm test <file>`.
**REV**: Security risk?
**ME**: It's running locally on the user's machine. Same permission level as the user. We should just confirm the command with the user if possible, or assume trust since it's a dev tool.

## Web UI (MVP)

**PM**: The MCP server should verify it can serve a small HTML page.
**ME**: We can use a simple Express/Fastify server inside the MCP server to serve static files for the dashboard.
**AAO**: The dashboard shows the list of tests. Clicking a "history" icon shows the prompt chain.

## Roadmap (Milestones)

**PM**:
1.  **Phase 1**: Project Skeleton & MCP Server implementation (Basic Tools).
2.  **Phase 2**: `retest-ai.index.json` logic & Prompt Hashing.
3.  **Phase 3**: Web UI implementation.
4.  **Phase 4**: "Retest" capability (executing tests from UI).

**REV**: One specific requirement: "each individual test should be marked with a hash".
**TE**: If we do file-level hashing, we miss granularity. But parsing every language to find function boundaries is hard.
**AAO**: Let's stick to *File Level* for MVP. "Test Suite" usually equals "Test File". We can parse individual test names just for display in the UI (using regex for now), but track the *Prompt* at the file level. Most agents write the whole file or a big chunk of it.
**PM**: Agreed. File-level granularity for v1.

## Sub-Agents & Orchestration

**AAO**: The MCP server doesn't need to be an agent itself yet. It just provides the memory and execution layer. The *User's Agent* (e.g. in Cursor) drives the workflow.
**REV**: Correct. The "Coding Agent" mentioned in the prompt is the *User's* agent, not our internal one. We are building the *tool* for that agent.

## Final Plan

-   **Architecture**: Node.js MCP Server (SDK).
-   **Storage**: JSON file in `.retest` folder.
-   **UI**: Localhost web server (part of MCP process).
-   **Integration**: Standard MCP Tools.

---

# Update: Pivot to Language-Specific Granularity (2026-02-18)

**Context**: User Feedback - "Hashing everything seems like a mistake... focus down on supporting 1 language at a time. To start, we will support JavaScript, with C# as a follow-up."

**TE**: Acknowledged. We are moving away from treating files as opaque blobs. We need to parse the AST (Abstract Syntax Tree) to understand individual tests.
**TE**: For **JavaScript/TypeScript**, we can use libraries like `@typescript-eslint/typescript-estree` or `acorn` to identify `describe`, `it`, and `test` blocks.
**PM**: Agreed. Milestone 1 is now strictly "JavaScript/Node.js Support". C# is a backlog item.

**New Data Structure Requirements**:
**TE**: The `retest-ai.index.json` needs to go deeper.
```json
"src/utils.test.ts": {
  "tests": {
    "should return true": {
      "prompt_hash": "...",
      "code_hash": "..." // Hash of the specific function body
    }
  }
}
```
**ME**: This complicates the `record_test_generation` tool.
*   **Old**: "Here is the file content I wrote." -> Hash whole file.
*   **New**: "Here is the file content I wrote." ->
    1.  MCP Server detects .ts/.js extension.
    2.  Parses content.
    3.  Extracts test names and bodies.
    4.  Hashes each body.
    5.  Updates index, checking if the test existed before.

**AAO**: If an Agent updates just *one* test in a file, the MCP server needs to figure out which one changed.
**TE**: If we hash the code body of each test, we can detect diffs.
*   If we receive a new file content:
    *   Parse all tests.
    *   For each test found:
        *   Calculate `current_code_hash`.
        *   Compare with `stored_code_hash`.
        *   If different -> Update `prompt_hash` with the *current* interaction's prompt.

**PM**: This is much smarter. It allows "targeted re-runs" and "targeted updates".
**REV**: What if the Agent adds a new test?
**TE**: It shows up as a new key in the JSON, inheriting the current prompt hash.

**Architectural Change**:
**ME**: We need a `LanguageParser` interface.
*   `JavaScriptParser` (MVP)
*   `CSharpParser` (Future)
*   Method: `extractTests(fileContent: string) -> { name: string, body: string, location: Range }[]`

**Plan Update**:
1.  **Phase 1**: MCP Server + **JS Parser**.
2.  **Phase 2**: Granular Indexing logic (Test-level vs File-level).
3.  **Phase 3**: UI updates to show individual tests.

**Action**: Update architecture and data structures to reflect "Language Parsers" and granular tracking.
