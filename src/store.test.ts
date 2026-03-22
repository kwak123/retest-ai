import { TestStore } from './store';
import { IPromptManager } from './prompt/interface';
import fs from 'fs/promises';
import path from 'path';

// Mock fs
jest.mock('fs/promises');

describe('TestStore', () => {
  let store: TestStore;
  let mockPromptManager: jest.Mocked<IPromptManager>;
  const projectRoot = '/tmp/test-project';
  const indexFile = path.join(projectRoot, '.retest', 'retest-ai.index.json');

  beforeEach(() => {
    jest.resetAllMocks();
    mockPromptManager = {
      getPrompt: jest.fn(),
      saveNewVersion: jest.fn().mockResolvedValue('mock-prompt-id'),
      findPrompts: jest.fn(),
      getAllPrompts: jest.fn()
    };
    store = new TestStore(projectRoot, mockPromptManager);
  });

  it('should initialize with empty data', async () => {
    (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    await store.load();
    const tests = await store.getTests('foo.ts');
    expect(tests).toEqual({});
  });

  it('should record a new test and hash prompt/code', async () => {
    (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    await store.load();

    const prompt = "Generate a test for sum";
    const tests = [{
      name: "should sum",
      body: "it('should sum', () => { expect(1+1).toBe(2); })",
      location: { start: { line: 1, column: 1 }, end: { line: 3, column: 1 } }
    }];

    await store.recordTest('math.test.ts', tests, 'mock-prompt-id');

    const storedTests = await store.getTests('math.test.ts');
    expect(storedTests['should sum']).toBeDefined();
    expect(storedTests['should sum'].prompt_id).toBeDefined();
    expect(storedTests['should sum'].code_hash).toBeDefined();
    
    // Check if writeFile was called
    expect(fs.writeFile).toHaveBeenCalled();
  });
});
