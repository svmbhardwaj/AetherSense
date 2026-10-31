import { queues } from "./queues";
import { logger } from "../utils/logger";

export interface AlertJobData {
  campaignId: string;
  recipientId: string;
  channel: "whatsapp" | "sms" | "push";
  /** Delivery destination resolved before the job is enqueued; the queue is
   * transient and PostgreSQL remains the source of truth. */
  destination: string;
  body: string;
}

export interface WebhookJobData {
  providerId: string;
  status: string;
  channel?: string;
}

export async function enqueueAlertJob(
  data: Omit<AlertJobData, "never">,
  priority: "critical" | "standard" = "standard",
) {
  const queue = priority === "critical" ? queues.criticalAlerts : queues.standardAlerts;
  const jobId = `alert:${data.campaignId}:${data.recipientId}:${data.channel}`;
  await queue.add(
    "send",
    data,
    {
      jobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: false,
    },
  );
  logger.info({ campaignId: data.campaignId, recipientId: data.recipientId, channel: data.channel }, "enqueued alert job");
}

export async function enqueueWebhookJob(data: WebhookJobData) {
  await queues.webhookProcessing.add("state-update", data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: false,
  });
}
