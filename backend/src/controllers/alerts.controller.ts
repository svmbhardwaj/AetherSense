import { Request, Response, NextFunction } from "express";
import { alertsService } from "../services/alerts.service";

export const alertsController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await alertsService.list(req.query.eventId as string | undefined)); } catch (e) { next(e); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const c = await alertsService.getCampaign(req.params.id);
      if (!c) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Campaign not found." } });
      res.json(c);
    } catch (e) { next(e); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await alertsService.createCampaign(req.body)); } catch (e) { next(e); }
  },
  updateRecipient: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await alertsService.updateRecipientStatus(req.params.id, req.body.status, req.body.providerId);
      if (!updated) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Recipient not found." } });
      res.json(updated);
    } catch (e) { next(e); }
  },
  /** Verified provider callbacks. The shared secret is checked by middleware
   * before this handler runs; the update itself is queued and persisted in the worker. */
  webhooks: async (req: Request, res: Response, next: NextFunction) => {
    try { alertsService.acceptProviderWebhook(req.params.channel, req.body); res.status(202).json({ accepted: true }); } catch (e) { next(e); }
  },
  stats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [stats, channels] = await Promise.all([alertsService.deliveryStats(), alertsService.channelStats()]);
      res.json({ ...stats, channels });
    } catch (e) { next(e); }
  },
  activity: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await alertsService.recentActivity()); } catch (e) { next(e); }
  },
  providers: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(alertsService.routerAvailability()); } catch (e) { next(e); }
  },
};
