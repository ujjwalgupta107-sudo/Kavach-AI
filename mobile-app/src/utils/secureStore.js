import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Helper to wrap a promise with a timeout fallback
const withTimeout = (promise, timeoutMs = 1500, fallbackValue = null) => {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => {
      console.warn(`[SecureStore Timeout] Operation exceeded ${timeoutMs}ms, returning fallback.`);
      resolve(fallbackValue);
    }, timeoutMs))
  ]);
};

export const getSecureItem = async (key) => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[SecureStore Fallback] localStorage read error:', e);
      return null;
    }
  }
  try {
    return await withTimeout(SecureStore.getItemAsync(key), 1500, null);
  } catch (e) {
    console.error('[SecureStore] Failed to read key:', key, e);
    return null;
  }
};

export const setSecureItem = async (key, value) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('[SecureStore Fallback] localStorage write error:', e);
      return false;
    }
  }
  try {
    return await withTimeout(SecureStore.setItemAsync(key, value).then(() => true), 1500, false);
  } catch (e) {
    console.error('[SecureStore] Failed to write key:', key, e);
    return false;
  }
};

export const deleteSecureItem = async (key) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('[SecureStore Fallback] localStorage delete error:', e);
      return false;
    }
  }
  try {
    return await withTimeout(SecureStore.deleteItemAsync(key).then(() => true), 1500, false);
  } catch (e) {
    console.error('[SecureStore] Failed to delete key:', key, e);
    return false;
  }
};
