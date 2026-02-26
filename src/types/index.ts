/**
 * Sing-Box Configuration Types
 * Based on: https://sing-box.sagernet.org/configuration/
 */

// ============================================================================
// Log Configuration
// ============================================================================

export interface LogConfig {
  disabled?: boolean;
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'panic';
  output?: string;
  timestamp?: boolean;
}

// ============================================================================
// DNS Configuration
// ============================================================================

export interface DNSConfig {
  servers: DNSServer[];
  rules?: DNSRule[];
  final?: string;
  final_server?: string;
  strategy?: 'default' | 'prefer_ipv4' | 'prefer_ipv6' | 'ipv4_only' | 'ipv6_only';
  independent_cache?: boolean;
  reverse_mapping?: boolean;
}

export interface DNSServer {
  tag: string;
  address: string;
  address_resolver?: string;
  address_strategy?: 'default' | 'prefer_ipv4' | 'prefer_ipv6' | 'ipv4_only' | 'ipv6_only';
  strategy?: 'default' | 'prefer_ipv4' | 'prefer_ipv6' | 'ipv4_only' | 'ipv6_only';
  detour?: string;
  client_subnet?: string;
}

export interface DNSRule {
  inbound?: string | string[];
  ip_version?: 4 | 6;
  network?: 'tcp' | 'udp';
  protocol?: string | string[];
  domain?: string | string[];
  domain_suffix?: string | string[];
  domain_keyword?: string | string[];
  domain_regex?: string | string[];
  source_ip_cidr?: string | string[];
  ip_cidr?: string | string[];
  source_port?: number | number[];
  source_port_range?: string | string[];
  port?: number | number[];
  port_range?: string | string[];
  process_name?: string | string[];
  process_path?: string | string[];
  package_name?: string | string[];
  user?: string | string[];
  user_id?: number | number[];
  clash_mode?: string;
  rule_set?: string | string[];
  invert?: boolean;
  outbound: string;
  server: string;
  disable_cache?: boolean;
  rewrite_ttl?: number;
}

// ============================================================================
// Inbound Configuration
// ============================================================================

export type InboundType =
  | 'direct'
  | 'mixed'
  | 'socks'
  | 'http'
  | 'shadowsocks'
  | 'vmess'
  | 'trojan'
  | 'naive'
  | 'hysteria'
  | 'hysteria2'
  | 'tuic'
  | 'tun';

export interface InboundBase {
  type: InboundType;
  tag: string;
  listen?: string;
  listen_port?: number;
  tcp_fast_open?: boolean;
  tcp_multi_path?: boolean;
  udp_fragment?: boolean;
  udp_timeout?: number;
  detour?: string;
  sniff?: boolean;
  sniff_override_destination?: boolean;
  domain_strategy?: 'default' | 'prefer_ipv4' | 'prefer_ipv6' | 'ipv4_only' | 'ipv6_only';
}

// Specific inbound types can be extended as needed
export type Inbound = InboundBase & Record<string, unknown>;

// ============================================================================
// Outbound Configuration
// ============================================================================

export type OutboundType =
  | 'direct'
  | 'block'
  | 'socks'
  | 'http'
  | 'shadowsocks'
  | 'vmess'
  | 'vless'
  | 'trojan'
  | 'hysteria'
  | 'hysteria2'
  | 'tuic'
  | 'wireguard'
  | 'dns'
  | 'selector'
  | 'urltest';

export interface OutboundBase {
  type: OutboundType;
  tag: string;
}

// Selector outbound (used for node selection)
export interface SelectorOutbound extends OutboundBase {
  type: 'selector';
  outbounds: string[];
  default?: string;
  interrupt_exist_connections?: boolean;
}

// URL Test outbound (used for auto selection)
export interface URLTestOutbound extends OutboundBase {
  type: 'urltest';
  outbounds: string[];
  url?: string;
  interval?: string;
  tolerance?: number;
  idle_timeout?: string;
  interrupt_exist_connections?: boolean;
}

// Direct outbound
export interface DirectOutbound extends OutboundBase {
  type: 'direct';
  override_address?: string;
  override_port?: number;
  proxy_protocol?: boolean | 1 | 2;
  proxy_protocol_username?: string;
}

// Block outbound
export interface BlockOutbound extends OutboundBase {
  type: 'block';
}

// DNS outbound
export interface DNSOutbound extends OutboundBase {
  type: 'dns';
}

// Shadowsocks outbound
export interface ShadowsocksOutbound extends OutboundBase {
  type: 'shadowsocks';
  server: string;
  server_port: number;
  method: string;
  password: string;
  plugin?: string;
  plugin_opts?: Record<string, unknown>;
  udp_over_tcp?: false | {
    enabled: true;
    version?: number;
  };
  multiplex?: MultiplexConfig;
  tls?: TLSConfig;
  transport?: TransportConfig;
  network?: 'tcp' | 'udp';
  detour?: string;
}

// VMess outbound
export interface VMessOutbound extends OutboundBase {
  type: 'vmess';
  server: string;
  server_port: number;
  uuid: string;
  security?: 'auto' | 'aes-128-gcm' | 'chacha20-poly1305' | 'none' | 'zero' | string;
  global_padding?: boolean;
  authenticated_length?: boolean;
  packet_encoding?: string;
  multiplex?: MultiplexConfig;
  tls?: TLSConfig;
  transport?: TransportConfig;
  network?: 'tcp' | 'udp';
  detour?: string;
}

// Trojan outbound
export interface TrojanOutbound extends OutboundBase {
  type: 'trojan';
  server: string;
  server_port: number;
  password: string;
  network?: 'tcp' | 'udp';
  tls?: TLSConfig;
  multiplex?: MultiplexConfig;
  transport?: TransportConfig;
  detour?: string;
}

