import { Router } from "express";
import { routesRepository } from "../repositories/events.repository";

const r = Router();
// Evacuation route geometry as GeoJSON; empty database = empty FeatureCollection.
r.get("/", async (_req, res, next) => {
  try { res.json(await routesRepository.list()); } catch (e) { next(e); }
});
export default r;
