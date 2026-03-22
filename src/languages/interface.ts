export interface TestBlock {
  name: string;
  body: string;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface LanguageParser {
  extractTests(content: string): TestBlock[];
}
