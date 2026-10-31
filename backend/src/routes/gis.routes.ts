import { Router } from "express";
import { gisController } from "../controllers/gis.controller";
import { validate } from "../middleware/validation.middleware";
import { requireIngest } from "../middleware/auth.middleware";
import {
  coordinatesBodySchema,
  geometryBodySchema,
  latlonQuerySchema,
  latlonRadiusQuerySchema,
} from "../schemas/query.schema";
import { idParamSchema } from "../schemas/params.schema";

const r = Router();
r.post("/users-in-polygon", requireIngest, validate(geometryBodySchema), gisController.usersInPolygon);
r.post("/districts-intersecting", requireIngest, validate(geometryBodySchema), gisController.districtsIntersecting);
r.post("/routes-intersecting", validate(geometryBodySchema), gisController.routesIntersecting);
r.get("/events/:id/bounding-box", validate(idParamSchema, "params"), gisController.boundingBox);
r.post("/distance", validate(coordinatesBodySchema), gisController.distance);
r.get("/shelters/nearest", validate(latlonQuerySchema, "query"), gisController.nearestShelters);
r.get("/shelters/in-radius", validate(latlonRadiusQuerySchema, "query"), gisController.sheltersInRadius);
r.post("/shelters/safe", validate(geometryBodySchema), gisController.safeShelters);
export default r;
