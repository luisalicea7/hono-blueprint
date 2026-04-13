import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, username } from "better-auth/plugins";
import { i18n } from "@better-auth/i18n";
import { redisStorage } from "@better-auth/redis-storage";
import _DB_CLIENT from "../database/index.js";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
import { redis } from "../cache/redis.js";

export const auth = betterAuth({
  appName: config.APP_NAME,
  database: drizzleAdapter(_DB_CLIENT, {
    provider: "pg",
  }),
  secondaryStorage: redisStorage({
    client: redis,
    keyPrefix: `better-auth:${config.NODE_ENV}:`,
  }),
  baseURL: config.BETTER_AUTH_URL,
  secret: config.BETTER_AUTH_SECRET,
  trustedOrigins: config.CORS_ORIGINS,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "users",
  },
  advanced: {
    useSecureCookies: config.NODE_ENV === "production",
    database: {
      generateId: "uuid",
    },
  },
  logger: {
    level: "warn",
    log: (level, message, ...args) => {
      const pino = logger[level as keyof typeof logger];
      if (typeof pino === "function") {
        (pino as Function).call(logger, { args }, message);
      }
    },
  },
  plugins: [
    admin(),
    openAPI(),
    username(),
    i18n({
      translations: {
        es: {
          USER_NOT_FOUND: "Usuario no encontrado",
          INVALID_EMAIL_OR_PASSWORD: "Credenciales inválidas",
          INVALID_PASSWORD: "Credenciales inválidas",
        },
      },
    }),
  ],
});
