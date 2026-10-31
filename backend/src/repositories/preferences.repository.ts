import { collections } from "../config/mongo";
import { logger } from "../utils/logger";

export interface UserPreferencesDoc {
  userId: string;
  language?: string;
  notificationChannels?: string[];
  quietHours?: { start: string; end: string } | null;
  updatedAt: string;
}

export interface ApplicationSettingDoc {
  key: string;
  value: Record<string, unknown>;
  updatedAt: string;
}

export interface MemoryMetadataDoc {
  eventId?: string;
  mekoRef: string;
  title?: string;
  confidence?: number;
  tags?: string[];
  createdAt: string;
}

/** MongoDB owns flexible application documents: preferences, settings,
 * integration configs and Meko reference metadata. Operational spatial or
 * time-series data stays in PostgreSQL. */
export const preferencesRepository = {
  async getUserPreferences(userId: string): Promise<UserPreferencesDoc | null> {
    const doc = await collections.userPreferences.findOne({ userId });
    if (!doc) return null;
    return {
      userId,
      language: doc.language,
      notificationChannels: doc.notificationChannels,
      quietHours: doc.quietHours ?? null,
      updatedAt: doc.updatedAt,
    };
  },

  async upsertUserPreferences(userId: string, patch: Partial<UserPreferencesDoc>): Promise<UserPreferencesDoc> {
    const now = new Date().toISOString();
    const doc: UserPreferencesDoc = {
      userId,
      language: patch.language,
      notificationChannels: patch.notificationChannels,
      quietHours: patch.quietHours ?? null,
      updatedAt: now,
    };
    await collections.userPreferences.updateOne(
      { userId },
      { $set: doc },
      { upsert: true },
    );
    return doc;
  },

  async getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
    const doc = await collections.applicationSettings.findOne({ key });
    return doc ? (doc.value as T) : null;
  },

  async upsertSetting(key: string, value: Record<string, unknown>): Promise<void> {
    await collections.applicationSettings.updateOne(
      { key },
      { $set: { key, value, updatedAt: new Date().toISOString() } },
      { upsert: true },
    );
  },

  async recordMemoryMetadata(meta: MemoryMetadataDoc): Promise<void> {
    await collections.memoryMetadata.insertOne({
      eventId: meta.eventId,
      mekoRef: meta.mekoRef,
      title: meta.title,
      confidence: meta.confidence,
      tags: meta.tags,
      createdAt: meta.createdAt,
    });
  },

  async listMemoryReferences(eventId?: string, limit = 50): Promise<MemoryMetadataDoc[]> {
    const filter = eventId ? { eventId } : {};
    const docs = await collections.memoryMetadata
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return docs.map((d) => ({
      eventId: d.eventId,
      mekoRef: d.mekoRef,
      title: d.title,
      confidence: d.confidence,
      tags: d.tags,
      createdAt: d.createdAt,
    }));
  },

  async integrationHealth(): Promise<boolean> {
    try {
      await collections.applicationSettings.countDocuments();
      return true;
    } catch (e) {
      logger.warn({ e }, "mongo integration health check failed");
      return false;
    }
  },
};

export const preferencesCollection = collections;
