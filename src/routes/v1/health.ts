import { Hono } from "hono";
import { healthController } from "../../controllers/v1/healthController.js";

export const healthRouter = new Hono();

healthRouter.get("/", healthController.getHealth);
healthRouter.get("/live", healthController.getLive);
healthRouter.get("/ready", healthController.getReady);
