"use client";

import { CheckCheck, Eye, Send, TriangleAlert, Users } from "lucide-react";
import { useAlertActivity, useAlertProviders, useAlertStats } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/* ── Delivery progress bar ── */
function DeliveryProgress({ delivered, target }: { delivered: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round((delivered / target) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[13px] text-secondary">Delivery progress</p>
        <p className="text-[22px] font-semibold text-ink tabular-nums">{target > 0 ? `${pct}%` : "—"}</p>
      </div>
      <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
        <div
          className="h-full rounded-full bg-safe transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% delivered`}
        />
      </div>
    </div>
  );
}

/* ── Single compact metric ── */
function StatItem({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Send;
  value: string;
  label: string;
  tone?: string;
}) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted mb-1">
        <Icon className={cn("size-3.5", tone)} strokeWidth={1.75} />
        {label}
      </div>
      <p className={cn("text-[22px] font-semibold tabular-nums leading-none", tone ?? "text-ink")}>
        {value}
      </p>
    </div>
  );
}

/* ── Channel row (real persisted recipient counts) ── */
function ChannelRow({
  name,
  sent,
  delivered,
  failed,
}: {
  name: string;
  sent: number;
  delivered: number;
  failed: number;
}) {
  const pct = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
  return (
    <div className="py-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-ink capitalize">{name}</span>
        <span className="text-[12px] text-secondary tabular-nums">{pct}% delivered</span>
      </div>
      <div className="h-1 rounded-full bg-surface2 overflow-hidden">
        <div className="h-full rounded-full bg-safe" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-4 mt-1.5 text-[11px] text-muted tabular-nums">
        <span>{sent.toLocaleString()} sent</span>
        <span className="text-safe">{delivered.toLocaleString()} delivered</span>
        {failed > 0 && <span className="text-critical">{failed.toLocaleString()} failed</span>}
      </div>
    </div>
  );
}

/* ── Recent campaign activity derived from persisted delivery events ── */
function ActivityFeed() {
  const activity = useAlertActivity();

  return (
    <div>
      <p className="text-[12px] font-medium text-muted mb-3 tracking-wide">Recent activity</p>
      {activity.isLoading ? (
        <p className="text-[12px] text-muted">Loading delivery status…</p>
      ) : (activity.data ?? []).length === 0 ? (
        <p className="text-[12px] text-muted">No alert activity yet.</p>
      ) : (
        <div className="space-y-0 divide-y divide-edge">
          {(activity.data ?? []).map((a) => (
            <div key={a.campaignId} className="flex items-start gap-3 py-3">
              <span
                className={cn(
                  "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                  a.failed > 0
                    ? "bg-critical/10 text-critical"
                    : a.delivered > 0
                    ? "bg-safe/10 text-safe"
                    : "bg-info/10 text-info",
                )}
              >
                {a.lastEventAt
                  ? new Date(a.lastEventAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Kolkata",
                    })
                  : "—"}
              </span>
              <p className="text-[12px] text-secondary leading-relaxed">
                Campaign{" "}
                <span className="font-mono text-[11px] text-muted">{a.campaignId.slice(0, 8)}</span>
                {" — "}
                {a.delivered.toLocaleString()} delivered
                {a.total > 0 && ` of ${a.total.toLocaleString()}`}
                {a.failed > 0 && `, ${a.failed.toLocaleString()} failed`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ── */
export default function AlertsPage() {
  const stats = useAlertStats();
  const providers = useAlertProviders();
  const s = stats.data;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-ink">Alerts</h1>
            <p className="mt-1 text-[13px] text-secondary">Did people receive the warning?</p>
          </div>
          {providers.data && (
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {Object.entries(providers.data).map(([channel, state]) => (
                <span
                  key={channel}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] capitalize",
                    state === "available"
                      ? "border-safe/30 bg-safe/10 text-safe"
                      : "border-edge bg-surface2 text-muted",
                  )}
                  title={`Provider: ${state}`}
                >
                  {channel}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats — all values come from the alert delivery tables */}
        {stats.isLoading ? (
          <p className="text-[12px] text-muted">Loading alert delivery data…</p>
        ) : !s ? (
          <p className="text-[12px] text-muted">No alert data available.</p>
        ) : (
          <>
            <DeliveryProgress delivered={s.delivered} target={s.target} />

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-edge border border-edge rounded-xl overflow-hidden">
              <div className="px-4">
                <StatItem icon={Users} value={s.target.toLocaleString()} label="Targeted" tone="text-info" />
              </div>
              <div className="px-4">
                <StatItem icon={Send} value={s.delivered.toLocaleString()} label="Delivered" tone="text-safe" />
              </div>
              <div className="px-4">
                <StatItem icon={Eye} value={s.read.toLocaleString()} label="Read" tone="text-brand" />
              </div>
              <div className="px-4">
                <StatItem
                  icon={TriangleAlert}
                  value={s.failed.toLocaleString()}
                  label="Failed"
                  tone={s.failed > 0 ? "text-critical" : "text-muted"}
                />
              </div>
            </div>

            <div className="h-px bg-edge" />

            {/* Channel breakdown */}
            {s.channels.length > 0 ? (
              <div>
                <p className="text-[12px] font-medium text-muted mb-1 tracking-wide">Channel breakdown</p>
                <div className="divide-y divide-edge">
                  {s.channels.map((c) => (
                    <ChannelRow
                      key={c.channel}
                      name={c.channel}
                      sent={c.sent}
                      delivered={c.delivered}
                      failed={c.failed}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-muted">No deliveries have been recorded yet.</p>
            )}

            <div className="h-px bg-edge" />

            {/* Activity */}
            <ActivityFeed />
          </>
        )}

        {/* Data source note */}
        <p className="text-[11px] text-muted border-t border-edge pt-4">
          Alert delivery counts come from the persisted delivery records and refresh every 4 seconds.
        </p>
      </div>
    </div>
  );
}
