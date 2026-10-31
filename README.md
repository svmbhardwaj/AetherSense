# AetherSense

Cyclone and flood intelligence for India — a map-first disaster monitoring,
alerting and response platform built on real data only.

Two apps, one shared contract:

```
frontend/    Next.js 16 + React 19 + TypeScript + Tailwind 4 + MapLibre GL
backend/     Node + Express 4 + TypeScript (Zod, pino, Helmet, rate limiting)
packages/    contracts/ — shared TypeScript domain + GeoJSON types
docs/        architecture, API reference, run commands
```

## Architecture at a glance

- **Frontend** — five command areas (Overview / Map / Memory / Alerts / Response)
  plus a citizen alert card. All disaster data comes from `/api/v1` via
  TanStack Query; the frontend renders states (loading / empty / stale / error),
  it never computes who is affected.
- **Backend** — layered: `routes → controllers → services → repositories`;
  `integrations/` holds provider SDKs behind abstractions (notification router,
  Meko); `queues/` + `workers/` run alert delivery through BullMQ.
- **TigerData/PostgreSQL** owns events, track points, observations, risk
  snapshots, flood extents, shelters, routes, alert campaigns/recipients and
  delivery history (PostGIS geometry + TimescaleDB hypertables).
- **MongoDB** owns user preferences, notification/language preferences,
  integration configs and Meko reference metadata.
- **Redis** is transient execution state only — the database remains the
  source of truth for alerts.
- **Meko** is reached only through `services/memory.service.ts`; when it is not
  configured, endpoints return an explicit unavailable/empty response.

See [docs/architecture.md](docs/architecture.md) for the full layering and
[data ownership](docs/architecture.md#database-ownership),
[docs/api.md](docs/api.md) for endpoints, and
[docs/running.md](docs/running.md) for setup, migrations and tests.

## Honesty rules

No runtime mock data, no fabricated predictions, no fake delivery receipts.
If a data source is missing you will see empty states like
"No active event." / "Waiting for connected data source." — never invented
values. Notification channels and memory insights report
`unavailable` until real credentials exist.

## Scripts

| Where    | Command            | What it does            |
|----------|--------------------|--------------------------|
| backend  | `npm run dev`      | API server + workers     |
| backend  | `npm run migrate`  | SQL migrations (PostGIS) |
| backend  | `npm test`         | vitest unit tests        |
| frontend | `npm run dev`      | Next.js dev server       |
| frontend | `npm run build`    | production build         |
