/**
 * API Client for communicating with the backend service
 */

const BACKEND_URL = 'http://localhost:5555';

/**
 * Custom error class with HTTP status information
 */
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
      // Add timeout handling
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || data.message || 'Request failed';
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    // Re-throw ApiError as is
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle fetch errors (network issues, timeout, etc.)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out', 408);
      }
      if (error.message.includes('Failed to fetch')) {
        throw new ApiError('Cannot connect to backend service', 503);
      }
    }
    // Wrap unknown errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

export const api = {
  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    return request('/health');
  },

  /**
   * Get sing-box service status
   */
  async getStatus() {
    return request<{
      active: boolean;
      running: boolean;
      status: string;
    }>('/status');
  },

  /**
   * Start sing-box service
   */
  async startService() {
    return request<{ success: boolean; message: string }>('/start', {
      method: 'POST',
    });
  },

  /**
   * Stop sing-box service
   */
  async stopService() {
    return request<{ success: boolean; message: string }>('/stop', {
      method: 'POST',
    });
  },

  /**
   * Restart sing-box service
   */
  async restartService() {
    return request<{ success: boolean; message: string }>('/restart', {
      method: 'POST',
    });
  },

  /**
   * Fetch configuration from URL
   */
  async fetchConfig(url: string) {
    return request<{
      success: boolean;
      message: string;
      outbounds_count: number;
    }>('/config/fetch', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  /**
   * Get available nodes from configuration
   */
  async getNodes() {
    return request<{
      nodes: Array<{
        index: number;
        name: string;
        type: string;
      }>;
      total: number;
    }>('/config/nodes');
  },

  /**
   * Select a proxy node
   */
  async selectNode(nodeName: string) {
    return request<{
      success: boolean;
      message: string;
      node_name: string;
    }>('/config/select', {
      method: 'POST',
      body: JSON.stringify({ node_name: nodeName }),
    });
  },

  /**
   * Get service logs
   */
  async getLogs(lines: number = 50) {
    return request<{ logs: string }>(`/config/logs?lines=${lines}`);
  },

  /**
   * Get sing-box version
   */
  async getVersion() {
    return request<{ version: string }>('/singbox/version');
  },
};

export default api;
