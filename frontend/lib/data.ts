// UI translation strings only. No fabricated domain data.
// All disaster domain data must come from the backend APIs.

export const LANGS = ["EN", "हिन्दी", "বাংলা", "ଓଡ଼ିଆ", "తెలుగు"] as const;
export type LangCode = "en" | "hi" | "bn" | "or" | "te";

const t = {
  title: "FLOOD WARNING",
  yourArea: "YOUR AREA",
  area: "—",
  impact: "Impact expected",
  impactTime: "—",
  floodRisk: "Flood risk",
  veryHigh: "—",
  avoid: "Avoid",
  avoidRoad: "—",
  shelter: "Nearest safe shelter",
  shelterName: "—",
  dist: "—",
  route: "GET SAFE ROUTE",
  safe: "I'M SAFE",
  imSafe: "YOU MARKED SAFE",
  emergency: "Emergency: 112",
  move: "Move to higher ground now.",
} as const;

// Regional translations arrive from MongoDB-backed user preferences once
// localized strings are authored; until then every locale resolves to the
// English skeleton with explicit "—" placeholders (no fabricated copy).
export const citizenTranslations: Record<LangCode, typeof t> = {
  en: t,
  hi: t,
  bn: t,
  or: t,
  te: t,
};
