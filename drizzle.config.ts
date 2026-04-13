import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  out: "./src/database/migrations",
  schema: "./src/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
