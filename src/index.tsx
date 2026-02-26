import { definePlugin, ServerAPI } from '@decky/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { StatusCard } from './components/StatusCard';
import { Settings } from './components/Settings';
import { NodeSelector } from './components/NodeSelector';
import { api, ApiError } from './utils/api';
import { initDeckyAPI, showToast, logger, safeStorage } from './utils/decky';
import { ServiceStatus, NodeInfo } from './types';

// Configuration constants
const CONFIG = {
  // Dynamic polling intervals based on service state (in milliseconds)
  POLL_INTERVAL_RUNNING: 10000,    // 10 seconds when running
  POLL_INTERVAL_STOPPED: 30000,    // 30 seconds when stopped
  POLL_INTERVAL_ERROR: 60000,      // 60 seconds when error
  // API timeout
  API_TIMEOUT: 30000,
  // Storage keys
  STORAGE_KEYS: {
    CONFIG_URL: 'singbox_config_url',
  },
};

// CSS styles - extracted for better maintainability
const styles = `
  .singbox-plugin {
    padding: 16px;
  }

  .singbox-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .singbox-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }

  .singbox-version {
    font-size: 11px;
    color: #666;
  }

  .singbox-error {
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid #F44336;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
    color: #F44336;
    font-size: 13px;
  }

  .singbox-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .singbox-tab {
    flex: 1;
    padding: 8px 12px;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: #888;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .singbox-tab.active {
    background-color: rgba(76, 175, 80, 0.3);
    color: #4CAF50;
  }

  .singbox-tab:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

// Helper function to get polling interval based on status
function getPollingInterval(status: ServiceStatus | null, error: string | null): number {
  if (error) return CONFIG.POLL_INTERVAL_ERROR;
  if (status?.running) return CONFIG.POLL_INTERVAL_RUNNING;
  return CONFIG.POLL_INTERVAL_STOPPED;
}

// Main content component
const PluginContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'nodes'>('status');
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingConfig, setIsFetchingConfig] = useState(false);
  const [isChangingNode, setIsChangingNode] = useState(false);
  const [configUrl, setConfigUrl] = useState('');
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [singBoxVersion, setSingBoxVersion] = useState<string>('');

  // Ref for polling interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const status = await api.getStatus();
      setServiceStatus(status);
      setError(null);
    } catch (err) {
      logger.error('Failed to fetch status:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to connect to backend service';
      setError(errorMessage);
    }
  }, []);

  // Fetch nodes
  const fetchNodes = useCallback(async () => {
    try {
      const response = await api.getNodes();
      setNodes(response.nodes);
    } catch (err) {
      logger.error('Failed to fetch nodes:', err);
    }
  }, []);

  // Setup dynamic polling
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Get dynamic interval based on status
    const interval = getPollingInterval(serviceStatus, error);

    // Setup new interval
    intervalRef.current = setInterval(fetchStatus, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus, serviceStatus, error]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchStatus();
      await fetchNodes();

      // Try to get sing-box version
      try {
        const versionInfo = await api.getVersion();
        setSingBoxVersion(versionInfo.version);
      } catch (err) {
        logger.warn('Failed to get sing-box version');
      }

      // Load saved config URL from safeStorage
      const savedUrl = safeStorage.getItem(CONFIG.STORAGE_KEYS.CONFIG_URL);
      if (savedUrl) {
        setConfigUrl(savedUrl);
      }

      setIsLoading(false);
    };

    init();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus, fetchNodes]);

  // Handle start/restart service
  const handleStart = async () => {
    setIsLoading(true);
    try {
      if (serviceStatus?.running) {
        await api.restartService();
        showToast('Service restarted', 'success');
      } else {
        await api.startService();
        showToast('Service started', 'success');
      }
      await fetchStatus();
    } catch (err: any) {
      logger.error('Failed to start service:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to start service';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stop service
  const handleStop = async () => {
    setIsLoading(true);
    try {
      await api.stopService();
      showToast('Service stopped', 'success');
      await fetchStatus();
    } catch (err: any) {
      logger.error('Failed to stop service:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to stop service';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle fetch config
  const handleFetchConfig = async () => {
    if (!configUrl.trim()) return;

    setIsFetchingConfig(true);
    try {
      const result = await api.fetchConfig(configUrl);
      showToast(result.message, 'success');

      // Save URL to safeStorage
      safeStorage.setItem(CONFIG.STORAGE_KEYS.CONFIG_URL, configUrl);

      // Refresh nodes
      await fetchNodes();
      setActiveTab('nodes');
    } catch (err: any) {
      logger.error('Failed to fetch config:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch configuration';
      showToast(errorMessage, 'error');
    } finally {
      setIsFetchingConfig(false);
    }
  };

  // Handle select node
  const handleSelectNode = async (nodeName: string) => {
    setIsChangingNode(true);
    try {
      const result = await api.selectNode(nodeName);
      showToast(result.message, 'success');
      setSelectedNode(nodeName);

      // Restart service to apply changes
      if (serviceStatus?.running) {
        await api.restartService();
        showToast('Service restarted with new node', 'info');
      }

      await fetchStatus();
    } catch (err: any) {
      logger.error('Failed to select node:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to select node';
      showToast(errorMessage, 'error');
    } finally {
      setIsChangingNode(false);
    }
  };

  return (
    <div className="singbox-plugin">
      <style>{styles}</style>

      <div className="singbox-header">
        <h1 className="singbox-title">Sing-Box Manager</h1>
        {singBoxVersion && (
          <span className="singbox-version">
            {singBoxVersion.includes('Not installed') ? '⚠️ Not installed' : singBoxVersion.split('\n')[0]}
          </span>
        )}
      </div>

      {error && (
        <div className="singbox-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="singbox-tabs">
        <button
          className={`singbox-tab ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          Status
        </button>
        <button
          className={`singbox-tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Config
        </button>
        <button
          className={`singbox-tab ${activeTab === 'nodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('nodes')}
        >
          Nodes ({nodes.length})
        </button>
      </div>

      <div>
        {activeTab === 'status' && (
          <StatusCard
            status={serviceStatus}
            isLoading={isLoading}
            onStart={handleStart}
            onStop={handleStop}
            onRefresh={fetchStatus}
          />
        )}

        {activeTab === 'config' && (
          <Settings
            configUrl={configUrl}
            onUrlChange={setConfigUrl}
            onFetchConfig={handleFetchConfig}
            isFetching={isFetchingConfig}
          />
        )}

        {activeTab === 'nodes' && (
          <NodeSelector
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
            isLoading={isChangingNode}
          />
        )}
      </div>
    </div>
  );
};

// Plugin export
export default definePlugin((serverAPI: ServerAPI) => {
  // Initialize Decky API
  initDeckyAPI(serverAPI);

  logger.info('Sing-Box Manager plugin loaded');

  return {
    title: 'Sing-Box Manager',
    content: () => <PluginContent />,
  };
});
