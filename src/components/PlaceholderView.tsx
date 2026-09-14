import React from 'react';
import {
  Radio,
  SearchCheck,
  Network,
  PlayCircle,
  ShieldAlert,
  History,
  Cpu,
  Clock,
  Code,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { NavPageId, Threat } from '../types';

interface PlaceholderViewProps {
  pageId: NavPageId;
  threats: Threat[];
  onSelectThreat?: (threat: Threat) => void;
}

const PAGE_CONFIG: Record<
  NavPageId,
  {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    details: string[];
  }
> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Security Operations Overview',
    icon: ShieldCheck,
    description: 'Main executive and operational telemetry for unidirectional data diode enclaves.',
    details: [],
  },
  'live-threats': {
    title: 'Live Threats',
    subtitle: 'Real-Time Unidirectional Telemetry Stream',
    icon: Radio,
    description:
      'Continuous streaming detection of packet anomalies, covert timing channels, and buffer saturation vectors traversing the physical diode.',
    details: [
      'High-throughput packet stream analyzer (10 Gbps optical line rate)',
      'Sub-millisecond packet jitter and entropy variance alerts',
      'Instant correlation with OT SCADA whitelist rules',
    ],
  },
  investigation: {
    title: 'Investigation',
    subtitle: 'Deep Packet Forensic & Protocol Dissector',
    icon: SearchCheck,
    description:
      'Forensic workspace for analyzing packet captures (PCAP), industrial protocol command structures, and AI DNA signatures.',
    details: [
      'Interactive byte-level packet dissector (Modbus, DNP3, OPC-UA, Syslog)',
      'Reconstruction of one-way UDP datagram streams',
      'Entropy map visualizer & Shannon dispersion graphs',
    ],
  },
  'network-map': {
    title: 'Network Map',
    subtitle: 'Physical Optical Diode & Enclave Topology',
    icon: Network,
    description:
      'Interactive topology depicting the physical separation between protected Industrial OT enclaves and corporate IT/DMZ networks.',
    details: [
      'Optical TX Laser Emitter node telemetry',
      'Photodiode RX Receiver buffer queues and link health',
      'Connected OT asset matrix (PLCs, RTUs, Turbines, Relays)',
    ],
  },
  simulation: {
    title: 'Simulation',
    subtitle: 'Asymmetric Attack & Diode Stress Testing',
    icon: PlayCircle,
    description:
      'Execute controlled penetration scenarios against unidirectional proxies to validate air-gap defenses and buffer integrity.',
    details: [
      'Simulate high-rate UDP exfiltration bursts',
      'Test covert timing channel detection limits',
      'Validate fail-safe interlocks under buffer overflow pressure',
    ],
  },
  incidents: {
    title: 'Incidents',
    subtitle: 'SOC Triage, Ticketing & Containment Runbooks',
    icon: ShieldAlert,
    description:
      'Formal incident management lifecycle for high-severity violations detected crossing or probing the data diode.',
    details: [
      'Automated containment playbooks for physical hardware isolators',
      'Chain-of-custody logging and forensic evidence packaging',
      'NERC CIP / IEC 62443 compliance reporting exports',
    ],
  },
  'threat-history': {
    title: 'Threat History',
    subtitle: 'Historical Audit Archive & Trend Telemetry',
    icon: History,
    description:
      'Long-term searchable archive of historical threat telemetry, attack signatures, and diode behavior logs.',
    details: [
      'Multi-month volumetric traffic baseline comparisons',
      'Recurring adversary infrastructure identification',
      'Hardware diode optical degradation logs',
    ],
  },
  'model-monitoring': {
    title: 'Model Monitoring',
    subtitle: 'AI Inference Health, Drift & Latency Telemetry',
    icon: Cpu,
    description:
      'Operational observability for the neural networks detecting anomalies in one-way protocol streams.',
    details: [
      'Unsupervised autoencoder reconstruction loss curves',
      'Detection confidence drift monitoring over time',
      'Confusion matrices and zero-shot industrial protocol heuristics',
    ],
  },
  'how-to-use': {
    title: 'How to Use',
    subtitle: 'Interactive Manual and Onboarding Guide',
    icon: ShieldCheck,
    description:
      'Step-by-step walkthrough of monitoring, deep investigation, and mitigation workflows.',
    details: [
      'Comprehensive 13-part security operations handbook',
      'Interactive guided tour through live console components',
      'Plain-English security term definitions and cheat sheet',
    ],
  },
  settings: {
    title: 'Settings',
    subtitle: 'Preferences & Workspace Customization',
    icon: Code,
    description:
      'Manage theme preferences, alert notifications, dashboard card visibility, and security display filters.',
    details: [
      'Refined light and dark color modes',
      'Customizable dashboard widget layout',
      'Local state persistence without external servers',
    ],
  },
};

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  pageId,
  threats,
}) => {
  const config = PAGE_CONFIG[pageId] || PAGE_CONFIG['live-threats'];
  const Icon = config.icon;

  // Filter relevant threats for context if appropriate
  const countForPage =
    pageId === 'live-threats'
      ? threats.length
      : pageId === 'incidents'
      ? threats.filter((t) => t.severity === 'critical' || t.severity === 'high').length
      : threats.filter((t) => t.direction === 'Unidirectional').length;

  return (
    <div id={`page-${pageId}`} className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="pb-2 border-b border-[#DCE3E3]">
        <div className="flex items-center gap-2 mb-1 text-[11px] font-mono font-bold uppercase tracking-widest text-[#173F4F]">
          <span>IPthreat AI Module</span>
          <span>&bull;</span>
          <span className="text-[#718096]">ID: {pageId}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#EEF3F5] border border-[#CBD5E1] text-[#173F4F]">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#263238] font-display">
              {config.title}
            </h1>
            <p className="text-xs text-[#718096] font-mono mt-0.5">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Placeholder Canvas */}
      <div className="p-8 rounded-2xl bg-white border border-[#DCE3E3] text-center relative overflow-hidden shadow-xs">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF3F5] border border-[#CBD5E1] flex items-center justify-center mx-auto text-[#173F4F] shadow-xs">
            <Icon className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#263238] font-display">
              {config.title} Module
            </h2>
            <p className="text-sm text-[#718096] mt-2 leading-relaxed">
              {config.description}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#DCE3E3] text-left space-y-2 mt-6">
            <div className="text-[11px] font-mono text-[#173F4F] font-bold uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              Planned Subsystem Capabilities (Prompt Staged):
            </div>
            <ul className="text-xs font-mono text-[#263238] space-y-1.5 pl-2">
              {config.details.map((detail, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-[#173F4F] font-bold">&gt;</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 text-xs font-mono text-[#718096]">
            <span className="px-2.5 py-1 rounded bg-[#F8FAF9] border border-[#DCE3E3]">
              Mock Threat Records Loaded: <span className="text-[#173F4F] font-bold">{threats.length}</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-[#F8FAF9] border border-[#DCE3E3]">
              Filtered Relevant: <span className="text-[#173F4F] font-bold">{countForPage}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
