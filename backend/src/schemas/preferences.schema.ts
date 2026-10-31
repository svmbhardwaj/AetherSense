import { z } from "zod";

export const preferencesPatchSchema = z
  .object({
    language: z.string().min(2).max(16).optional(),
    notificationChannels: z.array(z.enum(["whatsapp", "sms", "push"])).max(8).optional(),
    quietHours: z
      .object({
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
      })
      .nullable()
      .optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "At least one preference field is required" });

export type PreferencesPatch = z.infer<typeof preferencesPatchSchema>;

export const settingSchema = z.object({ value: z.record(z.string(), z.unknown()) }).transform((v) => v.value);
