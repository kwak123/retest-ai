# 04. Agent Simulation Log

**Goal**: Generate 5 system prompts for 5 different tests to validate the `retest-ai` concept.
**Participants**:
- **Test Expert Agent (TEA)**: Specializes in writing robust unit tests.
- **Prompt Expert Agent (PEA)**: Specializes in crafting LLM system prompts.
- **PM Agent (PMA)**: Reviews output against product goals.

---

## Session 1: Initial Prompt Generation

**PMA**: We need to verify that we can reliably generate tests for JavaScript. Please select 5 different testing scenarios we should cover, and then generate specific system prompts for an agent to write those tests.

**TEA**: Understood. Here are 5 scenarios that cover different aspects of JS testing:
1.  **Basic Logic**: A simple pure function (e.g., `sum(a, b)`).
2.  **Async/Await**: A function that fetches data (simulated).
3.  **Error Handling**: A function that throws errors on invalid input.
4.  **Mocking/Spies**: A function that calls a callback or dependency.
5.  **Edge Cases**: A function with complex branching or boundary conditions.

**PEA**: Those sound good. I will draft a "Meta-System Prompt" that we could theoretically use to instruct an agent to write these tests, or we can just draft the specific instructions for each.

**PMA**: Let's draft the specific *System Prompts* that `retest-ai` would send to an agent to generate these specific tests.

### Prompt 1: Basic Logic
**Target**: `src/math.ts` -> `function add(a, b)`
**TEA**: The test should verify `add(1, 2) === 3` and `add(-1, -1) === -2`.
**PEA**:
```markdown
You are a senior QA engineer.
Write a Jest unit test for the `add` function.
Requirements:
- Use `describe` and `it` blocks.
- Cover positive and negative numbers.
- Ensure type safety if TypeScript.
```

### Prompt 2: Async/Await
**Target**: `src/api.ts` -> `async function getUser(id)`
**TEA**: The test needs to mock the network call.
**PEA**:
```markdown
You are a testing specialist.
Write an async Jest test for `getUser(id)`.
Context:
- `getUser` calls `axios.get`.
- Mock `axios.get` to return `{ data: { id: 1, name: "Alice" } }`.
- Verify the function returns the user object.
- Use `async/await` syntax.
```

### Prompt 3: Error Handling
**Target**: `src/validator.ts` -> `function validateEmail(email)`
**TEA**: We need to ensure it throws or returns false on invalid input. Let's say it throws.
**PEA**:
```markdown
Write a unit test for `validateEmail`.
Scenarios:
1. Valid email -> returns true.
2. Invalid email (no @) -> throws Error("Invalid format").
- Use `expect(() => ...).toThrow()` pattern.
```

### Prompt 4: Mocking/Spies
**Target**: `src/logger.ts` -> `function logWarning(msg)`
**TEA**: This function should call `console.warn`. We should spy on that.
**PEA**:
```markdown
Write a test for `logWarning(msg)`.
- Spy on `console.warn` using `jest.spyOn`.
- Call the function.
- Assert `console.warn` was called with the specific message.
- Restore the mock after the test.
```

### Prompt 5: Edge Cases
**Target**: `src/utils.ts` -> `function flatten(arr)`
**TEA**: Flattening nested arrays. Needs to handle empty arrays, already flat arrays, and deeply nested ones.
**PEA**:
```markdown
Write a comprehensive test suite for `flatten(arr)`.
Cases:
- `[]` -> `[]`
- `[1, 2]` -> `[1, 2]`
- `[1, [2, 3]]` -> `[1, 2, 3]`
- `[1, [2, [3]]]` -> `[1, 2, 3]` (Recursive)
Ensure the implementation doesn't mutate the original array if possible, or matches expected behavior.
```

---

## Session 2: PM Review

**PMA**: Reviewing the generated prompts.
1.  **Prompt 1** is simple and direct. Good for baseline.
2.  **Prompt 2** introduces mocking, which is tracking complexity. Good.
3.  **Prompt 3** tests assertions on exceptions. Good.
4.  **Prompt 4** tests side-effects. Essential.
5.  **Prompt 5** tests algorithmic correctness.

**Findings**:
- The prompts are sufficiently distinct to identify if a particular "Prompt Strategy" works better for async vs logic.
- We need to capture the *hash* of these prompts in `retest-ai`.
- If we change Prompt 2 to usage `nock` instead of `jest.mock`, that should trigger a new test generation and a new hash.

**Conclusion**: These 5 prompts are approved for the initial test set.
