import express from "express";
import path from "path";

export function startUiServer(port: number) {
  const app = express();
  
  // Serve static files
  app.use(express.static(path.join(__dirname, "public")));

  // API Endpoints
  app.get("/api/tests", (req, res) => {
    // TODO: Fetch from Store
    res.json({ tests: [] });
  });

  return app;
}
