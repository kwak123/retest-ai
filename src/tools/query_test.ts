import { TestStore } from "../store.js";

export async function summarizeTestHealth(store: TestStore) {
  const allTests = store.getAllTests();
  const filePaths = Object.keys(allTests);
  let totalTests = 0;
  let filesWithTests = 0;

  for (const filePath of filePaths) {
    const tests = Object.keys(allTests[filePath].tests);
    if (tests.length > 0) {
      filesWithTests++;
      totalTests += tests.length;
    }
  }

  const feedback = `Comparing the current project state, I'm tracking **${totalTests} tests** across **${filesWithTests} files**. 
  
${totalTests === 0 ? "We haven't started building our test suite yet. Shall we begin by drafting a test for a core utility?" : "Your testing coverage is growing nicely. I'm ready to help you refine these or target specific gaps."}`;

  return {
    summary: {
      totalFiles: filePaths.length,
      filesWithTests,
      totalTests,
    },
    persona_feedback: feedback
  };
}
