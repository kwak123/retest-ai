import { TestStore } from "../store";
import { JavascriptParser } from "../languages/javascript";
import path from "path";

export async function recordTestGeneration(store: TestStore, args: { filePath: string; prompt: string; content: string; parentId?: string; tags?: Record<string, string> }) {
  console.log(`[Record] Processing ${args.filePath}`);

  // 1. Select Parser
  // For MVP we default to JS parser if extension matches.
  const ext = path.extname(args.filePath);
  if (!['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  const parser = new JavascriptParser();
  
  // 2. Parse Content
  let tests;
  try {
     tests = parser.extractTests(args.content);
  } catch (e) {
      console.error("Failed to parse test file:", e);
      throw new Error(`Failed to parse test file: ${e}`);
  }

  if (tests.length === 0) {
      console.warn("No tests found in file.");
  }

  // 3. Update Store
  const promptId = await store.promptManager.saveNewVersion(args.prompt, args.parentId, args.tags);
  await store.recordTest(args.filePath, tests, promptId);

  return { 
      status: "success", 
      promptId, 
      testsFound: tests.length,
      tests: tests.map(t => t.name)
  };
}
