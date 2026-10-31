import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const queues = {
  criticalAlerts: new Queue("critical-alerts", { connection: redis }),
  standardAlerts: new Queue("standard-alerts", { connection: redis }),
  notificationRetry: new Queue("notification-retry", { connection: redis }),
  webhookProcessing: new Queue("webhook-processing", { connection: redis }),
};

export async function closeQueues() {
  await Promise.all(Object.values(queues).map((q) => q.close()));
}
