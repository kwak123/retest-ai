# Design Overview: Self-Learning Unit Test Agent

## Vision
To build an autonomous agent that not only generates unit tests but actively learns from developer feedback to improve its future output. By treating system prompts as versioned, evolving software artifacts, we can trace quality improvements over time and adapt to specific team coding standards.

**Standalone & Specialized**: This tool runs as a CLI (`retest`) directly in your terminal. It does *not* rely on existing IDE AI assistants (like Copilot). It uses your provided API Key to communicate directly with LLMs to generate code and write files to your disk.

## Core Pillars
This design is broken down into 5 key phases/components:

1.  **[Initialization](./01_initialization.md)**
    *   Setting up the CLI tool (`retest`).
    *   Configuring the local environment and database.

2.  **[First Run & Generation](./02_first_run.md)**
    *   The primary `gen` workflow.
    *   Granular metadata tagging (per-test attribution).

3.  **[Iteration & Tuning](./03_iteration_tuning.md)**
    *   The "Self-Learning" loop using `refine`.
    *   Intent parsing and prompt evolution strategies.

4.  **[Prompt Database Abstracton](./04_prompt_db_plugin.md)**
    *   Architecture of the Prompt Manager.
    *   Treating valid prompts as a plugin/service rather than hardcoded strings.

5.  **[Test Exploration](./05_test_exploration.md)**
    *   Interfaces for browsing generated tests.
    *   Future-looking UI for manual selection and regeneration.

6.  **[MCP Server Interoperability](./06_chat_interop.md)**
    *   Exposing `retest` as a Model Context Protocol (MCP) server.
    *   Allows seamless "hand-off" from Claude Desktop, Cursor, and other AI IDEs.

## High-Level Architecture (Hybrid)
*   **Core Library**: Shared business logic (generation, prompt management) used by all interfaces.
*   **Interfaces**:
    1.  **CLI (`retest`)**: Direct terminal usage (human-driven).
    2.  **MCP Server**: Protocol-driven usage (AI-driven).
*   **Prompt Engine**: A local service backed by SQLite to manage versioned prompts.
*   **LLM Gateway**: Connects to the inference provider (OpenAI/Anthropic/Gemini).
