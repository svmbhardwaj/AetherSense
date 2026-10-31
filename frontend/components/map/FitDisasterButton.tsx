"use client";

import { Crosshair } from "lucide-react";
import { bbox } from "@turf/turf";
import type { GeoJSONFeatureCollection } from "@contracts";
import { useActiveEvent, useEventTrack, useRiskAreas } from "@/lib/hooks";
import { mapInstance } from "@/lib/map-instance";
import { INDIA_BOUNDS } from "@/components/map/mapLayerDefs";
import { cn } from "@/lib/utils";

/** Fits the map to the active event's risk areas, falling back to the
 * tracked cyclone extent. Disabled when no geometry is available. */
export default function FitDisasterButton() {
  const { data: event } = useActiveEvent();
  const risk = useRiskAreas(event?.id);
  const track = useEventTrack(event?.id);

  const riskBbox = risk.data && risk.data.features.length > 0 ? bboxOf(risk.data) : null;
  const trackBbox = track.data && track.data.features.length > 0 ? bboxOf(track.data) : null;
  const target = riskBbox ?? trackBbox;

  const disabled = !target || !event;

  return (
    <div className="absolute bottom-24 right-3 z-10 flex flex-col gap-1.5">
      <button
        onClick={() => {
          const map = mapInstance.current;
          if (map) map.fitBounds(INDIA_BOUNDS, { padding: 48, duration: 700 });
        }}
        aria-label="Fit map to India"
        title="Fit India"
        className="grid size-9 place-items-center rounded-lg border border-edge bg-elevated text-muted shadow-sm backdrop-blur transition-colors hover:text-secondary focus-visible:outline focus-visible:outline-brand"
      >
        <span className="font-mono text-[10px]">IN</span>
      </button>
      <button
        onClick={() => {
          const map = mapInstance.current;
          if (!map || !target) return;
          const [minX, minY, maxX, maxY] = target;
          map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 60, duration: 900, maxZoom: 9 });
        }}
        disabled={disabled}
        aria-label={disabled ? "Fit to disaster region unavailable" : "Fit map to disaster region"}
        title={disabled ? "No event geometry yet" : "Fit to disaster region"}
        className={cn(
          "grid size-9 place-items-center rounded-lg border shadow-sm backdrop-blur transition-colors focus-visible:outline focus-visible:outline-brand",
          disabled
            ? "cursor-not-allowed border-edge bg-elevated text-muted/40"
            : "border-edge bg-elevated text-muted hover:text-secondary",
        )}
      >
        <Crosshair className="size-4" />
      </button>
    </div>
  );
}

function bboxOf(fc: GeoJSONFeatureCollection): [number, number, number, number] | null {
  try {
    const b = bbox(fc as unknown as GeoJSON.GeoJSON);
    if (!Number.isFinite(b[0])) return null;
    return [b[0], b[1], b[2], b[3]];
  } catch {
    return null;
  }
}
