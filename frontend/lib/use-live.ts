"use client";

import { useActiveEvent, useSystemStatus } from "@/lib/hooks";

export type FeedStatus = "live" | "degraded" | "offline";

/**
 * Connection status derived from the real system status endpoint.
 * There is no synthesized live feed: when the backend is unreachable the
 * workspace honestly reports "offline".
 */
export function useLiveFeed() {
  const status = useSystemStatus();
  const activeEvent = useActiveEvent();

  const feed: { status: FeedStatus; events: [] } = status.isError
    ? { status: "offline", events: [] }
    : status.data
    ? {
        status:
          status.data.database === "ok" || status.data.redis === "ok"
            ? "live"
            : ("degraded" as FeedStatus),
        events: [],
      }
    : { status: "degraded", events: [] };

  return {
    ...feed,
    isLoading: status.isLoading,
    hasActiveEvent: Boolean(activeEvent.data),
  };
}
