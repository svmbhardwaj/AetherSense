"use client";

import { useState } from "react";
import { Layers, Check } from "lucide-react";
import { LAYER_META, useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const GROUP_ORDER = ["Weather", "Hazard", "Response", "Context"] as const;

const GROUP_COLORS: Record<string, string> = {
  Weather:    "text-track",
  Hazard:     "text-water",
  Response:   "text-safe",
  Intelligence: "text-memory",
  Context:    "text-memory",
};

export default function LayerSelector() {
  const layers = useUIStore((s) => s.layers);
  const toggleLayer = useUIStore((s) => s.toggleLayer);
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 left-3 z-10">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close layers menu" : "Open layers menu"}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] shadow-sm backdrop-blur transition-colors focus-visible:outline focus-visible:outline-brand",
          open
            ? "border-brand/30 bg-elevated text-brand"
            : "border-edge bg-elevated text-secondary hover:text-ink",
        )}
      >
        <Layers className="size-3.5" strokeWidth={1.75} />
        <span>Layers</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="fade-up absolute left-0 top-full mt-1.5 w-52 overflow-hidden rounded-xl border border-edge bg-elevated shadow-lg backdrop-blur">
          {GROUP_ORDER.map((group) => {
            const items = LAYER_META.filter((l) => l.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className={cn("px-3 pt-3 pb-1 text-[9px] font-semibold tracking-[0.18em]", GROUP_COLORS[group] ?? "text-muted")}>
                  {group.toUpperCase()}
                </p>
                {items.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => toggleLayer(id)}
                    aria-pressed={layers[id]}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-colors hover:bg-surface2 focus-visible:outline focus-visible:outline-brand"
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-md border transition-colors",
                        layers[id]
                          ? "border-brand bg-brand text-surface"
                          : "border-edge",
                      )}
                    >
                      {layers[id] && <Check className="size-2.5" strokeWidth={2.5} />}
                    </span>
                    <span className={layers[id] ? "text-ink" : "text-muted"}>{label}</span>
                  </button>
                ))}
              </div>
            );
          })}
          <div className="h-2" />
        </div>
      )}
    </div>
  );
}
