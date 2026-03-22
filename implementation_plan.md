# Implementation Plan - retest-ai MCP Server MVP

The goal is to rebuild `retest-ai` as an MCP server that agents can use to track and execute unit tests.

## User Review Required

> [!IMPORTANT]
> - Strategy pivot: We are now focusing on **JavaScript/TypeScript** support first.
> - Granularity: We will track individual tests by parsing the AST, rather than just hashing file content.

## Proposed Changes

### Project Initialization
#### [NEW] [package.json](file:///c:/work/retest-ai/package.json)
- Dependencies: `@modelcontextprotocol/sdk`, `express`, `zod`.
- Parser dependencies: `@typescript-eslint/typescript-estree` (for JS/TS parsing).
- Add scripts for building and running.

#### [NEW] [tsconfig.json](file:///c:/work/retest-ai/tsconfig.json)
- Node.js server config.

### Core MCP Server
#### [NEW] [src/index.ts](file:///c:/work/retest-ai/src/index.ts)
- Entry point.
- Initialize `McpServer`.
- Start Express UI.

#### [NEW] [src/store.ts](file:///c:/work/retest-ai/src/store.ts)
- `TestStore` class.
- Handles `retest-ai.index.json` read/write.
- Maps `file -> tests -> hashes`.

### Language Services (Parsers)
#### [NEW] [src/languages/interface.ts](file:///c:/work/retest-ai/src/languages/interface.ts)
- Interface `LanguageParser`: `extractTests(content: string) -> TestDefinition[]`.

#### [NEW] [src/languages/javascript.ts](file:///c:/work/retest-ai/src/languages/javascript.ts)
- Implements `LanguageParser`.
- Uses `@typescript-eslint/typescript-estree` to parse code.
- Traverses AST to find `describe`, `it`, `test` calls.
- Extracts name and body location.

### Tools Implementation
#### [NEW] [src/tools/record_test.ts](file:///c:/work/retest-ai/src/tools/record_test.ts)
- `record_test_generation` logic.
- Calls `JavascriptParser.extractTests(content)`.
- Updates Store with granular test data (code hash + prompt hash).

#### [NEW] [src/tools/query_test.ts](file:///c:/work/retest-ai/src/tools/query_test.ts)
- `get_test_info`, `list_tests`.
- Returns structured test data from the Store.

#### [NEW] [src/tools/run_test.ts](file:///c:/work/retest-ai/src/tools/run_test.ts)
- Executes `npm test <file>`.

### Web UI
#### [NEW] [src/ui/index.html](file:///c:/work/retest-ai/src/ui/index.html)
- Dashboard showing generic file list -> expandable to show individual tests.
- Visual diff of prompt history (if possible) or just list of prompts.

#### [NEW] [src/ui/server.ts](file:///c:/work/retest-ai/src/ui/server.ts)
- API endpoints for the UI.

## Verification Plan

### Automated Tests
- **Parser Tests**:
  - Feed sample JS/TS test files.
  - Verify it correctly extracts test names and bodies.
  - Verify it handles nested `describe` blocks.
- **Store Tests**:
  - Verify `record_test_generation` updates the index correctly.
  - Verify code hashing detects manual edits.
  
### Manual Verification
1.  **Run Server**: `npm start`.
2.  **Generate Test**: Use `record_test_generation` with a sample TS file.
3.  **Inspect Index**: Check `.retest/retest-ai.index.json` content.
4.  **Web UI**: Open localhost, expand the file, see the test cases listed.
