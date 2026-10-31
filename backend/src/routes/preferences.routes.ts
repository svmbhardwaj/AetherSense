import { Router } from "express";
import { preferencesController } from "../controllers/preferences.controller";
import { validate } from "../middleware/validation.middleware";
import { preferencesPatchSchema, settingSchema } from "../schemas/preferences.schema";
import { userKeySchema, settingKeySchema, memoryRefQuerySchema } from "../schemas/params.schema";

const r = Router();
r.get("/memory-references", validate(memoryRefQuerySchema, "query"), preferencesController.memoryReferences);
r.get("/:userId", validate(userKeySchema, "params"), preferencesController.get);
r.put("/:userId", validate(userKeySchema, "params"), validate(preferencesPatchSchema), preferencesController.upsert);
r.get("/settings/:key", validate(settingKeySchema, "params"), preferencesController.getSetting);
r.put("/settings/:key", validate(settingKeySchema, "params"), validate(settingSchema), preferencesController.upsertSetting);
export default r;
