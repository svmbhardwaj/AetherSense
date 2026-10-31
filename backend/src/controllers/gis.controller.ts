import { Request, Response, NextFunction } from "express";
import { gisService } from "../services/gis.service";

export const gisController = {
  usersInPolygon: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await gisService.usersInPolygon(req.body.geometry)); } catch (e) { next(e); }
  },
  districtsIntersecting: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await gisService.districtsIntersecting(req.body.geometry)); } catch (e) { next(e); }
  },
  routesIntersecting: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await gisService.routesIntersecting(req.body.geometry)); } catch (e) { next(e); }
  },
  boundingBox: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await gisService.eventBoundingBox(req.params.id)); } catch (e) { next(e); }
  },
  distance: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ meters: await gisService.distanceBetween(req.body.a, req.body.b) }); } catch (e) { next(e); }
  },
  nearestShelters: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await gisService.nearestShelters(Number(req.query.lat), Number(req.query.lon), Number(req.query.limit) || 5)); } catch (e) { next(e); }
  },
  sheltersInRadius: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await gisService.sheltersInRadius(Number(req.query.lat), Number(req.query.lon), Number(req.query.radiusM) || 1000)); } catch (e) { next(e); }
  },
  safeShelters: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await gisService.safeShelters(req.body.geometry ?? req.body.hazard)); } catch (e) { next(e); }
  },
};
