import type { Map as MLMap, StyleSpecification } from "maplibre-gl";
import type { GeoJSONFeatureCollection } from "@contracts";

export const INDIA_CENTER: [number, number] = [78.9629, 22.5937];
export const INDIA_BOUNDS: [[number, number], [number, number]] = [[67.0, 6.0], [98.0, 37.5]];

export const EMPTY_FC: GeoJSONFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const COLORS = {
  canvas: "#F7F4ED",
  land: "#E7E8DE",
  water: "#B7C4C0",
  state: "#8FA28A",
  district: "#AEBBB0",
  ink: "#2F3731",
  primary: "#8FA28A",
  secondary: "#C7D3C0",
  gold: "#C8A96B",
  warning: "#A8783E",
  critical: "#A9574B",
};

export function buildStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      india: { type: "geojson", data: "/india.geojson" },
    },
    layers: [
      { id: "map-background", type: "background", paint: { "background-color": COLORS.water } },
      {
        id: "india-land",
        type: "fill",
        source: "india",
        paint: { "fill-color": COLORS.land, "fill-opacity": 0.96 },
      },
      {
        id: "india-district-boundaries",
        type: "line",
        source: "india",
        paint: { "line-color": COLORS.district, "line-width": 0.45, "line-opacity": 0.48 },
      },
      {
        id: "india-state-boundaries",
        type: "line",
        source: "india",
        paint: { "line-color": COLORS.state, "line-width": 1.15, "line-opacity": 0.72 },
      },
    ],
  };
}

function addGeoJsonSource(map: MLMap, id: string, cluster = false) {
  map.addSource(id, {
    type: "geojson",
    data: EMPTY_FC,
    ...(cluster ? { cluster: true, clusterMaxZoom: 7, clusterRadius: 42 } : {}),
  });
}

export function addDynamicLayers(map: MLMap) {
  if (map.getSource("track-line")) return;

  addGeoJsonSource(map, "track-line");
  map.addLayer({
    id: "track-line-layer",
    type: "line",
    source: "track-line",
    paint: { "line-color": COLORS.primary, "line-width": 2.4, "line-opacity": 0.9 },
  });
  addGeoJsonSource(map, "track-points");
  map.addLayer({
    id: "track-points-layer",
    type: "circle",
    source: "track-points",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3, 8, 5],
      "circle-color": COLORS.primary,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": COLORS.canvas,
    },
  });

  addGeoJsonSource(map, "forecast-line");
  map.addLayer({
    id: "forecast-line-layer",
    type: "line",
    source: "forecast-line",
    paint: {
      "line-color": COLORS.primary,
      "line-width": 2,
      "line-opacity": 0.72,
      "line-dasharray": [2, 2],
    },
  });
  addGeoJsonSource(map, "forecast-points");
  map.addLayer({
    id: "forecast-points-layer",
    type: "circle",
    source: "forecast-points",
    paint: {
      "circle-radius": 4,
      "circle-color": COLORS.canvas,
      "circle-stroke-color": COLORS.primary,
      "circle-stroke-width": 1.5,
    },
  });
  addGeoJsonSource(map, "current-event");
  map.addLayer({
    id: "current-event-layer",
    type: "circle",
    source: "current-event",
    paint: {
      "circle-radius": 8,
      "circle-color": COLORS.critical,
      "circle-stroke-color": COLORS.canvas,
      "circle-stroke-width": 2,
      "circle-opacity": 0.92,
    },
  });

  addGeoJsonSource(map, "forecast-uncertainty");
  map.addLayer({
    id: "forecast-uncertainty-layer",
    type: "fill",
    source: "forecast-uncertainty",
    paint: { "fill-color": COLORS.secondary, "fill-opacity": 0.24 },
  });
  map.addLayer({
    id: "forecast-uncertainty-outline",
    type: "line",
    source: "forecast-uncertainty",
    paint: { "line-color": COLORS.primary, "line-opacity": 0.5, "line-width": 1, "line-dasharray": [2, 2] },
  });

  addGeoJsonSource(map, "risk-areas");
  map.addLayer({
    id: "risk-fill",
    type: "fill",
    source: "risk-areas",
    paint: { "fill-color": COLORS.warning, "fill-opacity": 0.16 },
  });
  map.addLayer({
    id: "risk-outline",
    type: "line",
    source: "risk-areas",
    paint: { "line-color": COLORS.warning, "line-width": 1.2, "line-opacity": 0.75 },
  });

  addGeoJsonSource(map, "flood-extents");
  map.addLayer({
    id: "flood-fill",
    type: "fill",
    source: "flood-extents",
    paint: { "fill-color": COLORS.water, "fill-opacity": 0.46 },
  });
  map.addLayer({
    id: "flood-outline",
    type: "line",
    source: "flood-extents",
    paint: { "line-color": COLORS.state, "line-width": 0.8, "line-opacity": 0.7 },
  });

  addGeoJsonSource(map, "shelters", true);
  map.addLayer({
    id: "shelter-clusters",
    type: "circle",
    source: "shelters",
    filter: ["has", "point_count"],
    paint: { "circle-color": COLORS.secondary, "circle-radius": ["step", ["get", "point_count"], 13, 10, 16, 50, 20], "circle-stroke-color": COLORS.primary, "circle-stroke-width": 1.5 },
  });
  map.addLayer({
    id: "shelter-cluster-count",
    type: "symbol",
    source: "shelters",
    filter: ["has", "point_count"],
    layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 10 },
    paint: { "text-color": COLORS.ink },
  });
  map.addLayer({
    id: "shelters-layer",
    type: "circle",
    source: "shelters",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 5,
      "circle-color": ["match", ["get", "status"], "full", COLORS.critical, "offline", COLORS.warning, "filling", COLORS.gold, COLORS.primary],
      "circle-stroke-color": COLORS.canvas,
      "circle-stroke-width": 1.5,
    },
  });

  addGeoJsonSource(map, "routes");
  map.addLayer({
    id: "routes-layer",
    type: "line",
    source: "routes",
    paint: {
      "line-color": ["match", ["get", "status"], "blocked", COLORS.critical, "congested", COLORS.gold, COLORS.primary],
      "line-width": ["match", ["get", "status"], "blocked", 2, 2.8],
      "line-opacity": 0.84,
      "line-dasharray": ["match", ["get", "status"], "blocked", ["literal", [1, 2]], ["literal", [1, 0]]],
    },
  });

  addGeoJsonSource(map, "historical-events");
  map.addLayer({
    id: "historical-layer",
    type: "circle",
    source: "historical-events",
    paint: { "circle-radius": 4, "circle-color": COLORS.gold, "circle-stroke-color": COLORS.canvas, "circle-stroke-width": 1 },
  });

  addRainfallLayer(map);
}

function addRainfallLayer(map: MLMap) {
  const tiles = process.env.NEXT_PUBLIC_RAINFALL_TILES;
  if (!tiles || map.getSource("rainfall")) return;
  map.addSource("rainfall", { type: "raster", tiles: [tiles], tileSize: 256 });
  map.addLayer({ id: "rainfall-layer", type: "raster", source: "rainfall", paint: { "raster-opacity": 0.42 }, layout: { visibility: "none" } });
}

export const MAP_LAYER_IDS = [
  "track-line-layer", "track-points-layer", "forecast-line-layer", "forecast-points-layer",
  "current-event-layer", "forecast-uncertainty-layer", "forecast-uncertainty-outline",
  "risk-fill", "risk-outline", "flood-fill", "flood-outline", "shelter-clusters",
  "shelter-cluster-count", "shelters-layer", "routes-layer", "historical-layer", "rainfall-layer",
] as const;
