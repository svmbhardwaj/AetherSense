"use client";

import { useActiveEvent, useMemoryInsights, useEvents } from "@/lib/hooks";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

/* ── Mode switcher ── */
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

/* ── Historical events observed by the platform ── */
function EventTimeline() {
  const events = useEvents();
  const past = (events.data ?? []).filter((e) => e.status !== "active");
  const current = (events.data ?? []).filter((e) => e.status === "active");

  if (events.isLoading) {
    return <p className="text-[12px] text-muted">Loading event history…</p>;
  }

  return (
    <div>
      <p className="text-[12px] font-medium text-muted tracking-wide mb-4">Recorded events</p>
      {(events.data ?? []).length === 0 ? (
        <p className="text-[12px] text-muted">No events recorded yet.</p>
      ) : (
        <div className="relative pl-5 space-y-6 before:absolute before:left-1.5 before:top-0 before:bottom-0 before:w-px before:bg-edge">
          {current.map((e) => (
            <TimelineEntry key={e.id} name={e.name} type={e.type} time={e.startedAt} current />
          ))}
          {past.slice(0, 6).map((e) => (
            <TimelineEntry key={e.id} name={e.name} type={e.type} time={e.startedAt} />
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineEntry({ name, type, time, current }: { name: string; type: string; time: string; current?: boolean }) {
  const dateLabel = new Date(time).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  return (
    <div className="relative">
      <span
        className={cn(
          "absolute -left-[17px] top-0.5 size-2.5 rounded-full border-2",
          current ? "border-memory bg-memory" : "border-track/40",
        )}
      />
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[13px] font-medium text-ink tabular-nums">{dateLabel}</span>
        <span className="text-[11px] font-medium rounded-md px-1.5 py-0.5 bg-track/10 text-track capitalize">{type}</span>
      </div>
      <p className={cn("mt-1 text-[12px] leading-relaxed", current ? "text-memory font-medium" : "text-secondary")}>
        {name}
      </p>
    </div>
  );
}

/* ── Meko memories from the connected Meko service only ── */
function MemoryList() {
  const { data: event } = useActiveEvent();
  const insights = useMemoryInsights(event?.id);

  return (
    <div>
      <p className="text-[12px] font-medium text-muted tracking-wide mb-3">Relevant memories</p>
      {insights.isLoading ? (
        <p className="text-[12px] text-muted">Checking memory service…</p>
      ) : insights.data?.available && insights.data.insights.length > 0 ? (
        <div className="divide-y divide-edge">
          {insights.data.insights.map((m) => (
            <div key={m.id} className="py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13px] font-medium text-ink">{m.title}</p>
                {m.confidence != null && (
                  <span className="text-[11px] text-memory tabular-nums shrink-0">{Math.round(m.confidence)}%</span>
                )}
              </div>
              {m.summary && <p className="mt-0.5 text-[12px] text-secondary leading-relaxed">{m.summary}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-muted">
          {insights.data && !insights.data.available
            ? "Meko memory service is not configured. Waiting for connected data source."
            : "No relevant historical memory found."}
        </p>
      )}
    </div>
  );
}

/* ── Page ── */
export default function MemoryPage() {
  const mekoOn = useUIStore((s) => s.mekoOn);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-semibold text-ink">Memory</h1>
            <p className="mt-1 text-[13px] text-secondary">
              Historical context that improves current decisions.
            </p>
          </div>
          <ModeSwitcher />
        </div>

        {/* Memory status — reflects the real Meko boundary */}
        {!mekoOn ? (
          <div className="rounded-xl border border-edge bg-surface2 px-5 py-4">
            <p className="text-[13px] text-secondary">
              Memory-aware mode is off. Enable it to see how historical disaster context changes the current recommendation.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-memory/20 bg-memory/5 px-5 py-4">
            <p className="text-[13px] text-memory font-medium">
              Meko long-term disaster memory
            </p>
            <p className="mt-1 text-[12px] text-secondary">
              Memories are retrieved from the connected Meko service. When it is not configured, nothing is invented here.
            </p>
          </div>
        )}

        <div className="h-px bg-edge" />

        {/* Memories from Meko */}
        <MemoryList />

        <div className="h-px bg-edge" />

        {/* Recorded event history */}
        <EventTimeline />

      </div>
    </div>
  );
}
