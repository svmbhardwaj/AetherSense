import { Request, Response, NextFunction } from "express";
import { checkDatabase } from "../config/database";
import { checkRedis } from "../config/redis";
import { checkMongo } from "../config/mongo";
import { notificationRouter } from "../services/notification.service";
import { systemRepository } from "../repositories/system.repository";

export const systemController = {
  status: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [db, redis, mongo] = await Promise.all([checkDatabase(), checkRedis(), checkMongo()]);
      res.json({
        api: "ok",
        database: db ? "ok" : "down",
        mongodb: mongo ? "ok" : "down",
        redis: redis ? "ok" : "down",
        queue: redis ? "ok" : "down",
        providers: notificationRouter.availability(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) { next(e); }
  },
  dataSources: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await systemRepository.listDataSources()); } catch (e) { next(e); }
  },
};
