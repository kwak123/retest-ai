import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";
import { TestStore } from "./store";
import { recordTestGeneration } from "./tools/record_test";
import path from "path";
import { JsonPromptManager } from "./prompt/json_manager";

// Initialize Store
const projectRoot = process.cwd();
const promptManager = new JsonPromptManager(projectRoot);
const store = new TestStore(projectRoot, promptManager);

// Initialize MCP Server
const server = new McpServer({
  name: "retest-ai",
  version: "1.0.0",
});

// Initialize Express for UI & SSE
const app = express();
const PORT = 4001; // User requested 4001

async function main() {
  await promptManager.load();
  await store.load();

  // --- Register Tools ---

  server.tool(
      "record_test_generation",
      {
          filePath: z.string(),
          prompt: z.string(),
          content: z.string(),
          parentId: z.string().optional(),
          tags: z.record(z.string()).optional()
      },
      async (args) => {
          return {
              content: [{ 
                  type: "text", 
                  text: JSON.stringify(await recordTestGeneration(store, args)) 
              }]
          };
      }
  );

  server.tool(
      "list_tests",
      {},
      async () => {
          const files = store.getAllTests();
          return {
              content: [{
                  type: "text",
                  text: JSON.stringify(files, null, 2)
              }]
          };
      }
  );

  server.tool(
      "list_prompts",
      {},
      async () => {
          const prompts = await promptManager.getAllPrompts();
          return {
              content: [{
                  type: "text",
                  text: JSON.stringify(prompts, null, 2)
              }]
          };
      }
  );

  server.tool(
      "get_test_info",
      { filePath: z.string() },
      async (args) => {
          const tests = await store.getTests(args.filePath);
          return {
              content: [{
                  type: "text",
                  text: JSON.stringify(tests, null, 2)
              }]
          };
      }
  );

  // --- Start Express UI & SSE ---
  app.use(express.static(path.join(__dirname, 'ui'))); 
  
  app.get("/api/tests", (req, res) => {
      res.json(store.getAllTests());
  });

  // SSE Endpoint
  app.get("/sse", async (req, res) => {
    console.log("New SSE connection request");
    globalTransport = new SSEServerTransport("/messages", res);
    console.log("Created globalTransport");
    await server.connect(globalTransport);
    console.log("Server connected to transport");
  });

  // POST Endpoint for Messages
  app.post("/messages", async (req, res) => {
    console.log("Received POST /messages");
    if (globalTransport) {
        console.log("Handling via globalTransport");
        await globalTransport.handlePostMessage(req, res);
    } else {
        console.log("No globalTransport found");
        res.status(503).send("No active connection");
    }
  });

  let globalTransport: SSEServerTransport | null = null;
  
  app.listen(PORT, () => {
    console.error(`retest-ai MCP Server running on http://localhost:${PORT}/sse`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

