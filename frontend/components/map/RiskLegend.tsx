"use client";

import { useUIStore } from "@/store/ui-store";

export default function RiskLegend() {
  const floodActive = useUIStore((s) => s.layers.flood);
  if (!floodActive) return null;

  return (
    <div
      aria-label="Flood risk legend"
      className="fade-up absolute bottom-24 left-3 z-10 hidden sm:flex items-center gap-3 rounded-lg border border-edge bg-elevated px-3 py-1.5 text-[11px] text-secondary shadow-sm backdrop-blur"
    >
      <span className="text-[10px] font-medium tracking-wide text-muted">Flood risk</span>
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: "#536955" }} />
        <span>Low</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: "#8FAF87" }} />
        <span>Moderate</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: "#C9824A" }} />
        <span>High</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: "#813F36" }} />
        <span>Critical</span>
      </div>
    </div>
  );
}
