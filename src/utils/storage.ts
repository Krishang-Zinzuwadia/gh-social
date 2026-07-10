import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      } else {
        throw new Error('localStorage is undefined');
      }
    } catch (e) {
      console.error('Local storage error:', e);
      throw e;
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return null;
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      } else {
        throw new Error('localStorage is undefined');
      }
    } catch (e) {
      console.error('Local storage error:', e);
      throw e;
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
