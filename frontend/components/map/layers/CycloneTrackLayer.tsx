"use client";

import { useEffect, useMemo } from "react";
import type { GeoJSONSource } from "maplibre-gl";
import { useEventTrack } from "@/lib/hooks";
import { useUIStore } from "@/store/ui-store";
import { mapInstance } from "@/lib/map-instance";
import type { GeoJSONFeatureCollection } from "@contracts";

type TrackProps = {
  eventId: string;
  observedAt: string;
  windKmh?: number;
  pressureHpa?: number;
  rainfallMm?: number;
  isForecast: boolean;
};

interface Props {
  mapReady: boolean;
  eventId?: string;
}

/** Renders the factual cyclone track: observed points/line from API data. */
export default function CycloneTrackLayer({ mapReady, eventId }: Props) {
  const visible = useUIStore((s) => s.layers.cyclone);
  const forecastHour = useUIStore((s) => s.forecastHour);
  const track = useEventTrack(eventId);

  const { observed, forecast } = useMemo(() => {
    const fc = track.data;
    const obs = (fc?.features ?? []).filter((f) => !f.properties?.isForecast);
    const fcst = (fc?.features ?? []).filter((f) => f.properties?.isForecast);
    return { observed: obs, forecast: fcst };
  }, [track.data]);

  // Observed line: consecutive observed points joined for rendering topology only.
  const observedLine = useMemo<GeoJSONFeatureCollection | null>(() => {
    if (observed.length < 2) return null;
    const coords = observed
      .map((f) => f.geometry?.type === "Point" ? f.geometry.coordinates : null)
      .filter((c): c is [number, number] => c !== null);
    return {
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: {} }],
    };
  }, [observed]);

  const observedPoints = useMemo<GeoJSONFeatureCollection>(
    () => ({ type: "FeatureCollection", features: observed }),
    [observed],
  );
  const forecastPoints = useMemo<GeoJSONFeatureCollection>(
    () => ({ type: "FeatureCollection", features: forecast }),
    [forecast],
  );
  const uncertainty = useMemo<GeoJSONFeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: (track.data?.features ?? []).filter(
        (feature) => feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon",
      ),
    }),
    [track.data],
  );

  useEffect(() => {
    const map = mapReady ? mapInstance.current : null;
    if (!map) return;
    const srcLine = map.getSource("track-line") as GeoJSONSource | undefined;
    srcLine?.setData(observedLine ?? { type: "FeatureCollection", features: [] });
    const srcPoints = map.getSource("track-points") as GeoJSONSource | undefined;
    srcPoints?.setData(observedPoints);
    const forecastSource = map.getSource("forecast-points") as GeoJSONSource | undefined;
    forecastSource?.setData(forecastPoints);
    const uncertaintySource = map.getSource("forecast-uncertainty") as GeoJSONSource | undefined;
    uncertaintySource?.setData(uncertainty);
    map.setLayoutProperty?.("track-line-layer", "visibility", visible ? "visible" : "none");
    map.setLayoutProperty?.("track-points-layer", "visibility", visible ? "visible" : "none");
    map.setLayoutProperty?.("forecast-points-layer", "visibility", visible ? "visible" : "none");
    map.setLayoutProperty?.("forecast-uncertainty-layer", "visibility", visible ? "visible" : "none");
    map.setLayoutProperty?.("forecast-uncertainty-outline", "visibility", visible ? "visible" : "none");
  }, [mapReady, observedLine, observedPoints, forecastPoints, uncertainty, visible]);

  // Highlight marker: last observed point, or the forecast point matching the timeline selection.
  useEffect(() => {
    const map = mapReady ? mapInstance.current : null;
    if (!map) return;
    const now = observed.length > 0 ? observed[observed.length - 1] : forecast[0] ?? null;
    let feature: (typeof observed)[number] | null = now ?? null;
    if (forecastHour > 0 && forecast.length > 0) {
      const hourIndex = Math.min(forecastHour, forecast.length) - 1;
      feature = forecast[hourIndex] ?? now;
    }
    const fc: GeoJSONFeatureCollection = {
      type: "FeatureCollection",
      features: feature && (visible ?? true) ? [feature] : [],
    };
    (map.getSource("current-event") as GeoJSONSource | undefined)?.setData(fc);
  }, [mapReady, observed, forecast, forecastHour, visible]);

  return null;
}

export type { TrackProps };
