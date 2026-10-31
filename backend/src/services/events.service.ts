import { eventsRepository, routesRepository } from "../repositories/events.repository";
import { gisRepository, sheltersRepository, alertsRepository } from "../repositories/shelters.repository";
import { memoryService } from "./memory.service";
import { preferencesRepository } from "../repositories/preferences.repository";

export const eventsService = {
  list: () => eventsRepository.list(),
  listRoutes: () => routesRepository.list(),
  getActive: () => eventsRepository.getActive(),
  getById: async (id: string) => {
    try {
      return await eventsRepository.getById(id);
    } catch (e) {
      if ((e as { code?: string }).code === "22P02") return null; // invalid uuid param
      throw e;
    }
  },
  create: (input: Parameters<typeof eventsRepository.create>[0]) => eventsRepository.create(input),
  getTrack: (id: string) => eventsRepository.getTrack(id),
  addTrackPoint: (id: string, input: Parameters<typeof eventsRepository.addTrackPoint>[1]) =>
    eventsRepository.addTrackPoint(id, input),
  getRiskAreas: (id: string) => eventsRepository.getRiskAreas(id),
  getFloodExtent: (id: string) => eventsRepository.getFloodExtent(id),
  getTimeline: (id: string) => eventsRepository.getTimeline(id),

  /** Response summary derived from stored data — PostGIS computes affected
   * facts; no invented values. Missing inputs surface as `undefined`. */
  getResponse: async (eventId: string) => {
    const ev = await eventsService.getById(eventId);
    if (!ev) return null;

    const affectedUnion = await eventsRepository.getAffectedAreaUnion(eventId);

    let safeShelters: Awaited<ReturnType<typeof sheltersRepository.safeOutsideHazard>> | null = null;
    let blockedRoutes: Awaited<ReturnType<typeof gisRepository.routesIntersecting>> | null = null;
    if (affectedUnion) {
      safeShelters = await sheltersRepository.safeOutsideHazard(affectedUnion);
      blockedRoutes = await gisRepository.routesIntersecting(affectedUnion);
    }

    const campaigns = await eventsRepository.getAlerts(eventId);
    const affectedUsers = affectedUnion ? await gisRepository.usersInPolygon(affectedUnion) : [];

    return {
      eventId,
      updatedAt: new Date().toISOString(),
      source: "derived",
      status: "current" as const,
      recommendedAction: affectedUnion
        ? "Prepare evacuation for affected areas; verify safe routes and shelters before dispatching alerts."
        : undefined,
      affectedAreaCount: affectedUnion ? 1 : 0,
      affectedUserCount: affectedUsers.length,
      exposedPopulation: ev.populationExposed,
      shelterIds: safeShelters ? safeShelters.slice(0, 5).map((s) => s.id) : [],
      routeIds: blockedRoutes ? blockedRoutes.filter((r) => r.status !== "blocked").map((r) => r.id) : [],
      blockedRouteCount: blockedRoutes ? blockedRoutes.filter((r) => r.status === "blocked").length : undefined,
      alerts: campaigns,
    };
  },

  /** Meko boundary: memories come from Meko only. Reference metadata is
   * stored in MongoDB; nothing is fabricated when Meko is unavailable. */
  getMemoryInsights: async (eventId: string) => {
    const result = await memoryService.getRelevantMemories({ eventId });
    if (!result.available || !result.items.length) {
      return { available: false as const, insights: [] };
    }
    await Promise.all(
      result.items.slice(0, 20).map((m) =>
        preferencesRepository
          .recordMemoryMetadata({
            eventId,
            mekoRef: String(m.id ?? m.mekoRef ?? "unknown"),
            title: typeof m.title === "string" ? m.title : undefined,
            confidence: typeof m.confidence === "number" ? m.confidence : undefined,
            createdAt: new Date().toISOString(),
          })
          .catch(() => undefined),
      ),
    );
    return {
      available: true as const,
      insights: result.items.map((m, i) => ({
        id: String(m.id ?? `mem-${i}`),
        eventId,
        title: typeof m.title === "string" ? m.title : "Memory insight",
        summary: typeof m.summary === "string" ? m.summary : "",
        confidence: typeof m.confidence === "number" ? m.confidence : undefined,
        source: "meko",
        createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date().toISOString(),
        available: true,
      })),
    };
  },

  getAlerts: (id: string) => eventsRepository.getAlerts(id),
  addObservation: async (eventId: string, input: Parameters<typeof eventsRepository.addObservation>[1]) => {
    await assertEventExists(eventId);
    return eventsRepository.addObservation(eventId, input);
  },
  addRiskArea: async (eventId: string, input: Parameters<typeof eventsRepository.addRiskArea>[1]) => {
    await assertEventExists(eventId);
    return eventsRepository.addRiskArea(eventId, input);
  },
  addFloodExtent: async (eventId: string, input: Parameters<typeof eventsRepository.addFloodExtent>[1]) => {
    await assertEventExists(eventId);
    return eventsRepository.addFloodExtent(eventId, input);
  },
  addTrackPrediction: async (
    eventId: string,
    input: { points: Array<{ observedAt: string; lat: number; lon: number; windKmh?: number; pressureHpa?: number; rainfallMm?: number }>; model?: string; modelVersion?: string },
  ) => {
    await assertEventExists(eventId);
    const result = await eventsRepository.addTrackPrediction(eventId, input.points);
    // Model metadata persists alongside future ML integrations (no ML built here).
    if (input.model) {
      await preferencesRepository.upsertSetting(`track-model:${eventId}`, {
        model: input.model,
        modelVersion: input.modelVersion ?? null,
        points: input.points.length,
        recordedAt: new Date().toISOString(),
      });
    }
    return result;
  },
};

async function assertEventExists(eventId: string) {
  const ev = await eventsRepository.getById(eventId);
  if (!ev) {
    const { HttpError } = await import("../middleware/error.middleware");
    throw new HttpError(404, "NOT_FOUND", "Event not found.");
  }
}
