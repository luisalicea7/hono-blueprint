import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config/index.js";
import * as schema from "./schema.js";

// Create connection pool for better performance
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: config.NODE_ENV === "test" ? 2 : 10,
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: config.NODE_ENV === "test" ? 10000 : 3000,
});

const _DB_CLIENT = drizzle(pool, { schema });

export { _DB_CLIENT };
export default _DB_CLIENT;
