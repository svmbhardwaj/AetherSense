import { describe, expect, it } from "vitest";
import {
  campaign_create_schema,
  create_event_schema,
  flood_extent_schema,
  observation_schema,
  risk_area_schema,
  shelter_create_schema,
  track_prediction_schema,
} from "../src/schemas/ingest.schema";
import { preferencesPatchSchema } from "../src/schemas/preferences.schema";
import { latlonQuerySchema, geometryBodySchema, coordinatesBodySchema } from "../src/schemas/query.schema";
import { webhookBodySchema } from "../src/schemas/params.schema";

describe("ingest schemas", () => {
  it("accepts a valid cyclone event", () => {
    const parsed = create_event_schema.safeParse({
      name: "Test event",
      type: "cyclone",
      windKmh: 120,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects unknown fields and bad types on events", () => {
    expect(create_event_schema.safeParse({ name: "x", type: "cyclone", bogus: 1 }).success).toBe(false);
    expect(create_event_schema.safeParse({ name: "", type: "tsunami" }).success).toBe(false);
  });

  it("requires datetime on observations", () => {
    expect(observation_schema.safeParse({ observedAt: "not-a-date" }).success).toBe(false);
    expect(observation_schema.safeParse({ observedAt: new Date().toISOString() }).success).toBe(true);
  });

  it("bounds coordinates on track predictions", () => {
    const base = { observedAt: new Date().toISOString() };
    expect(track_prediction_schema.safeParse({ points: [{ ...base, lat: 91, lon: 0 }] }).success).toBe(false);
    expect(track_prediction_schema.safeParse({ points: [{ ...base, lat: 20, lon: 88 }] }).success).toBe(true);
  });

  it("requires Polygon/MultiPolygon geometry for risk areas and flood extents", () => {
    const bad = { type: "LineString" };
    expect(risk_area_schema.safeParse({ geometry: bad }).success).toBe(false);
    expect(flood_extent_schema.safeParse({ geometry: { type: "Polygon" } }).success).toBe(true);
  });

  it("requires destinations on campaign recipients", () => {
    expect(
      campaign_create_schema.safeParse({ recipients: [{ destination: "" }] }).success,
    ).toBe(false);
    expect(
      campaign_create_schema.safeParse({ recipients: [{ destination: "+91 7000000000" }] }).success,
    ).toBe(true);
  });

  it("validates shelter creation bounds", () => {
    expect(shelter_create_schema.safeParse({ name: "S", lat: 20, lon: 88, capacity: 100 }).success).toBe(true);
    expect(shelter_create_schema.safeParse({ name: "S", lat: 20, lon: 88, capacity: -1 }).success).toBe(false);
  });
});

describe("preference schemas", () => {
  it("requires at least one field", () => {
    expect(preferencesPatchSchema.safeParse({}).success).toBe(false);
    expect(preferencesPatchSchema.safeParse({ language: "en" }).success).toBe(true);
  });

  it("restricts notification channels", () => {
    expect(preferencesPatchSchema.safeParse({ notificationChannels: ["carrier-pigeon"] }).success).toBe(false);
  });
});

describe("query schemas", () => {
  it("coerces numeric query params", () => {
    const parsed = latlonQuerySchema.safeParse({ lat: "20.3", lon: "88.1", limit: "5" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.lat).toBeCloseTo(20.3);
  });

  it("rejects out-of-range coordinates", () => {
    expect(latlonQuerySchema.safeParse({ lat: 95, lon: 0 }).success).toBe(false);
  });

  it("requires geometry for polygon-body endpoints", () => {
    expect(geometryBodySchema.safeParse({}).success).toBe(false);
    expect(geometryBodySchema.safeParse({ geometry: { type: "Polygon" } }).success).toBe(true);
  });

  it("validates distance payload", () => {
    expect(coordinatesBodySchema.safeParse({ a: { lon: 88, lat: 20 }, b: { lon: 89, lat: 21 } }).success).toBe(true);
  });
});

describe("webhook payload schema", () => {
  it("only accepts delivery statuses", () => {
    expect(webhookBodySchema.safeParse({ providerId: "wa-1", status: "delivered" }).success).toBe(true);
    expect(webhookBodySchema.safeParse({ providerId: "wa-1", status: "queued" }).success).toBe(false);
  });
});
