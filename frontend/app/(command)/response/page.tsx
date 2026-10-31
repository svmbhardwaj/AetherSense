"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useActiveEvent, useEventResponse, useShelters } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const IndiaMap = dynamic(() => import("@/components/map/IndiaMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-surface2">
      <p className="text-[11px] text-muted">Loading map…</p>
    </div>
  ),
});

function Row({ label, value, valueCls, mono }: { label: string; value?: string | number; valueCls?: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-edge last:border-0">
      <span className="text-[13px] text-secondary">{label}</span>
      <span className={cn("text-[13px] font-medium text-right", mono && "font-mono tabular-nums", valueCls ?? "text-ink")}>
        {value != null && value !== "" ? value : "—"}
      </span>
    </div>
  );
}

export default function ResponsePage() {
  const { data: event } = useActiveEvent();
  const response = useEventResponse(event?.id);
  const shelters = useShelters();

  if (!event || response.isLoading) {
    return (
      <div className="p-6 text-[13px] text-muted">
        {response.isError ? "Response data unavailable until an active event exists." : "Loading response plan…"}
      </div>
    );
  }

  const summary = response.data;

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Map — left */}
      <div className="relative flex-1 min-h-[45vh] lg:min-h-0 bg-surface2">
        <Suspense>
          <IndiaMap />
        </Suspense>
      </div>

      {/* Response plan — right */}
      <aside className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-edge bg-surface overflow-y-auto">
        <div className="px-6 py-6 space-y-6">

          <div>
            <h2 className="text-[18px] font-semibold text-ink">Response Plan</h2>
            <p className="mt-1 text-[13px] text-secondary">What should be done now.</p>
          </div>

          {/* Recommended action — only when affected areas exist */}
          {summary?.recommendedAction ? (
            <div className="rounded-xl border border-critical/20 bg-critical/5 px-4 py-4">
              <p className="text-[11px] text-muted mb-1">Recommended action</p>
              <p className="text-[15px] font-semibold text-critical leading-snug">{summary.recommendedAction}</p>
            </div>
          ) : (
            <p className="text-[12px] text-muted rounded-xl border border-edge bg-surface2 px-4 py-3">
              No action recommendation yet — unaffected or no risk geometry for the active event.
            </p>
          )}

          {/* Derived impact facts */}
          <div>
            <Row label="Affected areas" value={summary?.affectedAreaCount ?? 0} />
            <Row label="Population in affected areas" value={summary?.affectedUserCount?.toLocaleString()} />
            <Row label="Exposed population" value={summary?.exposedPopulation?.toLocaleString()} />
            <Row label="Routes intersecting risk" value={summary?.blockedRouteCount ?? 0} valueCls={summary?.blockedRouteCount ? "text-critical" : undefined} />
          </div>

          {/* Safe shelters derived server-side (outside hazard geometry) */}
          <div>
            <p className="text-[12px] font-medium text-muted mb-2">Safe shelters</p>
            {summary && summary.shelterIds.length > 0 ? (
              <div className="space-y-2">
                {shelters.data
                  ?.filter((s) => summary.shelterIds.includes(s.id))
                  .slice(0, 3)
                  .map((s) => (
                    <div key={s.id} className="flex items-center gap-2.5 rounded-xl border border-edge bg-surface2 px-4 py-3">
                      <p className="text-[13px] font-medium text-ink flex-1">{s.name}</p>
                      <span className="text-[11px] capitalize text-safe">{s.status}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[12px] text-muted">No safe shelter data available.</p>
            )}
          </div>

          {/* Route availability */}
          <div>
            <p className="text-[12px] font-medium text-muted mb-2">Routes</p>
            {summary && summary.routeIds.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-safe" />
                  <p className="text-[13px] text-secondary">
                    {summary.routeIds.length} evacuation {summary.routeIds.length === 1 ? "route" : "routes"} clear of flood zones.
                  </p>
                </div>
                {summary.blockedRouteCount ? (
                  <div className="flex items-start gap-2.5">
                    <XCircle className="mt-0.5 size-3.5 shrink-0 text-critical" />
                    <p className="text-[13px] text-secondary">
                      {summary.blockedRouteCount} {summary.blockedRouteCount === 1 ? "route" : "routes"} intersect the affected area.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-[12px] text-muted">No evacuation-route status available.</p>
            )}
          </div>

          {/* Alert campaigns tied to this event */}
          <div>
            <p className="text-[12px] font-medium text-muted mb-2">Alert campaigns</p>
            {summary && summary.alerts.length > 0 ? (
              <div className="divide-y divide-edge">
                {summary.alerts.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-baseline justify-between py-2.5">
                    <span className="text-[12px] font-mono text-muted">{c.id.slice(0, 8)}</span>
                    <span className={cn("text-[12px] capitalize", c.status === "failed" ? "text-critical" : "text-secondary")}>
                      {c.status} · {c.deliveredCount}/{c.targetCount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-muted">No alert data available.</p>
            )}
          </div>

        </div>
      </aside>
    </div>
  );
}
