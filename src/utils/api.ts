/**
 * API Client for communicating with the backend service
 */

const BACKEND_URL = 'http://localhost:5555';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Request failed');
  }

  return data;
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
