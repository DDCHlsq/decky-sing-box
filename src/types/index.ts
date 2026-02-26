/**
 * Sing-Box Configuration Types
 * Based on: https://sing-box.sagernet.org/configuration/
 * Compatible with sing-box 1.12.x
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
// NTP Configuration
// ============================================================================

export interface NTPConfig {
  enabled?: boolean;
  server: string;
  server_port?: number;
  interval?: string;
  detour?: string;
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
  | 'vless'
  | 'trojan'
  | 'naive'
  | 'hysteria'
  | 'hysteria2'
  | 'tuic'
  | 'tun'
  | 'redirect'
  | 'tproxy'
  | 'shadowtls'
  | 'anytls';

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

// Direct Inbound
export interface DirectInbound extends InboundBase {
  type: 'direct';
  override_address?: string;
  override_port?: number;
  proxy_protocol?: boolean | 1 | 2;
}

// Mixed Inbound
export interface MixedInbound extends InboundBase {
  type: 'mixed';
}

// SOCKS Inbound
export interface SocksInbound extends InboundBase {
  type: 'socks';
  users?: Array<{
    username: string;
    password: string;
  }>;
  header?: boolean;
}

// HTTP Inbound
export interface HTTPInbound extends InboundBase {
  type: 'http';
  users?: Array<{
    username: string;
    password: string;
  }>;
  tls?: TLSConfig;
  header?: boolean;
  realm?: string;
}

// Shadowsocks Inbound
export interface ShadowsocksInbound extends InboundBase {
  type: 'shadowsocks';
  method: string;
  password: string;
  network?: 'tcp' | 'udp';
  users?: Array<{
    name: string;
    password: string;
  }>;
  multiplex?: MultiplexConfig;
}

// VMess Inbound
export interface VMessInbound extends InboundBase {
  type: 'vmess';
  users: Array<{
    name: string;
    uuid: string;
    alterId: number;
  }>;
  tls?: TLSConfig;
  multiplex?: MultiplexConfig;
  transport?: TransportConfig;
}

// VLESS Inbound
export interface VLESSInbound extends InboundBase {
  type: 'vless';
  users: Array<{
    name: string;
    uuid: string;
    flow?: string;
  }>;
  tls?: TLSConfig;
  multiplex?: MultiplexConfig;
  transport?: TransportConfig;
}

// Trojan Inbound
export interface TrojanInbound extends InboundBase {
  type: 'trojan';
  users: Array<{
    name: string;
    password: string;
  }>;
  tls?: TLSConfig;
  multiplex?: MultiplexConfig;
  transport?: TransportConfig;
  fallback?: {
    server: string;
    server_port: number;
  };
}

// Naive Inbound
export interface NaiveInbound extends InboundBase {
  type: 'naive';
  users: Array<{
    username: string;
    password: string;
  }>;
  tls: TLSConfig;
}

// Hysteria Inbound
export interface HysteriaInbound extends InboundBase {
  type: 'hysteria';
  up: string | number;
  down: string | number;
  obfs?: string;
  users?: Array<{
    name: string;
    auth: string;
    auth_str?: string;
  }>;
  recv_window_conn?: number;
  recv_window_client?: number;
  max_conn_client?: number;
  disable_mtu_discovery?: boolean;
  tls: TLSConfig;
}

// Hysteria2 Inbound
export interface Hysteria2Inbound extends InboundBase {
  type: 'hysteria2';
  up_mbps?: number;
  down_mbps?: number;
  obfs?: {
    type?: 'salamander';
    password: string;
  };
  users?: Array<{
    name: string;
    password: string;
  }>;
  ignore_client_bandwidth?: boolean;
  tls: TLSConfig;
  masquerade?: string;
  brute_force?: boolean;
}

// TUIC Inbound
export interface TUICInbound extends InboundBase {
  type: 'tuic';
  users: Array<{
    name: string;
    uuid: string;
    password: string;
  }>;
  congestion_control?: 'cubic' | 'new_reno' | 'bbr';
  auth_timeout?: string;
  zero_rtt_handshake?: boolean;
  heartbeat?: string;
  tls: TLSConfig;
}

// TUN Inbound
export interface TUNInbound extends InboundBase {
  type: 'tun';
  interface_name?: string;
  inet4_address?: string | string[];
  inet6_address?: string | string[];
  mtu?: number;
  auto_route?: boolean;
  auto_redirect?: boolean;
  auto_redirect_input_mark?: number;
  auto_redirect_output_mark?: number;
  strict_route?: boolean;
  iproute2_table_index?: number;
  iproute2_rule_index?: number;
  auto_detect_interface?: boolean;
  endpoint_independent_nat?: boolean;
  udp_timeout?: number;
  stack?: 'system' | 'gvisor' | 'mixed';
  platform?: {
    http_proxy?: {
      enabled?: boolean;
      server?: string;
      server_port?: number;
    };
  };
}

// Redirect Inbound
export interface RedirectInbound extends InboundBase {
  type: 'redirect';
  tcp_fast_open?: boolean;
  proxy_protocol?: boolean | 1 | 2;
}

// TProxy Inbound
export interface TProxyInbound extends InboundBase {
  type: 'tproxy';
  network?: 'tcp' | 'udp';
}

// ShadowTLS Inbound
export interface ShadowTLSInbound extends InboundBase {
  type: 'shadowtls';
  version: 1 | 2 | 3;
  password?: string;
  users?: Array<{
    name: string;
    password: string;
  }>;
  handshake?: {
    server: string;
    server_port: number;
  };
  handshake_for_server_name?: Record<string, {
    server: string;
    server_port: number;
  }>;
  strict_mode?: boolean;
}

// AnyTLS Inbound
export interface AnyTLSInbound extends InboundBase {
  type: 'anytls';
  users: Array<{
    name: string;
    password: string;
  }>;
  handshake?: {
    server: string;
    server_port: number;
  };
  handshake_for_server_name?: Record<string, {
    server: string;
    server_port: number;
  }>;
  loss?: number;
  lazy?: boolean;
  corrupt?: number;
  delay?: number;
  jitter?: number;
}

// Generic inbound type for unknown/extended types
export type Inbound =
  | DirectInbound
  | MixedInbound
  | SocksInbound
  | HTTPInbound
  | ShadowsocksInbound
  | VMessInbound
  | VLESSInbound
  | TrojanInbound
  | NaiveInbound
  | HysteriaInbound
  | Hysteria2Inbound
  | TUICInbound
  | TUNInbound
  | RedirectInbound
  | TProxyInbound
  | ShadowTLSInbound
  | AnyTLSInbound
  | (InboundBase & Record<string, unknown>);

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
  | 'urltest'
  | 'shadowtls'
  | 'tor'
  | 'ssh'
  | 'anytls';

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
  proxy_protocol_password?: string;
}

// Block outbound
export interface BlockOutbound extends OutboundBase {
  type: 'block';
}

// DNS outbound
export interface DNSOutbound extends OutboundBase {
  type: 'dns';
}

// SOCKS outbound
export interface SocksOutbound extends OutboundBase {
  type: 'socks';
  server: string;
  server_port: number;
  version?: '4' | '4a' | '5';
  username?: string;
  password?: string;
  network?: 'tcp' | 'udp';
  udp_over_tcp?: false | {
    enabled: true;
    version?: number;
  };
  detour?: string;
}

// HTTP outbound
export interface HTTPOutbound extends OutboundBase {
  type: 'http';
  server: string;
  server_port: number;
  username?: string;
  password?: string;
  path?: string;
  headers?: Record<string, string>;
  tls?: TLSConfig;
  detour?: string;
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
  network?: 'tcp' | 'udp';
  udp_over_tcp?: false | {
    enabled: true;
    version?: number;
  };
  multiplex?: MultiplexConfig;
  detour?: string;
}

// VMess outbound
export interface VMessOutbound extends OutboundBase {
  type: 'vmess';
  server: string;
  server_port: number;
  uuid: string;
  security?: 'auto' | 'aes-128-gcm' | 'chacha20-poly1305' | 'none' | 'zero' | 'aes-128-ctr' | string;
  alter_id?: number;
  global_padding?: boolean;
  authenticated_length?: boolean;
  packet_encoding?: string;
  network?: 'tcp' | 'udp';
  tls?: TLSConfig;
  transport?: TransportConfig;
  multiplex?: MultiplexConfig;
  detour?: string;
}

// VLESS outbound
export interface VLESSOutbound extends OutboundBase {
  type: 'vless';
  server: string;
  server_port: number;
  uuid: string;
  flow?: 'xtls-rprx-vision' | 'xtls-rprx-vision-udp443' | string;
  packet_encoding?: string;
  network?: 'tcp' | 'udp';
  tls?: TLSConfig;
  transport?: TransportConfig;
  multiplex?: MultiplexConfig;
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

// Hysteria outbound
export interface HysteriaOutbound extends OutboundBase {
  type: 'hysteria';
  server: string;
  server_port: number;
  server_ports?: string[];
  hop_interval?: string;
  up?: string;
  down?: string;
  up_mbps?: number;
  down_mbps?: number;
  obfs?: string;
  auth?: string;
  auth_str?: string;
  recv_window_conn?: number;
  recv_window?: number;
  disable_mtu_discovery?: boolean;
  network?: 'tcp' | 'udp';
  tls: TLSConfig;
  detour?: string;
}

// Hysteria2 outbound
export interface Hysteria2Outbound extends OutboundBase {
  type: 'hysteria2';
  server: string;
  server_port: number;
  server_ports?: string[];
  hop_interval?: string;
  up_mbps?: number;
  down_mbps?: number;
  obfs?: {
    type?: 'salamander';
    password: string;
  };
  password?: string;
  network?: 'tcp' | 'udp';
  tls?: TLSConfig;
  multiplex?: MultiplexConfig;
  brutal_debug?: boolean;
  detour?: string;
}

// TUIC outbound
export interface TUICOutbound extends OutboundBase {
  type: 'tuic';
  server: string;
  server_port: number;
  uuid: string;
  password?: string;
  congestion_control?: 'cubic' | 'new_reno' | 'bbr';
  udp_relay_mode?: 'native' | 'quic';
  udp_over_stream?: boolean;
  zero_rtt_handshake?: boolean;
  heartbeat?: string;
  network?: 'tcp' | 'udp';
  tls: TLSConfig;
  detour?: string;
}

// WireGuard outbound
export interface WireGuardOutbound extends OutboundBase {
  type: 'wireguard';
  server?: string;
  server_port?: number;
  system_interface?: boolean;
  gso?: boolean;
  interface_name?: string;
  local_address: string | string[];
  private_key: string;
  peer_public_key?: string;
  pre_shared_key?: string;
  peers?: Array<{
    server?: string;
    server_port?: number;
    public_key: string;
    pre_shared_key?: string;
    allowed_ips?: string[];
    reserved?: number[];
  }>;
  reserved?: number[];
  workers?: number;
  mtu?: number;
  network?: 'tcp' | 'udp';
  detour?: string;
}

// ShadowTLS outbound
export interface ShadowTLSOutbound extends OutboundBase {
  type: 'shadowtls';
  server: string;
  server_port: number;
  version: 1 | 2 | 3;
  password?: string;
  tls: TLSConfig;
  detour?: string;
}

// Tor outbound
export interface TorOutbound extends OutboundBase {
  type: 'tor';
  executable_path?: string;
  data_directory?: string;
  extra_args?: string[];
  torrc?: Record<string, unknown>;
  detour?: string;
}

// SSH outbound
export interface SSHOutbound extends OutboundBase {
  type: 'ssh';
  server: string;
  server_port: number;
  user?: string;
  password?: string;
  private_key?: string;
  private_key_path?: string;
  private_key_passphrase?: string;
  host_key?: string[];
  host_key_algorithms?: string[];
  client_version?: string;
  detour?: string;
}

// AnyTLS outbound
export interface AnyTLSOutbound extends OutboundBase {
  type: 'anytls';
  server: string;
  server_port: number;
  password: string;
  network?: 'tcp' | 'udp';
  tls?: TLSConfig;
  loss?: number;
  lazy?: boolean;
  corrupt?: number;
  delay?: number;
  jitter?: number;
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
  | SocksOutbound
  | HTTPOutbound
  | ShadowsocksOutbound
  | VMessOutbound
  | VLESSOutbound
  | TrojanOutbound
  | HysteriaOutbound
  | Hysteria2Outbound
  | TUICOutbound
  | WireGuardOutbound
  | ShadowTLSOutbound
  | TorOutbound
  | SSHOutbound
  | AnyTLSOutbound
  | GenericOutbound;

// ============================================================================
// TLS Configuration
// ============================================================================

export interface TLSConfig {
  enabled?: boolean;
  disable_sni?: boolean;
  server_name?: string;
  insecure?: boolean;
  alpn?: string[];
  min_version?: '1.0' | '1.1' | '1.2' | '1.3';
  max_version?: '1.0' | '1.1' | '1.2' | '1.3';
  cipher_suites?: string[];
  certificate?: string | string[];
  certificate_path?: string;
  key?: string | string[];
  key_path?: string;

  // ECH (Encrypted Client Hello)
  ech?: {
    enabled: boolean;
    pq_signature_schemes_enabled?: boolean;
    dynamic_record_sizing_disabled?: boolean;
    config?: string[];
    config_path?: string;
  };

  // uTLS fingerprint
  utls?: {
    enabled: boolean;
    fingerprint: 'chrome' | 'firefox' | 'edge' | 'safari' | '360' | 'qq' | 'ios' | 'android' | 'random' | 'randomized' | string;
  };

  // Reality (for server)
  acme?: {
    domain: string | string[];
    data_directory?: string;
    default_server_name?: string;
    email?: string;
    provider?: 'letsencrypt' | 'zerossl' | string;
    disable_http_challenge?: boolean;
    disable_tls_alpn_challenge?: boolean;
    alternative_http_port?: number;
    alternative_tls_port?: number;
    external_account?: {
      key_id: string;
      mac_key: string;
    };
    dns01_challenge?: {
      provider: string;
      [key: string]: unknown;
    };
  };

  // Reality for outbound
  reality?: {
    enabled: boolean;
    public_key?: string;
    short_id?: string;
  };

  // Reality for inbound
  reality_server?: {
    enabled: boolean;
    handshake: {
      server: string;
      server_port: number;
    };
    private_key: string;
    short_id: string | string[];
    max_time_difference?: string;
  };

  // Fragment (1.12.0+)
  fragment?: boolean;
  fragment_fallback_delay?: string;
  record_fragment?: boolean;
}

// ============================================================================
// Transport Configuration (V2Ray Transport)
// ============================================================================

export interface HTTPTransportConfig {
  type: 'http';
  host?: string | string[];
  path?: string;
  method?: string;
  headers?: Record<string, string>;
  idle_timeout?: string;
  ping_timeout?: string;
}

export interface WebSocketTransportConfig {
  type: 'ws';
  path?: string;
  headers?: Record<string, string>;
  max_early_data?: number;
  early_data_header_name?: string;
}

export interface QUICTransportConfig {
  type: 'quic';
}

export interface GRPCTransportConfig {
  type: 'grpc';
  service_name?: string;
  idle_timeout?: string;
  ping_timeout?: string;
  permit_without_stream?: boolean;
}

export interface HTTPUpgradeTransportConfig {
  type: 'httpupgrade';
  host?: string;
  path?: string;
  headers?: Record<string, string>;
}

export type TransportConfig =
  | HTTPTransportConfig
  | WebSocketTransportConfig
  | QUICTransportConfig
  | GRPCTransportConfig
  | HTTPUpgradeTransportConfig;

// ============================================================================
// Multiplex Configuration
// ============================================================================

export interface MultiplexConfig {
  enabled: boolean;
  protocol?: 'smux' | 'yamux' | 'h2mux';
  max_connections?: number;
  min_streams?: number;
  max_streams?: number;
  max_concurrent_streams?: number;
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
  auto_redirect_iproute2_fallback_rule_index?: number;
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
// Dial Fields (Shared)
// ============================================================================

export interface DialFields {
  bind_interface?: string;
  inet4_bind_address?: string;
  inet6_bind_address?: string;
  routing_mark?: number;
  reuse_addr?: boolean;
  connect_timeout?: string;
  tcp_fast_open?: boolean;
  tcp_multi_path?: boolean;
  udp_fragment?: boolean;
  domain_strategy?: 'default' | 'prefer_ipv4' | 'prefer_ipv6' | 'ipv4_only' | 'ipv6_only';
  fallback_delay?: string;
}

// ============================================================================
// Main Config Interface
// ============================================================================

export interface SingBoxConfig {
  log?: LogConfig;
  dns?: DNSConfig;
  ntp?: NTPConfig;
  certificate?: {
    path: string;
    key: string;
    key_path?: string;
    certificate_path?: string;
  }[];
  endpoints?: Array<{
    type: 'wireguard';
    tag: string;
    [key: string]: unknown;
  }>;
  inbounds: Inbound[];
  outbounds: Outbound[];
  route?: RouteConfig;
  services?: Array<{
    type: string;
    [key: string]: unknown;
  }>;
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
