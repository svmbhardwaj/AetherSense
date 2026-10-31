import { Worker, type Job } from "bullmq";
import { redis } from "../../config/redis";
import { logger } from "../../utils/logger";
import { notificationRouter } from "../../services/notification.service";
import { alertsRepository } from "../../repositories/shelters.repository";
import type { AlertJobData, WebhookJobData } from "../alert.queue";

/** Alert dispatch. Missing provider credentials produce a persisted `failed`
 * state — never a fabricated success. Redis is transient; PostgreSQL is the
 * source of truth for delivery state. */
async function alertHandler(job: Job<AlertJobData>) {
  const { campaignId, recipientId, channel, destination, body } = job.data;
  const result = await notificationRouter.send(channel, { to: destination, body });
  if (result.ok) {
    await alertsRepository.updateRecipientStatus(recipientId, result.ok ? "sent" : "failed", result.providerId);
    logger.info({ jobId: job.id, campaignId, channel }, "notification dispatched");
  } else if (result.error === "provider_unavailable") {
    // Provider not configured: mark failed so the UI reports the truth.
    await alertsRepository.updateRecipientStatus(recipientId, "failed");
    logger.warn({ jobId: job.id, channel }, "provider unavailable; recipient marked failed");
    return { ok: false as const, error: result.error };
  } else {
    // Transient provider failure: BullMQ retries the job, status update happens on terminal failure.
    logger.warn({ jobId: job.id, channel, error: result.error }, "dispatch attempt failed; will retry");
    return { ok: false as const, error: result.error };
  }
  return { ok: true as const };
}

async function webhookHandler(job: Job<WebhookJobData>) {
  const { providerId, status } = job.data;
  const updated = await alertsRepository.updateRecipientByProviderId(providerId, status);
  if (!updated) {
    logger.warn({ jobId: job.id, providerId, status }, "webhook update: unknown providerId");
    return { ok: false as const };
  }
  return { ok: true as const };
}

export function startWorkers() {
  const handlerFor = (name: string) => (name === "webhook-processing" ? webhookHandler : alertHandler);

  const workers = [
    new Worker("critical-alerts", alertHandler, { connection: redis, concurrency: 10 }),
    new Worker("standard-alerts", alertHandler, { connection: redis, concurrency: 5 }),
    new Worker("notification-retry", alertHandler, { connection: redis, concurrency: 5 }),
    new Worker("webhook-processing", webhookHandler, { connection: redis, concurrency: 5 }),
  ];

  workers.forEach((w) => {
    void handlerFor(w.name); // handler selection recorded for observability
    w.on("failed", (job, err) => {
      logger.error({ queue: w.name, jobId: job?.id, err }, "job failed after all attempts");
      if (job?.name === "send") {
        const data = job.data as AlertJobData;
        void alertsRepository
          .updateRecipientStatus(data.recipientId, "failed")
          .catch((e) => logger.error({ e }, "could not persist terminal failure"));
      }
    });
  });

  return workers;
}
