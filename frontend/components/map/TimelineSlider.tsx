"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useActiveEvent, useEventTrack } from "@/lib/hooks";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

/** Timeline control bound to the active event's forecast points. With no
 * forecast data it honestly reports "Waiting for forecast data." instead of
 * inventing landfall times or distances. */
export default function TimelineSlider() {
  const { data: event } = useActiveEvent();
  const track = useEventTrack(event?.id);
  const forecastHour = useUIStore((s) => s.forecastHour);
  const setForecastHour = useUIStore((s) => s.setForecastHour);
  const [playing, setPlaying] = useState(false);

  const { maxHour, hasForecast } = useMemo(() => {
    const forecast = (track.data?.features ?? []).filter((f) => f.properties?.isForecast);
    const max = forecast.length;
    return { maxHour: max, hasForecast: max > 0 };
  }, [track.data]);

  useEffect(() => {
    if (maxHour !== undefined) {
      setForecastHour(0);
    }
  }, [maxHour, setForecastHour]);

  useEffect(() => {
    if (!playing || !hasForecast) return;
    const id = setInterval(() => {
      useUIStore.setState((s) => ({
        forecastHour: s.forecastHour >= maxHour ? 0 : s.forecastHour + 1,
      }));
    }, 220);
    return () => clearInterval(id);
  }, [playing, hasForecast, maxHour]);

  const hourLabel = (h: number) => (h === 0 ? "Now" : `+${h}h`);

  return (
    <div
      className="absolute bottom-4 left-1/2 z-10 w-[min(90%,520px)] -translate-x-1/2"
      role="group"
      aria-label="Forecast timeline"
    >
      <div className="rounded-xl border border-edge bg-elevated px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={!hasForecast}
            aria-label={playing ? "Pause forecast" : "Play forecast"}
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg border transition-colors focus-visible:outline focus-visible:outline-brand",
              hasForecast
                ? "border-edge bg-surface text-secondary hover:text-ink hover:border-brand/40"
                : "cursor-not-allowed border-edge bg-surface text-muted/40",
            )}
          >
            {playing ? <Pause className="size-3.5" strokeWidth={1.75} /> : <Play className="size-3.5" strokeWidth={1.75} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1.5 text-[10px]">
              <span className="text-muted">Forecast</span>
              <span className="font-medium tabular-nums text-secondary">
                {hasForecast ? hourLabel(forecastHour) : "No forecast yet"}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={hasForecast ? maxHour : 0}
              step={1}
              value={forecastHour}
              onChange={(e) => setForecastHour(Number(e.target.value))}
              disabled={!hasForecast}
              aria-label="Forecast hour step"
              aria-valuetext={hasForecast ? hourLabel(forecastHour) : "No forecast available"}
              className={cn(
                "range-control h-[3px] w-full cursor-pointer appearance-none rounded-full bg-edge",
                !hasForecast && "opacity-50",
              )}
            />

            {hasForecast && (
              <div className="relative mt-1.5 h-3">
                <span className="absolute -translate-x-1/2 text-[9px] font-mono text-muted/60" style={{ left: "0%" }}>
                  Now
                </span>
                <span className="absolute -translate-x-1/2 text-[9px] font-mono text-muted/60" style={{ left: "100%" }}>
                  +{maxHour}h
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
