import { pool } from "../config/database";
import { randomUUID } from "crypto";

export interface EventRow {
  id: string;
  name: string;
  type: string;
  severity: string;
  status: string;
  started_at: Date;
  updated_at: Date;
  source: string;
  data_freshness: string;
  landfall: string | null;
  wind_kmh: number | null;
  pressure_hpa: number | null;
  rainfall_mm: number | null;
  population_exposed: number | null;
  districts_at_risk: number | null;
  confidence: number | null;
  eta: string | null;
  latest_point?: { type: "Point"; coordinates: number[] } | null;
}

function mapEvent(r: EventRow) {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    severity: r.severity,
    status: r.status,
    startedAt: toIso(r.started_at),
    updatedAt: toIso(r.updated_at),
    source: r.source,
    dataFreshness: r.data_freshness,
    latestPoint: r.latest_point ?? undefined,
    landfall: r.landfall ?? undefined,
    windKmh: r.wind_kmh ?? undefined,
    pressureHpa: r.pressure_hpa ?? undefined,
    rainfallMm: r.rainfall_mm ?? undefined,
    populationExposed: r.population_exposed ?? undefined,
    districtsAtRisk: r.districts_at_risk ?? undefined,
    confidence: r.confidence ?? undefined,
    eta: r.eta ?? undefined,
  };
}

function toIso(v: Date | string | null | undefined): string {
  if (v instanceof Date) return v.toISOString();
  return v ? new Date(v).toISOString() : new Date().toISOString();
}

const EVENT_COLUMNS = `id, name, type, severity, status, started_at, updated_at, source, data_freshness,
  landfall, wind_kmh, pressure_hpa, rainfall_mm, population_exposed, districts_at_risk, confidence, eta`;

