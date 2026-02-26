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
