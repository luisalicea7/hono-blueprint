import { sql } from "drizzle-orm";
import { redis } from "../cache/redis.js";
import { config } from "../config/index.js";
import db from "../database/index.js";
import { logger } from "../utils/logger.js";
import type {
  DependencyCheck,
  DependencyChecks,
  HealthOverview,
  LivePayload,
  ReadyPayload,
} from "../types/index.js";

async function checkDatabase(): Promise<DependencyCheck> {
  const started = performance.now();
  try {
    await db.execute(sql`SELECT 1`);
    return { status: "ok", latencyMs: Math.round(performance.now() - started) };
  } catch (err) {
    logger.error({ err }, "Health check: database failed");
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - started),
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkRedis(): Promise<DependencyCheck> {
  const started = performance.now();
  try {
    const pong = await redis.ping();
    if (pong !== "PONG") {
      return {
        status: "error",
        latencyMs: Math.round(performance.now() - started),
        error: `Unexpected PING response: ${String(pong)}`,
      };
    }
    return { status: "ok", latencyMs: Math.round(performance.now() - started) };
  } catch (err) {
    logger.error({ err }, "Health check: redis failed");
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - started),
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getDependencyChecks(): Promise<DependencyChecks> {
  const [database, redisCheck] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);
  return { database, redis: redisCheck };
}

export async function getHealthOverview(): Promise<HealthOverview> {
  const checks = await getDependencyChecks();
  const anyError =
    checks.database.status === "error" || checks.redis.status === "error";

  return {
    status: anyError ? "error" : "ok",
    app: config.APP_NAME,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    checks,
  };
}

export function getLive(): LivePayload {
  return { status: "ok", timestamp: new Date().toISOString() };
}

export async function getReady(): Promise<ReadyPayload> {
  const checks = await getDependencyChecks();
  const ready = checks.database.status === "ok" && checks.redis.status === "ok";

  return {
    status: ready ? "ok" : "error",
    timestamp: new Date().toISOString(),
    checks,
  };
}
