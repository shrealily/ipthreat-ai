export type NavPageId = 
  | 'dashboard'
  | 'live-threats'
  | 'investigation'
  | 'network-map'
  | 'simulation'
  | 'incidents'
  | 'threat-history'
  | 'model-monitoring'
  | 'how-to-use'
  | 'settings';

export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ThreatStatus = 'detected' | 'investigating' | 'confirmed' | 'contained' | 'resolved';

export type ThreatDirection = 'Inbound' | 'Outbound' | 'Unidirectional';

export interface ThreatExplanation {
  factor: string;
  description: string;
  weight: number; // e.g., 0 - 100 or relative weight
}

export interface ThreatDnaMetrics {
  packetFrequency: number;  // 0 - 100
  portDiversity: number;    // 0 - 100
  destinationSpread: number;// 0 - 100
  trafficVolume: number;    // 0 - 100
  protocolAnomaly: number;  // 0 - 100
}

export interface Threat {
  id: string;
  detectedAt: string;
  threatType: string;
  sourceIP: string;
  destinationIP: string;
  protocol: string;
  direction: ThreatDirection;
  severity: ThreatSeverity;
  riskScore: number;     // 0 - 100
  aiConfidence: number;  // 0 - 100
  status: ThreatStatus;
  durationSeconds: number;
  trafficVolumeMB: number;
  sourcePort: number;
  destinationPort: number;
  packetCount: number;
  explanations: ThreatExplanation[];
  dnaMetrics: ThreatDnaMetrics;
  recommendedActions: string[];
}

export interface NavItemConfig {
  id: NavPageId;
  label: string;
  description: string;
  badge?: string | number;
}

export type NetworkNodeType = 'internal' | 'server' | 'router' | 'external' | 'diode';

export interface NetworkNode {
  id: string;
  label: string;
  ip: string;
  type: NetworkNodeType;
  zone: string;
  x: number;
  y: number;
  isSuspicious?: boolean;
  threatId?: string;
  threatType?: string;
  severity?: ThreatSeverity;
  statusText?: string;
  macAddress?: string;
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  isSuspicious?: boolean;
  isUnidirectional?: boolean;
  label?: string;
  protocol?: string;
}
