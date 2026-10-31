import { gisRepository, sheltersRepository } from "../repositories/shelters.repository";
import { routesRepository } from "../repositories/events.repository";

export const gisService = {
  usersInPolygon: (polygon: Record<string, unknown>) => gisRepository.usersInPolygon(polygon),
  districtsIntersecting: (geom: Record<string, unknown>) => gisRepository.districtsIntersecting(geom),
  routesIntersecting: (geom: Record<string, unknown>) => gisRepository.routesIntersecting(geom),
  eventBoundingBox: (eventId: string) => gisRepository.eventBoundingBox(eventId),
  distanceBetween: (a: { lon: number; lat: number }, b: { lon: number; lat: number }) => gisRepository.distanceBetween(a, b),
  nearestShelters: (lat: number, lon: number, limit?: number) => gisRepository.nearestShelters(lat, lon, limit),
  sheltersInRadius: (lat: number, lon: number, radiusM: number) => gisRepository.sheltersInRadius(lat, lon, radiusM),
  safeShelters: (hazard: Record<string, unknown>) => sheltersRepository.safeOutsideHazard(hazard),
  routesFeatureCollection: () => routesRepository.list(),
};
