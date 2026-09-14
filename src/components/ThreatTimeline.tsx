import React, { useState } from 'react';
import {
  Check,
  Activity,
  AlertCircle,
  Radio,
  Cpu,
  SearchCheck,
  AlertOctagon,
  Lock,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { Threat, ThreatStatus } from '../types';

export interface ThreatTimelineProps {
  threat: Threat;
  className?: string;
  compact?: boolean;
}

export interface LifecycleStageConfig {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  offsetMs: number;
  relativeBadge: string;
  logDetails: string;
}

const LIFECYCLE_STAGES: LifecycleStageConfig[] = [
  {
    id: 'normal-traffic',
    label: 'Normal Traffic',
    shortLabel: 'Normal',
    description: 'Optical interface steady-state telemetry within established 14-day baseline.',
    icon: Activity,
    offsetMs: -32 * 60 * 1000,
    relativeBadge: 'T-32m',
    logDetails: 'Optical link RX power -12.4 dBm. Constant uncompressed telemetry frames.',
  },
  {
    id: 'suspicious-activity',
    label: 'Suspicious Activity',
    shortLabel: 'Suspicious',
    description: 'Initial optical egress burst and inter-arrival jitter divergence observed.',
    icon: AlertCircle,
    offsetMs: -6 * 60 * 1000,
    relativeBadge: 'T-6m',
    logDetails: 'Buffer queue depth surged past 65%. Micro-burst sequence initiated from host.',
  },
  {
    id: 'anomaly-detected',
    label: 'Anomaly Detected',
    shortLabel: 'Detected',
    description: 'Hardware diode DPI filter triggered on forbidden function code / burst threshold.',
    icon: Radio,
    offsetMs: 0,
    relativeBadge: 'T-0s',
    logDetails: 'DPI threshold exceeded. Real-time capture dump registered in ring buffer.',
  },
  {
    id: 'threat-classified',
    label: 'Threat Classified',
    shortLabel: 'Classified',
    description: 'Neural model inference matched behavioral fingerprint and assigned risk score.',
    icon: Cpu,
    offsetMs: 4 * 1000,
    relativeBadge: 'T+4s',
    logDetails: 'Inference completed in 4.2ms. TreeSHAP weight attribution vector populated.',
  },
  {
    id: 'investigation',
    label: 'Investigation',
    shortLabel: 'Investigating',
    description: 'SOC analyst opened diagnostic session and forensic artifact review.',
    icon: SearchCheck,
    offsetMs: 2.5 * 60 * 1000,
    relativeBadge: 'T+2m',
    logDetails: 'Forensic session active. Deep packet disassembly and asset mapping engaged.',
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    shortLabel: 'Confirmed',
    description: 'Analyst corroborated true positive malicious intent; escalation protocol signed.',
    icon: AlertOctagon,
    offsetMs: 11 * 60 * 1000,
    relativeBadge: 'T+11m',
    logDetails: 'True positive verified against critical infrastructure asset directory.',
  },
  {
    id: 'contained',
    label: 'Contained',
    shortLabel: 'Contained',
    description: 'Hardware diode egress link gated; optical TX port or host isolated.',
    icon: Lock,
    offsetMs: 22 * 60 * 1000,
    relativeBadge: 'T+22m',
    logDetails: 'Upstream optical switch ACL clamped. Diode TX port hardware-isolated.',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    shortLabel: 'Resolved',
    description: 'Root cause remediated, audit artifact stored, and baseline model updated.',
    icon: CheckCircle2,
    offsetMs: 41 * 60 * 1000,
    relativeBadge: 'T+41m',
    logDetails: 'Host sanitized and recertified. Diode proxy rules updated in firmware.',
  },
];

// Map a ThreatStatus to the active stage index in the 8-step lifecycle
const getActiveStageIndex = (status: ThreatStatus): number => {
  switch (status) {
    case 'detected':
      return 3; // Threat Classified is current active milestone
    case 'investigating':
      return 4; // Investigation is current
    case 'confirmed':
      return 5; // Confirmed is current
    case 'contained':
      return 6; // Contained is current
    case 'resolved':
      return 7; // Resolved is current
    default:
      return 3;
  }
};

export const ThreatTimeline: React.FC<ThreatTimelineProps> = ({
  threat,
  className = '',
  compact = false,
}) => {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);

  const activeIndex = getActiveStageIndex(threat.status);

  // Compute timestamp formatted string given offset
  const baseTime = React.useMemo(() => {
    const parsed = new Date(threat.detectedAt).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
  }, [threat.detectedAt]);

  const formatStageTime = (offsetMs: number) => {
    const stageDate = new Date(baseTime + offsetMs);
    return stageDate.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatStageDate = (offsetMs: number) => {
    const stageDate = new Date(baseTime + offsetMs);
    return stageDate.toISOString().split('T')[0];
  };

  // Currently focused stage for detailed drawer/view (defaults to active stage)
  const focusedStageIdx = selectedStageIdx !== null ? selectedStageIdx : activeIndex;
  const focusedStage = LIFECYCLE_STAGES[focusedStageIdx];

  return (
    <div
      className={`p-5 md:p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-5 ${className}`}
      id="threat-timeline-component"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE3E3]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-semibold text-[#263238] font-display flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#173F4F]" />
              Threat Lifecycle Timeline
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20">
              8-Stage Sequential Stepper
            </span>
          </div>
          <p className="text-xs text-[#718096] mt-0.5">
            Real-time chronological progression from normal diode baseline telemetry to active resolution.
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs font-mono text-[#718096]">Current Phase:</span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/25 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#173F4F] animate-ping"></span>
            <span className="capitalize">{LIFECYCLE_STAGES[activeIndex].label}</span>
          </span>
        </div>
      </div>

      {/* Horizontal Sequential Stepper Track (Desktop/Tablet) */}
      <div className="pt-2 pb-1 overflow-x-auto scrollbar-thin">
        <div className="min-w-[720px] relative px-4">
          {/* Background Connecting Rail */}
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-[#DCE3E3] -z-0"></div>

          {/* Active Completed Progress Rail */}
          <div
            className="absolute top-5 left-10 h-0.5 bg-[#173F4F] -z-0 transition-all duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, (activeIndex / (LIFECYCLE_STAGES.length - 1)) * 100))}%`,
            }}
          ></div>

          {/* Stepper Nodes */}
          <div className="flex items-start justify-between relative z-10">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const IconComp = stage.icon;
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;
              const isPending = idx > activeIndex;
              const isFocused = idx === focusedStageIdx;

              // Node visual styling
              let nodeBorder = 'border-[#DCE3E3] bg-[#F6F7F5] text-[#718096]';
              let badgeColor = 'text-[#718096] bg-[#F6F7F5] border-[#DCE3E3]';

              if (isCompleted) {
                nodeBorder =
                  'border-[#5C8D6B] bg-[#5C8D6B]/15 text-[#5C8D6B] hover:border-[#5C8D6B]';
                badgeColor = 'text-[#5C8D6B] bg-[#5C8D6B]/10 border-[#5C8D6B]/25';
              } else if (isActive) {
                nodeBorder =
                  'border-[#173F4F] bg-[#173F4F] text-white shadow-sm ring-2 ring-[#173F4F]/20';
                badgeColor = 'text-[#173F4F] bg-[#173F4F]/10 border-[#173F4F]/30 font-bold';
              }

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setSelectedStageIdx(idx)}
                  className={`flex flex-col items-center text-center group cursor-pointer transition-all duration-150 focus:outline-none ${
                    isFocused ? 'scale-105' : 'hover:scale-102'
                  }`}
                  style={{ width: `${100 / LIFECYCLE_STAGES.length}%` }}
                >
                  {/* Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center relative transition-all duration-200 ${nodeBorder}`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-[#5C8D6B] stroke-[2.5]" />
                    ) : (
                      <IconComp
                        className={`w-4.5 h-4.5 ${
                          isActive ? 'text-white animate-pulse' : 'text-[#718096]'
                        }`}
                      />
                    )}

                    {/* Active Pulsing Ring */}
                    {isActive && (
                      <span className="absolute -inset-1 rounded-full border border-[#173F4F]/40 animate-ping pointer-events-none"></span>
                    )}
                  </div>

                  {/* Stage Label */}
                  <span
                    className={`mt-2.5 text-[11px] font-display font-semibold transition-colors px-1 leading-tight ${
                      isActive
                        ? 'text-[#173F4F] font-bold'
                        : isCompleted
                        ? 'text-[#263238] group-hover:text-[#5C8D6B]'
                        : 'text-[#718096] group-hover:text-[#263238]'
                    }`}
                  >
                    {stage.label}
                  </span>

                  {/* Timestamp or Status Badge */}
                  <div className="mt-1">
                    {isCompleted || isActive ? (
                      <div className="flex flex-col items-center">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badgeColor}`}>
                          {formatStageTime(stage.offsetMs)}
                        </span>
                        <span className="text-[9px] font-mono text-[#718096] mt-0.5">
                          {stage.relativeBadge}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono text-[#718096] px-1.5 py-0.5 rounded bg-[#F6F7F5] border border-[#DCE3E3]">
                        Pending
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected / Active Stage Detail Inspector Box */}
      {focusedStage && (
        <div className="p-4 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg border ${
                  focusedStageIdx < activeIndex
                    ? 'bg-[#5C8D6B]/15 border-[#5C8D6B]/30 text-[#5C8D6B]'
                    : focusedStageIdx === activeIndex
                    ? 'bg-[#173F4F]/10 border-[#173F4F]/25 text-[#173F4F]'
                    : 'bg-white border-[#DCE3E3] text-[#718096]'
                }`}
              >
                {React.createElement(focusedStage.icon, { className: 'w-4 h-4' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[#263238] font-display">
                    Stage {focusedStageIdx + 1}: {focusedStage.label}
                  </h4>
                  {focusedStageIdx < activeIndex && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#5C8D6B]/15 text-[#5C8D6B] border border-[#5C8D6B]/30 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                  {focusedStageIdx === activeIndex && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/25 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3" />
                      Active Stage
                    </span>
                  )}
                  {focusedStageIdx > activeIndex && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#718096] border border-[#DCE3E3]">
                      Pending Milestone
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#718096] mt-0.5 font-sans">
                  {focusedStage.description}
                </p>
              </div>
            </div>

            {/* Timestamp Badges */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto font-mono text-xs">
              <span className="text-[#718096]">Timestamp:</span>
              <span className="px-2.5 py-1 rounded-md bg-white text-[#173F4F] border border-[#DCE3E3] font-bold shadow-xs">
                {formatStageDate(focusedStage.offsetMs)} {formatStageTime(focusedStage.offsetMs)} UTC
              </span>
              <span className="px-2 py-1 rounded-md bg-white text-[#718096] border border-[#DCE3E3] text-[11px]">
                {focusedStage.relativeBadge}
              </span>
            </div>
          </div>

          {/* Telemetry Log snippet */}
          <div className="mt-3 pt-2.5 border-t border-[#DCE3E3] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-[#718096] gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[#718096]">Optical Telemetry Log:</span>
              <span className="text-[#263238] font-medium">{focusedStage.logDetails}</span>
            </div>
            <span className="text-[#718096] text-[10px] shrink-0">
              Diode Interface: DG-TX-01 (Unidirectional Optical Link)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatTimeline;
