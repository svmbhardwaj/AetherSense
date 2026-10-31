# Architecture

## Layout

```
backend/src/
  config/         env validation (zod), pg pool, redis client, mongo client
  routes/         Express routers only — no business logic
  controllers/    HTTP orchestration, status codes, response shaping
  services/       business logic (events, alerts, memory, response, GIS)
  repositories/   SQL + Mongo queries, row→DTO mapping
  middleware/     request-id, auth, validation, centralized errors
  integrations/   provider SDK boundaries (notification router, Meko)
  queues/         BullMQ queue definitions + workers
  schemas/        zod request schemas (shared by routes & docs)
  types/          augmentations, shared internal types
  utils/          logger, small helpers

frontend/
  app/            Next.js App Router (route groups: (command), citizen)
  components/     layout, map, dashboard, memory, alerts, citizen
  lib/            api client, hooks (TanStack Query), utilities
  store/          Zustand UI state (layer toggles, timeline selection)
  public/         static assets (india.geojson base map)
```

## Database ownership

| Domain | PostgreSQL (TigerData) | MongoDB |
|---|---|---|
| Events, tracks, observations | ✔ | |
| Risk snapshots, flood extents, affected areas | ✔ | |
| Shelters, routes (geometry) | ✔ | |
| Alert campaigns, recipients, delivery events | ✔ | |
| User/notification/language preferences | | ✔ |
| Integration configs, application settings | | ✔ |
| Meko reference metadata (IDs only) | ✔ event link | ✔ doc |

Cross-database relationships use IDs, never duplication.
TimescaleDB hypertables: `event_observations`, `cyclone_track_points`,
`rainfall_observations`, `risk_snapshots`, `shelter_status_history`,
`alert_delivery_events`. All timestamps `TIMESTAMPTZ` UTC, geometry SRID
4326 with GIST indexes.

Large satellite files (NetCDF/HDF/GeoTIFF) never enter a database — object
storage holds the bytes; `data_assets` metadata rows hold source, acquisition
time, storage key, bbox, checksum and processing status.

## Alert flow

```
Risk / affected area → PostGIS finds recipients in polygon →
campaign persisted → BullMQ jobs (critical / standard) → workers →
Notification Router → WhatsApp/SMS/Push providers → provider webhook →
delivery events persisted
```

Providers without credentials report `unavailable`; the pipeline never
writes a fake "sent" state. Retries live in the `notification-retry` queue;
Rabbit-free, PostgreSQL-backed counts are rebuilt from delivery events.

## Meko boundary

`memory.service.ts` is the only module to call Meko. When unconfigured it
returns `{ available: false, insights: [] }`. PostgreSQL stores the event→
memory reference; MongoDB stores reference metadata. Meko is authoritative
for learned memory content.

## Error & status model

- Centralized error middleware maps zod → 400, auth → 401/403,
  rate-limit → 429, unknown → 500 with `requestId` correlation.
- `GET /system/status` reports api/database/mongodb/redis/queue/provider
  health; the frontend banner derives live/degraded/offline from it.
- Empty databases return valid empty payloads (e.g. empty FeatureCollections),
  which the UI renders as explicit empty states.
