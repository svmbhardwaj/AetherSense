// Frontend API client for the AetherSense backend (Node/Express).
// No mock data: all domain data comes from /api/v1, typed by shared contracts.
import type {
  DisasterEvent,
  EventObservation,
  GeoJSONFeatureCollection,
  SystemStatus,
  Shelter,
  ShelterStatusValue,
  AlertCampaign,
  AlertStats,
  AlertCampaignActivity,
  MemoryInsightsResponse,
  RouteStatusValue,
  GeoJSONPosition,
  FreshnessStatus,
  DerivedResponseSummary,
} from "@contracts";

export type {
  DisasterEvent,
  EventObservation,
  SystemStatus,
  Shelter,
  AlertCampaign,
  AlertStats,
  GeoJSONFeatureCollection,
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface ApiPrimitives {
  lat: number;
  lon: number;
  radiusM: number;
}

export const api = {
  system: {
    status: () => request<SystemStatus>("/system/status"),
    dataSources: () =>
      request<{ id: string; name: string; kind: string; updatedAt: string; status: FreshnessStatus }[]>(
        "/system/data-sources",
      ),
  },
  events: {
    list: () => request<DisasterEvent[]>("/events"),
    active: () => request<DisasterEvent | null>("/events/active"),
    get: (id: string) => request<DisasterEvent>(`/events/${id}`),
    track: (id: string) =>
      request<
        GeoJSONFeatureCollection<{
          eventId: string;
          observedAt: string;
          windKmh?: number;
          pressureHpa?: number;
          rainfallMm?: number;
          isForecast: boolean;
        }>
      >(`/events/${id}/track`),
    riskAreas: (id: string) =>
      request<
        GeoJSONFeatureCollection<{
          eventId: string;
          riskScore?: number;
          source: string;
          updatedAt: string;
        }>
      >(`/events/${id}/risk-areas`),
    floodExtent: (id: string) =>
      request<
        GeoJSONFeatureCollection<{
          eventId: string;
          depthM?: number;
          probability?: number;
          source: string;
          acquiredAt: string;
          status: FreshnessStatus;
        }>
      >(`/events/${id}/flood-extent`),
    timeline: (id: string) =>
      request<{ time: string; label: string; value?: number | string }[]>(`/events/${id}/timeline`),
    response: (id: string) => request<DerivedResponseSummary>(`/events/${id}/response`),
    memoryInsights: (id: string) => request<MemoryInsightsResponse>(`/events/${id}/memory-insights`),
    alerts: (id: string) => request<AlertCampaign[]>(`/events/${id}/alerts`),
  },
  routes: {
    list: () =>
      request<
        GeoJSONFeatureCollection<{
          eventId?: string;
          status: RouteStatusValue;
          label?: string;
          updatedAt: string;
        }>
      >("/routes"),
  },
  shelters: {
    list: (params?: { lat?: number; lon?: number; radiusM?: number }) => {
      const q = new URLSearchParams();
      if (params?.lat != null) q.set("lat", String(params.lat));
      if (params?.lon != null) q.set("lon", String(params.lon));
      if (params?.radiusM != null) q.set("radiusM", String(params.radiusM));
      const qs = q.toString();
      return request<Shelter[]>(`/shelters${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => request<Shelter>(`/shelters/${id}`),
    nearest: (lat: number, lon: number, limit = 5) =>
      request<Shelter[]>(`/shelters/nearest?lat=${lat}&lon=${lon}&limit=${limit}`),
  },
  alerts: {
    list: (eventId?: string) =>
      request<AlertCampaign[]>(`/alerts${eventId ? `?eventId=${eventId}` : ""}`),
    get: (id: string) =>
      request<
        AlertCampaign & { message?: string }
      >(`/alerts/${id}`),
    stats: () => request<AlertStats>("/alerts/stats"),
    providers: () => request<Record<string, "available" | "unavailable">>("/alerts/providers"),
    activity: () => request<AlertCampaignActivity[]>("/alerts/activity"),
  },
  memory: {
    relevant: (params: { eventId?: string; location?: string }) => {
      const q = new URLSearchParams();
      if (params.eventId) q.set("eventId", params.eventId);
      if (params.location) q.set("location", params.location);
      return request<MemoryInsightsResponse>(`/memory/relevant?${q.toString()}`);
    },
  },
  gis: {
    eventBoundingBox: (id: string) =>
      request<
        | { type: "Polygon"; coordinates: GeoJSONPosition[][] }
        | null
      >(`/gis/events/${id}/bounding-box`),
    nearestShelters: (lat: number, lon: number, limit = 5) =>
      request<Shelter[]>(`/gis/shelters/nearest?lat=${lat}&lon=${lon}&limit=${limit}`),
    sheltersInRadius: (lat: number, lon: number, radiusM: number) =>
      request<Shelter[]>(`/gis/shelters/in-radius?lat=${lat}&lon=${lon}&radiusM=${radiusM}`),
  },
};

export type ShelterStatus = ShelterStatusValue;
