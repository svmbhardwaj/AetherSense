"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import LayerSelector from "@/components/map/LayerSelector";
import TimelineSlider from "@/components/map/TimelineSlider";
import FitDisasterButton from "@/components/map/FitDisasterButton";
import RiskLegend from "@/components/map/RiskLegend";

const IndiaMap = dynamic(() => import("@/components/map/IndiaMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-surface2">
      <div className="text-center">
        <div className="shimmer mx-auto h-1 w-40 rounded-full" />
        <p className="mt-3 text-[11px] text-muted">Preparing latest geospatial observations…</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="relative h-full w-full bg-surface2">
      <Suspense>
        <IndiaMap />
      </Suspense>
      <LayerSelector />
      <FitDisasterButton />
      <RiskLegend />
      <TimelineSlider />
    </div>
  );
}
