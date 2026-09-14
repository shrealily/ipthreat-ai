import React, { useState, useMemo } from 'react';
import {
  Network,
  Laptop,
  Server,
  Globe,
  Radio,
  Layers,
  AlertTriangle,
  ShieldAlert,
  Shield,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  X,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Threat, NetworkNode, NetworkLink, NetworkNodeType, ThreatSeverity } from '../types';

interface NetworkMapViewProps {
  threats: Threat[];
  onNavigateToInvestigation?: (threatId: string) => void;
}

// Fixed topology layout coordinates designed for clarity across security zones
const INITIAL_NODES: NetworkNode[] = [
  // ZONE 1: Secure OT Enclave (Air-Gapped SCADA)
  {
    id: 'plc-01',
    label: 'Turbine Controller 01 (PLC)',
    ip: '10.100.1.5',
    type: 'server',
    zone: 'Secure OT Enclave',
    x: 90,
    y: 120,
    isSuspicious: true,
    threatId: 'DG-THREAT-002',
    threatType: 'Modbus Register Injection',
    severity: 'critical',
    statusText: 'Unauthorized Force Single Coil commands detected targeting safety holding registers',
    macAddress: '00:1E:C9:84:11:05',
  },
  {
    id: 'plc-02',
    label: 'Safety Instrument Interlock',
    ip: '10.100.1.8',
    type: 'server',
    zone: 'Secure OT Enclave',
    x: 90,
    y: 250,
    macAddress: '00:1E:C9:84:11:08',
  },
  {
    id: 'rtu-03',
    label: 'Cooling Subsystem RTU',
    ip: '10.100.1.14',
    type: 'server',
    zone: 'Secure OT Enclave',
    x: 90,
    y: 380,
    macAddress: '00:1E:C9:84:11:14',
  },
  {
    id: 'eng-ws-01',
    label: 'Air-Gapped Workstation',
    ip: '10.100.2.20',
    type: 'internal',
    zone: 'Secure OT Enclave',
    x: 90,
    y: 510,
    macAddress: '00:1E:C9:84:12:20',
  },
  {
    id: 'ot-switch-01',
    label: 'OT Enclave Core Switch',
    ip: '10.100.0.1',
    type: 'router',
    zone: 'Secure OT Enclave',
    x: 230,
    y: 310,
    macAddress: '00:1A:2B:3C:00:01',
  },

  // ZONE 2: Data Diode Boundary
  {
    id: 'diode-tx',
    label: 'IPthreat Diode TX (Optical Transmitter)',
    ip: '10.240.0.1',
    type: 'diode',
    zone: 'Data Diode Boundary',
    x: 370,
    y: 230,
    statusText: 'Physical LED optical transmitter active; zero reverse physical transmission line',
    macAddress: '00:50:56:A1:00:01',
  },
  {
    id: 'diode-rx',
    label: 'IPthreat Diode RX (Optical Receiver)',
    ip: '10.240.0.2',
    type: 'diode',
    zone: 'Data Diode Boundary',
    x: 500,
    y: 230,
    statusText: 'Photodiode sensor active; receives unidirectional photons without return channel',
    macAddress: '00:50:56:A1:00:02',
  },
  {
    id: 'diode-proxy',
    label: 'Diode Ingestion Proxy',
    ip: '10.240.0.10',
    type: 'server',
    zone: 'Data Diode Boundary',
    x: 435,
    y: 380,
    macAddress: '00:50:56:A1:00:10',
  },

  // ZONE 3: Enterprise DMZ & Core Servers
  {
    id: 'dmz-router',
    label: 'DMZ Core Gateway',
    ip: '10.200.0.1',
    type: 'router',
    zone: 'Enterprise DMZ',
    x: 630,
    y: 250,
    macAddress: '00:25:B5:12:00:01',
  },
  {
    id: 'server-historian',
    label: 'SCADA Historian DB',
    ip: '10.200.4.12',
    type: 'server',
    zone: 'Enterprise DMZ',
    x: 630,
    y: 110,
    macAddress: '00:25:B5:12:04:12',
  },
  {
    id: 'server-siem',
    label: 'SOC SIEM Collector',
    ip: '10.200.4.50',
    type: 'server',
    zone: 'Enterprise DMZ',
    x: 740,
    y: 140,
    macAddress: '00:25:B5:12:04:50',
  },
  {
    id: 'server-auth',
    label: 'Auth & Kerberos Server',
    ip: '10.200.2.5',
    type: 'server',
    zone: 'Enterprise DMZ',
    x: 630,
    y: 390,
    macAddress: '00:25:B5:12:02:05',
  },

  // ZONE 4: Enterprise LAN
  {
    id: 'lan-switch',
    label: 'LAN Aggregation Switch',
    ip: '10.240.12.1',
    type: 'router',
    zone: 'Enterprise LAN',
    x: 520,
    y: 520,
    macAddress: '00:30:F2:88:00:01',
  },
  {
    id: 'client-compromised',
    label: 'Engineering Workstation',
    ip: '10.240.12.18',
    type: 'internal',
    zone: 'Enterprise LAN',
    x: 370,
    y: 540,
    isSuspicious: true,
    threatId: 'DG-THREAT-001',
    threatType: 'Anomalous Optical Egress Rate',
    severity: 'critical',
    statusText: 'Originating source of continuous 1.2 Gbps UDP burst exfiltration attempt',
    macAddress: '00:30:F2:88:12:18',
  },
  {
    id: 'client-ops',
    label: 'Control Room Console',
    ip: '10.240.12.22',
    type: 'internal',
    zone: 'Enterprise LAN',
    x: 640,
    y: 520,
    macAddress: '00:30:F2:88:12:22',
  },
  {
    id: 'client-field',
    label: 'Field Tech Laptop',
    ip: '10.240.12.45',
    type: 'internal',
    zone: 'Enterprise LAN',
    x: 730,
    y: 440,
    macAddress: '00:30:F2:88:12:45',
  },
  {
    id: 'client-office',
    label: 'Admin Workstation',
    ip: '10.240.12.89',
    type: 'internal',
    zone: 'Enterprise LAN',
    x: 730,
    y: 550,
    macAddress: '00:30:F2:88:12:89',
  },

  // ZONE 5: External Untrusted WAN
  {
    id: 'edge-gw',
    label: 'Perimeter Border Gateway',
    ip: '198.51.100.1',
    type: 'router',
    zone: 'External WAN',
    x: 850,
    y: 280,
    macAddress: '00:60:2F:99:00:01',
  },
  {
    id: 'ext-c2',
    label: 'Suspected C2 Exfiltration Drop',
    ip: '198.51.100.42',
    type: 'external',
    zone: 'External WAN',
    x: 960,
    y: 150,
    isSuspicious: true,
    threatId: 'DG-THREAT-001',
    threatType: 'Exfiltration Destination Drop',
    severity: 'critical',
    statusText: 'Exfiltration recipient receiving encrypted high-entropy UDP burst streams',
  },
  {
    id: 'ext-flooder',
    label: 'External UDP Flooder / Botnet',
    ip: '203.0.113.88',
    type: 'external',
    zone: 'External WAN',
    x: 960,
    y: 380,
    isSuspicious: true,
    threatId: 'DG-THREAT-003',
    threatType: 'DDoS / Diode Buffer Overflow',
    severity: 'critical',
    statusText: 'Generating non-standard fragmented UDP bursts at optical RX boundary',
  },
  {
    id: 'ext-cloud',
    label: 'Authorized Cloud Telemetry Sync',
    ip: '203.0.113.15',
    type: 'external',
    zone: 'External WAN',
    x: 960,
    y: 510,
  },
];

