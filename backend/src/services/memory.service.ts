import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface MemoryInsightInput {
  eventId?: string;
  title: string;
  summary: string;
  confidence?: number;
}

export class MemoryService {
  private baseUrl?: string;
  private apiKey?: string;
  constructor() {
    this.baseUrl = env.MEKO_BASE_URL;
    this.apiKey = env.MEKO_API_KEY;
  }
  get available() { return Boolean(this.baseUrl && this.apiKey); }

  /** Meko owns learned memory. When it is not configured this returns an
   * explicit unavailable response — never fabricated memories. */
  async getRelevantMemories(params: { eventId?: string; location?: string }) {
    if (!this.available) {
      logger.info("Meko unavailable; returning empty memories");
      return { available: false as const, items: [] as Record<string, unknown>[] };
    }
    try {
      const res = await fetch(`${this.baseUrl}/memories/relevant`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return { available: true as const, items: [] as Record<string, unknown>[] };
      const data = (await res.json()) as Record<string, unknown>;
      if (Array.isArray(data)) return { available: true as const, items: data };
      return { available: true as const, items: (data.items as Record<string, unknown>[]) ?? [] };
    } catch (e) {
      logger.warn({ e }, "Meko request failed");
      return { available: true as const, items: [] as Record<string, unknown>[] };
    }
  }

  async recordOutcome(payload: Record<string, unknown>): Promise<void> {
    if (!this.available) {
      logger.info("Meko unavailable; outcome not recorded");
      return;
    }
    try {
      await fetch(`${this.baseUrl}/memories/outcomes`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (e) {
      logger.warn({ e }, "Meko recordOutcome failed");
    }
  }

  async promoteVerifiedLearning(payload: Record<string, unknown>): Promise<void> {
    if (!this.available) {
      logger.info("Meko unavailable; learning not promoted");
      return;
    }
    try {
      await fetch(`${this.baseUrl}/memories/promote`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (e) {
      logger.warn({ e }, "Meko promote failed");
    }
  }
}

export const memoryService = new MemoryService();
