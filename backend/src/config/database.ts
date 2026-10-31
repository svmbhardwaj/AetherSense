import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export async function checkDatabase(): Promise<boolean> {
  try {
    const r = await pool.query("SELECT 1");
    return r.rowCount === 1;
  } catch (e) {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
