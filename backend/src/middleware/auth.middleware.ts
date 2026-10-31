import { Request, Response, NextFunction } from "express";
import type { IncomingHttpHeaders } from "http";
import { env } from "../config/env";

export type Role = "admin" | "operator" | "responder" | "anonymous";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

function readRole(headers: IncomingHttpHeaders): Role | undefined {
  const role = headers["x-role"];
  return typeof role === "string" ? (role as Role) : undefined;
}

function readUserId(headers: IncomingHttpHeaders): string {
  const id = headers["x-user-id"];
  return typeof id === "string" && id.length > 0 ? id : "anonymous";
}

/**
 * Derives the acting principal. For now this reads trusted edge headers —
 * replace `readRole`/`readUserId` with a real JWT/OIDC verification pass at
 * the edge before exposing the deployment publicly.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const role = readRole(req.headers);
  req.user = {
    id: readUserId(req.headers),
    role: role && ["admin", "operator", "responder"].includes(role) ? role : "anonymous",
  };
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } });
    }
    next();
  };
}

/**
 * Write guard for ingestion and mutations. When INGEST_API_TOKEN is unset the
 * write surface is closed outright instead of silently allowing anonymous
 * writes; callers set `x-ingest-token` and one of the privileged roles.
 */
export function requireIngest(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !["admin", "operator"].includes(req.user.role)) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } });
  }
  if (!env.INGEST_API_TOKEN) {
    return res.status(503).json({
      error: { code: "WRITE_MODE_NOT_CONFIGURED", message: "Write access is disabled until INGEST_API_TOKEN is configured." },
    });
  }
  if (req.headers["x-ingest-token"] !== env.INGEST_API_TOKEN) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid ingest token" } });
  }
  next();
}

/** Verified provider callbacks use a shared secret; never an open endpoint. */
export function requireWebhook(req: Request, res: Response, next: NextFunction) {
  if (!env.WEBHOOK_SHARED_SECRET) {
    return res.status(503).json({
      error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Webhook verification is not configured." },
    });
  }
  if (req.headers["x-webhook-token"] !== env.WEBHOOK_SHARED_SECRET) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid webhook token" } });
  }
  next();
}
