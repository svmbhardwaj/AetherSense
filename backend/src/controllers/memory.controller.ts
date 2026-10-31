import { Request, Response, NextFunction } from "express";
import { memoryService } from "../services/memory.service";
import { preferencesRepository } from "../repositories/preferences.repository";

export const memoryController = {
  relevant: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await memoryService.getRelevantMemories({
        eventId: req.query.eventId as string,
        location: req.query.location as string,
      });
      res.json(result);
    } catch (e) { next(e); }
  },
  references: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await preferencesRepository.listMemoryReferences(req.query.eventId as string | undefined)); } catch (e) { next(e); }
  },
  recordOutcome: async (req: Request, res: Response, next: NextFunction) => {
    try { await memoryService.recordOutcome(req.body); res.status(204).send(); } catch (e) { next(e); }
  },
  promote: async (req: Request, res: Response, next: NextFunction) => {
    try { await memoryService.promoteVerifiedLearning(req.body); res.status(204).send(); } catch (e) { next(e); }
  },
};
