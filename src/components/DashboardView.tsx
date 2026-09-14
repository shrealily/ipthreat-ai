import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Filter,
  Eye,
  ChevronRight,
  Radio,
  Lock,
  Flame,
  Layers,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { Threat, ThreatSeverity, ThreatDirection, NavPageId } from '../types';
import { useSettings } from '../context/SettingsContext';
import { HelpTooltip } from './common/HelpTooltip';
import { QuickStartCard } from './QuickStartCard';

interface DashboardViewProps {
  threats: Threat[];
  onSelectThreat: (threat: Threat) => void;
  onNavigatePage: (pageId: NavPageId) => void;
  onStartTour?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  threats,
  onSelectThreat,
  onNavigatePage,
  onStartTour,
}) => {
  const { settings } = useSettings();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [showQuickStart, setShowQuickStart] = useState<boolean>(() => {
    return localStorage.getItem('ipthreat_dismiss_quickstart') !== 'true';
  });

  // Metrics computation
  const stats = useMemo(() => {
    const total = threats.length;
    const critical = threats.filter((t) => t.severity === 'critical').length;
    const high = threats.filter((t) => t.severity === 'high').length;
    const medium = threats.filter((t) => t.severity === 'medium').length;
    const low = threats.filter((t) => t.severity === 'low').length;

    const unidirectionalCount = threats.filter(
      (t) => t.direction === 'Unidirectional'
    ).length;

    const avgConfidence = Math.round(
      threats.reduce((acc, curr) => acc + curr.aiConfidence, 0) / (total || 1)
    );

    const totalVolumeMB = threats
      .reduce((acc, curr) => acc + curr.trafficVolumeMB, 0)
      .toFixed(1);

    const investigatingCount = threats.filter(
      (t) => t.status === 'investigating' || t.status === 'detected'
    ).length;

    return {
      total,
      critical,
      high,
      medium,
      low,
      unidirectionalCount,
      avgConfidence,
      totalVolumeMB,
      investigatingCount,
    };
  }, [threats]);

  // Filtered threats for table
  const filteredThreats = useMemo(() => {
    return threats.filter((threat) => {
      const matchSeverity =
        severityFilter === 'all' || threat.severity === severityFilter;
      const matchDirection =
        directionFilter === 'all' || threat.direction === directionFilter;
      return matchSeverity && matchDirection;
    });
  }, [threats, severityFilter, directionFilter]);

  const handleDismissQuickStart = () => {
    localStorage.setItem('ipthreat_dismiss_quickstart', 'true');
    setShowQuickStart(false);
  };

  const isCompact = settings.density === 'compact';

  return (
    <div id="dashboard-view" className="space-y-6 animate-fadeIn pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCE3E3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20">
              UNIDIRECTIONAL IP TRAFFIC SOC
            </span>
            <span className="text-[11px] font-mono text-[#718096]">
              Optical Enclave #01
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#263238] font-display">
            Security Operations Dashboard
          </h1>
          <p className="text-xs text-[#718096] mt-0.5">
            Real-time telemetry and explainable AI detections for unidirectional data diode enclaves.
          </p>
        </div>

        {/* Diode Quick Action Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#DCE3E3] text-xs font-mono shadow-xs">
            <Lock className="w-3.5 h-3.5 text-[#173F4F]" />
            <span className="text-[#718096]">Reverse Path:</span>
            <span className="text-[#5C8D6B] font-bold">PHYSICALLY AIR-GAPPED</span>
          </div>
          <button
            onClick={() => onNavigatePage('live-threats')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#173F4F] hover:bg-[#133340] text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Feed</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Start Card (Requirement 8) */}
      {showQuickStart && (
        <QuickStartCard
          onStartGuide={() => {
            if (onStartTour) {
              onStartTour();
            } else {
              onNavigatePage('how-to-use');
            }
          }}
          onExploreDashboard={() => {
            const tableElement = document.getElementById('dashboard-threat-table');
            if (tableElement) {
              tableElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onDismiss={handleDismissQuickStart}
        />
      )}

      {/* Top 4 Stat Telemetry Cards (Section C: showRiskStatistics) */}
      {settings.showRiskStatistics && (
        <div id="dashboard-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Critical & Active Threats */}
          <div className="p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs relative overflow-hidden transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider block mb-1">
                  Active Critical Alerts
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-[#B94A48]">
                    {stats.critical}
                  </span>
                  <span className="text-xs font-mono text-[#718096]">
                    / {stats.total} total
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#B94A48]/10 text-[#B94A48] border border-[#B94A48]/20">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#718096] pt-3 border-t border-[#DCE3E3]">
              <span className="font-mono">{stats.investigatingCount} under triage</span>
              <span className="text-[#B94A48] font-semibold text-[11px] font-mono">
                Immediate Action
              </span>
            </div>
          </div>

          {/* Card 2: Unidirectional Traffic Diode */}
          <div className="p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs relative overflow-hidden transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider block mb-1">
                  One-Way Diode Traffic
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-[#173F4F]">
                    {stats.unidirectionalCount}
                  </span>
                  <span className="text-xs font-mono text-[#718096]">events</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#718096] pt-3 border-t border-[#DCE3E3] font-mono">
              <span>TX Optical Egress</span>
              <span className="text-[#5C8D6B] font-semibold">100% Forward-Only</span>
            </div>
          </div>

          {/* Card 3: AI Model Confidence */}
          <div
            onClick={() => onNavigatePage('model-monitoring')}
            className="p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs relative overflow-hidden group hover:border-[#173F4F] cursor-pointer transition-all"
            title="Click to open Model Monitoring & Observability"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider">
                    AI Confidence
                  </span>
                  <HelpTooltip term="ai-confidence" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-[#2F6978]">
                    {stats.avgConfidence}%
                  </span>
                  <span className="text-xs font-mono text-[#5C8D6B]">Avg</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2F6978]/10 text-[#2F6978] border border-[#2F6978]/20">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#718096] pt-3 border-t border-[#DCE3E3] font-mono">
              <span>Latency: 11.4ms</span>
              <span className="text-[#173F4F] font-semibold flex items-center gap-1">
                <span>View Metrics</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 4: Analyzed Traffic Volume */}
          <div className="p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs relative overflow-hidden transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider block mb-1">
                  Monitored Diode Stream
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-[#263238]">
                    {stats.totalVolumeMB}
                  </span>
                  <span className="text-xs font-mono text-[#718096]">MB inspected</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 text-[#718096] border border-[#DCE3E3]">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#718096] pt-3 border-t border-[#DCE3E3] font-mono">
              <span>FIFO Queue Fill: 18%</span>
              <span className="text-[#5C8D6B] font-semibold">Healthy</span>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Diode Enforcement Architecture (Section C: showNetworkHealth) */}
      {settings.showNetworkHealth && (
        <div className="p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#173F4F]"></span>
                <span className="text-xs font-mono font-bold text-[#173F4F] uppercase tracking-wide">
                  Hardware Data Diode Enforcement
                </span>
                <HelpTooltip term="unidirectional-traffic" />
              </div>
              <h3 className="text-sm font-semibold text-[#263238]">
                Unidirectional Physical Optical Isolation
              </h3>
              <p className="text-xs text-[#718096] mt-1 leading-relaxed">
                Traffic moves strictly from the high-security Industrial/OT enclave to the monitoring DMZ.
                IPthreat AI analyzes one-way datagram streams where return TCP handshakes are physically blocked.
              </p>
            </div>

            {/* Interactive Visual Schematic */}
            <div className="flex items-center gap-2 md:gap-4 font-mono text-xs w-full lg:w-auto justify-center overflow-x-auto py-2">
              {/* Step 1: Secure Enclave */}
              <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3] text-center shrink-0">
                <div className="text-[10px] text-[#173F4F] uppercase font-bold">OT Enclave</div>
                <div className="text-[#263238] font-semibold mt-0.5">SCADA / PLC / ICS</div>
                <div className="text-[10px] text-[#718096] mt-1">TX Laser Emitter</div>
              </div>

              {/* Direction Arrow */}
              <div className="flex flex-col items-center shrink-0 px-1 text-[#173F4F]">
                <span className="text-[10px] font-bold tracking-wider">ONE-WAY</span>
                <div className="flex items-center gap-1 my-1">
                  <span className="w-3 h-0.5 bg-[#173F4F]"></span>
                  <ArrowRight className="w-4 h-4 text-[#173F4F]" />
                </div>
                <span className="text-[9px] text-[#718096]">10 Gbps Fiber</span>
              </div>

              {/* Step 2: Optical Diode Hardware */}
              <div className="p-3.5 rounded-lg bg-[#F6F7F5] border-2 border-[#173F4F] text-center shrink-0">
                <div className="text-[10px] text-[#173F4F] font-bold uppercase tracking-wider">
                  PHYSICAL DIODE
                </div>
                <div className="text-[#263238] font-bold text-xs mt-0.5">
                  IP-1000 Hardware
                </div>
                <div className="text-[10px] text-[#5C8D6B] mt-1 font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> No Reverse Fiber
                </div>
              </div>

              {/* Direction Arrow */}
              <div className="flex flex-col items-center shrink-0 px-1 text-[#2F6978]">
                <span className="text-[10px] font-bold">INGRESS</span>
                <div className="flex items-center gap-1 my-1">
                  <span className="w-3 h-0.5 bg-[#2F6978]"></span>
                  <ArrowRight className="w-4 h-4 text-[#2F6978]" />
                </div>
                <span className="text-[9px] text-[#718096]">Photodiode RX</span>
              </div>

              {/* Step 3: SOC Ingestion & AI */}
              <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3] text-center shrink-0">
                <div className="text-[10px] text-[#2F6978] uppercase font-bold">SOC Ingestion</div>
                <div className="text-[#263238] font-semibold mt-0.5">IPthreat AI Engine</div>
                <div className="text-[10px] text-[#718096] mt-1">Deep Anomaly Inspection</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Threat Severity Spectrum Bar (Section C: showThreatDistribution) */}
      {settings.showThreatDistribution && (
        <div className="p-4 rounded-xl bg-white border border-[#DCE3E3] shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#263238] uppercase font-semibold">
              Threat Severity Spectrum
            </span>
            <span className="text-[#718096]">{stats.total} Monitored Incidents</span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#F6F7F5] overflow-hidden flex border border-[#DCE3E3]">
            <div
              title={`Critical: ${stats.critical}`}
              className="bg-[#B94A48] h-full transition-all duration-300"
              style={{ width: `${(stats.critical / stats.total) * 100}%` }}
            ></div>
            <div
              title={`High: ${stats.high}`}
              className="bg-[#C87545] h-full transition-all duration-300"
              style={{ width: `${(stats.high / stats.total) * 100}%` }}
            ></div>
            <div
              title={`Medium: ${stats.medium}`}
              className="bg-[#C39A45] h-full transition-all duration-300"
              style={{ width: `${(stats.medium / stats.total) * 100}%` }}
            ></div>
            <div
              title={`Low: ${stats.low}`}
              className="bg-[#5C8D6B] h-full transition-all duration-300"
              style={{ width: `${(stats.low / stats.total) * 100}%` }}
            ></div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs font-mono mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B94A48]"></span>
              <span className="text-[#718096]">Critical:</span>
              <span className="text-[#B94A48] font-bold">{stats.critical}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C87545]"></span>
              <span className="text-[#718096]">High:</span>
              <span className="text-[#C87545] font-bold">{stats.high}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C39A45]"></span>
              <span className="text-[#718096]">Medium:</span>
              <span className="text-[#B45309] font-bold">{stats.medium}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5C8D6B]"></span>
              <span className="text-[#718096]">Low:</span>
              <span className="text-[#5C8D6B] font-bold">{stats.low}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Threat Records Table (Section C: showLiveThreatFeed) */}
      {settings.showLiveThreatFeed && (
        <div id="dashboard-threat-table" className="rounded-xl bg-white border border-[#DCE3E3] shadow-xs overflow-hidden">
          {/* Table Header and Filters */}
          <div className="p-4 border-b border-[#DCE3E3] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#263238] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#173F4F]" />
                Detected Threat Feed ({filteredThreats.length})
              </h2>
              <p className="text-xs text-[#718096] mt-0.5">
                Select any threat record to open deep forensic packet dissection and mitigation options.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 bg-[#F6F7F5] p-1 rounded-xl border border-[#DCE3E3] text-xs overflow-x-auto">
                <span className="text-[10px] font-mono text-[#718096] px-2 uppercase font-semibold shrink-0">
                  Severity:
                </span>
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-3 py-2 min-h-[40px] sm:min-h-[36px] rounded-lg capitalize font-mono text-xs cursor-pointer transition-colors shrink-0 ${
                      severityFilter === sev
                        ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                        : 'text-[#718096] hover:text-[#263238]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#F6F7F5] p-1 rounded-xl border border-[#DCE3E3] text-xs overflow-x-auto">
                <span className="text-[10px] font-mono text-[#718096] px-2 uppercase font-semibold shrink-0">
                  Direction:
                </span>
                {(['all', 'Unidirectional', 'Inbound', 'Outbound'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setDirectionFilter(dir)}
                    className={`px-3 py-2 min-h-[40px] sm:min-h-[36px] rounded-lg font-mono text-xs cursor-pointer transition-colors shrink-0 ${
                      directionFilter === dir
                        ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                        : 'text-[#718096] hover:text-[#263238]'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Stacked Cards (< md) */}
          <div className="block md:hidden divide-y divide-[#DCE3E3]">
            {filteredThreats.slice(0, 15).map((threat) => {
              const severityBadge = {
                critical: 'bg-[#B94A48]/15 text-[#B94A48] border-[#B94A48]/30',
                high: 'bg-[#C87545]/15 text-[#C87545] border-[#C87545]/30',
                medium: 'bg-[#C39A45]/15 text-[#B45309] border-[#C39A45]/30',
                low: 'bg-[#5C8D6B]/15 text-[#5C8D6B] border-[#5C8D6B]/30',
              }[threat.severity];

              const statusBadge = {
                detected: 'text-[#173F4F] bg-[#173F4F]/10 border-[#173F4F]/20',
                investigating: 'text-[#173F4F] bg-[#173F4F]/10 border-[#173F4F]/20',
                confirmed: 'text-[#B94A48] bg-[#B94A48]/10 border-[#B94A48]/20',
                contained: 'text-[#B45309] bg-[#FFFBEB] border-[#C39A45]/30',
                resolved: 'text-[#5C8D6B] bg-[#5C8D6B]/10 border-[#5C8D6B]/20',
              }[threat.status];

              return (
                <div
                  key={threat.id}
                  className="p-4 bg-white hover:bg-[#F8FAF9] transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${severityBadge}`}>
                        {threat.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#173F4F]">
                        {threat.id}
                      </span>
                    </div>
                    <span className={`text-[10px] capitalize px-2 py-0.5 rounded border ${statusBadge}`}>
                      {threat.status}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#263238] font-sans">
                      {threat.threatType}
                    </h3>
                    <span className="text-[11px] font-mono text-[#173F4F] font-semibold shrink-0">
                      {threat.protocol}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase block">Source</span>
                      <span className="text-[#263238] font-medium truncate block">
                        {threat.sourceIP}:{threat.sourcePort}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase block">Destination</span>
                      <span className="text-[#263238] font-medium truncate block">
                        {threat.destinationIP}:{threat.destinationPort}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase block">Direction</span>
                      <span className="text-[#173F4F] font-semibold">{threat.direction}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase block">Risk Score</span>
                      <span className="font-bold text-[#B94A48]">
                        {threat.riskScore} <span className="text-[10px] text-[#718096] font-normal">({threat.aiConfidence}% conf)</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectThreat(threat)}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#173F4F] hover:bg-[#2F6978] text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs active:scale-[0.99]"
                  >
                    <Eye className="w-4 h-4 text-white" />
                    <span>Investigate Threat Dossier</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-[#263238] border-collapse">
              <thead className="bg-[#F6F7F5] text-[#718096] font-mono text-[11px] uppercase tracking-wider border-b border-[#DCE3E3]">
                <tr>
                  <th className={`${isCompact ? 'py-2 px-3' : 'py-3 px-4'}`}>Threat ID</th>
                  <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'}`}>Severity</th>
                  <th className={`${isCompact ? 'py-2 px-3' : 'py-3 px-4'}`}>Threat Type</th>
                  <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'}`}>Direction</th>
                  {settings.showIpAddresses && (
                    <>
                      <th className={`${isCompact ? 'py-2 px-3' : 'py-3 px-4'}`}>Source IP : Port</th>
                      <th className={`${isCompact ? 'py-2 px-3' : 'py-3 px-4'}`}>Destination IP : Port</th>
                    </>
                  )}
                  <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'}`}>Protocol</th>
                  {settings.showRiskScore && (
                    <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'}`}>
                      <div className="flex items-center gap-1">
                        <span>Risk</span>
                        <HelpTooltip term="risk-score" />
                      </div>
                    </th>
                  )}
                  {settings.showAiConfidence && (
                    <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'}`}>
                      <div className="flex items-center gap-1">
                        <span>AI Conf</span>
                        <HelpTooltip term="ai-confidence" />
                      </div>
                    </th>
                  )}
                  <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'}`}>Status</th>
                  <th className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3E3] font-mono">
                {filteredThreats.slice(0, 15).map((threat) => {
                  const severityBadge = {
                    critical: 'bg-[#B94A48]/15 text-[#B94A48] border-[#B94A48]/30',
                    high: 'bg-[#C87545]/15 text-[#C87545] border-[#C87545]/30',
                    medium: 'bg-[#C39A45]/15 text-[#B45309] border-[#C39A45]/30',
                    low: 'bg-[#5C8D6B]/15 text-[#5C8D6B] border-[#5C8D6B]/30',
                  }[threat.severity];

                  const statusBadge = {
                    detected: 'text-[#173F4F] bg-[#173F4F]/10 border-[#173F4F]/20',
                    investigating: 'text-[#173F4F] bg-[#173F4F]/10 border-[#173F4F]/20',
                    confirmed: 'text-[#B94A48] bg-[#B94A48]/10 border-[#B94A48]/20',
                    contained: 'text-[#B45309] bg-[#FFFBEB] border-[#C39A45]/30',
                    resolved: 'text-[#5C8D6B] bg-[#5C8D6B]/10 border-[#5C8D6B]/20',
                  }[threat.status];

                  return (
                    <tr
                      key={threat.id}
                      onClick={() => onSelectThreat(threat)}
                      className="hover:bg-[#F6F7F5] cursor-pointer transition-colors group"
                    >
                      <td className={`${isCompact ? 'py-2 px-3' : 'py-3 px-4'} font-bold text-[#173F4F] whitespace-nowrap`}>
                        {threat.id}
                      </td>
                      <td className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'} whitespace-nowrap`}>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${severityBadge}`}>
                          {threat.severity}
                        </span>
                      </td>
                      <td className={`${isCompact ? 'py-2 px-3' : 'py-3 px-4'} font-sans font-medium text-[#263238] whitespace-nowrap`}>
                        {threat.threatType}
                      </td>
                      <td className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'} whitespace-nowrap`}>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            threat.direction === 'Unidirectional'
                              ? 'bg-[#173F4F]/10 text-[#173F4F] border-[#173F4F]/20'
                              : 'bg-[#F6F7F5] text-[#718096] border-[#DCE3E3]'
                          }`}
                        >
                          {threat.direction}
                        </span>
                      </td>
                      {settings.showIpAddresses && (
                        <>
                          <td className={`${isCompact ? 'py-2 px-3' : 'py-3 px-4'} text-[#718096] whitespace-nowrap`}>
                            {threat.sourceIP}:{threat.sourcePort}
                          </td>
                          <td className={`${isCompact ? 'py-2 px-3' : 'py-3 px-4'} text-[#718096] whitespace-nowrap`}>
                            {threat.destinationIP}:{threat.destinationPort}
                          </td>
                        </>
                      )}
                      <td className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'} whitespace-nowrap`}>
                        <span className="text-[#173F4F] font-semibold">{threat.protocol}</span>
                      </td>
                      {settings.showRiskScore && (
                        <td className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'} whitespace-nowrap`}>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold ${
                                threat.riskScore > 85
                                  ? 'text-[#B94A48]'
                                  : threat.riskScore > 65
                                  ? 'text-[#C87545]'
                                  : 'text-[#B45309]'
                              }`}
                            >
                              {threat.riskScore}
                            </span>
                            <div className="w-10 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden hidden sm:block border border-[#DCE3E3]">
                              <div
                                className={`h-full ${
                                  threat.riskScore > 85
                                    ? 'bg-[#B94A48]'
                                    : 'bg-[#173F4F]'
                                }`}
                                style={{ width: `${threat.riskScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      )}
                      {settings.showAiConfidence && (
                        <td className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'} whitespace-nowrap text-[#173F4F] font-semibold`}>
                          {threat.aiConfidence}%
                        </td>
                      )}
                      <td className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'} whitespace-nowrap`}>
                        <span className={`text-[10px] capitalize px-2 py-0.5 rounded border ${statusBadge}`}>
                          {threat.status}
                        </span>
                      </td>
                      <td className={`${isCompact ? 'py-2 px-2' : 'py-3 px-3'} text-right whitespace-nowrap`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectThreat(threat);
                          }}
                          className="p-1 text-[#718096] hover:text-[#173F4F] hover:bg-[#173F4F]/10 rounded transition-colors cursor-pointer"
                          title="Inspect Threat"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-[#F6F7F5] border-t border-[#DCE3E3] text-xs text-[#718096] flex items-center justify-between">
            <span className="font-mono">
              Showing top {Math.min(15, filteredThreats.length)} of {filteredThreats.length} records
            </span>
            <button
              onClick={() => onNavigatePage('live-threats')}
              className="text-[#173F4F] hover:underline font-mono text-xs flex items-center gap-1 cursor-pointer font-semibold"
            >
              View all {threats.length} threats in Live Monitor <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Optical Stream Telemetry Summary (Section C: showTrafficChart) */}
      {settings.showTrafficChart && (
        <div className="p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DCE3E3]">
            <div>
              <h3 className="text-sm font-semibold text-[#263238]">
                Optical Stream Telemetry & Buffer Health
              </h3>
              <p className="text-xs text-[#718096]">
                FIFO buffer queue latency and unidirectional datagram throughput.
              </p>
            </div>
            <div className="text-xs font-mono text-[#5C8D6B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5C8D6B]"></span>
              Line Rate: 9.84 Gbps
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[11px] text-[#718096] block">Buffer Occupancy</span>
              <span className="text-base font-bold text-[#173F4F]">18.4%</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[11px] text-[#718096] block">Packet Drops (Physical)</span>
              <span className="text-base font-bold text-[#5C8D6B]">0</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[11px] text-[#718096] block">Reverse Leakage</span>
              <span className="text-base font-bold text-[#5C8D6B]">0.00%</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[11px] text-[#718096] block">Avg Transit Latency</span>
              <span className="text-base font-bold text-[#263238]">0.84 µs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
