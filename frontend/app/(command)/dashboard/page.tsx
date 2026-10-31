"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Layers, Maximize2, Search } from "lucide-react";
import EventInspector from "@/components/dashboard/EventInspector";
import PastDisasterInsight from "@/components/memory/PastDisasterInsight";
import LayerSelector from "@/components/map/LayerSelector";
import TimelineSlider from "@/components/map/TimelineSlider";
import FitDisasterButton from "@/components/map/FitDisasterButton";
import RiskLegend from "@/components/map/RiskLegend";

const IndiaMap = dynamic(() => import("@/components/map/IndiaMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center bg-surface2">
      <div className="text-center">
        <div className="shimmer mx-auto h-1 w-40 rounded-full" />
        <p className="mt-3 text-[11px] text-muted">Preparing latest geospatial observations…</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col lg:flex-row">

      {/* ── MAP — primary workspace ── */}
      <div className="relative flex-1 min-h-[55vh] lg:min-h-0 bg-surface2">
        <Suspense fallback={<MapSkeleton />}>
          <IndiaMap />
        </Suspense>

        {/* Floating map controls — top-left search placeholder */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <button
            aria-label="Search location"
            className="flex items-center gap-2 rounded-lg border border-edge bg-elevated px-3 py-2 text-[12px] text-muted shadow-sm backdrop-blur hover:text-ink transition-colors"
          >
            <Search className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Search location</span>
          </button>
        </div>

        {/* Layer control — top-right */}
        <LayerSelector />

        {/* Recenter / fit */}
        <FitDisasterButton />

        {/* Risk legend */}
        <RiskLegend />

        {/* Timeline — bottom */}
        <TimelineSlider />
      </div>

      {/* ── RIGHT PANEL — event inspector ── */}
      <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-edge bg-surface overflow-y-auto">
        <EventInspector />
        <div className="mt-auto border-t border-edge">
          <PastDisasterInsight />
        </div>
      </aside>
    </div>
  );
}
