import { preferencesRepository, UserPreferencesDoc } from "../repositories/preferences.repository";
import { HttpError } from "../middleware/error.middleware";

export const preferencesService = {
  async get(userId: string): Promise<UserPreferencesDoc | null> {
    return preferencesRepository.getUserPreferences(userId);
  },

  async upsert(userId: string, patch: Partial<UserPreferencesDoc>): Promise<UserPreferencesDoc> {
    if (!userId || userId.trim().length < 1) {
      throw new HttpError(400, "VALIDATION_ERROR", "userId is required");
    }
    return preferencesRepository.upsertUserPreferences(userId, patch);
  },

  async getSetting(key: string) {
    return preferencesRepository.getSetting(key);
  },

  async upsertSetting(key: string, value: Record<string, unknown>) {
    await preferencesRepository.upsertSetting(key, value);
    return preferencesRepository.getSetting(key);
  },

  memoryReferences: (eventId?: string) => preferencesRepository.listMemoryReferences(eventId),
};
