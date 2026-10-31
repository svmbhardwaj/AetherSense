import { Request, Response, NextFunction } from "express";
import { preferencesService } from "../services/preferences.service";

export const preferencesController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prefs = await preferencesService.get(req.params.userId);
      res.json({ userId: req.params.userId, ...prefs });
    } catch (e) { next(e); }
  },
  upsert: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await preferencesService.upsert(req.params.userId, req.body)); } catch (e) { next(e); }
  },
  getSetting: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ key: req.params.key, value: await preferencesService.getSetting(req.params.key) }); } catch (e) { next(e); }
  },
  upsertSetting: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ key: req.params.key, value: await preferencesService.upsertSetting(req.params.key, req.body) }); } catch (e) { next(e); }
  },
  memoryReferences: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await preferencesService.memoryReferences(req.query.eventId as string | undefined)); } catch (e) { next(e); }
  },
};
