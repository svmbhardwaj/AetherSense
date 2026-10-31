import fs from "fs";
import path from "path";
import { pool } from "./config/database";
import { logger } from "./utils/logger";

async function main() {
  const dir = path.join(__dirname, "..", "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), "utf8");
    logger.info({ file: f }, "running migration");
    await pool.query(sql);
  }
  logger.info("migrations complete");
  await pool.end();
}
main().catch((e) => { logger.error(e); process.exit(1); });
