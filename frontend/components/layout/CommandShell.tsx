"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Brain,
  ChevronRight,
  LayoutDashboard,
  Map,
  Megaphone,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveFeed } from "@/lib/use-live";
import ConnectionBanner from "./ConnectionBanner";
import type { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Overview",  icon: LayoutDashboard },
  { href: "/map",       label: "Map",        icon: Map },
  { href: "/memory",    label: "Memory",     icon: Brain },
  { href: "/alerts",    label: "Alerts",     icon: Megaphone },
  { href: "/response",  label: "Response",   icon: Shield },
] as const;

/* ── Feed status pill — derived from the real system status ── */
function DataStatusDot() {
  const { status } = useLiveFeed();
  const cfg = {
    live:     { dot: "bg-safe",     label: "Live",      cls: "text-safe" },
    degraded: { dot: "bg-moderate", label: "Degraded",  cls: "text-moderate" },
    offline:  { dot: "bg-critical", label: "Offline",   cls: "text-critical" },
  }[status];
  return (
    <span className={cn("flex items-center gap-1.5 text-[11px]", cfg.cls)} aria-live="polite">
      <span className={cn("size-1.5 rounded-full", cfg.dot, status === "live" && "pulse-dot")} />
      {cfg.label}
    </span>
  );
}

/* ── IST clock ── */
function ISTClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const t0 = setTimeout(() => setNow(new Date()), 0);
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => { clearTimeout(t0); clearInterval(id); };
  }, []);
  const fmt = now
    ? now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false })
    : "--:--";
  return (
    <span className="font-mono text-[11px] tabular-nums text-muted" aria-label="Current IST time">
      {fmt} <span className="text-[10px]">IST</span>
    </span>
  );
}

export default function CommandShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="aether-ambient flex h-dvh overflow-hidden bg-bg">

      {/* ── Desktop nav rail ── */}
      <aside className="neo-surface hidden md:flex shrink-0 w-[68px] flex-col items-center border-r border-edge bg-surface py-5 gap-1">
        {/* Logo mark */}
        <Link
          href="/"
          aria-label="AetherSense home"
          className="mb-5 flex flex-col items-center gap-0.5 group"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-surface shadow-sm group-hover:bg-brand-hover transition-colors">
            <Shield className="size-4" strokeWidth={1.75} />
          </span>
        </Link>

        {/* Nav items */}
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === "/dashboard" && (pathname === "/" || pathname === "/dashboard"));
          return (
            <Link
              key={label}
              href={href}
              title={label}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 w-14 transition-colors focus-visible:outline focus-visible:outline-brand",
                active
                  ? "bg-teal-soft text-brand"
                  : "text-muted hover:bg-surface2 hover:text-secondary",
              )}
            >
              <Icon className="size-[18px]" strokeWidth={active ? 2 : 1.75} />
              <span className={cn("text-[9px] font-medium tracking-wide", active ? "text-brand" : "text-muted/70")}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Bottom zone */}
        <div className="mt-auto flex flex-col items-center gap-3 border-t border-edge pt-4 w-full px-2">
          <DataStatusDot />
          <ISTClock />
        </div>
      </aside>

      {/* ── Mobile nav overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="neo-surface absolute inset-y-0 left-0 flex w-64 flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-6">
              <div>
                <p className="text-[13px] font-semibold tracking-[0.12em]">AETHERSENSE</p>
                <p className="mt-0.5 text-[10px] text-muted">Spatial Disaster Intelligence</p>
              </div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-muted hover:text-ink">
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-0.5">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                      active ? "bg-teal-soft text-brand font-medium" : "text-secondary hover:bg-surface2",
                    )}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
                    {label}
                    {active && <ChevronRight className="ml-auto size-3.5 text-brand/50" />}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-edge px-5 py-4 space-y-2">
              <DataStatusDot />
              <ISTClock />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main column ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Mobile top bar */}
        <header className="neo-surface flex h-12 shrink-0 items-center justify-between border-b border-edge bg-surface px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="flex items-center gap-2.5"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-brand text-surface">
              <Shield className="size-3.5" strokeWidth={1.75} />
            </span>
            <span className="text-[12px] font-semibold tracking-[0.1em]">AETHERSENSE</span>
          </button>
          <div className="flex items-center gap-3">
            <DataStatusDot />
            <Link href="/alerts" className="relative" aria-label="Alerts">
              <Bell className="size-4 text-muted" />
            </Link>
          </div>
        </header>

        <ConnectionBanner />

        <main className="min-h-0 flex-1 overflow-hidden">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="neo-surface flex shrink-0 items-center justify-around border-t border-edge bg-surface px-2 py-2 md:hidden" aria-label="Main navigation">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2 : 1.5} />
                <span className="text-[9px] font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
