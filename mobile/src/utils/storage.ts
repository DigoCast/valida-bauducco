import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Armazenamento em memória para web ou fallback
const memoryStorage = new Map<string, string>();

export const Storage = {
  async setItem(key: string, value: string): Promise<void> {
    const cleanKey = key.replace(/[^a-zA-Z0-9._-]/g, "_");
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(cleanKey, value);
      } else {
        await SecureStore.setItemAsync(cleanKey, value);
      }
    } catch (error) {
      memoryStorage.set(cleanKey, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    const cleanKey = key.replace(/[^a-zA-Z0-9._-]/g, "_");
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(cleanKey);
      }
      return await SecureStore.getItemAsync(cleanKey);
    } catch (error) {
      return memoryStorage.get(cleanKey) || null;
    }
  },

  async removeItem(key: string): Promise<void> {
    const cleanKey = key.replace(/[^a-zA-Z0-9._-]/g, "_");
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(cleanKey);
      } else {
        await SecureStore.deleteItemAsync(cleanKey);
      }
    } catch (error) {
      memoryStorage.delete(cleanKey);
    }
  },
};
