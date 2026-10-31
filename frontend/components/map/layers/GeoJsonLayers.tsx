"use client";

import { useEffect, useMemo } from "react";
import type { GeoJSONSource } from "maplibre-gl";
import { useFloodExtent, useRiskAreas, useRoutes, useShelters, useEvents, useEventTrack } from "@/lib/hooks";
import { useUIStore } from "@/store/ui-store";
import { mapInstance } from "@/lib/map-instance";
import type { GeoJSONFeatureCollection } from "@contracts";

interface Props {
  mapReady: boolean;
  eventId?: string;
}

const EMPTY: GeoJSONFeatureCollection = { type: "FeatureCollection", features: [] };

function useMapSourceData(
  mapReady: boolean,
  sourceId: string,
  data: GeoJSONFeatureCollection,
  layerIds: readonly string[],
  visible: boolean,
) {
  useEffect(() => {
    const map = mapReady ? mapInstance.current : null;
    if (!map) return;
    (map.getSource(sourceId) as GeoJSONSource | undefined)?.setData(data);
    for (const layerId of layerIds) {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    }
  }, [data, layerIds, mapReady, sourceId, visible]);
}

export function RiskAreaLayer({ mapReady, eventId }: Props) {
  const visible = useUIStore((s) => s.layers.risk);
  const risk = useRiskAreas(eventId);
  useMapSourceData(mapReady, "risk-areas", risk.data ?? EMPTY, ["risk-fill", "risk-outline"], visible);
  return null;
}

export function FloodExtentLayer({ mapReady, eventId }: Props) {
  const visible = useUIStore((s) => s.layers.flood);
  const flood = useFloodExtent(eventId);
  useMapSourceData(mapReady, "flood-extents", flood.data ?? EMPTY, ["flood-fill", "flood-outline"], visible);
  return null;
}

export function ShelterLayer({ mapReady }: Props) {
  const visible = useUIStore((s) => s.layers.shelters);
  const shelters = useShelters();
  const fc: GeoJSONFeatureCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: (shelters.data ?? []).map((s) => ({
        type: "Feature",
        id: s.id,
        geometry: s.location,
        properties: {
          name: s.name,
          status: s.status,
          capacity: s.capacity,
          occupied: s.occupied,
        },
      })),
    }),
    [shelters.data],
  );
  useMapSourceData(mapReady, "shelters", fc, ["shelter-clusters", "shelter-cluster-count", "shelters-layer"], visible);
  return null;
}

export function RouteLayer({ mapReady }: Props) {
  const visible = useUIStore((s) => s.layers.routes);
  const routes = useRoutes();
  useMapSourceData(mapReady, "routes", routes.data ?? EMPTY, ["routes-layer"], visible);
  return null;
}

export function HistoricalEventLayer({ mapReady }: Props) {
  const visible = useUIStore((s) => s.layers.memory);
  const events = useEvents();
  const fc: GeoJSONFeatureCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: (events.data ?? [])
        .filter((event) => event.latestPoint && event.status !== "active")
        .map((event) => ({
          type: "Feature",
          id: event.id,
          geometry: event.latestPoint!,
          properties: { name: event.name, type: event.type, startedAt: event.startedAt },
        })),
    }),
    [events.data],
  );
  useMapSourceData(mapReady, "historical-events", fc, ["historical-layer"], visible);
  return null;
}

export function ForecastTrackLayer({ mapReady, eventId }: Props) {
  const visible = useUIStore((s) => s.layers.cyclone);
  const track = useEventTrack(eventId);
  const forecastLine = useMemo(() => buildForecastLine(track.data), [track.data]);
  useMapSourceData(mapReady, "forecast-line", forecastLine, ["forecast-line-layer"], visible);
  return null;
}

export function RainfallLayer({ mapReady }: Props) {
  const visible = useUIStore((s) => s.layers.rainfall);

  useEffect(() => {
    const map = mapReady ? mapInstance.current : null;
    if (!map || !map.getLayer("rainfall-layer")) return;
    map.setLayoutProperty("rainfall-layer", "visibility", visible ? "visible" : "none");
  }, [mapReady, visible]);

  return null;
}

function buildForecastLine(trackData?: GeoJSONFeatureCollection): GeoJSONFeatureCollection {
  const forecastPoints = (trackData?.features ?? []).filter(
    (feature) => feature.properties?.isForecast && feature.geometry.type === "Point",
  );
  if (forecastPoints.length < 2) return EMPTY;
  const coordinates: [number, number][] = forecastPoints.flatMap((feature) => {
    if (feature.geometry.type !== "Point") return [];
    const [lon, lat] = feature.geometry.coordinates;
    return [[lon, lat] as [number, number]];
  });
  if (coordinates.length < 2) return EMPTY;
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates,
      },
      properties: {},
    }],
  };
}
