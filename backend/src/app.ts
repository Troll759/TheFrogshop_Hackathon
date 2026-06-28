import cors from "cors";
import express from "express";

import { createOrchestrator } from "./agents/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { createChatRouter } from "./routes/chat.js";
import { healthRouter } from "./routes/health.js";

export function createApp() {
  const app = express();
  const orchestrator = createOrchestrator();
  const corsOrigin = process.env.CORS_ORIGIN;

  app.use(
    cors({
      origin: corsOrigin ? corsOrigin.split(",").map((origin) => origin.trim()) : true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  app.use("/health", healthRouter);
  app.use("/api/chat", createChatRouter(orchestrator));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
