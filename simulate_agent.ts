
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
  console.log("Starting Agent Simulation...");

  // 1. Connect to MCP Server
  const transport = new SSEClientTransport(new URL("http://localhost:4001/sse"));
  const client = new Client({
    name: "agent-simulation",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  console.log("Connecting to server...");
  await client.connect(transport);
  console.log("Connected!");

  // 2. List Tools to verify connection
  const tools = await client.listTools();
  console.log("Available Tools:", tools.tools.map(t => t.name));

  // 3. Simulate "Reading" code and generating a test
  console.log("Simulating test generation for 'string.ts'...");
  const testContent = `
import { reverse } from '../string';

describe('String Library', () => {
    it('should reverse a string', () => {
        expect(reverse('hello')).toBe('olleh');
    });
});
`;
  
  // 4. Call record_test_generation
  console.log("Calling record_test_generation...");
  const result = await client.callTool({
      name: "record_test_generation",
      arguments: {
          filePath: "example/tests/string.test.ts",
          prompt: "Generate a test for the reverse function in string.ts",
          content: testContent
      }
  });
  console.log("Result:", result);

  // 5. Verify it's listed
  console.log("Verifying test list...");
  const listResult = await client.callTool({
      name: "list_tests",
      arguments: {}
  });
  
  // @ts-ignore
  const fileList = JSON.parse(listResult.content[0].text);
  console.log("Current Test Index:", JSON.stringify(fileList, null, 2));

  if (fileList['example/tests/string.test.ts']) {
      console.log("SUCCESS: String tests recorded.");
  } else {
      console.error("FAILURE: String tests not found.");
      process.exit(1);
  }
  
  // Keep alive for a moment to ensure everything flushes if needed, then exit
  setTimeout(() => process.exit(0), 1000);
}

main().catch(err => {
    console.error("Simulation Error:", err);
    process.exit(1);
});
