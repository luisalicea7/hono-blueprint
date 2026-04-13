import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { logger } from "../../utils/logger.js";
import * as healthService from "../../services/healthService.js";
import { isAppError } from "../../types/index.js";

export const healthController = {
  async getHealth(c: Context) {
    try {
      const payload = await healthService.getHealthOverview();
      return c.json(payload, payload.status === "error" ? 503 : 200);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.message },
          err.statusCode as ContentfulStatusCode,
        );
      logger.error({ err }, "get health failed");
      return c.json({ error: "Internal server error" }, 500);
    }
  },

  getLive(c: Context) {
    try {
      return c.json(healthService.getLive(), 200);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.message },
          err.statusCode as ContentfulStatusCode,
        );
      logger.error({ err }, "get live failed");
      return c.json({ error: "Internal server error" }, 500);
    }
  },

  async getReady(c: Context) {
    try {
      const payload = await healthService.getReady();
      return c.json(payload, payload.status === "ok" ? 200 : 503);
    } catch (err) {
      if (isAppError(err))
        return c.json(
          { error: err.message },
          err.statusCode as ContentfulStatusCode,
        );
      logger.error({ err }, "get ready failed");
      return c.json({ error: "Internal server error" }, 500);
    }
  },
};
