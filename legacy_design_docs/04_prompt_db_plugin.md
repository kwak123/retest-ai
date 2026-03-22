# Phase 4: Prompt Database Plugin

## Goal
To abstract the storage and retrieval of prompts so that the core agent logic is decoupled from *how* prompts are stored. Ideally, this component is an invokable plugin or separate local service.

## 1. Architecture
The "Prompt Manager" is designed as a standalone module/plugin that exposes a strictly typed API.

### 1.1. Interface (TypeScript)
```typescript
interface IPromptManager {
  // Retrieval
  getPrompt(id: string): Promise<PromptVersion>;
  getActivePrompt(tags?: string[]): Promise<PromptVersion>;
  
  // Storage
  saveNewVersion(content: string, parentId: string, metadata: any): Promise<string>;
  
  // Searching
  findPrompts(query: string): Promise<PromptVersion[]>;
}
```

## 2. Storage Backends
The plugin system supports multiple backends.

### 2.1. Local SQLite (Default)
*   **File**: `.retest/prompts.db`
*   **Benefits**: Zero setup, easy to commit (if desired), fast.
*   **Schema**:
    ```sql
    CREATE TABLE prompts (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      parent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      tags TEXT, -- JSON string
      metrics TEXT -- JSON string for acceptance rates
    );
    ```

### 2.2. Remote API (Enterprise)
*   **Endpoint**: `https://api.retest.company/v1/prompts`
*   **Use Case**: Sharing verified "Gold Standard" prompts across a large organization.
*   The plugin simply implements the `IPromptManager` interface via HTTP calls.

## 3. Plugin Invocation
The main agent loads this plugin at runtime.
```javascript
// agent-boot.js
const promptManager = await loadPlugin('retest-sqlite-backend', { path: './.retest/prompts.db' });
const currentPrompt = await promptManager.getActivePrompt();
```

## 4. Metadata & Traceability
The plugin is also the source of truth for the tags injected into code. The **Tagging Service** asks the Prompt Manager: "I am using Prompt ID X, what metadata string should I inject?"
This ensures that if the metadata format changes (e.g., from JSDoc to Python Docstrings), logic is centralized in the plugin, not the core agent.
