import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function setStorageItem(key: string, value: string): Promise<void> {
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

export async function getStorageItem(key: string): Promise<string | null> {
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

export async function removeStorageItem(key: string): Promise<void> {
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

// Legacy aliases to maintain backward compatibility across the rest of the app
export const setItemAsync = setStorageItem;
export const getItemAsync = getStorageItem;
export const deleteItemAsync = removeStorageItem;
