import { z } from "zod";

const lat = z.coerce.number().min(-90).max(90);
const lon = z.coerce.number().min(-180).max(180);

export const latlonQuerySchema = z.object({ lat, lon, limit: z.coerce.number().int().min(1).max(50).optional() });
export const latlonRadiusQuerySchema = z.object({ lat, lon, radiusM: z.coerce.number().min(1).max(500_000) });

export const coordinatesBodySchema = z
  .object({
    a: z.object({ lon, lat }),
    b: z.object({ lon, lat }),
  })
  .strict();

export const geometryBodySchema = z.object({
  geometry: z.object({ type: z.enum(["Polygon", "MultiPolygon"]) }).passthrough().optional(),
  hazard: z.object({ type: z.enum(["Polygon", "MultiPolygon"]) }).passthrough().optional(),
  body: z.object({ type: z.enum(["Polygon", "MultiPolygon"]) }).passthrough().optional(),
})
  .passthrough()
  .refine(
    (v) => Boolean(v.geometry ?? v.hazard),
    { message: "geometry or hazard is required" },
  )
  .transform((v) => v);
