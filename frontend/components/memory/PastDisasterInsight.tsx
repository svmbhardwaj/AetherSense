"use client";

import { useActiveEvent, useMemoryInsights } from "@/lib/hooks";
import { useUIStore } from "@/store/ui-store";

/** Wraps "what happened before" from real Meko insights only. */
export default function PastDisasterInsight() {
  const mekoOn = useUIStore((s) => s.mekoOn);
  const { data: event } = useActiveEvent();
  const insights = useMemoryInsights(event?.id);

  if (!mekoOn) {
    return (
      <div className="px-5 py-5">
        <p className="text-[11px] font-medium text-muted tracking-wide mb-2">Past Disaster Insight</p>
        <p className="text-[12px] text-muted">Enable memory-aware mode to see relevant historical context.</p>
      </div>
    );
  }

  const items = insights.data?.insights ?? [];

  if (items.length === 0) {
    return (
      <div className="px-5 py-5">
        <p className="text-[11px] font-medium text-muted tracking-wide mb-2">Past Disaster Insight</p>
        <p className="text-[12px] text-muted">
          {insights.isError || insights.isLoading
            ? "Waiting for connected memory service."
            : "No relevant historical memory found."}
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium text-secondary tracking-wide">Past Disaster Insight</p>
        <span className="rounded-md bg-memory/10 border border-memory/20 px-2 py-0.5 text-[10px] font-medium text-memory">
          {items.length} {items.length === 1 ? "memory" : "memories"}
        </span>
      </div>

      <div className="space-y-3">
        {items.slice(0, 4).map((m) => (
          <div key={m.id} className="text-[12px] text-secondary leading-relaxed">
            <p className="font-medium text-ink text-[13px]">{m.title}</p>
            {m.summary && <p className="mt-0.5">{m.summary}</p>}
            {m.confidence != null && (
              <p className="mt-0.5 text-[11px] text-muted">confidence {Math.round(m.confidence)}%</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
