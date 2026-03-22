# Data Structures

## 1. File Structure
The MCP server manages data within the user's project directory, specifically inside `.retest/`.
- `.retest/retest-ai.index.json`: Main index of tests and prompt hashes.
- `.retest/prompts/`: (Optional future phase) Directory for individual prompt files if index becomes too large.
- `.retest/config.json`: Configuration for the test runner.

## 2. `retest-ai.index.json` Schema

```json
{
  "version": "1.1.0",
  "project_root": "/absolute/path/to/project",
  "test_files": {
    "src/utils.test.ts": {
      "language": "javascript|typescript",
      "last_modified": "ISO-8601-Timestamp",
      "tests": {
        "should return true": {
          "code_hash": "sha256-hash-of-function-body",
          "prompt_hash": "sha256-hash- of-prompt-used",
          "location": { "start": 10, "end": 25 },
          "status": "passed|failed|unknown"
        },
        "should throw error": {
          "code_hash": "...",
          "prompt_hash": "...",
          "location": { "start": 30, "end": 45 },
          "status": "passed"
        }
      }
    }
  },
  "prompts": {
    "sha256-hash-of-prompt-content": {
      "content": "Full text of the prompt used to generate the test...",
      "timestamp": "ISO-8601-Timestamp",
      "agent": "optional-agent-identifier"
    }
  }
}
```

## 3. Hashing Mechanism
- **Prompt Hash**: SHA-256 of the *user instruction* or *context prompt*.
- **Code Hash**: SHA-256 of the *test function body*. Used to detect manual edits. If code hash changes but no new prompt was recorded, it's a "manual override".

## 4. Configuration (`.retest/config.json`)

```json
{
  "test_runner": "npm test", // Command to run tests
  "test_file_pattern": "**/*.test.{ts,js}",
  "web_ui_port": 3000
}
```
