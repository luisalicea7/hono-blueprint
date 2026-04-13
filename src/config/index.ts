import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

dotenv.config({
  path: [path.join(projectRoot, ".env.test"), path.join(projectRoot, ".env")],
  quiet: true,
});

const corsOriginsSchema = z
  .string()
  .optional()
  .transform(
    (value) =>
      value
        ?.split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0) ?? [],
  );

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_NAME: z.string().default("chefsito-backend"),
  DATABASE_URL: z.url().min(1),
  REDIS_URL: z.url().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url().min(1),
  CORS_ORIGINS: corsOriginsSchema,
  CACHE_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true")
    .default(false),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error(_env.error, "Invalid environment variables");
  throw new Error("Invalid environment variables");
}

logger.info("Environment variables validated");

export const config = {
  ..._env.data,
  CORS_ORIGINS:
    _env.data.CORS_ORIGINS.length > 0
      ? _env.data.CORS_ORIGINS
      : _env.data.NODE_ENV === "production"
        ? []
        : ["http://localhost:5173"],
};
