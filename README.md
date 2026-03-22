# retest-ai: The Testing Persona

**retest-ai** is an MCP (Model Context Protocol) server that transforms your standard AI coding assistant (like Claude, Cursor, or Copilot) into a **dedicated Testing Persona** (a "QA Orchestrator").

Instead of just generating tests and quickly losing the context of *why* they were generated, `retest-ai` provides your AI agent with a persistent memory. It maps every individual generated test back to the exact textual prompt that created it, providing full traceability for your entire test suite.

## The Problem

When you ask an AI to "write tests for this file," it outputs code. Later, when business requirements change, you ask the AI to "update the tests." Over time, the link between the *human instruction* and the *code output* is lost. You end up with brittle tests and no idea what the original intent was.

## The Solution: Traced Test Generation

`retest-ai` solves this by introducing AST-level (Abstract Syntax Tree) test tracking combined with prompt versioning.

1. **Granular Tracking**: It understands JavaScript/TypeScript at the syntax level. It finds your `describe`, `it`, and `test` blocks and hashes their exact function bodies.
2. **Prompt Linking**: Every hashed test is linked to a `prompt_id`. 
3. **The Persona**: By pointing your AI agent at the `retest-ai` MCP server, your agent adopts the "Testing Persona." It can proactively review health, summarize test breadth, and provide QA feedback instead of just dumping code.

## Getting Started

### Prerequisites
- Node.js (v18+)
- An MCP-compatible client (e.g., Cursor, Claude Desktop, or an agent framework)

### Installation & Setup

1. **Install dependencies and build the server**:
   ```bash
   cd retest-ai
   npm install
   npm run build
   ```

2. **Run the MCP Server**:
   You can run the server directly via your MCP client configuration, or start it standalone (useful for SSE connections):
   ```bash
   npm start
   ```

3. **Configure your AI Client**:
   Add `retest-ai` to your MCP client configuration. For example, in a standard `mcp.json` or Claude Desktop config:
   ```json
   {
     "mcpServers": {
       "retest-ai": {
         "command": "node",
         "args": ["/absolute/path/to/retest-ai/dist/index.js"]
       }
     }
   }
   ```

### Adopt the Persona

To get the most out of `retest-ai`, provide the contents of `src/persona/system_prompt.md` as custom instructions or system prompt to your agent. This tells the agent *how* to use the MCP tools to act as a QA Orchestrator.

## Workflow: Using Traced Generation

Here is how you and your AI agent will interact to generate useful, traced tests:

### 1. Check Initial Health
Ask your agent:
> *"What is the current test health of our project?"*

Your agent will call the `summarize_test_health` MCP tool and reply in persona:
> *"Comparing the current project state, I see we haven't started building our test suite yet. Shall we begin by drafting a test for a core utility?"*

### 2. Generate a Traced Test
Instruct your agent to write a test, providing clear context.
> *"Write a unit test for `src/math.ts` covering positive numbers and integer overflow."*

The agent will write the test file locally, but then it will call `record_test_generation`. It passes:
- The file path (`src/math.ts`)
- The file content
- The prompt you just gave it.

### 3. Receive Persona Feedback
`retest-ai` processes the AST, hashes the new `it("should handle positive numbers")` blocks, saves your prompt to `.retest/prompts.json`, and links them in `.retest/retest-ai.index.json`.

The agent receives a QA Summary and relays it to you:
> *"I've successfully indexed 2 test cases from math.ts. These are now linked to your latest prompt for full traceability. I notice we are still missing negative floating points. Would you like me to add those?"*

### 4. Updating Tests
Later, you ask for a change:
> *"Update the overflow test to expect a specific custom Error class."*

The agent updates the code and calls `record_test_generation` again. `retest-ai` detects that the `code_hash` for the overflow test has changed, saves the *new* prompt, and updates the link. The prompt history is perfectly preserved.

## Available MCP Tools

Once connected, your agent has access to:
- `summarize_test_health`: Get a high-level view of test coverage and files.
- `record_test_generation`: Parse a test file, hash the test blocks, record the prompt, and retrieve QA feedback.
- `list_tests`: See every file and test currently tracked by the system.
- `get_test_info`: Examine the exact code hashes and prompt IDs for a specific file.
- `list_prompts`: Read the historical DB of textual instructions used to build the suite.

## The `.retest` Directory

All of your project's testing memory is stored locally in the `.retest/` folder at the root of your workspace. You can commit this to Source Control to share the "testing memory" with your team!
