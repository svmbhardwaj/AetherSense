import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import routes from "./routes";
import { logger } from "./utils/logger";
import { env } from "./config/env";
import pinoHttp from "pino-http";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(requestIdMiddleware);
  app.use(pinoHttp({ logger }));
  app.use(authMiddleware);
  app.use(rateLimit({ windowMs: 60_000, max: 300 }));
  app.use("/api/v1", routes);
  app.use(errorMiddleware);
  return app;
}