export const eventsRepository = {
  async list() {
    // LATEST track point joined for map rendering — no N+1 from the client.
    const { rows } = await pool.query<EventRow>(
      `SELECT ${EVENT_COLUMNS}, latest.location_geojson AS latest_point
       FROM disaster_events
       LEFT JOIN LATERAL (
         SELECT ST_AsGeoJSON(location)::json AS location_geojson
         FROM cyclone_track_points
         WHERE event_id = disaster_events.id
         ORDER BY observed_at DESC
         LIMIT 1
       ) latest ON true
       ORDER BY started_at DESC`,
    );
    return rows.map(mapEvent);
  },
  async getActive() {
    const { rows } = await pool.query<EventRow>(
      `${baseSelect()} WHERE status='active' ORDER BY started_at DESC LIMIT 1`,
    );
    return rows[0] ? mapEvent(rows[0]) : null;
  },
  async getById(id: string) {
    const { rows } = await pool.query<EventRow>(`${baseSelect()} WHERE id=$1`, [id]);
    return rows[0] ? mapEvent(rows[0]) : null;
  },
  async create(input: {
    name: string; type: string; severity?: string; status?: string; source?: string; dataFreshness?: string;
    landfall?: string; windKmh?: number; pressureHpa?: number; rainfallMm?: number;
    populationExposed?: number; districtsAtRisk?: number; confidence?: number; eta?: string;
  }) {
    const id = randomUUID();
    const { rows } = await pool.query<EventRow>(
      `INSERT INTO disaster_events (id, name, type, severity, status, source, data_freshness, landfall,
         wind_kmh, pressure_hpa, rainfall_mm, population_exposed, districts_at_risk, confidence, eta)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING ${EVENT_COLUMNS}`,
      [
        id, input.name, input.type, input.severity || "moderate", input.status || "active",
        input.source || "manual", input.dataFreshness || "current", input.landfall ?? null,
        input.windKmh ?? null, input.pressureHpa ?? null, input.rainfallMm ?? null,
        input.populationExposed ?? null, input.districtsAtRisk ?? null, input.confidence ?? null, input.eta ?? null,
      ],
    );
    return mapEvent(rows[0]);
  },
  async getTrack(eventId: string) {
    const { rows } = await pool.query(
      `SELECT id, event_id, observed_at, ST_AsGeoJSON(location)::json AS location, wind_kmh, pressure_hpa, rainfall_mm, is_forecast
       FROM cyclone_track_points WHERE event_id=$1 ORDER BY observed_at ASC`,
      [eventId],
    );
    return rows.map((r: Record<string, unknown>) => ({
      type: "Feature",
      id: r.id,
      geometry: r.location,
      properties: {
        eventId: r.event_id,
        observedAt: toIso(r.observed_at as string),
        windKmh: r.wind_kmh ?? undefined,
        pressureHpa: r.pressure_hpa ?? undefined,
        rainfallMm: r.rainfall_mm ?? undefined,
        isForecast: Boolean(r.is_forecast),
      },
    }));
  },
  async addTrackPoint(eventId: string, input: {
    observedAt: string; lat: number; lon: number; windKmh?: number; pressureHpa?: number; rainfallMm?: number; isForecast?: boolean;
  }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO cyclone_track_points (id, event_id, observed_at, location, wind_kmh, pressure_hpa, rainfall_mm, is_forecast)
       VALUES ($1,$2,$3,ST_SetSRID(ST_MakePoint($4,$5),4326),$6,$7,$8,$9)`,
      [id, eventId, input.observedAt, input.lon, input.lat, input.windKmh ?? null, input.pressureHpa ?? null, input.rainfallMm ?? null, input.isForecast ?? false],
    );
    return { id };
  },
  async getRiskAreas(eventId: string) {
    const { rows } = await pool.query(
      `SELECT a.id, a.event_id, ST_AsGeoJSON(a.geom)::json AS geometry, s.risk_score, a.source, a.updated_at
       FROM affected_areas a LEFT JOIN LATERAL (
         SELECT risk_score FROM risk_snapshots WHERE event_id=a.event_id ORDER BY recorded_at DESC LIMIT 1
       ) s ON true WHERE a.event_id=$1`,
      [eventId],
    );
    return {
      type: "FeatureCollection",
      features: rows.map((r: Record<string, unknown>) => ({
        type: "Feature",
        id: r.id,
        geometry: r.geometry,
        properties: {
          eventId: r.event_id,
          riskScore: r.risk_score ?? undefined,
          source: r.source,
          updatedAt: toIso(r.updated_at as string),
        },
      })),
    };
  },
  async getFloodExtent(eventId: string) {
    const { rows } = await pool.query(
      `SELECT id, event_id, ST_AsGeoJSON(geom)::json AS geometry, depth_m, probability, source, acquired_at, status
       FROM flood_extents WHERE event_id=$1 ORDER BY acquired_at DESC`,
      [eventId],
    );
    return {
      type: "FeatureCollection",
      features: rows.map((r: Record<string, unknown>) => ({
        type: "Feature",
        id: r.id,
        geometry: r.geometry,
        properties: {
          eventId: r.event_id,
          depthM: r.depth_m ?? undefined,
          probability: r.probability ?? undefined,
          source: r.source,
          acquiredAt: toIso(r.acquired_at as string),
          status: String(r.status),
        },
      })),
    };
  },
  /** Union of all affected-area geometry for this event (server-side PostGIS). */
  async getAffectedAreaUnion(eventId: string) {
    const { rows } = await pool.query(
      `SELECT ST_AsGeoJSON(ST_UnaryUnion(ST_Collect(geom)))::json AS geometry
       FROM affected_areas WHERE event_id=$1`,
      [eventId],
    );
    return (rows[0]?.geometry as Record<string, unknown> | null) ?? null;
  },
  async getTimeline(eventId: string) {
    const { rows } = await pool.query(
      `SELECT recorded_at, risk_score FROM risk_snapshots WHERE event_id=$1 ORDER BY recorded_at ASC`,
      [eventId],
    );
    return rows.map((r: Record<string, unknown>) => ({
      time: toIso(r.recorded_at as string),
      label: "risk",
      value: r.risk_score,
    }));
  },
  async getAlerts(eventId: string) {
    const { rows } = await pool.query(
      `SELECT id, event_id, created_at, status, target_count, delivered_count, read_count, failed_count, channels
       FROM alert_campaigns WHERE event_id=$1 ORDER BY created_at DESC`,
      [eventId],
    );
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      eventId: r.event_id,
      createdAt: toIso(r.created_at as string),
      status: r.status,
      targetCount: r.target_count,
      deliveredCount: r.delivered_count,
      readCount: r.read_count,
      failedCount: r.failed_count,
      channels: (r.channels as string[] | null) ?? [],
    }));
  },
  async addObservation(eventId: string, input: {
    observedAt: string; windKmh?: number; pressureHpa?: number; rainfallMm?: number; source?: string;
  }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO event_observations (id, event_id, observed_at, wind_kmh, pressure_hpa, rainfall_mm, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, eventId, input.observedAt, input.windKmh ?? null, input.pressureHpa ?? null, input.rainfallMm ?? null, input.source || "manual"],
    );
    return { id };
  },
  async addRiskArea(eventId: string, input: { geometry: Record<string, unknown>; riskScore?: number; source?: string }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO affected_areas (id, event_id, geom, source, updated_at)
       VALUES ($1,$2,ST_SetSRID(ST_GeomFromGeoJSON($3),4326),$4,NOW())`,
      [id, eventId, JSON.stringify(input.geometry), input.source || "manual"],
    );
    if (input.riskScore !== undefined) {
      await pool.query(
        `INSERT INTO risk_snapshots (id, event_id, recorded_at, risk_score, source) VALUES ($1,$2,NOW(),$3,$4)`,
        [randomUUID(), eventId, input.riskScore, input.source || "manual"],
      );
    }
    return { id };
  },
  async addFloodExtent(eventId: string, input: {
    geometry: Record<string, unknown>; depthM?: number; probability?: number; source?: string; acquiredAt?: string; status?: string;
  }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO flood_extents (id, event_id, geom, depth_m, probability, source, acquired_at, status)
       VALUES ($1,$2,ST_SetSRID(ST_GeomFromGeoJSON($3),4326),$4,$5,$6,$7,$8)`,
      [id, eventId, JSON.stringify(input.geometry), input.depthM ?? null, input.probability ?? null, input.source || "manual", input.acquiredAt || new Date().toISOString(), input.status || "current"],
    );
    return { id };
  },
  async addTrackPrediction(eventId: string, points: Array<{
    observedAt: string; lat: number; lon: number; windKmh?: number; pressureHpa?: number; rainfallMm?: number;
  }>) {
    for (const p of points) {
      await this.addTrackPoint(eventId, { ...p, isForecast: true });
    }
    return { count: points.length };
  },
};

function baseSelect() {
  return `SELECT ${EVENT_COLUMNS} FROM disaster_events`;
}

export const routesRepository = {
  list: async () => {
    const { rows } = await pool.query(
      `SELECT id, event_id, ST_AsGeoJSON(geom)::json AS geometry, status, label, updated_at FROM routes
       ORDER BY updated_at DESC`,
    );
    return {
      type: "FeatureCollection",
      features: rows.map((r: Record<string, unknown>) => ({
        type: "Feature",
        id: r.id,
        geometry: r.geometry,
        properties: {
          eventId: r.event_id ?? undefined,
          status: r.status,
          label: r.label ?? undefined,
          updatedAt: toIso(r.updated_at as string),
        },
      })),
    };
  },
};
