"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  Navigation,
  Phone,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { LANGS, citizenTranslations, type LangCode } from "@/lib/data";
import { cn } from "@/lib/utils";

const CODE: Record<string, LangCode> = {
  EN: "en",
  "हिन्दी": "hi",
  "বাংলা": "bn",
  "ଓଡ଼ିଆ": "or",
  "తెలుగు": "te",
};

interface Props {
  /** Present on /citizen/alert/[id] — the campaign referenced by the alert link. */
  alertId?: string;
}

export default function CitizenAlertCard({ alertId }: Props) {
  const [lang, setLang] = useState<LangCode>("en");
  const [routeRequested, setRouteRequested] = useState(false);
  const [routeError, setRouteError] = useState(true);
  const [isSafe, setIsSafe] = useState(false);
  const t = citizenTranslations[lang];

  const loadRoute = async () => {
    setRouteRequested(true);
    if (!alertId) {
      setRouteError(true);
      return;
    }
    try {
      const alert = await api.alerts.get(alertId);
      // Safe-route geometry is exposed through backend APIs once evacuation
      // routes exist for the campaign's event; until then keep the honest state.
      void alert;
      setRouteError(true);
    } catch {
      setRouteError(true);
    }
  };

  return (
    <div className="flex min-h-dvh justify-center bg-bg px-4 py-5">
      <div className="w-full max-w-sm space-y-4">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 text-[11px] text-muted hover:text-ink">
            <ChevronLeft className="size-3.5" />
            AetherSense
          </Link>
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(CODE[l])}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] transition-colors focus-visible:outline focus-visible:outline-brand",
                  CODE[l] === lang
                    ? "bg-brand text-surface font-medium"
                    : "text-muted hover:bg-surface2 hover:text-ink",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Alert title */}
        <div className="rounded-2xl border border-critical/25 bg-critical/6 px-5 py-4">
          <p className="text-[16px] font-semibold text-critical leading-tight">{t.title}</p>
        </div>

        {/* Area + time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-edge bg-surface px-4 py-3">
            <p className="text-[10px] text-muted mb-1">{t.yourArea}</p>
            <p className="text-[14px] font-semibold text-ink">{t.area}</p>
          </div>
          <div className="rounded-xl border border-edge bg-surface px-4 py-3">
            <p className="text-[10px] text-muted mb-1">{t.impact}</p>
            <p className="text-[14px] font-semibold text-high">{t.impactTime}</p>
          </div>
        </div>

        {/* Risk level — bar fills only with real data */}
        <div className="rounded-xl border border-edge bg-surface px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-secondary">{t.floodRisk}</span>
            <span className="text-[12px] font-semibold text-critical">{t.veryHigh}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-moderate via-high to-critical" style={{ width: 0 }} />
          </div>
        </div>

        {/* Avoid — filled once route/campaign data is connected */}
        <div className="flex items-start gap-3 rounded-xl border border-high/25 bg-high/6 px-4 py-3">
          <TriangleAlert className="size-4 text-high mt-0.5 shrink-0" strokeWidth={1.75} />
          <p className="text-[13px] text-secondary">
            <span className="font-medium text-ink">{t.avoid}: </span>
            {t.avoidRoad}
          </p>
        </div>

        {/* Shelter */}
        <div className="rounded-xl border border-safe/25 bg-safe/6 px-4 py-4">
          <p className="text-[10px] text-muted mb-1">{t.shelter}</p>
          <p className="text-[15px] font-semibold text-safe">{t.shelterName}</p>
          <p className="mt-0.5 text-[12px] text-secondary">{t.dist}</p>

          {routeRequested && (
            <div className="fade-up mt-3 rounded-xl bg-surface border border-edge p-3 space-y-2">
              {routeError ? (
                <p className="text-[12px] text-muted">No route data available.</p>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-[12px] text-secondary">
                    <Navigation className="size-3.5 text-brand" strokeWidth={1.75} />
                    Route details will appear when connected to evacuation-route data.
                  </p>
                </>
              )}
            </div>
          )}

          <button
            onClick={loadRoute}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[13px] font-semibold text-surface hover:bg-brand-hover transition-colors focus-visible:outline focus-visible:outline-brand"
          >
            {t.route}
          </button>
        </div>

        {/* I'm safe */}
        {isSafe ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-safe/30 bg-safe/8 py-3.5 text-[13px] font-medium text-safe">
            <ShieldCheck className="size-4" strokeWidth={1.75} />
            {t.imSafe}
          </div>
        ) : (
          <button
            onClick={() => setIsSafe(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-safe/30 bg-safe/6 py-3 text-[13px] font-medium text-safe hover:bg-safe/10 transition-colors focus-visible:outline focus-visible:outline-brand"
          >
            <Check className="size-4" strokeWidth={2} />
            {t.safe}
          </button>
        )}

        {/* Instruction */}
        <p className="text-center text-[13px] leading-relaxed text-secondary px-2">
          {t.move}
        </p>

        {/* Emergency */}
        <a
          href="tel:112"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-critical/30 bg-critical/8 py-3 text-[13px] font-semibold text-critical hover:bg-critical/12 transition-colors"
        >
          <Phone className="size-4" strokeWidth={1.75} />
          {t.emergency}
        </a>

        {alertId ? (
          <p className="text-center text-[10px] text-muted pb-4">
            Alert {alertId.slice(0, 8)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// Re-exported for type use in the citizen pages.
export { XCircle };
