/**
 * Sing-Box Configuration Types
 */

export interface SingBoxConfig {
  log?: LogConfig;
  dns?: DNSConfig;
  inbounds: Inbound[];
  outbounds: Outbound[];
  route?: RouteConfig;
  experimental?: ExperimentalConfig;
}

export interface LogConfig {
  disabled?: boolean;
  level?: string;
  output?: string;
  timestamp?: boolean;
}

export interface DNSConfig {
  servers: DNSServer[];
  rules?: DNSRule[];
  final?: string;
  strategy?: string;
}

export interface DNSServer {
  tag: string;
  address: string;
  address_resolver?: string;
  detour?: string;
}

export interface DNSRule {
  outbound?: string;
  server?: string;
}

export interface Inbound {
  type: string;
  tag: string;
  listen?: string;
  listen_port?: number;
  [key: string]: any;
}

export interface Outbound {
  type: string;
  tag: string;
  server?: string;
  server_port?: number;
  uuid?: string;
  security?: string;
  tls?: {
    enabled?: boolean;
    server_name?: string;
    insecure?: boolean;
  };
  transport?: {
    type: string;
    path?: string;
    headers?: Record<string, string>;
  };
  outbounds?: string[]; // For selector/urltest type
  [key: string]: any;
}

export interface RouteConfig {
  rules?: RouteRule[];
  auto_detect_interface?: boolean;
  final?: string;
}

export interface RouteRule {
  outbound: string;
  ip_is_private?: boolean;
  domain?: string[];
  ip_cidr?: string[];
}

export interface ExperimentalConfig {
  cache_file?: CacheFileConfig;
  clash_api?: ClashAPIConfig;
}

export interface CacheFileConfig {
  enabled?: boolean;
  path?: string;
  cache_id?: string;
}

export interface ClashAPIConfig {
  external_controller?: string;
  external_ui?: string;
  secret?: string;
}

/**
 * API Response Types
 */

export interface ServiceStatus {
  active: boolean;
  running: boolean;
  status: string;
}

export interface NodeInfo {
  index: number;
  name: string;
  type: string;
}

export interface NodesResponse {
  nodes: NodeInfo[];
  total: number;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ConfigFetchResponse {
  success: boolean;
  message: string;
  outbounds_count: number;
}

export interface NodeSelectResponse {
  success: boolean;
  message: string;
  node_name: string;
}

export interface LogsResponse {
  logs: string;
}

/**
 * Plugin State Types
 */

export interface PluginState {
  serviceStatus: ServiceStatus | null;
  isLoading: boolean;
  error: string | null;
  configUrl: string;
  nodes: NodeInfo[];
  selectedNode: string | null;
  isFetchingConfig: boolean;
  isChangingNode: boolean;
}

export interface Settings {
  backendUrl: string;
  autoStart: boolean;
  checkInterval: number;
}

/**
 * Component Props Types
 */

export interface StatusCardProps {
  status: ServiceStatus | null;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
}

export interface SettingsPanelProps {
  configUrl: string;
  onUrlChange: (url: string) => void;
  onFetchConfig: () => void;
  isFetching: boolean;
}

export interface NodeSelectorProps {
  nodes: NodeInfo[];
  selectedNode: string | null;
  onSelectNode: (nodeName: string) => void;
  isLoading: boolean;
}