// Hysteria2 outbound
export interface Hysteria2Outbound extends OutboundBase {
  type: 'hysteria2';
  server: string;
  server_port: number;
  up_mbps?: number;
  down_mbps?: number;
  obfs?: {
    type?: 'salamander';
    password?: string;
  };
  password?: string;
  network?: 'tcp' | 'udp';
  tls?: TLSConfig;
  multiplex?: MultiplexConfig;
  detour?: string;
}

// Generic outbound type for unknown/extended types
export type GenericOutbound = OutboundBase & {
  server?: string;
  server_port?: number;
  uuid?: string;
  password?: string;
  security?: string;
  tls?: TLSConfig;
  transport?: TransportConfig;
  outbounds?: string[];
  multiplex?: MultiplexConfig;
  [key: string]: unknown;
};

// Union type for all outbound types
export type Outbound =
  | SelectorOutbound
  | URLTestOutbound
  | DirectOutbound
  | BlockOutbound
  | DNSOutbound
  | ShadowsocksOutbound
  | VMessOutbound
  | TrojanOutbound
  | Hysteria2Outbound
  | GenericOutbound;

// ============================================================================
// TLS Configuration
// ============================================================================

export interface TLSConfig {
  enabled?: boolean;
  server_name?: string;
  insecure?: boolean;
  alpn?: string[];
  min_version?: '1.0' | '1.1' | '1.2' | '1.3';
  max_version?: '1.0' | '1.1' | '1.2' | '1.3';
  cipher_suites?: string[];
  certificate?: string | string[];
  certificate_path?: string;
  ech?: {
    enabled: boolean;
    pq_signature_schemes_enabled?: boolean;
    dynamic_record_sizing_disabled?: boolean;
    config?: string[];
    config_path?: string;
  };
  utls?: {
    enabled: boolean;
    fingerprint: string;
  };
  realtime?: {
    enabled: boolean;
  };
}

// ============================================================================
// Transport Configuration
// ============================================================================

export interface TransportConfig {
  type: 'http' | 'ws' | 'quic' | 'grpc' | 'httpupgrade';
  host?: string | string[];
  path?: string;
  headers?: Record<string, string>;
  method?: string;
  max_early_data?: number;
  early_data_header_name?: string;
  service_name?: string;
  idle_timeout?: string;
  ping_timeout?: string;
}

// ============================================================================
// Multiplex Configuration
// ============================================================================

export interface MultiplexConfig {
  enabled: boolean;
  protocol?: 'smux' | 'yamux' | 'h2mux';
  max_connections?: number;
  min_streams?: number;
  max_streams?: number;
  padding?: boolean;
}

// ============================================================================
// Route Configuration
// ============================================================================

export interface RouteConfig {
  rules?: RouteRule[];
  rule_set?: RouteRuleSet[];
  rule_set_url?: string;
  auto_detect_interface?: boolean;
  default_interface?: string;
  final?: string;
  find_process?: boolean;
}

export interface RouteRule {
  inbound?: string | string[];
  ip_version?: 4 | 6;
  network?: 'tcp' | 'udp';
  protocol?: string | string[];
  domain?: string | string[];
  domain_suffix?: string | string[];
  domain_keyword?: string | string[];
  domain_regex?: string | string[];
  source_ip_cidr?: string | string[];
  ip_cidr?: string | string[];
  source_port?: number | number[];
  source_port_range?: string | string[];
  port?: number | number[];
  port_range?: string | string[];
  process_name?: string | string[];
  process_path?: string | string[];
  package_name?: string | string[];
  user?: string | string[];
  user_id?: number | number[];
  clash_mode?: string;
  rule_set?: string | string[];
  invert?: boolean;
  outbound: string;
}

export interface RouteRuleSet {
  tag: string;
  type: 'local' | 'remote';
  format: 'source' | 'binary';
  path?: string;
  url?: string;
  download_detour?: string;
  update_interval?: string;
}

// ============================================================================
// Experimental Configuration
// ============================================================================

export interface ExperimentalConfig {
  cache_file?: CacheFileConfig;
  clash_api?: ClashAPIConfig;
  v2ray_api?: V2RayAPIConfig;
  global?: {
    external_detector?: string;
    tracer?: Record<string, unknown>;
  };
}

export interface CacheFileConfig {
  enabled?: boolean;
  path?: string;
  cache_id?: string;
  store_fakeip?: boolean;
  store_rdrc?: boolean;
}

export interface ClashAPIConfig {
  external_controller?: string;
  external_ui?: string;
  external_ui_download_url?: string;
  external_ui_download_detour?: string;
  secret?: string;
  default_mode?: string;
  access_control_allow_origin?: string[];
  access_control_allow_private_network?: boolean;
}

export interface V2RayAPIConfig {
  tag: string;
  listen?: string;
  stats?: {
    enabled: boolean;
    inbounds?: string[];
    outbounds?: string[];
    users?: string[];
  };
}

// ============================================================================
// Main Config Interface
// ============================================================================

export interface SingBoxConfig {
  log?: LogConfig;
  dns?: DNSConfig;
  inbounds: Inbound[];
  outbounds: Outbound[];
  route?: RouteConfig;
  experimental?: ExperimentalConfig;
}

// ============================================================================
// API Response Types
// ============================================================================

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

export interface VersionResponse {
  version: string;
}

// ============================================================================
// Plugin State Types
// ============================================================================

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

// ============================================================================
// Component Props Types
// ============================================================================

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
