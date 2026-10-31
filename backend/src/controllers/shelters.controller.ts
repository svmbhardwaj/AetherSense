import { Request, Response, NextFunction } from "express";
import { sheltersService } from "../services/shelters.service";

export const sheltersController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lat = req.query.lat ? Number(req.query.lat) : undefined;
      const lon = req.query.lon ? Number(req.query.lon) : undefined;
      const radiusM = req.query.radiusM ? Number(req.query.radiusM) : undefined;
      res.json(await sheltersService.list({ lat, lon, radiusM }));
    } catch (e) { next(e); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const s = await sheltersService.getById(req.params.id);
      if (!s) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Shelter not found." } });
      res.json(s);
    } catch (e) { next(e); }
  },
  nearest: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await sheltersService.nearest(Number(req.query.lat), Number(req.query.lon), Number(req.query.limit) || 5)); } catch (e) { next(e); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await sheltersService.create(req.body)); } catch (e) { next(e); }
  },
  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await sheltersService.updateStatus(req.params.id, req.body.status, req.body.occupied)); } catch (e) { next(e); }
  },
};