const INITIAL_LINKS: NetworkLink[] = [
  // OT Enclave links
  { id: 'l-ot-1', source: 'ot-switch-01', target: 'plc-01', isSuspicious: true, protocol: 'MODBUS/TCP' },
  { id: 'l-ot-2', source: 'ot-switch-01', target: 'plc-02', protocol: 'MODBUS/TCP' },
  { id: 'l-ot-3', source: 'ot-switch-01', target: 'rtu-03', protocol: 'DNP3' },
  { id: 'l-ot-4', source: 'ot-switch-01', target: 'eng-ws-01', protocol: 'SSH' },

  // OT to Diode TX (Strict physical one-way feed)
  { id: 'l-ot-diode', source: 'ot-switch-01', target: 'diode-tx', protocol: 'RAW ETHERNET', label: 'Egress Feed' },

  // Diode TX to Diode RX (The physical optical one-way link)
  {
    id: 'l-diode-beam',
    source: 'diode-tx',
    target: 'diode-rx',
    isUnidirectional: true,
    protocol: 'OPTICAL FIBER (TX ONLY)',
    label: '1-Way Optical Beam',
  },

  // Diode RX into DMZ
  { id: 'l-diode-dmz', source: 'diode-rx', target: 'dmz-router', protocol: 'RAW ETHERNET' },
  { id: 'l-diode-proxy', source: 'diode-rx', target: 'diode-proxy', protocol: 'INGEST STREAM' },
  { id: 'l-proxy-dmz', source: 'diode-proxy', target: 'dmz-router', protocol: 'INTERNAL DB' },

  // DMZ Server links
  { id: 'l-dmz-hist', source: 'dmz-router', target: 'server-historian', protocol: 'POSTGRES / TLS' },
  { id: 'l-dmz-siem', source: 'dmz-router', target: 'server-siem', protocol: 'SYSLOG / TLS' },
  { id: 'l-dmz-auth', source: 'dmz-router', target: 'server-auth', protocol: 'LDAP / KERBEROS' },

  // DMZ to LAN
  { id: 'l-dmz-lan', source: 'dmz-router', target: 'lan-switch', protocol: '802.1Q TRUNK' },

  // LAN Client links
  { id: 'l-lan-comp', source: 'lan-switch', target: 'client-compromised', isSuspicious: true, protocol: 'UDP BURST' },
  { id: 'l-lan-ops', source: 'lan-switch', target: 'client-ops', protocol: 'HTTPS' },
  { id: 'l-lan-field', source: 'lan-switch', target: 'client-field', protocol: 'HTTPS' },
  { id: 'l-lan-office', source: 'lan-switch', target: 'client-office', protocol: 'RDP / TLS' },

  // Compromised client exfiltration link heading towards boundary
  { id: 'l-comp-exfil', source: 'client-compromised', target: 'diode-tx', isSuspicious: true, protocol: 'UDP EXFIL', label: 'Exfiltration Burst' },

  // DMZ to Edge Gateway
  { id: 'l-dmz-edge', source: 'dmz-router', target: 'edge-gw', protocol: 'BGP / ROUTED' },

  // Edge to External
  { id: 'l-edge-c2', source: 'edge-gw', target: 'ext-c2', isSuspicious: true, protocol: 'ENCRYPTED ARCHIVE', label: 'Malicious Drop' },
  { id: 'l-edge-flood', source: 'edge-gw', target: 'ext-flooder', isSuspicious: true, protocol: 'UDP FLOOD', label: 'DDoS Stream' },
  { id: 'l-edge-cloud', source: 'edge-gw', target: 'ext-cloud', protocol: 'HTTPS TLS 1.3' },
];

