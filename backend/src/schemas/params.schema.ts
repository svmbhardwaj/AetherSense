import { z } from "zod";

export const userKeySchema = z.object({ userId: z.string().min(1).max(128) });
export const settingKeySchema = z.object({ key: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_.-]+$/) });
export const memoryRefQuerySchema = z.object({ eventId: z.string().uuid().optional() });

// Generic UUID-only param matchers reused across routes.
export const idParamSchema = z.object({ id: z.string().uuid() });
export const eventIdParamSchema = z.object({ id: z.string().uuid() });

export const webhookChannelSchema = z.object({ channel: z.enum(["whatsapp", "sms", "push"]) });
export const webhookBodySchema = z
  .object({
    providerId: z.string().min(1).max(200),
    status: z.enum(["sent", "delivered", "read", "failed"]),
  })
  .strict();
