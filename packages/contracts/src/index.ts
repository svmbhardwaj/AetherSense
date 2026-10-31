// Shared domain contracts for AetherSense.
// GeoJSON types are structural; use proper GeoJSON.

export type GeoJSONPosition = [number, number] | [number, number, number];

export interface GeoJSONPoint {
  type: "Point";
  coordinates: GeoJSONPosition;
}

export interface GeoJSONLineString {
  type: "LineString";
  coordinates: GeoJSONPosition[];
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: GeoJSONPosition[][];
}

export interface GeoJSONMultiPolygon {
  type: "MultiPolygon";
  coordinates: GeoJSONPosition[][][];
}

export type GeoJSONGeometry =
  | GeoJSONPoint
  | GeoJSONLineString
  | GeoJSONPolygon
  | GeoJSONMultiPolygon;

export interface GeoJSONFeature<P = Record<string, unknown>> {
  type: "Feature";
  id?: string | number;
  geometry: GeoJSONGeometry;
  properties: P;
}

export interface GeoJSONFeatureCollection<P = Record<string, unknown>> {
  type: "FeatureCollection";
  features: GeoJSONFeature<P>[];
}

export type FreshnessStatus = "current" | "delayed" | "stale" | "unavailable";

export interface DataSource {
  id: string;
  name: string;
  kind: string;
  updatedAt: string;
  status: FreshnessStatus;
}

export interface DataAsset {
  id: string;
  source: string;
  storageKey: string;
  acquiredAt: string;
  bbox?: GeoJSONPolygon;
  resolution?: string;
  metadata?: Record<string, unknown>;
  processingStatus: "pending" | "processed" | "failed";
  checksum?: string;
  eventId?: string;
}

export interface DisasterEvent {
  id: string;
  name: string;
  type: string;
  severity: "low" | "moderate" | "high" | "severe" | "critical";
  status: "active" | "monitoring" | "closed";
  startedAt: string;
  updatedAt: string;
  /** Latest observed track point (joined server-side for map rendering). */
  latestPoint?: GeoJSONPoint;
  source: string;
  dataFreshness: FreshnessStatus;
  landfall?: string;
  windKmh?: number;
  pressureHpa?: number;
  rainfallMm?: number;
  populationExposed?: number;
  districtsAtRisk?: number;
  confidence?: number;
  eta?: string;
}

export interface EventObservation {
  id: string;
  eventId: string;
  observedAt: string;
  windKmh?: number;
  pressureHpa?: number;
  rainfallMm?: number;
  source: string;
}

export interface CycloneTrackPoint {
  id: string;
  eventId: string;
  observedAt: string;
  location: GeoJSONPoint;
  windKmh?: number;
  pressureHpa?: number;
  rainfallMm?: number;
  isForecast: boolean;
}

export interface RiskArea {
  id: string;
  eventId: string;
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon;
  riskScore: number;
  label?: string;
  source: string;
  updatedAt: string;
}

export interface FloodExtent {
  id: string;
  eventId: string;
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon;
  depthM?: number;
  probability?: number;
  source: string;
  acquiredAt: string;
  status: FreshnessStatus;
}

export type ShelterStatusValue = "available" | "filling" | "full" | "offline";

export interface Shelter {
  id: string;
  name: string;
  location: GeoJSONPoint;
  capacity: number;
  occupied?: number;
  status: ShelterStatusValue;
  distanceKm?: number;
  etaMin?: number;
  routeStatus?: string;
  updatedAt: string;
}

export interface ShelterStatus {
  id: string;
  shelterId: string;
  recordedAt: string;
  occupied: number;
  status: ShelterStatusValue;
}

export type RouteStatusValue = "open" | "congested" | "blocked" | "unknown";

export interface EvacuationRoute {
  id: string;
  eventId?: string;
  geometry: GeoJSONLineString;
  status: RouteStatusValue;
  label?: string;
  reason?: string;
  updatedAt: string;
}

export interface RouteStatus {
  id: string;
  routeId: string;
  recordedAt: string;
  status: RouteStatusValue;
}

export interface AlertCampaign {
  id: string;
  eventId?: string;
  createdAt: string;
  status: "draft" | "queued" | "sending" | "sent" | "failed" | "cancelled";
  targetCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  channels: string[];
}

export interface AlertRecipient {
  id: string;
  campaignId: string;
  // server-side only; never expose PII to browser
  status: "queued" | "sent" | "delivered" | "read" | "failed" | "fallback_triggered";
  channel: string;
  createdAt: string;
}

export type DeliveryStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "fallback_triggered";

export interface AlertDeliveryEvent {
  id: string;
  recipientId: string;
  campaignId: string;
  status: DeliveryStatus;
  providerId?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryInsight {
  id: string;
  eventId?: string;
  title: string;
  summary: string;
  confidence?: number;
  source: string;
  createdAt: string;
  available: boolean;
}

export interface SystemStatus {
  api: "ok" | "degraded" | "down";
  database: "ok" | "degraded" | "down" | "unavailable";
  mongodb: "ok" | "down" | "unavailable";
  redis: "ok" | "degraded" | "down" | "unavailable";
  queue: "ok" | "degraded" | "down" | "unavailable";
  providers: Record<string, "available" | "unavailable">;
  updatedAt: string;
}

export interface AlertChannelStat {
  channel: string;
  sent: number;
  delivered: number;
  failed: number;
  deliveredPct: number;
}

export interface AlertStats {
  target: number;
  delivered: number;
  read: number;
  failed: number;
  channels: AlertChannelStat[];
}

export interface AlertCampaignActivity {
  campaignId: string;
  eventId?: string;
  channels: string[];
  total: number;
  delivered: number;
  failed: number;
  lastEventAt?: string;
}

export interface MemoryInsightsResponse {
  available: boolean;
  insights: MemoryInsight[];
}

export interface DerivedResponseSummary {
  eventId: string;
  updatedAt: string;
  source: "derived";
  status: FreshnessStatus;
  recommendedAction?: string;
  affectedAreaCount?: number;
  affectedUserCount?: number;
  exposedPopulation?: number;
  shelterIds: string[];
  routeIds: string[];
  blockedRouteCount?: number;
  alerts: AlertCampaign[];
}

export interface PreferencesDocument {
  userId: string;
  language?: string;
  notificationChannels?: ("whatsapp" | "sms" | "push")[];
  quietHours?: { start: string; end: string } | null;
  updatedAt: string;
}

export interface MemoryReferenceMetadata {
  eventId?: string;
  mekoRef: string;
  title?: string;
  confidence?: number;
  tags?: string[];
  createdAt: string;
}

export interface AffectedArea {
  id: string;
  eventId: string;
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon;
  source: string;
  updatedAt: string;
}

export interface EventTimelineEntry {
  time: string;
  label: string;
  value?: number | string;
}


