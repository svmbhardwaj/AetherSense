import { Router } from "express";
import { memoryController } from "../controllers/memory.controller";
import { validate } from "../middleware/validation.middleware";
import { requireIngest } from "../middleware/auth.middleware";
import { memoryRefQuerySchema } from "../schemas/params.schema";

const r = Router();
r.get("/relevant", validate(memoryRefQuerySchema, "query"), memoryController.relevant);
r.get("/references", validate(memoryRefQuerySchema, "query"), memoryController.references);
r.post("/outcomes", requireIngest, memoryController.recordOutcome);
r.post("/promote", requireIngest, memoryController.promote);
export default r;
