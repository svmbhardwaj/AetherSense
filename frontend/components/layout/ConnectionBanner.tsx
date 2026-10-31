"use client";

import { TriangleAlert, WifiOff } from "lucide-react";
import { useLiveFeed } from "@/lib/use-live";

export default function ConnectionBanner() {
  const { status } = useLiveFeed();
  if (status === "live") return null;

  return (
    <div
      className="flex shrink-0 items-center gap-2.5 border-b px-5 py-2.5 text-[12px]"
      style={{
        borderColor: status === "degraded" ? "rgba(208,173,105,0.42)" : "rgba(209,109,96,0.3)",
        background: status === "degraded" ? "rgba(208,173,105,0.1)" : "rgba(209,109,96,0.08)",
      }}
      role="status"
      aria-live="assertive"
    >
      {status === "degraded" ? (
        <>
          <TriangleAlert className="size-3.5 text-moderate shrink-0" strokeWidth={1.75} />
          <span className="font-medium text-moderate">Backend partially unavailable</span>
          <span className="text-muted">— showing what remains reachable. Monitoring recovery.</span>
        </>
      ) : (
        <>
          <WifiOff className="size-3.5 text-critical shrink-0" strokeWidth={1.75} />
          <span className="font-medium text-critical">Connection interrupted</span>
          <span className="text-muted">— last verified data shown. Auto-retrying…</span>
        </>
      )}
    </div>
  );
}
