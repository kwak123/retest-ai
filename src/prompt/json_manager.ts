import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { IPromptManager, PromptVersion } from './interface.js';

export class JsonPromptManager implements IPromptManager {
  private dbPath: string;
  private data: Record<string, PromptVersion> = {};

  constructor(projectRoot: string) {
    this.dbPath = path.join(projectRoot, '.retest', 'prompts.json');
  }

  async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.dbPath, 'utf-8');
      this.data = JSON.parse(content);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.data = {};
        await this.save();
      } else {
        throw error;
      }
    }
  }

  async save(): Promise<void> {
    const dir = path.dirname(this.dbPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  async getPrompt(id: string): Promise<PromptVersion | undefined> {
    return this.data[id];
  }

  async saveNewVersion(content: string, parentId?: string, tags?: Record<string, string>): Promise<string> {
    const id = crypto.createHash('sha256').update(content).digest('hex');
    
    if (!this.data[id]) {
      this.data[id] = {
        id,
        content,
        parentId,
        createdAt: new Date().toISOString(),
        tags: tags || {}
      };
      await this.save();
    }
    
    return id;
  }

  async findPrompts(query: string): Promise<PromptVersion[]> {
    query = query.toLowerCase();
    return Object.values(this.data).filter(p => 
      p.content.toLowerCase().includes(query) || 
      (p.tags && Object.values(p.tags).some(v => v.toLowerCase().includes(query)))
    );
  }

  async getAllPrompts(): Promise<PromptVersion[]> {
    return Object.values(this.data);
  }
}
