-- Extensions (guarded for environments where an extension is unavailable)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'postgis unavailable: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS timescaledb;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'timescaledb unavailable: %', SQLERRM;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  role TEXT NOT NULL DEFAULT 'citizen',
  location GEOGRAPHY(POINT,4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disaster events
CREATE TABLE IF NOT EXISTS disaster_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'moderate',
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'unknown',
  data_freshness TEXT NOT NULL DEFAULT 'current',
  landfall TEXT,
  wind_kmh DOUBLE PRECISION,
  pressure_hpa DOUBLE PRECISION,
  rainfall_mm DOUBLE PRECISION,
  population_exposed BIGINT,
  districts_at_risk INTEGER,
  confidence DOUBLE PRECISION,
  eta TEXT
);

-- Event observations (time-series)
CREATE TABLE IF NOT EXISTS event_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  wind_kmh DOUBLE PRECISION,
  pressure_hpa DOUBLE PRECISION,
  rainfall_mm DOUBLE PRECISION,
  source TEXT NOT NULL DEFAULT 'unknown'
);

-- Cyclone track points (time-series, spatial)
CREATE TABLE IF NOT EXISTS cyclone_track_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  location GEOMETRY(POINT,4326) NOT NULL,
  wind_kmh DOUBLE PRECISION,
  pressure_hpa DOUBLE PRECISION,
  rainfall_mm DOUBLE PRECISION,
  is_forecast BOOLEAN NOT NULL DEFAULT FALSE
);

-- Risk snapshots (time-series)
CREATE TABLE IF NOT EXISTS risk_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  risk_score DOUBLE PRECISION NOT NULL,
  source TEXT NOT NULL DEFAULT 'unknown'
);

-- Affected areas (spatial)
CREATE TABLE IF NOT EXISTS affected_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
  geom GEOMETRY(MULTIPOLYGON,4326) NOT NULL,
  source TEXT NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flood extents (spatial)
CREATE TABLE IF NOT EXISTS flood_extents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES disaster_events(id) ON DELETE CASCADE,
  geom GEOMETRY(MULTIPOLYGON,4326) NOT NULL,
  depth_m DOUBLE PRECISION,
  probability DOUBLE PRECISION,
  source TEXT NOT NULL DEFAULT 'unknown',
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'current'
);

-- Districts (spatial)
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  geom GEOMETRY(MULTIPOLYGON,4326) NOT NULL
);

-- Shelters
CREATE TABLE IF NOT EXISTS shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location GEOGRAPHY(POINT,4326) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  occupied INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shelter status history (time-series)
CREATE TABLE IF NOT EXISTS shelter_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  occupied INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available'
);

-- Routes
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES disaster_events(id) ON DELETE SET NULL,
  geom GEOMETRY(LINESTRING,4326) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  label TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Route status history
CREATE TABLE IF NOT EXISTS route_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'open'
);

-- Alert campaigns
CREATE TABLE IF NOT EXISTS alert_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES disaster_events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'queued',
  message TEXT,
  target_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  read_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  channels TEXT[] NOT NULL DEFAULT '{}'
);

-- Alert recipients (destinations are server-side only, never returned to browsers)
CREATE TABLE IF NOT EXISTS alert_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES alert_campaigns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  channel TEXT NOT NULL,
  destination TEXT NOT NULL,
  provider_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert delivery events (time-series)
CREATE TABLE IF NOT EXISTS alert_delivery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES alert_recipients(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES alert_campaigns(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  provider_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Data sources
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'current'
);

-- Data assets
CREATE TABLE IF NOT EXISTS data_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bbox GEOMETRY(POLYGON,4326),
  resolution TEXT,
  metadata JSONB,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  checksum TEXT,
  event_id UUID REFERENCES disaster_events(id) ON DELETE SET NULL
);

-- Memory references
CREATE TABLE IF NOT EXISTS memory_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES disaster_events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  confidence DOUBLE PRECISION,
  source TEXT NOT NULL DEFAULT 'meko',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT,
  action TEXT NOT NULL,
  target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disaster_events_status ON disaster_events(status);
CREATE INDEX IF NOT EXISTS idx_cyclone_track_event ON cyclone_track_points(event_id);
CREATE INDEX IF NOT EXISTS idx_risk_snapshots_event ON risk_snapshots(event_id);
CREATE INDEX IF NOT EXISTS idx_affected_areas_event ON affected_areas(event_id);
CREATE INDEX IF NOT EXISTS idx_flood_extents_event ON flood_extents(event_id);
CREATE INDEX IF NOT EXISTS idx_shelters_status ON shelters(status);
CREATE INDEX IF NOT EXISTS idx_alert_campaigns_event ON alert_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_alert_recipients_campaign ON alert_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_alert_recipients_provider ON alert_recipients(provider_id);
CREATE INDEX IF NOT EXISTS idx_alert_delivery_campaign ON alert_delivery_events(campaign_id);

-- Spatial indexes
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_shelters_location ON shelters USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_cyclone_track_location ON cyclone_track_points USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_districts_geom ON districts USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_affected_areas_geom ON affected_areas USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_flood_extents_geom ON flood_extents USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_routes_geom ON routes USING GIST(geom);

-- TimescaleDB hypertables (guarded)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='timescaledb') THEN
    PERFORM create_hypertable('event_observations','observed_at', if_not_exists => TRUE);
    PERFORM create_hypertable('cyclone_track_points','observed_at', if_not_exists => TRUE);
    PERFORM create_hypertable('risk_snapshots','recorded_at', if_not_exists => TRUE);
    PERFORM create_hypertable('shelter_status','recorded_at', if_not_exists => TRUE);
    PERFORM create_hypertable('alert_delivery_events','occurred_at', if_not_exists => TRUE);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'hypertable setup skipped: %', SQLERRM;
END $$;
