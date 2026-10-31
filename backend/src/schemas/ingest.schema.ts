import { z } from "zod";

// ─── Domain write schemas (validated before any controller code runs) ───

export const create_event_schema = z
  .object({
    name: z.string().min(1).max(200),
    type: z.enum(["cyclone", "flood", "earthquake", "wildfire", "other"]),
    severity: z.enum(["low", "moderate", "high", "severe", "critical"]).optional(),
    status: z.enum(["active", "monitoring", "closed"]).optional(),
    source: z.string().min(1).max(120).optional(),
    dataFreshness: z.enum(["current", "delayed", "stale", "unavailable"]).optional(),
    landfall: z.string().max(200).optional(),
    windKmh: z.number().min(0).max(400).optional(),
    pressureHpa: z.number().min(700).max(1100).optional(),
    rainfallMm: z.number().min(0).max(3000).optional(),
    populationExposed: z.number().int().min(0).optional(),
    districtsAtRisk: z.number().int().min(0).optional(),
    confidence: z.number().min(0).max(100).optional(),
    eta: z.string().max(120).optional(),
  })
  .strict();

export const observation_schema = z
  .object({
    observedAt: z.string().datetime(),
    windKmh: z.number().min(0).max(400).optional(),
    pressureHpa: z.number().min(700).max(1100).optional(),
    rainfallMm: z.number().min(0).max(3000).optional(),
    source: z.string().min(1).max(120).optional(),
  })
  .strict();

export const track_point_schema = z
  .object({
    observedAt: z.string().datetime(),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    windKmh: z.number().min(0).max(400).optional(),
    pressureHpa: z.number().min(700).max(1100).optional(),
    rainfallMm: z.number().min(0).max(3000).optional(),
    isForecast: z.boolean().optional(),
  })
  .strict();

export const track_prediction_schema = z
  .object({
    points: z.array(track_point_schema).min(0).max(500),
    model: z.string().max(120).optional(),
    modelVersion: z.string().max(60).optional(),
  })
  .strict();

export const risk_area_schema = z
  .object({
    geometry: z.object({ type: z.enum(["Polygon", "MultiPolygon"]) }).passthrough(),
    riskScore: z.number().min(0).max(100).optional(),
    source: z.string().min(1).max(120).optional(),
  })
  .strict();

export const flood_extent_schema = z
  .object({
    geometry: z.object({ type: z.enum(["Polygon", "MultiPolygon"]) }).passthrough(),
    depthM: z.number().min(0).max(30).optional(),
    probability: z.number().min(0).max(1).optional(),
    source: z.string().min(1).max(120).optional(),
    acquiredAt: z.string().datetime().optional(),
    status: z.enum(["current", "delayed", "stale", "unavailable"]).optional(),
  })
  .strict();

export const shelter_create_schema = z
  .object({
    name: z.string().min(1).max(200),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    capacity: z.number().int().min(0),
    occupied: z.number().int().min(0).optional(),
    status: z.enum(["available", "filling", "full", "offline"]).optional(),
  })
  .strict();

export const shelter_status_schema = z
  .object({
    status: z.enum(["available", "filling", "full", "offline"]),
    occupied: z.number().int().min(0).optional(),
  })
  .strict();

export const campaign_create_schema = z
  .object({
    eventId: z.string().uuid().optional(),
    priority: z.enum(["critical", "standard"]).optional(),
    targetCount: z.number().int().min(0).optional(),
    channels: z.array(z.enum(["whatsapp", "sms", "push"])).max(4).optional(),
    message: z.string().min(1).max(1_000).optional(),
    recipients: z
      .array(
        z.object({
          channel: z.enum(["whatsapp", "sms", "push"]).optional(),
          destination: z.string().min(3).max(200),
        }),
      )
      .max(50_000)
      .optional(),
  })
  .strict();

export const recipient_status_patch_schema = z
  .object({
    status: z.enum(["queued", "sent", "delivered", "read", "failed", "fallback_triggered"]),
    providerId: z.string().max(200).optional(),
  })
  .strict();

export type CreateEventInput = z.infer<typeof create_event_schema>;
export type ObservationInput = z.infer<typeof observation_schema>;
export type TrackPredictionInput = z.infer<typeof track_prediction_schema>;
export type RiskAreaInput = z.infer<typeof risk_area_schema>;
export type FloodExtentInput = z.infer<typeof flood_extent_schema>;
export type ShelterCreateInput = z.infer<typeof shelter_create_schema>;
export type CampaignCreateInput = z.infer<typeof campaign_create_schema>;
