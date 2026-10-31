import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || 500;
  const code = err?.code || "INTERNAL_ERROR";
  const message = status >= 500 ? "Internal server error" : err?.message || "Error";
  logger.error({ err, requestId: (req as any).requestId, path: req.path }, message);
  res.status(status).json({ error: { code, message, requestId: (req as any).requestId } });
}
