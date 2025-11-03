import type { UserSkinProfile } from '@shared/types';

const PROFILE_KEY = 'userProfile';

export const storage = {
  async getProfile(): Promise<UserSkinProfile | null> {
    const result = await chrome.storage.local.get(PROFILE_KEY);
    return result[PROFILE_KEY] || null;
  },

  async setProfile(profile: UserSkinProfile): Promise<void> {
    await chrome.storage.local.set({ [PROFILE_KEY]: profile });
  },

  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  }
};
