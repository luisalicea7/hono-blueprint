import { redis } from "./redis.js";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  if (!config.CACHE_ENABLED) return null;
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch (err) {
    logger.warn({ err, key }, "cache get failed — falling back to db");
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl = DEFAULT_TTL,
): Promise<void> {
  if (!config.CACHE_ENABLED) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (err) {
    logger.warn({ err, key }, "cache set failed");
  }
}

export async function invalidatePrefix(prefix: string): Promise<void> {
  if (!config.CACHE_ENABLED) return;
  try {
    let cursor = "0";
    do {
      const [next, keys] = await redis.scan(
        cursor,
        "MATCH",
        `${prefix}*`,
        "COUNT",
        100,
      );
      cursor = next;
      if (keys.length > 0) await redis.del(...keys);
    } while (cursor !== "0");
  } catch (err) {
    logger.warn({ err, prefix }, "cache invalidation failed");
  }
}

export const cacheKey = (userId: string, domain: string) =>
  `cache:${config.NODE_ENV}:${userId}:${domain}`;
