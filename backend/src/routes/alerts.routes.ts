import { Router } from "express";
import { alertsController } from "../controllers/alerts.controller";
import { validate } from "../middleware/validation.middleware";
import { requireIngest, requireWebhook } from "../middleware/auth.middleware";
import {
  campaign_create_schema,
  recipient_status_patch_schema,
} from "../schemas/ingest.schema";
import { idParamSchema, webhookBodySchema, webhookChannelSchema } from "../schemas/params.schema";

const r = Router();
r.get("/", alertsController.list);
r.get("/stats", alertsController.stats);
r.get("/providers", alertsController.providers);
r.get("/activity", alertsController.activity);
r.get("/:id", validate(idParamSchema, "params"), alertsController.get);
r.post("/", requireIngest, validate(campaign_create_schema), alertsController.create);
r.patch("/recipients/:id", requireIngest, validate(idParamSchema, "params"), validate(recipient_status_patch_schema), alertsController.updateRecipient);
r.post("/webhooks/:channel", requireWebhook, validate(webhookChannelSchema, "params"), validate(webhookBodySchema), alertsController.webhooks);
export default r;
