# Design: MCP Server Integration (Interoperability)

## Overview
To enable users to "ask their chat" (e.g., Claude Desktop, Cursor, or MCP-enabled IDEs) and hand off to `retest`, we will expose `retest` as a **Model Context Protocol (MCP)** server.

This approach replaces the need for a bespoke VS Code extension. Instead of building a custom "bridge," we adopt the industry standard protocol that allows AI assistants to discover and execute local tools.

## Architecture

*   **MCP Server**: `retest` will implement the MCP specification.
*   **Tools Exposed**:
    *   `generate_tests`: The primary tool for test generation.
    *   `list_prompts`: Allow valid prompts to be inspected.
    *   `refine_test`: For the iteration loop.
*   **Transport**: Stdio (standard input/output) is the standard for local agent-to-agent communication.
*   **Internal Agent**: The CLI will also include an optional "Agent Mode" (`retest do "..."`) that acts as an *internal* MCP client, allowing users to interact with the core tools via natural language similar to the external flow.

## The Workflow

1.  **Configuration**: The user adds `retest` to their MCP Client configuration (e.g., `claude_desktop_config.json` or Cursor settings).
    ```json
    {
      "mcpServers": {
        "retest": {
          "command": "retest",
          "args": ["mcp"]
        }
      }
    }
    ```
2.  **User Action**:
    *   User opens their AI Chat (e.g., in Cursor or Claude Desktop).
    *   User types: "Generate unit tests for the `calculateTax` function in this file."
    *   *Note*: The AI Chat (Client) is responsible for providing the file context (reading the active file) to the Model.
3.  **Model Action**:
    *   The Model decides to call the `retest` tool `generate_tests`.
    *   Arguments: `file_path`, `line_range`, `instruction`.
4.  **Execution**:
    *   `retest` receives the JSON-RPC request over stdio.
    *   `retest` executes the logic (same as the CLI `gen` command).
    *   `retest` returns the result (success message, path of created file).

## Tools Definition

### `generate_tests`
*   **Description**: Generate unit tests for a specific file or code block.
*   **Schema**:
    *   `file_path` (string): Absolute path to the source file.
    *   `line_range` (string, optional): "start-end" (e.g., "10-25").
    *   `instruction` (string, optional): Specific user requirement (e.g., "focus on edge cases").

### `list_prompts`
*   **Description**: List available system prompts/personas for test generation.
*   **Schema**: None.

## Implementation Details
We will use the official `@modelcontextprotocol/sdk`.

*   **New Entry Point**: `src/mcp.ts`.
*   **CLI Command**: `retest mcp` (starts the server).

## Advantages over VS Code Extension
1.  **Universal**: Works with any MCP-compliant client (Claude, Cursor, Zed, etc.).
2.  **Less Maintenance**: No need to maintain a separate VS Code Extension codebase.
3.  **Direct AI Control**: The AI model understands the tool definition natively and can decide *when* to call it.
