import { Request, Response, NextFunction } from "express";
import { eventsService } from "../services/events.service";

export const eventsController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await eventsService.list()); } catch (e) { next(e); }
  },
  active: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const ev = await eventsService.getActive();
      if (!ev) return res.status(404).json({ error: { code: "NOT_FOUND", message: "No active disaster event." } });
      res.json(ev);
    } catch (e) { next(e); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ev = await eventsService.getById(req.params.id);
      if (!ev) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Event not found." } });
      res.json(ev);
    } catch (e) { next(e); }
  },
  track: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const features = await eventsService.getTrack(req.params.id);
      res.json({ type: "FeatureCollection", features });
    } catch (e) { next(e); }
  },
  riskAreas: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await eventsService.getRiskAreas(req.params.id)); } catch (e) { next(e); }
  },
  floodExtent: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await eventsService.getFloodExtent(req.params.id)); } catch (e) { next(e); }
  },
  timeline: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await eventsService.getTimeline(req.params.id)); } catch (e) { next(e); }
  },
  response: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await eventsService.getResponse(req.params.id);
      if (!summary) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Event not found." } });
      res.json(summary);
    } catch (e) { next(e); }
  },
  memoryInsights: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ev = await eventsService.getById(req.params.id);
      if (!ev) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Event not found." } });
      const result = await eventsService.getMemoryInsights(req.params.id);
      res.json(result);
    } catch (e) { next(e); }
  },
  alerts: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await eventsService.getAlerts(req.params.id)); } catch (e) { next(e); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await eventsService.create(req.body)); } catch (e) { next(e); }
  },
  addObservation: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await eventsService.addObservation(req.params.id, req.body)); } catch (e) { next(e); }
  },
  addRiskArea: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await eventsService.addRiskArea(req.params.id, req.body)); } catch (e) { next(e); }
  },
  addFloodExtent: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await eventsService.addFloodExtent(req.params.id, req.body)); } catch (e) { next(e); }
  },
  addTrackPrediction: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await eventsService.addTrackPrediction(req.params.id, req.body)); } catch (e) { next(e); }
  },
};
