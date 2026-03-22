import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { IPromptManager } from './prompt/interface.js';

export interface TestDefinition {
  name: string;
  code_hash: string;
  prompt_id?: string;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  status?: "passed" | "failed" | "unknown";
}

export interface IndexFile {
  version: string;
  project_root: string;
  test_files: Record<string, {
    language: string;
    last_modified: string;
    tests: Record<string, TestDefinition>;
  }>;
}

export class TestStore {
  private indexFilePath: string;
  private data: IndexFile;
  public promptManager: IPromptManager;

  constructor(private projectRoot: string, promptManager: IPromptManager) {
    this.indexFilePath = path.join(projectRoot, '.retest', 'retest-ai.index.json');
    this.promptManager = promptManager;
    this.data = {
      version: "1.2.0",
      project_root: projectRoot,
      test_files: {}
    };
  }

  async load() {
    try {
      const content = await fs.readFile(this.indexFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      
      // Migrate old data if necessary
      if (parsed.prompts) {
          delete parsed.prompts;
          this.data = parsed;
          await this.save();
      } else {
          this.data = parsed;
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Init empty
        await this.save();
      } else {
        throw error;
      }
    }
  }

  async save() {
    const dir = path.dirname(this.indexFilePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.indexFilePath, JSON.stringify(this.data, null, 2));
  }

  async recordTest(filePath: string, extractedTests: { name: string; body: string; location: any }[], promptId: string) {
    const now = new Date().toISOString();

    if (!this.data.test_files[filePath]) {
      this.data.test_files[filePath] = {
        language: 'javascript', // TODO: detect
        last_modified: now,
        tests: {}
      };
    }

    const fileEntry = this.data.test_files[filePath];
    fileEntry.last_modified = now;

    for (const test of extractedTests) {
      const codeHash = this.hashString(test.body);
      const existingTest = fileEntry.tests[test.name];

      if (!existingTest) {
        fileEntry.tests[test.name] = {
          name: test.name,
          code_hash: codeHash,
          prompt_id: promptId,
          location: test.location,
          status: "unknown"
        };
      } else {
        if (existingTest.code_hash !== codeHash) {
          existingTest.code_hash = codeHash;
          existingTest.prompt_id = promptId; 
          existingTest.location = test.location;
          existingTest.status = "unknown";
        } else {
          existingTest.prompt_id = promptId;
          existingTest.location = test.location;
        }
      }
    }

    await this.save();
    return promptId;
  }

  async getTests(filePath: string) {
    return this.data.test_files[filePath]?.tests || {};
  }
  
  getAllTests() {
      return this.data.test_files;
  }

  private hashString(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
