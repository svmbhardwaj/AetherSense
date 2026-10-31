import { Router } from "express";
import { sheltersController } from "../controllers/shelters.controller";
import { validate } from "../middleware/validation.middleware";
import { requireIngest } from "../middleware/auth.middleware";
import { shelter_create_schema, shelter_status_schema } from "../schemas/ingest.schema";
import { idParamSchema } from "../schemas/params.schema";
import { latlonQuerySchema, latlonRadiusQuerySchema } from "../schemas/query.schema";

const r = Router();
r.get("/", validate(latlonRadiusQuerySchema.partial(), "query"), sheltersController.list);
r.get("/nearest", validate(latlonQuerySchema, "query"), sheltersController.nearest);
r.get("/:id", validate(idParamSchema, "params"), sheltersController.get);
r.post("/", requireIngest, validate(shelter_create_schema), sheltersController.create);
r.patch("/:id/status", requireIngest, validate(idParamSchema, "params"), validate(shelter_status_schema), sheltersController.updateStatus);
export default r;
