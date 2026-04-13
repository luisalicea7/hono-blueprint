import { Redis } from "ioredis";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("reconnecting", () => logger.warn("Redis reconnecting"));
redis.on("error", (err) => logger.error({ err }, "Redis error"));
redis.on("end", () => logger.warn("Redis connection closed"));
