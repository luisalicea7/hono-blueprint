import { serve } from "@hono/node-server";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { app } from "./app.js";

const PORT = config.PORT;
const BASE_URL = config.BETTER_AUTH_URL;

const server = serve(
  {
    port: PORT,
    fetch: app.fetch,
  },
  () => {
    logger.info(`Server running on ${BASE_URL}`);
  },
);

process.on("SIGINT", () => {
  server.close((err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
