# MCP API Specification

The MCP server exposes the following tools to connected clients (Agents).

## Tools

### 1. `list_tests`
**Description**: Returns a structured list of all tracked test files and their individual tests.
- **Arguments**: None.
- **Returns**: JSON object with files and nested test definitions.

### 2. `get_test_info`
**Description**: Returns specific details for a test file, including granular test function data.
- **Arguments**:
  - `file_path` (string): Relative path to the test file.
- **Returns**: JSON object with:
  - `file_path`
  - `tests`: Array of `{ name, code_hash, prompt_hash, location }`

### 3. `record_test_generation`
**Description**: processed a generated test file. Parses the content to identify individual tests and updates the index.
- **Arguments**:
  - `file_path` (string): Relative path to the test file.
  - `prompt` (string): The full text of the prompt used.
  - `content` (string): The full content of the file.
- **Process**:
  1.  Detect Language (based on extension).
  2.  Parse `content` (AST).
  3.  Extract test names and bodies.
  4.  Hash each body.
  5.  Update index: map `test_name` to `prompt` + `code_hash`.
- **Returns**: `file_hash` (string).

### 4. `run_test`
**Description**: Executes the test runner for a specific file.
- **Arguments**:
  - `file_path` (string): Relative path to the test file.
- **Returns**: 
  - `status`: "passed" | "failed"
  - `output`: Stdout/Stderr from the test runner.

### 5. `start_web_server`
**Description**: Starts the local web UI if not running.
- **Arguments**:
  - `port` (number, optional): Port to listen on (default 3000).
- **Returns**: URL of the running server.
