import { Hono } from "hono";
import { healthRouter } from "./v1/health.js";
import type { HonoVariables } from "../types/hono.js";

export const apiRouter = new Hono<{ Variables: HonoVariables }>();

// Public
apiRouter.route("/health", healthRouter);
