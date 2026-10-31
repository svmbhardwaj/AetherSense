import { createApp } from "./app";
import { env } from "./config/env";
import { closeDatabase } from "./config/database";
import { closeMongo, ensureMongoIndexes } from "./config/mongo";
import { redis } from "./config/redis";
import { closeQueues } from "./queues/queues";
import { startWorkers } from "./queues/workers";
import { logger } from "./utils/logger";

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "AetherSense API listening");
});
startWorkers();
void ensureMongoIndexes();

async function shutdown() {
  logger.info("shutting down");
  server.close();
  await closeQueues();
  await closeDatabase();
  await closeMongo();
  redis.disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
