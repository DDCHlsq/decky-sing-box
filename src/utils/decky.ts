import { DeckyPluginAPI } from '@decky/api';

let deckyAPI: DeckyPluginAPI | null = null;

/**
 * Initialize Decky API
 */
export function initDeckyAPI(api: DeckyPluginAPI) {
  deckyAPI = api;
}

/**
 * Get Decky API instance
 */
export function getDeckyAPI(): DeckyPluginAPI {
  if (!deckyAPI) {
    throw new Error('Decky API not initialized');
  }
  return deckyAPI;
}

/**
 * Show toast notification
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (deckyAPI?.toast) {
    deckyAPI.toast(message, {
      kind: type,
    });
  }
}

/**
 * Safe localStorage operations with error handling
 */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      logger.warn('Failed to read from localStorage:', e);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      logger.warn('Failed to write to localStorage:', e);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      logger.warn('Failed to remove from localStorage:', e);
      return false;
    }
  },
};

/**
 * Logger utility
 */
export const logger = {
  info: (...args: any[]) => {
    console.log('[SingBox Manager]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[SingBox Manager]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[SingBox Manager]', ...args);
  },
};
