import express from "express";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const basePath = process.env.BASE_PATH ?? "/";

app.get(`${basePath}api/health`, (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(
  `${basePath}api/trpc`,
  createExpressMiddleware({ router: appRouter }),
);

// Serve static client build in production
const clientDist = path.resolve(import.meta.dirname, "../../dist/client");
app.use(basePath, express.static(clientDist));

// SPA fallback: serve index.html for non-API, non-file routes
app.get(`${basePath}{*path}`, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port} with base path ${basePath}`);
});
