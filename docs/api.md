# API — `/api/v1`

All responses JSON; GeoJSON where spatial. Requests validated with zod.
Rate limited; every response carries `x-request-id`.
Write/ingestion endpoints require `Authorization: Bearer <INGEST_API_TOKEN>`
(503 `WRITE_MODE_NOT_CONFIGURED` when no token is set).
Provider webhooks require the `WEBHOOK_SHARED_SECRET` verification.

## System

| Method | Path | Notes |
|---|---|---|
| GET | `/system/status` | api, database, mongodb, redis, queue, providers health |
| GET | `/system/data-sources` | source freshness: current / delayed / stale / unavailable |

## Events

| Method | Path | Notes |
|---|---|---|
| GET | `/events` | list (latest track point joined server-side) |
| GET | `/events/active` | active event or `null` |
| GET | `/events/:id` | 404 when unknown |
| GET | `/events/:id/track` | GeoJSON FeatureCollection (observed + forecast flags) |
| GET | `/events/:id/risk-areas` | GeoJSON FeatureCollection |
| GET | `/events/:id/flood-extent` | GeoJSON FeatureCollection (empty when none) |
| GET | `/events/:id/timeline` | risk snapshot series |
| GET | `/events/:id/memory-insights` | `{ available: false, insights: [] }` unless Meko configured |
| GET | `/events/:id/response` | derived summary: affected areas/users, exposed population, shelters, route status, alerts |
| GET | `/events/:id/alerts` | campaigns for this event |

### Ingestion (write mode)

| Method | Path | Body |
|---|---|---|
| POST | `/events/:id/observations` | observedAt, windKmh?, pressureHpa?, rainfallMm?, source? |
| POST | `/events/:id/risk-areas` | GeoJSON geometry, riskScore?, source? |
| POST | `/events/:id/flood-extents` | GeoJSON geometry, depthM?, probability?, acquiredAt?, status? |
| POST | `/events/:id/track-predictions` | points[] { observedAt, lat, lon, windKmh?… } (stored with `isForecast: true`) |

These accept future ML/model output. Model/version metadata fields are
validated and persisted with each record; no model logic runs in-platform.

## Shelters

| Method | Path | Notes |
|---|---|---|
| GET | `/shelters` | optional `lat`,`lon`,`radiusM` (PostGIS ST_DWithin) |
| GET | `/shelters/:id` | single record |
| GET | `/shelters/nearest` | `lat`,`lon`,`limit` — KNN via ST_Distance |

## Routes

| Method | Path | Notes |
|---|---|---|
| GET | `/routes` | GeoJSON FeatureCollection with live `status` |

## Alerts

| Method | Path | Notes |
|---|---|---|
| GET | `/alerts` | optional `eventId` filter |
| GET | `/alerts/:id` | campaign; `message` only when present |
| GET | `/alerts/stats` | target/delivered/read/failed + per-channel stats |
| GET | `/alerts/providers` | channel availability derived from credentials |
| GET | `/alerts/activity` | recent campaign activity stream |

## GIS

| Method | Path | Notes |
|---|---|---|
| GET | `/gis/events/:id/bounding-box` | ST_Extent of event geometry, or `null` |
| GET | `/gis/shelters/nearest` | same as shelters/nearest |
| GET | `/gis/shelters/in-radius` | ST_DWithin radius search |
