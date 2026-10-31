# Running AetherSense

## Prerequisites

- Node 20+, npm 10+
- PostgreSQL with PostGIS + TimescaleDB (TigerData)
- MongoDB
- Redis

## 1. Backend

```bash
cd backend
cp .env.example .env      # fill DATABASE_URL, REDIS_URL, MONGODB_URI, secrets
npm install
npm run migrate           # creates extensions, tables, hypertables, indexes
npm run dev               # http://localhost:4000  (API + BullMQ workers)
```

Scripts:

```bash
npm run build             # tsc → dist/
npm start                 # node dist/server.js
npm test                  # vitest run
```

Environment are validated at boot with zod; a missing `DATABASE_URL` fails
fast. **Write mode:** ingestion endpoints stay closed (503
`WRITE_MODE_NOT_CONFIGURED`) until `INGEST_API_TOKEN` is set.
Provider channels stay `unavailable` until both URL and token env vars exist
for them — no fake sends.

## 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at the backend
npm install
npm run dev                  # http://localhost:3000
npm run build                # production build (also typechecks)
```

## 3. Migrations

Plain SQL files in `backend/migrations/`, applied by `npm run migrate` (idempotent,
tracked in `__migrations__`). Enable PostGIS/TimescaleDB extensions and creates
the hypertables: event_observations, cyclone_track_points, rainfall_observations,
risk_snapshots, shelter_status_history, alert_delivery_events.

## 4. Smoke checks

```bash
curl -s http://localhost:4000/api/v1/system/status | jq
curl -s http://localhost:4000/api/v1/events/active | jq
curl -s http://localhost:4000/api/v1/events/$(id)/track | jq '.type, (.features|length)'
```

With an empty database every response above is a valid, honest empty payload —
the UI shows "No active event." / "Waiting for connected data source."

## 5. Data backfill (no fabrication)

Bring real data in through the ingestion endpoints or a DBA-provisioned ETL:
event rows, track points, risk areas, flood extents, shelters, routes.
The platform never generates synthetic disasters, alerts or memories.
