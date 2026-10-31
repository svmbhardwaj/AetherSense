import { pool } from "../config/database";
import { randomUUID } from "crypto";

export interface ShelterRow {
  id: string;
  name: string;
  location: { type: "Point"; coordinates: number[] };
  capacity: number;
  occupied: number;
  status: string;
  updated_at: Date;
  distanceKm?: number;
}

interface ShelterQueryRow {
  id: string;
  name: string;
  location: { type: "Point"; coordinates: number[] };
  capacity: number;
  occupied: number | null;
  status: string;
  updated_at: Date;
  dist_m?: string | number;
}

function mapShelter(r: ShelterQueryRow) {
  return {
    id: r.id,
    name: r.name,
    location: r.location,
    capacity: r.capacity,
    occupied: r.occupied ?? 0,
    status: r.status,
    updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    ...(r.dist_m != null ? { distanceKm: Number(r.dist_m) / 1000 } : {}),
  };
}

export const sheltersRepository = {
  async list(params: { lat?: number; lon?: number; radiusM?: number } = {}) {
    let sql = `SELECT id, name, ST_AsGeoJSON(location)::json AS location, capacity, occupied, status, updated_at FROM shelters`;
    const vals: unknown[] = [];
    if (params.lat !== undefined && params.lon !== undefined && params.radiusM) {
      sql += ` WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)`;
      vals.push(params.lon, params.lat, params.radiusM);
    }
    sql += ` ORDER BY updated_at DESC LIMIT 500`;
    const { rows } = await pool.query<ShelterQueryRow>(sql, vals);
    return rows.map(mapShelter);
  },

  async getById(id: string) {
    const { rows } = await pool.query<ShelterQueryRow>(
      `SELECT id, name, ST_AsGeoJSON(location)::json AS location, capacity, occupied, status, updated_at FROM shelters WHERE id=$1`,
      [id],
    );
    return rows[0] ? mapShelter(rows[0]) : null;
  },

  async nearest(lat: number, lon: number, limit = 5) {
    const { rows } = await pool.query<ShelterQueryRow>(
      `SELECT id, name, ST_AsGeoJSON(location)::json AS location, capacity, occupied, status, updated_at,
              ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) AS dist_m
       FROM shelters
       WHERE status <> 'offline'
       ORDER BY dist_m ASC
       LIMIT $3`,
      [lon, lat, limit],
    );
    return rows.map(mapShelter);
  },

  /** Shelters outside the hazard geometry (server-side PostGIS point-in-polygon). */
  async safeOutsideHazard(hazardGeoJson: Record<string, unknown>) {
    const { rows } = await pool.query<ShelterQueryRow>(
      `SELECT id, name, ST_AsGeoJSON(location)::json AS location, capacity, occupied, status, updated_at,
              ST_Distance(location::geography, ST_Centroid(ST_GeomFromGeoJSON($1), true)::geography) AS dist_m
       FROM shelters
       WHERE NOT ST_Contains(ST_SetSRID(ST_GeomFromGeoJSON($1),4326), location::geometry)
         AND status <> 'offline'
       ORDER BY dist_m ASC
       LIMIT 100`,
      [JSON.stringify(hazardGeoJson)],
    );
    return rows.map(mapShelter);
  },

  async create(input: { name: string; lon: number; lat: number; capacity: number; occupied?: number; status?: string }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO shelters (id, name, location, capacity, occupied, status)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3,$4),4326), $5, $6, $7)`,
      [id, input.name, input.lon, input.lat, input.capacity, input.occupied ?? 0, input.status || "available"],
    );
    return { id };
  },

  async updateStatus(id: string, status: string, occupied?: number) {
    const { rows } = await pool.query(`SELECT occupied FROM shelters WHERE id=$1`, [id]);
    const current = rows[0]?.occupied ?? 0;
    const nextOccupied = occupied ?? current;
    await pool.query(
      `INSERT INTO shelter_status (id, shelter_id, recorded_at, occupied, status) VALUES ($1,$2,NOW(),$3,$4)`,
      [randomUUID(), id, nextOccupied, status],
    );
    await pool.query(`UPDATE shelters SET status=$1, occupied=$2, updated_at=NOW() WHERE id=$3`, [status, nextOccupied, id]);
    return { id, status };
  },
};

export const gisRepository = {
  /** Affected users inside a risk polygon (server-side spatial query). */
  async usersInPolygon(polygonGeoJson: Record<string, unknown>) {
    const { rows } = await pool.query(
      `SELECT id, role FROM users WHERE location IS NOT NULL
         AND ST_Contains(ST_SetSRID(ST_GeomFromGeoJSON($1),4326), location::geometry)`,
      [JSON.stringify(polygonGeoJson)],
    );
    return rows;
  },
  async districtsIntersecting(geometryGeoJson: Record<string, unknown>) {
    const { rows } = await pool.query(
      `SELECT id, name FROM districts WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($1),4326))`,
      [JSON.stringify(geometryGeoJson)],
    );
    return rows;
  },
  async routesIntersecting(geometryGeoJson: Record<string, unknown>) {
    const { rows } = await pool.query(
      `SELECT id, status, ST_AsGeoJSON(geom)::json AS geometry FROM routes
       WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($1),4326))`,
      [JSON.stringify(geometryGeoJson)],
    );
    return rows;
  },
  async eventBoundingBox(eventId: string) {
    const { rows } = await pool.query(
      `SELECT ST_AsGeoJSON(ST_Envelope(ST_Extent(location)))::json AS bbox
       FROM cyclone_track_points WHERE event_id=$1`,
      [eventId],
    );
    return rows[0]?.bbox ?? null;
  },
  async distanceBetween(a: { lon: number; lat: number }, b: { lon: number; lat: number }) {
    const { rows } = await pool.query(
      `SELECT ST_Distance(ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, ST_SetSRID(ST_MakePoint($3,$4),4326)::geography) AS d`,
      [a.lon, a.lat, b.lon, b.lat],
    );
    return rows[0]?.d ?? 0;
  },
  async nearestShelters(lat: number, lon: number, limit = 5) {
    return sheltersRepository.nearest(lat, lon, limit);
  },
  async sheltersInRadius(lat: number, lon: number, radiusM: number) {
    return sheltersRepository.list({ lat, lon, radiusM });
  },
};

export const alertsRepository = {
  async createCampaign(input: {
    eventId?: string;
    status?: string;
    targetCount?: number;
    channels?: string[];
    message?: string;
  }) {
    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO alert_campaigns (id, event_id, status, target_count, message)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id, input.eventId ?? null, input.status || "queued", input.targetCount ?? 0, input.message ?? null],
    );
    const r = rows[0];
    return mapCampaign(r);
  },
  async getCampaign(id: string) {
    const { rows } = await pool.query(`SELECT * FROM alert_campaigns WHERE id=$1`, [id]);
    return rows[0] ? mapCampaign(rows[0]) : null;
  },
  async listCampaigns(eventId?: string) {
    const { rows } = eventId
      ? await pool.query(`SELECT * FROM alert_campaigns WHERE event_id=$1 ORDER BY created_at DESC LIMIT 100`, [eventId])
      : await pool.query(`SELECT * FROM alert_campaigns ORDER BY created_at DESC LIMIT 100`);
    return rows.map(mapCampaign);
  },
  async addRecipient(input: { campaignId: string; channel: string; destination: string; status?: string }) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO alert_recipients (id, campaign_id, status, channel, destination) VALUES ($1,$2,$3,$4,$5)`,
      [id, input.campaignId, input.status || "queued", input.channel, input.destination],
    );
    return { id };
  },
  async getRecipientDestination(recipientId: string): Promise<string | null> {
    const { rows } = await pool.query(`SELECT destination FROM alert_recipients WHERE id=$1`, [recipientId]);
    return rows[0]?.destination ?? null;
  },
  async updateRecipientStatus(id: string, status: string, providerId?: string) {
    const { rows } = await pool.query(
      `UPDATE alert_recipients SET status=$1 WHERE id=$2 RETURNING campaign_id`,
      [status, id],
    );
    const campaignId = rows[0]?.campaign_id;
    if (!campaignId) return null;
    await pool.query(
      `INSERT INTO alert_delivery_events (id, recipient_id, campaign_id, status, provider_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [randomUUID(), id, campaignId, status, providerId ?? null],
    );
    const { rows: counts } = await pool.query(
      `UPDATE alert_campaigns SET
         delivered_count = sub.delivered, read_count = sub.read, failed_count = sub.failed
       FROM (
         SELECT
           (SELECT COUNT(*) FROM alert_recipients WHERE campaign_id=$1 AND status IN ('sent','delivered','read')) AS delivered,
           (SELECT COUNT(*) FROM alert_recipients WHERE campaign_id=$1 AND status='read') AS read,
           (SELECT COUNT(*) FROM alert_recipients WHERE campaign_id=$1 AND status='failed') AS failed
       ) AS sub
       WHERE alert_campaigns.id=$1`,
      [campaignId],
    );
    void counts;
    return { id, status };
  },
  async updateRecipientByProviderId(providerId: string, status: string) {
    const { rows } = await pool.query(`SELECT id FROM alert_recipients WHERE provider_id=$1 LIMIT 1`, [providerId]);
    if (!rows[0]) return null;
    return this.updateRecipientStatus(rows[0].id, status, providerId);
  },
  /** Persistence layer counts — the source of truth lives in PostgreSQL, not Redis. */
  async getDeliveryStats() {
    const { rows } = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM alert_recipients) AS total,
        (SELECT COUNT(*) FROM alert_recipients WHERE status IN ('sent','delivered','read')) AS delivered,
        (SELECT COUNT(*) FROM alert_recipients WHERE status='read') AS read,
        (SELECT COUNT(*) FROM alert_recipients WHERE status='failed') AS failed`,
    );
    const r = rows[0];
    return {
      target: Number(r.total),
      delivered: Number(r.delivered),
      read: Number(r.read),
      failed: Number(r.failed),
    };
  },
  async getChannelStats() {
    const { rows } = await pool.query(
      `SELECT
        channel,
        COUNT(*) FILTER (WHERE status <> 'failed') AS sent,
        COUNT(*) FILTER (WHERE status IN ('sent','delivered','read')) AS delivered,
        COUNT(*) FILTER (WHERE status='failed') AS failed
       FROM alert_recipients
       GROUP BY channel`,
    );
    return rows.map((r: Record<string, unknown>) => {
      const sent = Number(r.sent);
      const delivered = Number(r.delivered);
      return {
        channel: String(r.channel),
        sent,
        delivered,
        failed: Number(r.failed),
        deliveredPct: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
      };
    });
  },
  /** Recent delivery activity derived from persisted delivery events. */
  async getRecentActivity(limit = 8) {
    const { rows } = await pool.query(
      `SELECT
         c.id AS campaign_id,
         c.event_id,
         c.channels,
         c.created_at,
         COUNT(r.id) FILTER (WHERE r.status IN ('sent','delivered','read')) AS delivered,
         COUNT(r.id) FILTER (WHERE r.status='failed') AS failed,
         COUNT(r.id) AS total,
         MAX(e.occurred_at) AS last_event_at
       FROM alert_campaigns c
       LEFT JOIN alert_recipients r ON r.campaign_id = c.id
       LEFT JOIN LATERAL (
         SELECT occurred_at FROM alert_delivery_events
         WHERE campaign_id = c.id ORDER BY occurred_at DESC LIMIT 1
       ) e ON true
       GROUP BY c.id, c.event_id, c.channels, c.created_at
       ORDER BY COALESCE(e.occurred_at, c.created_at) DESC
       LIMIT $1`,
      [limit],
    );
    return rows.map((r: Record<string, unknown>) => ({
      campaignId: String(r.campaign_id),
      eventId: (r.event_id as string | null) ?? undefined,
      channels: (r.channels as string[] | null) ?? [],
      total: Number(r.total),
      delivered: Number(r.delivered),
      failed: Number(r.failed),
      lastEventAt: r.last_event_at ? String(r.last_event_at) : (r.created_at ? String(r.created_at) : undefined),
    }));
  },
};

function mapCampaign(r: Record<string, unknown>) {
  return {
    id: String(r.id),
    eventId: (r.event_id as string | null) ?? undefined,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : new Date().toISOString(),
    status: String(r.status) as "draft" | "queued" | "sending" | "sent" | "failed" | "cancelled",
    message: (r.message as string | null) ?? undefined,
    targetCount: Number(r.target_count),
    deliveredCount: Number(r.delivered_count),
    readCount: Number(r.read_count),
    failedCount: Number(r.failed_count),
    channels: (r.channels as string[] | null) ?? [],
  };
}
