import { alertsRepository } from "../repositories/shelters.repository";
import { enqueueAlertJob, enqueueWebhookJob } from "../queues/alert.queue";
import { notificationRouter } from "./notification.service";
import { env } from "../config/env";
import { HttpError } from "../middleware/error.middleware";
import type { CampaignCreateInput } from "../schemas/ingest.schema";

export const alertsService = {
  /** Persist campaign + recipients in PostgreSQL, then enqueue BullMQ jobs. */
  async createCampaign(input: CampaignCreateInput) {
    const campaign = await alertsRepository.createCampaign({
      eventId: input.eventId,
      targetCount: input.targetCount,
      channels: input.channels,
      message: input.message,
    });
    const recipients = input.recipients ?? [];
    for (const r of recipients) {
      const rec = await alertsRepository.addRecipient({
        campaignId: campaign.id,
        channel: r.channel ?? (input.channels?.[0] as "whatsapp" | "sms" | "push") ?? "whatsapp",
        destination: r.destination,
      });
      await enqueueAlertJob(
        {
          campaignId: campaign.id,
          recipientId: rec.id,
          channel: (r.channel ?? (input.channels?.[0] as "whatsapp" | "sms" | "push") ?? "whatsapp") as
            | "whatsapp"
            | "sms"
            | "push",
          destination: r.destination,
          body: campaign.message ?? "AetherSense: please follow official guidance for this event.",
        },
        input.priority,
      );
    }
    return campaign;
  },

  acceptProviderWebhook(channel: string, payload: { providerId: string; status: string }) {
    if (!env.WEBHOOK_SHARED_SECRET) {
      throw new HttpError(503, "WEBHOOK_NOT_CONFIGURED", "Webhook verification is not configured.");
    }
    void enqueueWebhookJob({ providerId: payload.providerId, status: payload.status, channel });
  },

  getCampaign: (id: string) => alertsRepository.getCampaign(id),
  list: (eventId?: string) => alertsRepository.listCampaigns(eventId),
  updateRecipientStatus: (id: string, status: string, providerId?: string) =>
    alertsRepository.updateRecipientStatus(id, status, providerId),
  deliveryStats: () => alertsRepository.getDeliveryStats(),
  channelStats: () => alertsRepository.getChannelStats(),
  recentActivity: (limit?: number) => alertsRepository.getRecentActivity(limit),
  routerAvailability: () => notificationRouter.availability(),
};
