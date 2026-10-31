"use client";

import {
  Map as MLMap,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";
import type { MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { useActiveEvent } from "@/lib/hooks";
import { mapInstance } from "@/lib/map-instance";
import CycloneTrackLayer from "@/components/map/layers/CycloneTrackLayer";
import {
  FloodExtentLayer,
  ForecastTrackLayer,
  HistoricalEventLayer,
  RiskAreaLayer,
  RainfallLayer,
  RouteLayer,
  ShelterLayer,
} from "@/components/map/layers/GeoJsonLayers";
import { addDynamicLayers, buildStyle, INDIA_BOUNDS, INDIA_CENTER } from "@/components/map/mapLayerDefs";

setWorkerUrl("/maplibre-gl-worker.mjs");

// Single reusable map. Layers receive data from backend APIs / application
// state. No hardcoded cyclone tracks, polygons, shelters, routes or disaster
// locations — with no data the map stays a calm, empty India viewport.

export default function IndiaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selection, setSelection] = useState<{ title: string; details: string[] } | null>(null);
  const { data: activeEvent, isLoading } = useActiveEvent();

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl2")) {
      const t = setTimeout(() => setMapError("WebGL2 unavailable."), 0);
      return () => clearTimeout(t);
    }

    let map: MLMap;
    try {
      map = new MLMap({
        container: containerRef.current,
        style: buildStyle(),
        center: INDIA_CENTER,
        zoom: 4.6,
        maxBounds: [[60.0, 4.0], [100.0, 40.0]],
        attributionControl: false,
      });
    } catch {
      const timer = setTimeout(() => setMapError("Failed to initialize map."), 0);
      return () => clearTimeout(timer);
    }
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      addDynamicLayers(map);
      map.fitBounds(INDIA_BOUNDS, { padding: 48, duration: 0 });
      mapInstance.current = map;
      setMapReady(true);
    });
    const selectableLayers = [
      "current-event-layer",
      "risk-fill",
      "shelters-layer",
      "routes-layer",
      "historical-layer",
    ];
    const handleMapClick = (event: MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(event.point, { layers: selectableLayers.filter((id) => map.getLayer(id)) })[0];
      if (!feature) {
        setSelection(null);
        return;
      }
      const properties = feature.properties ?? {};
      const title = String(properties.name ?? properties.label ?? properties.type ?? "Selected map feature");
      const details = Object.entries(properties)
        .filter(([, value]) => value != null && value !== "")
        .slice(0, 4)
        .map(([key, value]) => `${key}: ${String(value)}`);
      setSelection({ title, details });
    };
    const handleMouseMove = (event: MapMouseEvent) => {
      const hasFeature = map.queryRenderedFeatures(event.point, { layers: selectableLayers.filter((id) => map.getLayer(id)) }).length > 0;
      map.getCanvas().style.cursor = hasFeature ? "pointer" : "";
    };
    map.on("click", handleMapClick);
    map.on("mousemove", handleMouseMove);
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    mapRef.current = map;

    return () => {
      map.remove();
      resizeObserver.disconnect();
      mapRef.current = null;
      mapInstance.current = null;
      setMapReady(false);
    };
  }, []);

  if (mapError) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-surface2 flex flex-col items-center justify-center px-8">
        <p className="text-[13px] font-medium text-ink">Interactive map unavailable</p>
        <p className="mt-1 text-[12px] text-muted text-center max-w-xs">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {selection && (
        <aside className="neo-surface absolute bottom-4 left-4 z-10 w-64 rounded-xl p-4" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">Map selection</p>
              <h2 className="mt-1 text-[13px] font-medium text-ink">{selection.title}</h2>
            </div>
            <button type="button" onClick={() => setSelection(null)} className="text-[11px] text-muted hover:text-ink" aria-label="Close map selection">Close</button>
          </div>
          <ul className="mt-3 space-y-1 text-[10px] text-secondary">
            {selection.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        </aside>
      )}

      {activeEvent && (
        <>
          <CycloneTrackLayer mapReady={mapReady} eventId={activeEvent.id} />
          <ForecastTrackLayer mapReady={mapReady} eventId={activeEvent.id} />
          <RiskAreaLayer mapReady={mapReady} eventId={activeEvent.id} />
          <FloodExtentLayer mapReady={mapReady} eventId={activeEvent.id} />
        </>
      )}
      <ShelterLayer mapReady={mapReady} />
      <RouteLayer mapReady={mapReady} />
      <HistoricalEventLayer mapReady={mapReady} />
      <RainfallLayer mapReady={mapReady} />

      {isLoading && (
        <div className="absolute inset-0 grid place-items-center bg-surface2/60" role="status" aria-live="polite">
          <p className="text-[11px] text-muted">Loading geospatial observations…</p>
        </div>
      )}
      {!activeEvent && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-xl border border-edge bg-surface/90 px-4 py-3 backdrop-blur-sm" role="alert">
            <p className="text-[11px] font-medium text-moderate">No active disaster event.</p>
            <p className="mt-0.5 text-[11px] text-muted leading-relaxed">
              The map will populate when observations arrive.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
