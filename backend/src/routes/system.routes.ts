import { Router } from "express";
import { systemController } from "../controllers/system.controller";

const r = Router();
r.get("/status", systemController.status);
r.get("/data-sources", systemController.dataSources);
export default r;
