import React, { useState, useMemo } from 'react';
import {
  SearchCheck,
  ShieldAlert,
  Clock,
  Zap,
  ArrowRight,
  RotateCw,
  Server,
  Layers,
  HelpCircle,
  Dna,
  GitCompare,
  ShieldCheck,
  ListTree,
  ChevronDown,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Activity,
  Network,
  AlertTriangle,
  BarChart3,
  Sliders,
  TrendingUp,
  CheckSquare,
  Square,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Threat, ThreatSeverity, ThreatStatus, ThreatDirection } from '../types';
import { ThreatTimeline } from './ThreatTimeline';
import { HelpTooltip } from './common/HelpTooltip';

interface InvestigationViewProps {
  threats: Threat[];
  onUpdateStatus?: (threatId: string, newStatus: ThreatStatus) => void;
  initialSelectedId?: string;
  onNavigatePage?: (pageId: string) => void;
}

const STATUS_CYCLE: ThreatStatus[] = [
  'detected',
  'investigating',
  'confirmed',
  'contained',
  'resolved',
];

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  threats,
  onUpdateStatus,
  initialSelectedId,
  onNavigatePage,
}) => {
  // Find highest severity mock record for fallback default
  const defaultThreat = useMemo(() => {
    if (!threats.length) return null;
    const severityRank: Record<ThreatSeverity, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return [...threats].sort((a, b) => {
      const diff = severityRank[b.severity] - severityRank[a.severity];
      if (diff !== 0) return diff;
      return b.riskScore - a.riskScore;
    })[0];
  }, [threats]);

  // Active threat ID
  const [selectedThreatId, setSelectedThreatId] = useState<string>(() => {
    if (initialSelectedId && threats.some((t) => t.id === initialSelectedId)) {
      return initialSelectedId;
    }
    return defaultThreat ? defaultThreat.id : threats[0]?.id || '';
  });

  // Local status tracking to ensure instantaneous UI reaction if cycling
  const [localStatusMap, setLocalStatusMap] = useState<Record<string, ThreatStatus>>({});

  // Resolve currently selected threat
  const selectedThreat = useMemo(() => {
    const found = threats.find((t) => t.id === selectedThreatId) || defaultThreat || threats[0];
    if (!found) return null;
    const overriddenStatus = localStatusMap[found.id] || found.status;
    return { ...found, status: overriddenStatus };
  }, [threats, selectedThreatId, defaultThreat, localStatusMap]);

  // Status pill cycle handler
  const handleCycleStatus = () => {
    if (!selectedThreat) return;
    const currentIndex = STATUS_CYCLE.indexOf(selectedThreat.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    setLocalStatusMap((prev) => ({
      ...prev,
      [selectedThreat.id]: nextStatus,
    }));

    onUpdateStatus?.(selectedThreat.id, nextStatus);
  };

  // Local checklist state mapping threatId to checked action indexes
  const [checkedActionsMap, setCheckedActionsMap] = useState<Record<string, Record<number, boolean>>>({});

  // Handler to mark threat as contained directly from Recommended Response section
  const handleMarkAsContained = () => {
    if (!selectedThreat) return;
    setLocalStatusMap((prev) => ({
      ...prev,
      [selectedThreat.id]: 'contained',
    }));
    onUpdateStatus?.(selectedThreat.id, 'contained');
  };

  // Handler to toggle an action checkbox
  const handleToggleAction = (actionIdx: number) => {
    if (!selectedThreat) return;
    setCheckedActionsMap((prev) => {
      const current = prev[selectedThreat.id] || {};
      return {
        ...prev,
        [selectedThreat.id]: {
          ...current,
          [actionIdx]: !current[actionIdx],
        },
      };
    });
  };

  // Handler to select/clear all checklist items
  const handleToggleAllActions = (allActionIndexes: number[], shouldCheckAll: boolean) => {
    if (!selectedThreat) return;
    setCheckedActionsMap((prev) => {
      const updated: Record<number, boolean> = {};
      allActionIndexes.forEach((idx) => {
        updated[idx] = shouldCheckAll;
      });
      return {
        ...prev,
        [selectedThreat.id]: updated,
      };
    });
  };

  // Risk band calculation
  const getRiskBand = (score: number) => {
    if (score <= 30) {
      return {
        label: 'Low Impact',
        tier: '0–30 Low',
        textColor: 'text-[#5C8D6B]',
        strokeColor: 'var(--sev-low)',
        bgBadge: 'bg-[#F0FDF4] text-[#2E7D32] border-[#5C8D6B]/30',
      };
    }
    if (score <= 60) {
      return {
        label: 'Medium Impact',
        tier: '31–60 Medium',
        textColor: 'text-[#C39A45]',
        strokeColor: 'var(--sev-med)',
        bgBadge: 'bg-[#FFFBEB] text-[#B45309] border-[#C39A45]/30',
      };
    }
    if (score <= 80) {
      return {
        label: 'High Impact',
        tier: '61–80 High',
        textColor: 'text-[#C87545]',
        strokeColor: 'var(--sev-high)',
        bgBadge: 'bg-[#FFF7ED] text-[#C87545] border-[#C87545]/30',
      };
    }
    return {
      label: 'Critical Impact',
      tier: '81–100 Critical',
      textColor: 'text-[#B94A48]',
      strokeColor: 'var(--sev-crit)',
      bgBadge: 'bg-[#FEF2F2] text-[#B94A48] border-[#B94A48]/30',
    };
  };

  // Status badge styling
  const getStatusBadgeStyle = (status: ThreatStatus) => {
    switch (status) {
      case 'detected':
        return 'bg-[#E6F4F1] text-[#173F4F] border-[#173F4F]/30';
      case 'investigating':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]';
      case 'confirmed':
        return 'bg-[#FEF2F2] text-[#B94A48] border-[#B94A48]/30';
      case 'contained':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#C39A45]/30';
      case 'resolved':
        return 'bg-[#F0FDF4] text-[#5C8D6B] border-[#5C8D6B]/30';
    }
  };

  if (!selectedThreat) {
    return (
      <div className="p-12 text-center text-[#718096] font-mono">
        No telemetry records available for investigation.
      </div>
    );
  }

  const riskBand = getRiskBand(selectedThreat.riskScore);

  // SVG Gauge calculations
  // Semi-circular gauge: 180-degree sweep from -180 to 0 or 220 degree arc
  const gaugeRadius = 56;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  // Use a 240-degree arc
  const arcLength = (240 / 360) * gaugeCircumference;
  const riskPercent = Math.min(100, Math.max(0, selectedThreat.riskScore)) / 100;
  const riskStrokeOffset = arcLength - riskPercent * arcLength;

  // AI Confidence full-circle ring calculation
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const confidencePercent = Math.min(100, Math.max(0, selectedThreat.aiConfidence)) / 100;
  const ringStrokeOffset = ringCircumference - confidencePercent * ringCircumference;

  return (
    <div id="investigation-view" className="space-y-6 animate-fadeIn pb-16">
      {/* Top Breadcrumb & Case Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE3E3]">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#718096]">CASE MANAGEMENT</span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-[#173F4F] font-semibold flex items-center gap-1.5">
            <SearchCheck className="w-4 h-4" />
            FORENSIC DOSSIER
          </span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-[#263238] font-bold">{selectedThreat.id}</span>
        </div>

        {/* Case Switcher Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[11px] font-mono text-[#718096] shrink-0">Switch Dossier:</label>
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedThreat.id}
              onChange={(e) => setSelectedThreatId(e.target.value)}
              className="w-full sm:w-auto bg-white text-[#263238] text-xs font-mono rounded-xl px-3 py-2 pr-8 min-h-[44px] border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] cursor-pointer appearance-none shadow-xs truncate"
            >
              {threats.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} - {t.threatType} ({t.severity.toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#718096] absolute right-2.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 1. Header Section */}
      <div
        id="investigation-header"
        className="p-5 md:p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Top Tagline with Diode Indicator */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#173F4F] px-2.5 py-1.5 rounded-lg bg-[#E6F4F1] border border-[#173F4F]/30">
                RECORD ID: {selectedThreat.id}
              </span>

              {/* Status Pill: Cycles on click for demo */}
              <button
                type="button"
                id="status-cycle-pill"
                onClick={handleCycleStatus}
                title="Click to cycle status through workflow stages"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold capitalize border cursor-pointer transition-all duration-150 hover:brightness-105 active:scale-95 ${getStatusBadgeStyle(
                  selectedThreat.status
                )}`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span>{selectedThreat.status}</span>
                <RotateCw className="w-3.5 h-3.5 ml-0.5 opacity-70 hover:opacity-100" />
              </button>

              <span className="text-[11px] font-mono text-[#718096] italic hidden sm:inline">
                (click status to cycle state)
              </span>

              {selectedThreat.direction === 'Unidirectional' && (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#E6F4F1] text-[#173F4F] border border-[#173F4F]/30">
                  <Zap className="w-3 h-3 text-[#173F4F]" />
                  Unidirectional Optical Diode Egress
                </span>
              )}
            </div>

            {/* Threat Type Headline */}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#263238] font-display">
              {selectedThreat.threatType}
            </h1>

            {/* Detected Timestamp */}
            <div className="flex items-center gap-4 text-xs font-mono text-[#718096]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#173F4F]" />
                Detected: <strong className="text-[#263238]">{new Date(selectedThreat.detectedAt).toUTCString()}</strong>
              </span>
              <span className="text-[#CBD5E1] hidden sm:inline">•</span>
              <span className="text-[#718096] hidden sm:inline">
                Optical Diode Tap: <strong className="text-[#263238]">PHY-TX-AIRGAP-01</strong>
              </span>
            </div>
          </div>

          {/* Quick Threat Severity Tag */}
          <div className="shrink-0 flex items-center lg:flex-col lg:items-end gap-2">
            <span className="text-[10px] font-mono uppercase text-[#718096] tracking-wider">
              Assigned Severity
            </span>
            <span
              className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-lg border ${
                selectedThreat.severity === 'critical'
                  ? 'bg-[#FEF2F2] text-[#B94A48] border-[#B94A48]/30'
                  : selectedThreat.severity === 'high'
                  ? 'bg-[#FFF7ED] text-[#C87545] border-[#C87545]/30'
                  : selectedThreat.severity === 'medium'
                  ? 'bg-[#FFFBEB] text-[#B45309] border-[#C39A45]/30'
                  : 'bg-[#F0FDF4] text-[#5C8D6B] border-[#5C8D6B]/30'
              }`}
            >
              {selectedThreat.severity} Severity
            </span>
          </div>
        </div>
      </div>

      {/* 2. Metadata Panel + Risk Gauge & AI Confidence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Metadata Panel (7 cols) */}
        <div
          id="metadata-panel"
          className="lg:col-span-7 p-5 md:p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3E3]">
            <h2 className="text-sm font-semibold text-[#263238] font-display flex items-center gap-2">
              <Server className="w-4 h-4 text-[#173F4F]" />
              Telemetry Metadata & Packet Boundaries
            </h2>
            <span className="text-[10px] font-mono text-[#718096] uppercase">
              Physical Layer DPI
            </span>
          </div>

          {/* 9 Specified Metadata Fields in a High-Density SOC Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            {/* 1. Source IP */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Source IP
              </span>
              <span className="text-[#263238] font-bold text-sm truncate block">
                {selectedThreat.sourceIP}
              </span>
            </div>

            {/* 2. Destination IP */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Destination IP
              </span>
              <span className="text-[#263238] font-bold text-sm truncate block">
                {selectedThreat.destinationIP}
              </span>
            </div>

            {/* 3. Protocol */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Protocol
              </span>
              <span className="text-[#173F4F] font-bold text-sm block">
                {selectedThreat.protocol}
              </span>
            </div>

            {/* 4. Direction */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Direction
              </span>
              <span className="text-[#263238] font-bold text-xs truncate block">
                {selectedThreat.direction}
              </span>
            </div>

            {/* 5. Source Port */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Source Port
              </span>
              <span className="text-[#263238] font-bold text-sm block">
                {selectedThreat.sourcePort}
              </span>
            </div>

            {/* 6. Destination Port */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Destination Port
              </span>
              <span className="text-[#263238] font-bold text-sm block">
                {selectedThreat.destinationPort}
              </span>
            </div>

            {/* 7. Duration */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Duration
              </span>
              <span className="text-[#263238] font-bold text-sm block">
                {selectedThreat.durationSeconds}s
              </span>
            </div>

            {/* 8. Traffic Volume */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Traffic Volume
              </span>
              <span className="text-[#263238] font-bold text-sm block">
                {selectedThreat.trafficVolumeMB} MB
              </span>
            </div>

            {/* 9. Packet Count */}
            <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[10px] text-[#718096] uppercase tracking-wider block mb-1">
                Packet Count
              </span>
              <span className="text-[#263238] font-bold text-sm block">
                {selectedThreat.packetCount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCE3E3] flex items-center justify-between text-[11px] font-mono text-[#718096]">
            <span>Hardware Diode RX Ingest Buffer: <strong>0.18% Nominal</strong></span>
            <span className="text-[#5C8D6B] font-medium">Physical One-Way Verified</span>
          </div>
        </div>

        {/* Risk Score Gauge & AI Confidence Ring (5 cols) */}
        <div
          id="gauges-panel"
          className="lg:col-span-5 p-5 md:p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E3]">
            <h2 className="text-sm font-semibold text-[#263238] font-display">
              Risk & Confidence Assessment
            </h2>
            <span className="text-[10px] font-mono text-[#718096] uppercase">
              Model Inference
            </span>
          </div>

          {/* Side-by-Side Dual Dial Display (Single column on mobile, 2 cols on sm+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-auto py-3">
            {/* 3. Prominent Risk Score Gauge with 4 Color Bands */}
            <div id="metric-risk-score" className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[11px] font-mono uppercase font-bold text-[#263238]">
                  Risk Score
                </span>
                <HelpTooltip term="risk-score" />
              </div>

              {/* Arc Gauge Visual */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-[210deg] transform" viewBox="0 0 140 140">
                  {/* Track Background */}
                  <circle
                    cx="70"
                    cy="70"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                    strokeDasharray={`${arcLength} ${gaugeCircumference}`}
                    strokeLinecap="round"
                  />

                  {/* Active Risk Score Arc */}
                  <circle
                    cx="70"
                    cy="70"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke={riskBand.strokeColor}
                    strokeWidth="10"
                    strokeDasharray={`${arcLength} ${gaugeCircumference}`}
                    strokeDashoffset={riskStrokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Gauge Numeric Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className={`text-3xl font-bold tracking-tight ${riskBand.textColor}`}>
                    {selectedThreat.riskScore}
                  </span>
                  <span className="text-[10px] text-[#718096] uppercase tracking-widest">
                    / 100
                  </span>
                </div>
              </div>

              {/* Band Label Badge */}
              <div className="mt-1">
                <span className={`inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${riskBand.bgBadge}`}>
                  {riskBand.label}
                </span>
              </div>

              {/* Color Bands Reference */}
              <div className="w-full mt-3 grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                <span className="px-1 py-0.5 rounded bg-[#F0FDF4] border border-[#5C8D6B]/30 text-[#2E7D32]">
                  0-30
                </span>
                <span className="px-1 py-0.5 rounded bg-[#FFFBEB] border border-[#C39A45]/30 text-[#B45309]">
                  31-60
                </span>
                <span className="px-1 py-0.5 rounded bg-[#FFF7ED] border border-[#C87545]/30 text-[#C87545]">
                  61-80
                </span>
                <span className="px-1 py-0.5 rounded bg-[#FEF2F2] border border-[#B94A48]/30 text-[#B94A48]">
                  81-100
                </span>
              </div>
            </div>

            {/* 4. Visually Distinct AI Confidence Ring */}
            <div id="metric-ai-confidence" className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[11px] font-mono uppercase font-bold text-[#173F4F]">
                  AI Confidence
                </span>
                <HelpTooltip term="ai-confidence" />
              </div>

              {/* Concentric Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                  {/* Outer subtle guide */}
                  <circle
                    cx="70"
                    cy="70"
                    r={ringRadius + 6}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Ring Background */}
                  <circle
                    cx="70"
                    cy="70"
                    r={ringRadius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="8"
                  />

                  {/* Active AI Confidence Ring */}
                  <circle
                    cx="70"
                    cy="70"
                    r={ringRadius}
                    fill="transparent"
                    stroke="#173F4F"
                    strokeWidth="8"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringStrokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className="text-3xl font-bold tracking-tight text-[#173F4F]">
                    {selectedThreat.aiConfidence}%
                  </span>
                  <span className="text-[9px] text-[#718096] font-bold uppercase tracking-wider">
                    Model Certainty
                  </span>
                </div>
              </div>

              {/* Sub-badge */}
              <div className="mt-1">
                <span className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#E6F4F1] text-[#173F4F] border border-[#173F4F]/30">
                  SHAP Calibrated
                </span>
              </div>

              <div className="w-full mt-3 p-1 rounded bg-[#F6F7F5] border border-[#DCE3E3] text-[9px] font-mono text-[#718096]">
                Inference Latency: <strong>4.2ms</strong>
              </div>
            </div>
          </div>

          {/* Mandatory Disambiguation Clarification Caption */}
          <div className="mt-3 p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] text-[11px] font-sans text-[#263238] leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#173F4F] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#173F4F] font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                Metric Differentiation Notice
              </strong>
              <strong>Risk Score</strong> reflects potential impact and asset consequence, while{' '}
              <strong>AI Confidence</strong> reflects the model's mathematical certainty — these should never look interchangeable.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Analysis & Forensic Sections */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCE3E3]">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#718096]">
            Forensic Artifacts & Behavioral Diagnostics
          </h2>
          <span className="text-[11px] font-mono text-[#173F4F] font-semibold">
            Neural DPI Signal Attribution
          </span>
        </div>

        {/* Section 1: Why Was This Flagged */}
        <section
          id="ai-explanation-panel"
          className="p-5 md:p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE3E3]">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#263238] font-display flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#173F4F]" />
                Why Was This Flagged?
              </h3>
              <p className="text-xs text-[#718096] mt-0.5">
                Neural DPI factor attribution breakdown, ranked by relative model influence weight.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#173F4F] border border-[#173F4F]/30 flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3 h-3 text-[#173F4F]" />
                <span>{selectedThreat.explanations?.length || 0} Attributing Factors</span>
              </span>
            </div>
          </div>

          {/* Reason Cards sorted by weight descending */}
          {(() => {
            // Sort explanations by weight descending
            const sortedExplanations = [...(selectedThreat.explanations || [])].sort(
              (a, b) => b.weight - a.weight
            );

            if (sortedExplanations.length === 0) {
              return (
                <div className="p-6 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] text-center font-mono text-xs text-[#718096]">
                  No individual explanation factors registered for this record.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 gap-3.5">
                {sortedExplanations.map((exp, index) => {
                  const isPrimary = index === 0;
                  const weightScore = Math.min(100, Math.max(0, exp.weight));

                  // Color banding for factor weights
                  const getWeightColor = (w: number) => {
                    if (w >= 85) {
                      return {
                        bar: 'bg-[#B94A48]',
                        text: 'text-[#B94A48]',
                        badge: 'bg-[#FEF2F2] text-[#B94A48] border-[#B94A48]/30',
                        label: 'Dominant Factor',
                      };
                    }
                    if (w >= 70) {
                      return {
                        bar: 'bg-[#C87545]',
                        text: 'text-[#C87545]',
                        badge: 'bg-[#FFF7ED] text-[#C87545] border-[#C87545]/30',
                        label: 'Primary Driver',
                      };
                    }
                    if (w >= 50) {
                      return {
                        bar: 'bg-[#C39A45]',
                        text: 'text-[#B45309]',
                        badge: 'bg-[#FFFBEB] text-[#B45309] border-[#C39A45]/30',
                        label: 'Contributing Signal',
                      };
                    }
                    return {
                      bar: 'bg-[#173F4F]',
                      text: 'text-[#173F4F]',
                      badge: 'bg-[#E6F4F1] text-[#173F4F] border-[#173F4F]/30',
                      label: 'Corroborating Signal',
                    };
                  };

                  const styling = getWeightColor(weightScore);

                  return (
                    <div
                      key={`${exp.factor}-${index}`}
                      className={`p-4 md:p-4.5 rounded-xl border transition-all duration-200 ${
                        isPrimary
                          ? 'border-[#173F4F]/40 bg-white shadow-xs'
                          : 'bg-[#F6F7F5] border-[#DCE3E3] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-start md:items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-white border border-[#DCE3E3] font-mono text-[11px] font-bold text-[#263238] flex items-center justify-center shrink-0 shadow-2xs">
                            #{index + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-semibold text-[#263238] font-display flex items-center gap-2">
                              <span>{exp.factor}</span>
                              {isPrimary && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E6F4F1] text-[#173F4F] border border-[#173F4F]/30">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  HIGHEST INFLUENCE
                                </span>
                              )}
                            </h4>
                          </div>
                        </div>

                        {/* Weight Metric Badge */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${styling.badge}`}>
                            {styling.label}
                          </span>
                          <span className={`font-mono font-bold text-sm ${styling.text}`}>
                            {weightScore}%
                          </span>
                        </div>
                      </div>

                      {/* One-line Plain-language Description */}
                      <p className="text-xs text-[#263238]/90 leading-relaxed pl-8.5 font-sans mb-3">
                        {exp.description}
                      </p>

                      {/* Horizontal Weight Bar (0-100%) */}
                      <div className="pl-8.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#718096]">
                          <span>Attribution Weight</span>
                          <span className={styling.text}>{weightScore} / 100</span>
                        </div>
                        <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden p-0.5 border border-[#CBD5E1]/50">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${styling.bar}`}
                            style={{ width: `${weightScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="pt-2 border-t border-[#DCE3E3] flex items-center justify-between text-[11px] font-mono text-[#718096]">
            <span>Model Explainability: <strong>TreeSHAP Game-Theoretic Attributions</strong></span>
            <span className="text-[#263238]">Additive Feature Sum = 100% Normalized</span>
          </div>
        </section>

        {/* Section 2: Threat DNA */}
        <section
          id="section-threat-dna"
          className="p-5 md:p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE3E3]">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#263238] font-display flex items-center gap-2.5">
                <Dna className="w-5 h-5 text-[#173F4F]" />
                Threat DNA: 5-Axis Behavioral Fingerprint
              </h3>
              <p className="text-xs text-[#718096] mt-0.5">
                Multi-dimensional behavioral vector plotting signature characteristics across the unidirectional optical link.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#173F4F] font-semibold px-2.5 py-1 rounded-full bg-[#E6F4F1] border border-[#173F4F]/30 shrink-0 self-start sm:self-auto">
              5-Vector Fingerprint
            </span>
          </div>

          {/* 5-Axis Radar Chart + Detailed Explanatory Axis Grid */}
          {(() => {
            // Define the 5 axes with user-requested labels and one-line plain language captions
            const axesConfig = [
              {
                key: 'packetFrequency' as const,
                label: 'Packet Frequency',
                short: 'Frequency',
                value: selectedThreat.dnaMetrics?.packetFrequency ?? 50,
                caption: 'Measures packet arrival rate and burst cadence across the optical diode compared to historical baselines.',
                icon: Activity,
              },
              {
                key: 'portDiversity' as const,
                label: 'Port Diversity',
                short: 'Port Spread',
                value: selectedThreat.dnaMetrics?.portDiversity ?? 50,
                caption: 'Quantifies the range and entropy of source and destination transport ports touched in the session.',
                icon: Layers,
              },
              {
                key: 'destinationSpread' as const,
                label: 'Destination Spread',
                short: 'Dest Spread',
                value: selectedThreat.dnaMetrics?.destinationSpread ?? 50,
                caption: 'Evaluates the breadth and fan-out distribution of target IP hosts and protected subnets addressed.',
                icon: Network,
              },
              {
                key: 'trafficVolume' as const,
                label: 'Traffic Volume',
                short: 'Volume',
                value: selectedThreat.dnaMetrics?.trafficVolume ?? 50,
                caption: 'Tracks cumulative byte transfer size and throughput magnitude traversing the physical diode interface.',
                icon: Server,
              },
              {
                key: 'protocolAnomaly' as const,
                label: 'Protocol Anomaly',
                short: 'Protocol',
                value: selectedThreat.dnaMetrics?.protocolAnomaly ?? 50,
                caption: 'Gauges protocol specification deviations, unauthorized industrial opcodes, and malformed frame headers.',
                icon: AlertTriangle,
              },
            ];

            // SVG Radar Geometry Calculations
            const cx = 190;
            const cy = 180;
            const radius = 115;
            const totalAxes = 5;

            // Concentric grid rings (20%, 40%, 60%, 80%, 100%)
            const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

            // Helper to compute (x, y) given an axis index and scale [0, 1]
            const getCoord = (index: number, scale: number) => {
              const angle = (2 * Math.PI / totalAxes) * index - Math.PI / 2;
              return {
                x: cx + radius * scale * Math.cos(angle),
                y: cy + radius * scale * Math.sin(angle),
                angle,
              };
            };

            // Calculate points for the threat's actual values
            const dataCoordinates = axesConfig.map((axis, i) => {
              const normalized = Math.min(100, Math.max(0, axis.value)) / 100;
              return getCoord(i, normalized);
            });

            const polygonPoints = dataCoordinates
              .map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
              .join(' ');

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Visual Radar / Spider Chart (5 cols) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] relative">
                  <div className="w-full max-w-[380px] aspect-square relative flex items-center justify-center">
                    <svg
                      viewBox="0 0 380 360"
                      className="w-full h-full overflow-visible"
                    >
                      {/* Concentric Pentagon Grid Rings */}
                      {levels.map((lvl) => {
                        const ringPoints = Array.from({ length: totalAxes })
                          .map((_, i) => {
                            const pt = getCoord(i, lvl);
                            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                          })
                          .join(' ');

                        return (
                          <g key={`ring-${lvl}`}>
                            <polygon
                              points={ringPoints}
                              fill="none"
                              stroke="#CBD5E1"
                              strokeWidth={lvl === 1.0 ? '1.5' : '1'}
                              strokeDasharray={lvl < 1.0 ? '3 3' : undefined}
                              opacity={lvl === 1.0 ? 0.9 : 0.6}
                            />
                            {/* Level indicator percentage along top vertical axis */}
                            <text
                              x={cx + 4}
                              y={cy - radius * lvl + 3}
                              fill="#718096"
                              fontSize="8"
                              fontFamily="monospace"
                            >
                              {Math.round(lvl * 100)}%
                            </text>
                          </g>
                        );
                      })}

                      {/* 5 Radial Axis Spokes */}
                      {Array.from({ length: totalAxes }).map((_, i) => {
                        const endPt = getCoord(i, 1.0);
                        return (
                          <line
                            key={`spoke-${i}`}
                            x1={cx}
                            y1={cy}
                            x2={endPt.x}
                            y2={endPt.y}
                            stroke="#CBD5E1"
                            strokeWidth="1.2"
                          />
                        );
                      })}

                      {/* Professional Threat Polygon */}
                      <polygon
                        points={polygonPoints}
                        fill="#173F4F"
                        fillOpacity="0.2"
                        stroke="#173F4F"
                        strokeWidth="2.5"
                        className="transition-all duration-700 ease-out"
                      />

                      {/* Data Vertex Circles */}
                      {dataCoordinates.map((pt, i) => (
                        <g key={`vertex-${i}`}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4.5"
                            fill="#173F4F"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                        </g>
                      ))}

                      {/* Axis Label Placement */}
                      {axesConfig.map((axis, i) => {
                        const labelCoord = getCoord(i, 1.22);
                        const isRight = Math.cos(labelCoord.angle) > 0.2;
                        const isLeft = Math.cos(labelCoord.angle) < -0.2;

                        let textAnchor = 'middle';
                        if (isRight) textAnchor = 'start';
                        if (isLeft) textAnchor = 'end';

                        return (
                          <g key={`label-${axis.key}`}>
                            <text
                              x={labelCoord.x}
                              y={labelCoord.y - 4}
                              textAnchor={textAnchor}
                              fill="#263238"
                              fontSize="10"
                              fontWeight="600"
                              fontFamily="sans-serif"
                            >
                              {axis.label}
                            </text>
                            <text
                              x={labelCoord.x}
                              y={labelCoord.y + 8}
                              textAnchor={textAnchor}
                              fill="#173F4F"
                              fontSize="11"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {axis.value}%
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono text-[#718096] mt-2 text-center">
                    Teal Polygon: Active Threat Fingerprint
                  </span>
                </div>

                {/* 5 Axis Cards with One-Line Plain Language Captions (7 cols) */}
                <div className="lg:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 text-xs font-mono text-[#718096] border-b border-[#DCE3E3]">
                    <span>BEHAVIORAL AXIS</span>
                    <span>SCORE & METRIC MEANING</span>
                  </div>

                  {axesConfig.map((axis) => {
                    const IconComp = axis.icon;
                    const val = axis.value;

                    // Level classification
                    let levelLabel = 'Nominal';
                    let levelBadge = 'bg-[#F0FDF4] text-[#2E7D32] border-[#5C8D6B]/30';
                    let barColor = 'bg-[#5C8D6B]';

                    if (val > 75) {
                      levelLabel = 'Critical Deviation';
                      levelBadge = 'bg-[#FEF2F2] text-[#B94A48] border-[#B94A48]/30';
                      barColor = 'bg-[#B94A48]';
                    } else if (val > 50) {
                      levelLabel = 'Elevated';
                      levelBadge = 'bg-[#FFF7ED] text-[#C87545] border-[#C87545]/30';
                      barColor = 'bg-[#C87545]';
                    } else if (val > 30) {
                      levelLabel = 'Moderate';
                      levelBadge = 'bg-[#FFFBEB] text-[#B45309] border-[#C39A45]/30';
                      barColor = 'bg-[#C39A45]';
                    }

                    return (
                      <div
                        key={axis.key}
                        className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] hover:border-[#CBD5E1] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-md bg-white border border-[#DCE3E3] text-[#173F4F]">
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-[#263238] font-display">
                              {axis.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${levelBadge}`}>
                              {levelLabel}
                            </span>
                            <span className="font-mono font-bold text-xs text-[#173F4F] w-10 text-right">
                              {val}%
                            </span>
                          </div>
                        </div>

                        {/* One-line Plain-Language Caption Explaining What It Means */}
                        <p className="text-[11px] text-[#263238]/80 leading-relaxed font-sans mb-2">
                          {axis.caption}
                        </p>

                        {/* Visual Micro Progress Bar */}
                        <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                            style={{ width: `${val}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="pt-2 border-t border-[#DCE3E3] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#718096] gap-1">
            <span>Shape Topology: <strong>Asymmetric High-Frequency Egress Profile</strong></span>
            <span className="text-[#173F4F] font-semibold">Cross-Referenced with Diode Baseline Corpus</span>
          </div>
        </section>

        {/* Section 3: What Changed */}
        <section
          id="section-what-changed"
          className="p-5 md:p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-5"
        >
          {(() => {
            // Compute 6 metrics comparing Normal Baseline vs This Threat
            // Severity color for the threat bar
            const getSeverityBarColor = (sev: ThreatSeverity) => {
              switch (sev) {
                case 'critical':
                  return {
                    bar: 'bg-[#B94A48]',
                    text: 'text-[#B94A48]',
                    border: 'border-[#B94A48]/40',
                    badge: 'bg-[#FEF2F2] text-[#B94A48] border-[#B94A48]/30',
                  };
                case 'high':
                  return {
                    bar: 'bg-[#C87545]',
                    text: 'text-[#C87545]',
                    border: 'border-[#C87545]/40',
                    badge: 'bg-[#FFF7ED] text-[#C87545] border-[#C87545]/30',
                  };
                case 'medium':
                  return {
                    bar: 'bg-[#C39A45]',
                    text: 'text-[#B45309]',
                    border: 'border-[#C39A45]/40',
                    badge: 'bg-[#FFFBEB] text-[#B45309] border-[#C39A45]/30',
                  };
                default:
                  return {
                    bar: 'bg-[#5C8D6B]',
                    text: 'text-[#5C8D6B]',
                    border: 'border-[#5C8D6B]/40',
                    badge: 'bg-[#F0FDF4] text-[#5C8D6B] border-[#5C8D6B]/30',
                  };
              }
            };

            const sevStyles = getSeverityBarColor(selectedThreat.severity);

            // 1. Packets/sec
            const threatPps = Math.round(selectedThreat.packetCount / Math.max(1, selectedThreat.durationSeconds));
            const baselinePps = 45; // standard nominal baseline for diode telemetry
            const ppsRatio = threatPps / baselinePps;

            // 2. Traffic Volume (MB)
            const threatVol = selectedThreat.trafficVolumeMB;
            const baselineVol = Math.max(1.5, Math.round(selectedThreat.durationSeconds * 0.045 * 10) / 10);
            const volRatio = threatVol / baselineVol;

            // 3. Number of Destinations
            // In unidirectional data diode link, normal baseline is strictly 1 single receiver host
            const baselineDests = 1;
            const threatDests = Math.max(2, Math.round((selectedThreat.dnaMetrics?.destinationSpread ?? 40) / 100 * 28) + 1);
            const destRatio = threatDests / baselineDests;

            // 4. Number of Ports
            // In unidirectional data diode link, normal baseline is strictly 1 designated listening port
            const baselinePorts = 1;
            const threatPorts = Math.max(2, Math.round((selectedThreat.dnaMetrics?.portDiversity ?? 50) / 100 * 48) + 1);
            const portRatio = threatPorts / baselinePorts;

            // 5. Protocol Distribution (% Anomaly / Non-standard Entropy)
            const baselineProtoAnomaly = 2; // 2% nominal non-standard / jitter
            const threatProtoAnomaly = Math.max(12, Math.round((selectedThreat.dnaMetrics?.protocolAnomaly ?? 50) * 0.94));
            const protoRatio = threatProtoAnomaly / baselineProtoAnomaly;

            // 6. Flow Duration (Seconds)
            const threatDur = selectedThreat.durationSeconds;
            const baselineDur = 30; // standard 30-second burst window
            const durRatio = threatDur / baselineDur;

            // Array of 6 compared metrics
            const comparisonMetrics = [
              {
                id: 'pps',
                label: 'Packets/sec',
                unit: 'pps',
                baselineVal: baselinePps,
                threatVal: threatPps,
                displayBaseline: `${baselinePps.toLocaleString()} pps`,
                displayThreat: `${threatPps.toLocaleString()} pps`,
                ratio: ppsRatio,
                callout: `${ppsRatio.toFixed(1)}x higher packet transmission rate than baseline`,
                maxVal: Math.max(baselinePps, threatPps),
              },
              {
                id: 'volume',
                label: 'Traffic Volume',
                unit: 'MB',
                baselineVal: baselineVol,
                threatVal: threatVol,
                displayBaseline: `${baselineVol.toFixed(1)} MB`,
                displayThreat: `${threatVol.toFixed(1)} MB`,
                ratio: volRatio,
                callout: `${volRatio.toFixed(1)}x more traffic volume than baseline`,
                maxVal: Math.max(baselineVol, threatVol),
              },
              {
                id: 'destinations',
                label: 'Number of Destinations',
                unit: 'hosts',
                baselineVal: baselineDests,
                threatVal: threatDests,
                displayBaseline: `${baselineDests} host`,
                displayThreat: `${threatDests} hosts`,
                ratio: destRatio,
                callout: `${threatDests}x more destination hosts than baseline`,
                maxVal: Math.max(baselineDests, threatDests),
              },
              {
                id: 'ports',
                label: 'Number of Ports',
                unit: 'ports',
                baselineVal: baselinePorts,
                threatVal: threatPorts,
                displayBaseline: `${baselinePorts} port`,
                displayThreat: `${threatPorts} ports`,
                ratio: portRatio,
                callout: `${threatPorts}x more destination ports than baseline`,
                maxVal: Math.max(baselinePorts, threatPorts),
              },
              {
                id: 'protocol',
                label: 'Protocol Distribution',
                unit: '% deviation',
                baselineVal: baselineProtoAnomaly,
                threatVal: threatProtoAnomaly,
                displayBaseline: `${baselineProtoAnomaly}% deviation`,
                displayThreat: `${threatProtoAnomaly}% deviation`,
                ratio: protoRatio,
                callout: `${protoRatio.toFixed(1)}x greater protocol framing entropy than baseline`,
                maxVal: 100,
              },
              {
                id: 'duration',
                label: 'Flow Duration',
                unit: 'sec',
                baselineVal: baselineDur,
                threatVal: threatDur,
                displayBaseline: `${baselineDur}s`,
                displayThreat: `${threatDur}s`,
                ratio: durRatio,
                callout: `${durRatio.toFixed(1)}x extended flow duration than baseline`,
                maxVal: Math.max(baselineDur, threatDur),
              },
            ];

            // Determine the biggest deviation
            const biggestDeviation = [...comparisonMetrics].sort((a, b) => b.ratio - a.ratio)[0];

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE3E3]">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-[#263238] font-display flex items-center gap-2.5">
                      <GitCompare className="w-5 h-5 text-[#173F4F]" />
                      What Changed?
                    </h3>
                    <p className="text-xs text-[#718096] mt-0.5">
                      Differential analysis: Normal Diode Baseline vs. This Detected Threat across 6 core telemetry metrics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#F6F7F5] text-[#263238] border border-[#DCE3E3] flex items-center gap-1.5">
                      <span>Baseline Corpus: 14-Day Optical Window</span>
                    </span>
                  </div>
                </div>

                {/* Prominent One-line Callout naming the biggest deviation */}
                <div className="p-4 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] shadow-xs flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-[#DCE3E3] text-[#173F4F] shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                    <AlertTriangle className="w-4 h-4 text-[#173F4F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#173F4F] font-bold mb-0.5">
                      Primary Telemetry Anomaly Detected
                    </div>
                    <div className="text-sm font-semibold text-[#263238] font-display flex flex-wrap items-center gap-1.5">
                      <span>Biggest Deviation:</span>
                      <span className="text-[#173F4F] font-mono font-bold underline decoration-[#173F4F]/50 underline-offset-2">
                        {biggestDeviation.callout}
                      </span>
                      <span className="text-xs text-[#718096] font-normal">
                        ({biggestDeviation.displayThreat} vs {biggestDeviation.displayBaseline} baseline)
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border shrink-0 ${sevStyles.badge}`}>
                    +{biggestDeviation.ratio.toFixed(1)}x Jump
                  </span>
                </div>

                {/* Legend for Two-tone grouped bars */}
                <div className="flex items-center justify-between text-xs font-mono text-[#718096] px-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-[#94A3B8] inline-block border border-[#64748B]/30"></span>
                      <span>Normal Baseline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-sm inline-block border ${sevStyles.bar} ${sevStyles.border}`}></span>
                      <span className="capitalize">{selectedThreat.severity} Threat</span>
                    </div>
                  </div>
                  <span className="hidden sm:inline text-[#718096]">
                    Normalized Proportional Bar Scale
                  </span>
                </div>

                {/* 6 Metrics Grid with Two-Tone Grouped Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparisonMetrics.map((metric) => {
                    // Normalize bar widths (threat is usually max, baseline is fraction)
                    const baselineWidthPct = Math.max(3, Math.min(100, (metric.baselineVal / metric.maxVal) * 100));
                    const threatWidthPct = Math.max(3, Math.min(100, (metric.threatVal / metric.maxVal) * 100));

                    return (
                      <div
                        key={metric.id}
                        className="p-4 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] hover:border-[#CBD5E1] transition-all space-y-3"
                      >
                        {/* Metric Header */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#263238] font-display">
                            {metric.label}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-[#173F4F] border border-[#DCE3E3] font-semibold">
                            {metric.ratio >= 2 ? `+${metric.ratio.toFixed(1)}x` : `~${metric.ratio.toFixed(1)}x`}
                          </span>
                        </div>

                        {/* Two-Tone Grouped Bars */}
                        <div className="space-y-2 pt-1">
                          {/* Row 1: Normal Baseline */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#718096]">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#94A3B8]"></span>
                                Baseline
                              </span>
                              <span className="text-[#263238] font-medium">{metric.displayBaseline}</span>
                            </div>
                            <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full bg-[#94A3B8] transition-all duration-700 ease-out"
                                style={{ width: `${baselineWidthPct}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Row 2: This Threat (Severity Color) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className={`flex items-center gap-1.5 ${sevStyles.text}`}>
                                <span className={`w-2 h-2 rounded-full ${sevStyles.bar}`}></span>
                                Detected Threat
                              </span>
                              <span className={`font-bold ${sevStyles.text}`}>{metric.displayThreat}</span>
                            </div>
                            <div className="h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden p-0.5 border border-[#CBD5E1]/50">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${sevStyles.bar}`}
                                style={{ width: `${threatWidthPct}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Differential Delta Summary */}
                        <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#718096] border-t border-[#DCE3E3]">
                          <span>Observed Delta:</span>
                          <span className={sevStyles.text}>
                            {metric.ratio >= 10
                              ? `Extreme ${metric.ratio.toFixed(1)}x Anomaly`
                              : `${metric.ratio.toFixed(1)}x Baseline Deviation`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </section>

        {/* Section 4: Recommended Response */}
        <section
          id="section-recommended-response"
          className="p-5 md:p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-5"
        >
          {(() => {
            // Build response actions combining the threat's recommendedActions with standard SOC containment steps
            const threatActions = selectedThreat.recommendedActions || [];

            // Standard complementary SOC playbook actions
            const standardSOCPlaybook = [
              'Investigate source IP and cross-reference with zero-trust asset directory',
              'Review recent communication history and unidirectional diode flow logs',
              'Check affected destination host/PLC for unauthorized state changes',
              'Compare with baseline behavior profile in diode proxy cache',
              'Check for similar activity across adjacent isolated network segments',
              'Consider containment if confirmed malicious (isolate upstream optical switch port)',
            ];

            // Merge threat-specific actions with standard playbook without duplicates
            const allActionsList = [
              ...threatActions,
              ...standardSOCPlaybook.filter(
                (std) => !threatActions.some((ta) => ta.toLowerCase().includes(std.slice(0, 20).toLowerCase()))
              ),
            ].slice(0, 7); // Provide a focused, highly actionable list of 6-7 steps

            const threatChecklistState = checkedActionsMap[selectedThreat.id] || {};
            const completedCount = allActionsList.filter((_, idx) => !!threatChecklistState[idx]).length;
            const totalCount = allActionsList.length;
            const progressPercent = Math.round((completedCount / Math.max(1, totalCount)) * 100);
            const isFullyCompleted = completedCount === totalCount;
            const isAlreadyContained = selectedThreat.status === 'contained';

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE3E3]">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-[#263238] font-display flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#173F4F]" />
                      Recommended Response
                    </h3>
                    <p className="text-xs text-[#718096] mt-0.5">
                      Guided incident response checklist tailored to this threat signature and diode architecture.
                    </p>
                  </div>

                  {/* Mark as Contained Action Button */}
                  <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleMarkAsContained}
                      disabled={isAlreadyContained}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-xs ${
                        isAlreadyContained
                          ? 'bg-[#FFFBEB] text-[#B45309] border border-[#C39A45]/40 cursor-default'
                          : 'bg-[#173F4F] hover:bg-[#133340] text-white active:scale-95 cursor-pointer'
                      }`}
                      title={isAlreadyContained ? 'Threat is currently marked as Contained' : 'Update status pill to Contained'}
                    >
                      {isAlreadyContained ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-[#B45309]" />
                          <span>Status: Contained</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Mark as Contained</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress & Quick Batch Toggles */}
                <div className="p-3.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 max-w-md">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#263238] flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isFullyCompleted ? 'text-[#5C8D6B]' : 'text-[#173F4F]'}`} />
                        <span>Analyst Playbook Progress</span>
                      </span>
                      <span className={`font-bold ${isFullyCompleted ? 'text-[#5C8D6B]' : 'text-[#173F4F]'}`}>
                        {completedCount} of {totalCount} completed ({progressPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFullyCompleted
                            ? 'bg-[#5C8D6B]'
                            : 'bg-[#173F4F]'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Batch Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleAllActions(allActionsList.map((_, i) => i), true)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#DCE3E3] hover:bg-[#F1F5F9] text-[#263238] text-[11px] font-mono transition-colors shadow-2xs"
                    >
                      Check All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAllActions(allActionsList.map((_, i) => i), false)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#DCE3E3] hover:bg-[#F1F5F9] text-[#718096] hover:text-[#263238] text-[11px] font-mono transition-colors shadow-2xs"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Status Notice if Contained */}
                {isAlreadyContained && (
                  <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#C39A45]/30 text-xs font-mono text-[#B45309] flex items-center gap-2.5">
                    <Lock className="w-4 h-4 shrink-0 text-[#B45309]" />
                    <span>
                      Incident status is marked as <strong>Contained</strong>. Upstream optical isolation applied and header status pill synchronized.
                    </span>
                  </div>
                )}

                {/* Interactive Checklist Items */}
                <div className="space-y-2.5">
                  {allActionsList.map((actionText, idx) => {
                    const isChecked = !!threatChecklistState[idx];

                    return (
                      <div
                        key={`action-${idx}`}
                        onClick={() => handleToggleAction(idx)}
                        className={`p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#F8FAF9] border-[#DCE3E3] opacity-75'
                            : 'bg-[#F6F7F5] border-[#DCE3E3] hover:border-[#173F4F]/40 hover:bg-white'
                        }`}
                      >
                        {/* Interactive Checkbox */}
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-[#5C8D6B]" />
                          ) : (
                            <Square className="w-5 h-5 text-[#94A3B8] hover:text-[#173F4F] transition-colors" />
                          )}
                        </div>

                        {/* Step Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-[#718096] uppercase tracking-wider font-semibold">
                              Step {idx + 1} {idx < (threatActions.length || 0) ? '• Threat-Specific' : '• Protocol SOP'}
                            </span>
                            {isChecked && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#2E7D32] border border-[#5C8D6B]/30">
                                Completed
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs font-sans leading-relaxed transition-all ${
                              isChecked
                                ? 'text-[#718096] line-through'
                                : 'text-[#263238] font-medium'
                            }`}
                          >
                            {actionText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#DCE3E3] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#718096] gap-1">
                  <span>Containment SOP: <strong>IPthreat Optical Diode Hardware ACL Isolation</strong></span>
                  <span className="text-[#263238]">Changes persist in local state across investigation sessions</span>
                </div>
              </>
            );
          })()}
        </section>

        {/* Section 5: Threat Timeline */}
        <section id="section-timeline">
          <ThreatTimeline threat={selectedThreat} />
        </section>
      </div>
    </div>
  );
};
