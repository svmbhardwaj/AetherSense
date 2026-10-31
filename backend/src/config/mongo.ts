import { MongoClient, Db, type Collection } from "mongodb";
import { env } from "./env";
import { logger } from "../utils/logger";

let client: MongoClient | null = null;

export function getMongoClient(): MongoClient {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5_000,
      maxPoolSize: 10,
    });
  }
  return client;
}

export function getDb(): Db {
  return getMongoClient().db(env.MONGODB_DB);
}

export const collections = {
  get applicationSettings(): Collection {
    return getDb().collection("application_settings");
  },
  get userPreferences(): Collection {
    return getDb().collection("user_preferences");
  },
  get memoryMetadata(): Collection {
    return getDb().collection("memory_metadata");
  },
  get integrationConfigs(): Collection {
    return getDb().collection("integration_configs");
  },
};

/** Idempotent index setup. Safe to call at startup. */
export async function ensureMongoIndexes(): Promise<void> {
  try {
    await collections.userPreferences.createIndex({ userId: 1 }, { unique: true });
    await collections.memoryMetadata.createIndex({ eventId: 1 });
    await collections.memoryMetadata.createIndex({ createdAt: -1 });
    await collections.applicationSettings.createIndex({ key: 1 }, { unique: true });
  } catch (e) {
    logger.warn({ e }, "could not ensure mongo indexes");
  }
}

export async function checkMongo(): Promise<boolean> {
  try {
    await getMongoClient().db("admin").command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}
