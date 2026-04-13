import { Hono } from "hono";
import { auth } from "./lib/auth.js";
import { apiRouter } from "./routes/index.js";
import { sessionMiddleware } from "./middleware/validateAuth.js";
import type { HonoVariables } from "./types/hono.js";
import { config } from "./config/index.js";
import { cors } from "hono/cors";

export function createApp() {
  const app = new Hono<{ Variables: HonoVariables }>();

  const corsMiddleware = cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "set-auth-token"],
    maxAge: 600,
  });

  app.use("*", corsMiddleware);

  app.on(["GET", "POST"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

  app.use("*", sessionMiddleware);

  app.get("/", (c) => {
    return c.json({
      message: "Welcome to the Chefsito API!",
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
    });
  });

  app.route("/v1", apiRouter);

  return app;
}

export const app = createApp();
