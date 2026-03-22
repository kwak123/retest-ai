export interface PromptVersion {
  id: string;
  content: string;
  parentId?: string;
  createdAt: string;
  tags?: Record<string, string>;
  metrics?: Record<string, any>;
}

export interface IPromptManager {
  getPrompt(id: string): Promise<PromptVersion | undefined>;
  saveNewVersion(content: string, parentId?: string, tags?: Record<string, string>): Promise<string>;
  findPrompts(query: string): Promise<PromptVersion[]>;
  getAllPrompts(): Promise<PromptVersion[]>;
}
