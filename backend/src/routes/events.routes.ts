import { Router } from "express";
import { eventsController } from "../controllers/events.controller";
import { validate } from "../middleware/validation.middleware";
import { requireIngest } from "../middleware/auth.middleware";
import {
  create_event_schema,
  observation_schema,
  risk_area_schema,
  flood_extent_schema,
  track_prediction_schema,
} from "../schemas/ingest.schema";
import { idParamSchema } from "../schemas/params.schema";

const r = Router();
r.get("/", eventsController.list);
r.get("/active", eventsController.active);
r.get("/:id", validate(idParamSchema, "params"), eventsController.get);
r.get("/:id/track", validate(idParamSchema, "params"), eventsController.track);
r.get("/:id/risk-areas", validate(idParamSchema, "params"), eventsController.riskAreas);
r.get("/:id/flood-extent", validate(idParamSchema, "params"), eventsController.floodExtent);
r.get("/:id/timeline", validate(idParamSchema, "params"), eventsController.timeline);
r.get("/:id/response", validate(idParamSchema, "params"), eventsController.response);
r.get("/:id/memory-insights", validate(idParamSchema, "params"), eventsController.memoryInsights);
r.get("/:id/alerts", validate(idParamSchema, "params"), eventsController.alerts);

// Model ingestion endpoints (future ML integration; authenticated writes only).
r.post("/", requireIngest, validate(create_event_schema), eventsController.create);
r.post("/:id/observations", requireIngest, validate(idParamSchema, "params"), validate(observation_schema), eventsController.addObservation);
r.post("/:id/risk-areas", requireIngest, validate(idParamSchema, "params"), validate(risk_area_schema), eventsController.addRiskArea);
r.post("/:id/flood-extents", requireIngest, validate(idParamSchema, "params"), validate(flood_extent_schema), eventsController.addFloodExtent);
r.post("/:id/track-predictions", requireIngest, validate(idParamSchema, "params"), validate(track_prediction_schema), eventsController.addTrackPrediction);
export default r;