export const NetworkMapView: React.FC<NetworkMapViewProps> = ({
  threats,
  onNavigateToInvestigation,
}) => {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(
    INITIAL_NODES.find((n) => n.id === 'client-compromised') || null
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [animatePulses, setAnimatePulses] = useState<boolean>(true);

  // Drag and touch tracking refs
  const dragStartRef = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const touchStateRef = React.useRef<{
    mode: 'none' | 'pan' | 'pinch';
    initialDist: number;
    initialZoom: number;
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  }>({
    mode: 'none',
    initialDist: 0,
    initialZoom: 1,
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  // Map nodes dictionary for quick access
  const nodeMap = useMemo(() => {
    const map = new Map<string, NetworkNode>();
    INITIAL_NODES.forEach((n) => map.set(n.id, n));
    return map;
  }, []);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return INITIAL_NODES.filter((n) => {
      if (filterSuspiciousOnly && !n.isSuspicious) return false;
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.label.toLowerCase().includes(q) ||
          n.ip.toLowerCase().includes(q) ||
          n.zone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filterType, filterSuspiciousOnly, searchQuery]);

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes]
  );

  // Count metrics
  const suspiciousCount = INITIAL_NODES.filter((n) => n.isSuspicious).length;
  const totalNodesCount = INITIAL_NODES.length;
  const totalLinksCount = INITIAL_LINKS.length;

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.0, Math.round((z + 0.15) * 100) / 100));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, Math.round((z - 0.15) * 100) / 100));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Touch event handlers for mobile pinch-to-zoom and pan
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStateRef.current = {
        mode: 'pan',
        initialDist: 0,
        initialZoom: zoomLevel,
        startX: touch.clientX,
        startY: touch.clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
      };
    } else if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      touchStateRef.current = {
        mode: 'pinch',
        initialDist: dist,
        initialZoom: zoomLevel,
        startX: midX,
        startY: midY,
        initialPanX: pan.x,
        initialPanY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStateRef.current.mode === 'pan' && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStateRef.current.startX;
      const dy = touch.clientY - touchStateRef.current.startY;
      setPan({
        x: touchStateRef.current.initialPanX + dx,
        y: touchStateRef.current.initialPanY + dy,
      });
    } else if (touchStateRef.current.mode === 'pinch' && e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = dist / Math.max(1, touchStateRef.current.initialDist);
      const newZoom = Math.min(2.5, Math.max(0.6, touchStateRef.current.initialZoom * factor));
      setZoomLevel(Math.round(newZoom * 100) / 100);

      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      const dx = midX - touchStateRef.current.startX;
      const dy = midY - touchStateRef.current.startY;
      setPan({
        x: touchStateRef.current.initialPanX + dx,
        y: touchStateRef.current.initialPanY + dy,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current.mode = 'none';
  };

  // Mouse pan handlers for desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'svg' || target.tagName === 'DIV' || target.id === 'network-canvas-bg') {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper to render icon for node type
  const renderNodeIcon = (type: NetworkNodeType, isSuspicious?: boolean) => {
    if (isSuspicious) {
      return <AlertTriangle className="w-4 h-4 text-[#B94A48]" />;
    }
    switch (type) {
      case 'internal':
        return <Laptop className="w-4 h-4 text-[#173F4F]" />;
      case 'server':
        return <Server className="w-4 h-4 text-[#4A6572]" />;
      case 'router':
        return <Network className="w-4 h-4 text-[#C87545]" />;
      case 'diode':
        return <Zap className="w-4 h-4 text-[#173F4F]" />;
      case 'external':
        return <Globe className="w-4 h-4 text-[#718096]" />;
      default:
        return <Server className="w-4 h-4 text-[#173F4F]" />;
    }
  };

  // Helper to get node color classes
  const getNodeColorTheme = (node: NetworkNode) => {
    if (node.isSuspicious) {
      return {
        bg: 'bg-[#FEF2F2]',
        border: 'border-[#B94A48]',
        glow: 'shadow-xs',
        text: 'text-[#B94A48]',
        ring: 'ring-[#B94A48]/30',
      };
    }
    if (node.type === 'diode') {
      return {
        bg: 'bg-[#E6F4F1]',
        border: 'border-[#173F4F]',
        glow: 'shadow-xs',
        text: 'text-[#173F4F]',
        ring: 'ring-[#173F4F]/30',
      };
    }
    switch (node.type) {
      case 'internal':
        return {
          bg: 'bg-white',
          border: 'border-[#CBD5E1]',
          glow: 'shadow-xs',
          text: 'text-[#263238]',
          ring: 'ring-[#173F4F]/20',
        };
      case 'server':
        return {
          bg: 'bg-white',
          border: 'border-[#CBD5E1]',
          glow: 'shadow-xs',
          text: 'text-[#263238]',
          ring: 'ring-[#4A6572]/20',
        };
      case 'router':
        return {
          bg: 'bg-white',
          border: 'border-[#CBD5E1]',
          glow: 'shadow-xs',
          text: 'text-[#263238]',
          ring: 'ring-[#C87545]/20',
        };
      case 'external':
      default:
        return {
          bg: 'bg-[#F6F7F5]',
          border: 'border-[#CBD5E1]',
          glow: 'shadow-none',
          text: 'text-[#718096]',
          ring: 'ring-slate-400/20',
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="network-map-view">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#DCE3E3]">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#173F4F]/10 border border-[#173F4F]/20 text-[#173F4F]">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#263238] font-display flex items-center gap-2.5">
                <span>Network Topology Map</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20 font-normal">
                  Air-Gapped & Diode Topology
                </span>
              </h1>
              <p className="text-xs md:text-sm text-[#718096] mt-0.5">
                Physical and optical layer visualization mapping air-gapped industrial SCADA enclaves, unidirectional diode barriers, and WAN boundaries.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#173F4F]"></span>
            <span className="text-[#718096]">Nodes:</span>
            <span className="font-bold text-[#263238]">{totalNodesCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4A6572]"></span>
            <span className="text-[#718096]">Links:</span>
            <span className="font-bold text-[#263238]">{totalLinksCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#B94A48]/10 border border-[#B94A48]/30 text-[#B94A48] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B94A48] animate-ping"></span>
            <span className="font-bold">{suspiciousCount} Suspicious Nodes</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#173F4F]/10 border border-[#173F4F]/20 text-[#173F4F] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#173F4F]" />
            <span>One-Way Diode: <strong>Enforced</strong></span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#DCE3E3] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Left: Filter by Node Type */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#718096] flex items-center gap-1.5 pl-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#173F4F]" />
            <span>Filter:</span>
          </span>

          {[
            { id: 'all', label: 'All Nodes' },
            { id: 'internal', label: 'Clients' },
            { id: 'server', label: 'Servers' },
            { id: 'router', label: 'Routers' },
            { id: 'external', label: 'External IPs' },
          ].map((typeBtn) => (
            <button
              key={typeBtn.id}
              type="button"
              onClick={() => setFilterType(typeBtn.id)}
              className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono transition-all cursor-pointer ${
                filterType === typeBtn.id
                  ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                  : 'bg-[#F6F7F5] text-[#718096] hover:text-[#263238] border border-[#DCE3E3]'
              }`}
            >
              {typeBtn.label}
            </button>
          ))}

          {/* Toggle Suspicious Only */}
          <button
            type="button"
            onClick={() => setFilterSuspiciousOnly(!filterSuspiciousOnly)}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              filterSuspiciousOnly
                ? 'bg-[#B94A48]/15 text-[#B94A48] border border-[#B94A48]/40 font-bold'
                : 'bg-[#F6F7F5] text-[#718096] hover:text-[#263238] border border-[#DCE3E3]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#B94A48]" />
            <span>Suspicious Only ({suspiciousCount})</span>
          </button>
        </div>

        {/* Right: Search & View Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap sm:flex-nowrap">
          {/* Quick Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search IP, node, zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-2 min-h-[40px] rounded-lg bg-[#F6F7F5] border border-[#DCE3E3] text-xs font-mono text-[#263238] placeholder-[#718096] focus:outline-none focus:border-[#173F4F] w-full sm:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#263238] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#718096] hover:text-[#263238] active:bg-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-[#263238] min-w-[42px] text-center font-semibold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#718096] hover:text-[#263238] active:bg-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#718096] hover:text-[#263238] active:bg-[#E2E8F0] rounded-lg transition-colors border-l border-[#DCE3E3] ml-0.5 cursor-pointer"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Pulse Animation Toggle */}
          <button
            type="button"
            onClick={() => setAnimatePulses(!animatePulses)}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
              animatePulses
                ? 'bg-[#173F4F]/10 text-[#173F4F] border-[#173F4F]/25 font-semibold'
                : 'bg-[#F6F7F5] text-[#718096] border-[#DCE3E3]'
            }`}
            title="Toggle animated traffic signals along highlighted paths"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Motion</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspection Sidebar Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Topology Interactive SVG Canvas (8 cols on XL) */}
        <div id="network-map-canvas" className="xl:col-span-8 rounded-2xl bg-[#F8FAF9] border border-[#DCE3E3] shadow-xs relative overflow-hidden flex flex-col min-h-[580px]">
          {/* Subtle Canvas Background Watermark & Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>

          {/* Zone Label Watermarks across top */}
          <div className="absolute top-2.5 inset-x-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#718096] pointer-events-none select-none z-0">
            <span className="text-[#4A6572] font-semibold">1. OT Enclave</span>
            <span className="text-[#173F4F] font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#173F4F]" />
              2. Optical Diode
            </span>
            <span className="text-[#718096] font-semibold">3. Corporate DMZ</span>
            <span className="text-[#B94A48] font-semibold">4. External WAN</span>
          </div>

          {/* Mobile Gestures Indicator */}
          <div className="absolute bottom-16 right-4 z-10 pointer-events-none bg-white/90 backdrop-blur-xs border border-[#DCE3E3] px-2.5 py-1 rounded-full text-[10px] font-mono text-[#718096] shadow-xs flex items-center gap-1.5 sm:hidden">
            <span>Pinch to zoom • Drag to pan</span>
          </div>

          {/* Interactive SVG Container with Touch and Mouse Pan/Zoom */}
          <div
            className="flex-1 w-full overflow-hidden flex items-center justify-center p-2 touch-none relative select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <svg
              viewBox="0 0 1060 620"
              className="w-full h-auto max-h-[620px] transition-transform duration-75 select-none overflow-visible"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
              }}
            >
              <defs>
                {/* Arrowhead marker for Unidirectional Link */}
                <marker
                  id="arrow-cyan"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#173F4F" />
                </marker>

                {/* Arrowhead marker for Suspicious Flow */}
                <marker
                  id="arrow-rose"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#B94A48" />
                </marker>
              </defs>

              {/* Zone Background Panels */}
              {/* Zone 1: OT Enclave */}
              <rect
                x="20"
                y="60"
                width="280"
                height="530"
                rx="16"
                fill="#F1F5F5"
                fillOpacity="0.8"
                stroke="#CBD5E1"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="35" y="85" fill="#718096" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SECURE SCADA ENCLAVE
              </text>

              {/* Zone 2: Physical Diode Barrier */}
              <rect
                x="325"
                y="150"
                width="245"
                height="310"
                rx="16"
                fill="#E6F4F1"
                fillOpacity="0.8"
                stroke="#173F4F"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text x="340" y="175" fill="#173F4F" fontSize="10" fontFamily="monospace" fontWeight="bold">
                DATA DIODE BARRIER (ONE-WAY)
              </text>

              {/* Zone 3: Enterprise DMZ & Servers */}
              <rect
                x="590"
                y="60"
                width="220"
                height="530"
                rx="16"
                fill="#F8FAF9"
                fillOpacity="0.9"
                stroke="#CBD5E1"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="605" y="85" fill="#718096" fontSize="10" fontFamily="monospace" fontWeight="bold">
                ENTERPRISE DMZ & LAN
              </text>

              {/* Zone 4: External WAN */}
              <rect
                x="830"
                y="60"
                width="210"
                height="530"
                rx="16"
                fill="#FEF2F2"
                fillOpacity="0.6"
                stroke="#FECACA"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text x="845" y="85" fill="#B94A48" fontSize="10" fontFamily="monospace" fontWeight="bold">
                EXTERNAL WAN (UNTRUSTED)
              </text>

              {/* Render Communication Links */}
              {INITIAL_LINKS.map((link) => {
                const sourceNode = nodeMap.get(link.source);
                const targetNode = nodeMap.get(link.target);
                if (!sourceNode || !targetNode) return null;

                const isVisible =
                  filteredNodeIds.has(sourceNode.id) && filteredNodeIds.has(targetNode.id);

                if (!isVisible) return null;

                const isSuspiciousLink = link.isSuspicious;
                const isDiodeLink = link.isUnidirectional;

                // Path stroke coordinates
                const x1 = sourceNode.x;
                const y1 = sourceNode.y;
                const x2 = targetNode.x;
                const y2 = targetNode.y;

                if (isDiodeLink) {
                  // Physical Diode Beam (Optical Laser Channel)
                  return (
                    <g key={link.id}>
                      {/* Glow backdrop line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#173F4F"
                        strokeWidth="4"
                        strokeOpacity="0.15"
                      />
                      {/* Core laser beam */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#173F4F"
                        strokeWidth="2.5"
                        markerEnd="url(#arrow-cyan)"
                      />
                      {/* Animated photon pulses along beam */}
                      {animatePulses && (
                        <circle r="4" fill="#173F4F">
                          <animateMotion
                            path={`M ${x1} ${y1} L ${x2} ${y2}`}
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      {/* Diode Label */}
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 10}
                        fill="#173F4F"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ONE-WAY OPTICAL BEAM
                      </text>
                    </g>
                  );
                }

                if (isSuspiciousLink) {
                  // Suspicious Anomaly / Exfiltration Path
                  return (
                    <g key={link.id}>
                      {/* Dashed animated stroke */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#B94A48"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        markerEnd="url(#arrow-rose)"
                      >
                        {animatePulses && (
                          <animate
                            attributeName="stroke-dashoffset"
                            from="20"
                            to="0"
                            dur="0.8s"
                            repeatCount="indefinite"
                          />
                        )}
                      </line>
                      {/* Red anomaly particle */}
                      {animatePulses && (
                        <circle r="3.5" fill="#B94A48">
                          <animateMotion
                            path={`M ${x1} ${y1} L ${x2} ${y2}`}
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      {link.label && (
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2 - 8}
                          fill="#B94A48"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {link.label}
                        </text>
                      )}
                    </g>
                  );
                }

                // Normal Communication Link
                return (
                  <line
                    key={link.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    strokeOpacity="0.9"
                  />
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const styling = getNodeColorTheme(node);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Invisible Hit Area (≥ 44px for comfortable touch selection on mobile) */}
                    <rect
                      x="-26"
                      y="-26"
                      width="52"
                      height="52"
                      fill="transparent"
                      className="cursor-pointer"
                    />

                    {/* Pulsing ring for suspicious nodes */}
                    {node.isSuspicious && animatePulses && (
                      <circle
                        r="25"
                        fill="none"
                        stroke="#B94A48"
                        strokeWidth="1.5"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer focus halo if selected */}
                    {isSelected && (
                      <circle
                        r="28"
                        fill="none"
                        stroke="#173F4F"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Main Node Shape Container */}
                    <rect
                      x="-20"
                      y="-20"
                      width="40"
                      height="40"
                      rx="10"
                      className={`transition-all duration-150 ${styling.bg} ${styling.border} group-hover:scale-105`}
                      fill={
                        node.isSuspicious
                          ? 'color-mix(in srgb, var(--sev-crit) 15%, transparent)'
                          : node.type === 'diode'
                          ? 'color-mix(in srgb, var(--primary-teal) 15%, transparent)'
                          : 'var(--bg-card)'
                      }
                      stroke={
                        node.isSuspicious
                          ? 'var(--sev-crit)'
                          : isSelected
                          ? 'var(--primary-teal)'
                          : node.type === 'diode'
                          ? 'var(--primary-teal)'
                          : 'var(--border-app)'
                      }
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Node Icon Element */}
                    <g transform="translate(-8, -8)" className="pointer-events-none">
                      {node.isSuspicious ? (
                        <AlertTriangle className="w-4 h-4 text-[#B94A48]" />
                      ) : node.type === 'diode' ? (
                        <Zap className="w-4 h-4 text-[#173F4F]" />
                      ) : node.type === 'server' ? (
                        <Server className="w-4 h-4 text-[#4A6572]" />
                      ) : node.type === 'internal' ? (
                        <Laptop className="w-4 h-4 text-[#173F4F]" />
                      ) : node.type === 'router' ? (
                        <Network className="w-4 h-4 text-[#C87545]" />
                      ) : (
                        <Globe className="w-4 h-4 text-[#718096]" />
                      )}
                    </g>

                    {/* Node Label Below */}
                    <text
                      x="0"
                      y="32"
                      textAnchor="middle"
                      fill={node.isSuspicious ? 'var(--sev-crit)' : 'var(--text-main)'}
                      fontSize="9.5"
                      fontFamily="sans-serif"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
                    </text>

                    {/* Node IP Below Label */}
                    <text
                      x="0"
                      y="44"
                      textAnchor="middle"
                      fill={node.isSuspicious ? 'var(--sev-crit)' : 'var(--text-muted)'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      {node.ip}
                    </text>

                    {/* Small Alert Tag for Suspicious */}
                    {node.isSuspicious && (
                      <g transform="translate(10, -22)">
                        <circle r="7" fill="var(--sev-crit)" stroke="var(--bg-card)" strokeWidth="1.5" />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill="var(--bg-card)"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          !
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Interactive Legend */}
          <div className="p-4 border-t border-[#DCE3E3] bg-[#F6F7F5] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            {/* Node Types Legend */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#718096] font-bold uppercase text-[10px] tracking-wider">
                Node Types:
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-white border border-[#CBD5E1] flex items-center justify-center">
                  <Laptop className="w-2 h-2 text-[#173F4F]" />
                </div>
                <span className="text-[#263238] text-[11px]">Internal Client</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-white border border-[#CBD5E1] flex items-center justify-center">
                  <Server className="w-2 h-2 text-[#4A6572]" />
                </div>
                <span className="text-[#263238] text-[11px]">Server / PLC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-white border border-[#CBD5E1] flex items-center justify-center">
                  <Network className="w-2 h-2 text-[#C87545]" />
                </div>
                <span className="text-[#263238] text-[11px]">Router / Gateway</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-[#E6F4F1] border border-[#173F4F] flex items-center justify-center">
                  <Zap className="w-2 h-2 text-[#173F4F]" />
                </div>
                <span className="text-[#173F4F] text-[11px] font-semibold">Data Diode Unit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-[#F6F7F5] border border-[#CBD5E1] flex items-center justify-center">
                  <Globe className="w-2 h-2 text-[#718096]" />
                </div>
                <span className="text-[#718096] text-[11px]">External WAN</span>
              </div>
            </div>

            {/* Path Styles Legend */}
            <div className="flex flex-wrap items-center gap-4 border-l border-[#DCE3E3] pl-4">
              <span className="text-[#718096] font-bold uppercase text-[10px] tracking-wider">
                Paths:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-0.5 bg-[#CBD5E1] inline-block"></span>
                <span className="text-[#718096] text-[11px]">Nominal Link</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-1 bg-[#173F4F] inline-block"></span>
                <span className="text-[#173F4F] text-[11px] font-semibold">Unidirectional Optical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-1 bg-[#B94A48] inline-block border-b border-dashed border-[#B94A48]"></span>
                <span className="text-[#B94A48] text-[11px] font-bold">Suspicious Anomaly Path</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Inspection Tooltip / Popover Panel (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-4">
          {selectedNode ? (
            <div
              className={`p-5 rounded-2xl bg-white border shadow-md transition-all space-y-4 ${
                selectedNode.isSuspicious
                  ? 'border-[#B94A48]/50 shadow-[0_0_20px_rgba(185,74,72,0.15)] bg-gradient-to-b from-[#FEF2F2] to-white'
                  : 'border-[#DCE3E3]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DCE3E3]">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      selectedNode.isSuspicious
                        ? 'bg-[#FEF2F2] border-[#B94A48]/30 text-[#B94A48]'
                        : selectedNode.type === 'diode'
                        ? 'bg-[#E6F4F1] border-[#173F4F]/30 text-[#173F4F]'
                        : 'bg-[#F6F7F5] border-[#DCE3E3] text-[#263238]'
                    }`}
                  >
                    {renderNodeIcon(selectedNode.type, selectedNode.isSuspicious)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#263238] font-display leading-tight">
                      {selectedNode.label}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs font-bold text-[#173F4F]">
                        {selectedNode.ip}
                      </span>
                      {selectedNode.isSuspicious && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B94A48]/15 text-[#B94A48] border border-[#B94A48]/30 font-bold">
                          SUSPICIOUS
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg text-[#718096] hover:text-[#263238] hover:bg-[#F6F7F5] cursor-pointer"
                  title="Dismiss inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Node Metadata Details */}
              <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] space-y-0.5">
                  <span className="text-[10px] text-[#718096] uppercase">Device Type</span>
                  <p className="font-bold text-[#263238] capitalize">{selectedNode.type}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] space-y-0.5">
                  <span className="text-[10px] text-[#718096] uppercase">Security Zone</span>
                  <p className="font-bold text-[#173F4F]">{selectedNode.zone}</p>
                </div>

                {selectedNode.macAddress && (
                  <div className="col-span-2 p-2.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] flex items-center justify-between">
                    <span className="text-[10px] text-[#718096] uppercase">Hardware MAC</span>
                    <span className="font-mono text-[#263238] font-medium">{selectedNode.macAddress}</span>
                  </div>
                )}
              </div>

              {/* Specific Suspicious Threat Context Card */}
              {selectedNode.isSuspicious ? (
                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#B94A48]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B94A48] flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Linked Security Incident
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-[#B94A48] border border-[#B94A48]/30 shadow-xs">
                      {selectedNode.threatId}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#263238] font-display">
                      {selectedNode.threatType}
                    </h4>
                    <p className="text-xs text-[#263238]/90 mt-1 leading-relaxed font-sans">
                      {selectedNode.statusText}
                    </p>
                  </div>

                  {/* Deep Investigation Direct Link */}
                  {onNavigateToInvestigation && selectedNode.threatId && (
                    <button
                      type="button"
                      onClick={() => onNavigateToInvestigation(selectedNode.threatId!)}
                      className="w-full py-2 px-4 rounded-xl bg-[#B94A48] hover:bg-[#A33D3B] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Investigate Threat ({selectedNode.threatId})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#718096]">Telemetry Status</span>
                    <span className="text-[#5C8D6B] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Nominal Steady-State
                    </span>
                  </div>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    {selectedNode.statusText ||
                      'Telemetry parameters adhere to 14-day statistical baseline. Packet arrival intervals and frame opcodes conform to RFC protocols.'}
                  </p>
                </div>
              )}

              {/* Connected Links Summary for Selected Node */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-[#718096] uppercase tracking-wider font-semibold">
                  Connected Network Paths:
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {INITIAL_LINKS.filter(
                    (l) => l.source === selectedNode.id || l.target === selectedNode.id
                  ).map((link) => {
                    const peerId = link.source === selectedNode.id ? link.target : link.source;
                    const peer = nodeMap.get(peerId);
                    if (!peer) return null;

                    return (
                      <div
                        key={link.id}
                        onClick={() => setSelectedNode(peer)}
                        className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                          link.isSuspicious
                            ? 'bg-[#FEF2F2] border-[#B94A48]/30 hover:border-[#B94A48]'
                            : 'bg-white border-[#DCE3E3] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              link.isSuspicious ? 'bg-[#B94A48]' : 'bg-[#CBD5E1]'
                            }`}
                          ></span>
                          <span className="text-[#263238] truncate font-medium">{peer.label}</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                            link.isSuspicious
                              ? 'bg-[#B94A48]/10 text-[#B94A48] border border-[#B94A48]/25 font-semibold'
                              : 'bg-[#F6F7F5] text-[#718096] border border-[#DCE3E3]'
                          }`}
                        >
                          {link.protocol || 'TCP/IP'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F6F7F5] border border-[#DCE3E3] text-[#718096] mx-auto flex items-center justify-center">
                <Network className="w-6 h-6 text-[#173F4F]" />
              </div>
              <h4 className="text-sm font-semibold text-[#263238] font-display">
                No Node Selected
              </h4>
              <p className="text-xs text-[#718096] max-w-xs mx-auto">
                Click any node on the topology map to inspect its IP, hardware properties, and associated security anomalies.
              </p>
            </div>
          )}

          {/* Quick Threat Jump Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#718096] uppercase tracking-wider font-bold">
                Flagged Anomaly Nodes
              </span>
              <span className="text-[#B94A48] font-bold">{suspiciousCount} Active</span>
            </div>
            <div className="space-y-1.5">
              {INITIAL_NODES.filter((n) => n.isSuspicious).map((suspNode) => (
                <button
                  key={suspNode.id}
                  type="button"
                  onClick={() => setSelectedNode(suspNode)}
                  className={`w-full p-2 rounded-xl text-left border transition-all flex items-center justify-between text-xs font-mono cursor-pointer ${
                    selectedNode?.id === suspNode.id
                      ? 'bg-[#FEF2F2] border-[#B94A48] text-[#B94A48] font-bold'
                      : 'bg-[#F6F7F5] border-[#DCE3E3] hover:border-[#B94A48]/40 text-[#263238]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#B94A48] animate-ping"></span>
                    <span className="truncate">{suspNode.label}</span>
                  </div>
                  <span className="text-[#B94A48] text-[10px] shrink-0 font-bold">
                    {suspNode.ip}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMapView;
