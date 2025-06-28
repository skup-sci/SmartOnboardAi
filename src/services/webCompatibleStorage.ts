import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Web-compatible storage service
class WebCompatibleStorage {
  static async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn(`Error getting item from localStorage: ${error}`);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.warn(`Error getting item from SecureStore: ${error}`);
        return null;
      }
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn(`Error setting item in localStorage: ${error}`);
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.warn(`Error setting item in SecureStore: ${error}`);
      }
    }
  }

  static async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing item from localStorage: ${error}`);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn(`Error removing item from SecureStore: ${error}`);
      }
    }
  }
}

export default WebCompatibleStorage;
