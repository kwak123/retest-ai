# Phase 1: Initialization

## Goal
To bootstrap the `retest` agent environment on a user's machine, ensuring all necessary dependencies (database, CLI binary, default prompts) are ready for the first interaction.

## 1. Installation
The tool is distributed as a standard NPM package (or similar binary).
```bash
npm install -g @retest-ai/cli
```

## 2. The `init` Command
The user initializes the project workspace.
```bash
retest init
```

### 2.1. Credentials Setup (BYO Key)
Since this is a developer tool, we assume "Bring Your Own Key" model.
1.  **Environment Variables**: The tool naturally looks for standard keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) in the shell environment.
2.  **Interactive Prompt**: If no keys are found, `init` will prompt:
    > "No API key found in plugins. Please enter your OpenAI/Anthropic Key:"
3.  **Storage**:
    *   **Recommended**: Writes to a local `.env.retest` (and ensures it is added to `.gitignore`).
    *   **Global**: Optionally saves to `~/.retest/config` for use across all projects.

### 2.2. Actions Performed
1.  **Config Creation**: Generates a `.retestrc` or `retest.config.json` in the root.
    *   `testFramework`: (jest/mocha/vitest) - autodetected.
    *   `language`: (ts/js) - autodetected.
    *   `llmProvider`: (openai/anthropic/gemini) - user selected.
    *   `promptDbPath`: Location of the local SQLite DB (default: `.retest/prompts.db`).
2.  **Database Hydration**:
    *   Creates the `.retest/` directory (gitignored by default, though teams might want to commit the DB).
    *   Initializes the SQLite schema (see [Prompt DB Plugin](./04_prompt_db_plugin.md)).
    *   **Seeding**: Inserts the "Genesis Prompts" – a set of curated, high-quality base prompts for different frameworks (e.g., `default-jest-ts`, `default-react-testing-library`).
3.  **Sanity Check**: Runs a quick connection test to the configured LLM provider.

## 3. Configuration Options
Users can override defaults via flags during init:
*   `--global`: Store the DB in the user home directory (shared across projects).
*   `--team-remote <url>`: Connect to a shared remote prompt server instead of a local DB.

## 4. Output
Upon success, the CLI prints:
> "Retest initialized. Default prompt 'v0.1-genesis' is ready. Run `retest gen <file>` to start."
