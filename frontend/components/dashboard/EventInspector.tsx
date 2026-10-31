"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useActiveEvent, useDataSources, useMemoryInsights } from "@/lib/hooks";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

/* ── Mode switcher: Standard | Memory-aware ── */
function ModeSwitcher() {
  const mekoOn = useUIStore((s) => s.mekoOn);
  const toggleMeko = useUIStore((s) => s.toggleMeko);
  return (
    <div className="inline-flex rounded-lg border border-edge bg-surface2 p-0.5 text-[11px]" role="group" aria-label="Intelligence mode">
      <button
        onClick={() => mekoOn && toggleMeko()}
        aria-pressed={!mekoOn}
        className={cn(
          "rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline focus-visible:outline-brand",
          !mekoOn ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-secondary",
        )}
      >
        Standard
      </button>
      <button
        onClick={() => !mekoOn && toggleMeko()}
        aria-pressed={mekoOn}
        className={cn(
          "rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline focus-visible:outline-brand",
          mekoOn ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-secondary",
        )}
      >
        Memory-aware
      </button>
    </div>
  );
}

/* ── Row item: label + value ── */
function InfoRow({ label, value, valueCls, placeholder }: { label: string; value?: string | number; valueCls?: string; placeholder?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="text-[13px] text-secondary shrink-0">{label}</span>
      <span className={cn("text-[13px] font-medium text-right", valueCls ?? "text-ink")}>
        {value != null && value !== "" ? value : placeholder ?? "—"}
      </span>
    </div>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-info/10 text-info border-info/20",
  moderate: "bg-info/10 text-info border-info/20",
  high: "bg-moderate/10 text-moderate border-moderate/20",
  severe: "bg-high/10 text-high border-high/20",
  critical: "bg-critical/10 text-critical border-critical/20",
};

/* ── "Why memory influenced the picture" — real Meko insights only ── */
function WhyDrawer({ open, insights, onClose }: { open: boolean; insights: { id: string; title: string; summary: string }[]; onClose: () => void }) {
  if (!open) return null;
  if (insights.length === 0) {
    return (
      <div className="fade-up mt-3 rounded-xl border border-edge bg-surface2 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-secondary tracking-wide">How memory influenced this</p>
          <button onClick={onClose} className="text-[11px] text-muted hover:text-ink">Dismiss</button>
        </div>
        <p className="text-[12px] text-muted">No relevant historical memory found.</p>
      </div>
    );
  }
  return (
    <div className="fade-up mt-3 rounded-xl border border-edge bg-surface2 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-secondary tracking-wide">How memory influenced this</p>
        <button onClick={onClose} className="text-[11px] text-muted hover:text-ink">Dismiss</button>
      </div>
      <div className="space-y-2.5 text-[12px] text-secondary">
        {insights.slice(0, 5).map((m) => (
          <div key={m.id} className="flex gap-2">
            <span className="mt-0.5 text-memory shrink-0">›</span>
            <span>
              {m.title !== "Memory insight" && <b className="font-medium text-ink">{m.title}: </b>}
              {m.summary}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main EventInspector ── */
export default function EventInspector() {
  const mekoOn = useUIStore((s) => s.mekoOn);
  const { data: event, isLoading, isError } = useActiveEvent();
  const insights = useMemoryInsights(event?.id);
  const sources = useDataSources();
  const [whyOpen, setWhyOpen] = useState(false);

  if (isLoading) {
    return <div className="p-5 text-[13px] text-muted">Loading event status…</div>;
  }
  if (isError || !event) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="size-10 rounded-full bg-surface2 grid place-items-center mb-4">
          <span className="text-muted text-lg">◎</span>
        </div>
        <p className="text-[14px] font-medium text-ink">No active event</p>
        <p className="mt-1.5 text-[12px] text-muted leading-relaxed">
          Monitoring connected satellite and forecast feeds.
        </p>
      </div>
    );
  }

  const memoryInsights = mekoOn ? (insights.data?.insights ?? []) : [];
  const memoryAvailable = insights.data?.available ?? false;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted tracking-wide">Current event</p>
            <h2 className="mt-0.5 text-[18px] font-semibold text-ink leading-tight">{event.name}</h2>
            <p className="mt-0.5 text-[13px] text-secondary capitalize">{event.type} · {event.source}</p>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize",
              SEVERITY_STYLES[event.severity] ?? "bg-surface2 text-muted border-edge",
            )}
          >
            {event.severity}
          </span>
        </div>

        <div className="mt-4">
          <ModeSwitcher />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-edge mx-5" />

      {/* Core info — unknowns stay "—" */}
      <div className="px-5 divide-y divide-edge">
        <InfoRow label="Expected impact" value={event.eta} valueCls="text-high" />
        <InfoRow label="Population exposed" value={event.populationExposed?.toLocaleString()} />
        <InfoRow label="Districts at risk" value={event.districtsAtRisk} />
        <InfoRow
          label="Data freshness"
          value={event.dataFreshness}
          valueCls={event.dataFreshness === "current" ? "text-safe" : "text-moderate"}
        />
      </div>

      {/* Memory influence callout — only when a real Meko response says so */}
      {mekoOn && (
        <div className="mx-5 mt-4 rounded-xl border border-memory/20 bg-memory/5 p-3.5">
          {memoryAvailable && insights.data && insights.data.insights.length > 0 ? (
            <>
              <p className="text-[12px] text-memory leading-relaxed">
                {insights.data.insights.length} relevant historical {insights.data.insights.length === 1 ? "memory" : "memories"} recalled.
              </p>
              <button
                onClick={() => setWhyOpen(w => !w)}
                className="mt-1.5 text-[12px] font-medium text-memory hover:text-memory/80 flex items-center gap-1 focus-visible:outline focus-visible:outline-brand"
              >
                See why
                <ChevronRight className={cn("size-3.5 transition-transform", whyOpen && "rotate-90")} />
              </button>
              <WhyDrawer open={whyOpen} insights={insights.data.insights} onClose={() => setWhyOpen(false)} />
            </>
          ) : (
            <p className="text-[12px] text-muted leading-relaxed">No relevant historical memory found.</p>
          )}
        </div>
      )}

      {/* Measurements */}
      <div className="mx-5 mt-4 divide-y divide-edge fade-up">
        <InfoRow label="Wind speed" value={event.windKmh ? `${Math.round(event.windKmh)} km/h` : undefined} />
        <InfoRow label="Pressure" value={event.pressureHpa ? `${Math.round(event.pressureHpa)} hPa` : undefined} />
        <InfoRow label="Rainfall" value={event.rainfallMm ? `${Math.round(event.rainfallMm)} mm / 24h` : undefined} />
        <InfoRow label="Forecast confidence" value={event.confidence != null ? `${Math.round(event.confidence)}%` : undefined} valueCls="text-info" />
        <div className="pt-3 pb-1">
          <p className="text-[11px] text-muted mb-1.5">Data sources</p>
          {sources.data && sources.data.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {sources.data.map((s) => (
                <span
                  key={s.id}
                  title={`${s.kind} · ${s.status}`}
                  className={cn(
                    "rounded-md bg-surface2 border px-2 py-0.5 text-[10px] text-secondary",
                    s.status === "current" ? "border-edge" : "border-moderate/40 text-moderate",
                  )}
                >
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-muted">Waiting for connected data source.</p>
          )}
        </div>
      </div>

      {/* Primary CTA */}
      <div className="px-5 py-5 mt-4">
        <a
          href="/response"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-[13px] font-semibold text-surface shadow-sm hover:bg-brand-hover transition-colors focus-visible:outline focus-visible:outline-brand"
        >
          View response plan
          <ExternalLink className="size-3.5" />
        </a>
        <a
          href="/citizen"
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-edge px-4 py-2.5 text-[12px] text-secondary hover:bg-surface2 transition-colors focus-visible:outline focus-visible:outline-brand"
        >
          View citizen alert
        </a>
      </div>
    </div>
  );
}
