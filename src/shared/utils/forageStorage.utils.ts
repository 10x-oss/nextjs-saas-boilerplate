// src/shared/utils/forageStorage.ts

import localForage from "localforage";

localForage.config({
  name: "zAxis",
  storeName: "zaxis-store",
  description: "Persistent storage for zAxis app.",
});

const isBrowser = typeof window !== "undefined";

const fallbackStorage = {
  async getItem(key: string): Promise<string | null> {
    console.warn(`[forageStorage] getItem(${key}) called outside browser.`);
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    console.warn(
      `[forageStorage] setItem(${key}, ...) called outside browser.`
    );
  },
  async removeItem(key: string): Promise<void> {
    console.warn(`[forageStorage] removeItem(${key}) called outside browser.`);
  },
};

export const forageStorage = isBrowser
  ? {
      async getItem(name: string): Promise<string | null> {
        try {
          const value = await localForage.getItem(name);
          return typeof value === "string" ? value : JSON.stringify(value);
        } catch (error) {
          console.error(`[forageStorage] Error getting "${name}":`, error);
          return null;
        }
      },
      async setItem(name: string, value: string): Promise<void> {
        try {
          await localForage.setItem(name, value);
        } catch (error) {
          console.error(`[forageStorage] Error setting "${name}":`, error);
        }
      },
      async removeItem(name: string): Promise<void> {
        try {
          await localForage.removeItem(name);
        } catch (error) {
          console.error(`[forageStorage] Error removing "${name}":`, error);
        }
      },
    }
  : fallbackStorage;
