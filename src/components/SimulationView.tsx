import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
  Clock,
  ChevronRight,
  Flame,
  Info,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { Threat, ThreatSeverity } from '../types';

interface SimulationViewProps {
  onAddThreat?: (threat: Threat) => void;
  onNavigateToInvestigation?: (threatId: string) => void;
}

export type SimulationStageId =
  | 'idle'
  | 'normal-traffic'
  | 'suspicious-traffic'
  | 'anomaly-detected'
  | 'ai-analysis'
  | 'threat-identified'
  | 'critical-alert';

interface StageMeta {
  id: SimulationStageId;
  index: number;
  name: string;
  shortDesc: string;
  durationSec: number;
  logMessage: string;
  color: string;
}

const SIMULATION_STAGES: StageMeta[] = [
  {
    id: 'normal-traffic',
    index: 1,
    name: 'Normal Traffic',
    shortDesc: 'Baseline optical telemetry within 14-day Gaussian envelope (~45 Mbps, zero dropped frames).',
    durationSec: 3.5,
    logMessage: '[DIODE_CORE] Optical RX power nominal: -12.4 dBm. Steady-state telemetry: 46.8 Mbps. FIFO fill: 14%.',
    color: 'emerald',
  },
  {
    id: 'suspicious-traffic',
    index: 2,
    name: 'Suspicious Traffic Increase',
    shortDesc: 'Sudden optical egress velocity spike; packet queue depth surges past 85% threshold.',
    durationSec: 3.5,
    logMessage: '[BUFFER_MON] WARNING: Egress rate jumped from 48 Mbps to 1,240 Mbps in 120ms. Micro-burst sequence active.',
    color: 'amber',
  },
  {
    id: 'anomaly-detected',
    index: 3,
    name: 'Anomaly Detected',
    shortDesc: 'Hardware diode DPI threshold tripped on forbidden high-entropy binary UDP payloads.',
    durationSec: 3.5,
    logMessage: '[DPI_FILTER] Hardware diode threshold breached. High-entropy egress on port 51413 -> 198.51.100.42.',
    color: 'orange',
  },
  {
    id: 'ai-analysis',
    index: 4,
    name: 'AI Analysis',
    shortDesc: 'Neural inference engine extracting TreeSHAP weights, Shannon entropy, and inter-arrival jitter.',
    durationSec: 4.0,
    logMessage: '[NEURAL_INFERENCE] TreeSHAP feature extraction underway. Shannon entropy: 7.94 / 8.00. Jitter divergence: +340%.',
    color: 'cyan',
  },
  {
    id: 'threat-identified',
    index: 5,
    name: 'Threat Identified',
    shortDesc: 'Attack fingerprint classified: Unidirectional Data Exfiltration via UDP Burst (MITRE T1048.003).',
    durationSec: 3.5,
    logMessage: '[CLASSIFIER] Model inference: Exfiltration via covert burst pattern. Confidence: 98.6%. Risk: Critical (96/100).',
    color: 'purple',
  },
  {
    id: 'critical-alert',
    index: 6,
    name: 'Critical Alert',
    shortDesc: 'High-priority incident synthesized; automated SOC containment recommendations generated.',
    durationSec: 0, // Terminal state
    logMessage: '[SOC_BROADCAST] CRITICAL INCIDENT GENERATED (DG-SIM-904). Hardware optical gate containment advised.',
    color: 'rose',
  },
];

interface TrafficDataPoint {
  time: string;
  mbps: number;
  kpps: number;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  onAddThreat,
  onNavigateToInvestigation,
}) => {
  const [currentStage, setCurrentStage] = useState<SimulationStageId>('idle');
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x or 2x
  const [logs, setLogs] = useState<Array<{ timestamp: string; text: string; type: string }>>([
    {
      timestamp: '00:00.000',
      text: '[SIM_READY] Interactive simulation sandbox initialized. 100% simulated data mode active.',
      type: 'info',
    },
  ]);
  const [isThreatAdded, setIsThreatAdded] = useState<boolean>(false);
  const [isContained, setIsContained] = useState<boolean>(false);

  // Live traffic data points (sliding window)
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      time: `-${22 - i}s`,
      mbps: Math.round(42 + Math.sin(i * 0.8) * 8),
      kpps: Math.round(18 + Math.sin(i * 0.8) * 4),
    }));
  });

  // Current metric values
  const [currentThroughput, setCurrentThroughput] = useState<number>(46);
  const [currentPacketRate, setCurrentPacketRate] = useState<number>(19);
  const [queueFill, setQueueFill] = useState<number>(14);
  const [aiConfidenceProgress, setAiConfidenceProgress] = useState<number>(0);

  // Refs for timers
  const stageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trafficIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Clear all running timers
  const clearAllTimers = () => {
    if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Format elapsed time string
  const getElapsedTimestamp = () => {
    if (!startTimeRef.current) return '00:00.000';
    const elapsed = Date.now() - startTimeRef.current;
    const mins = Math.floor(elapsed / 60000).toString().padStart(2, '0');
    const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    const ms = Math.floor(elapsed % 1000).toString().padStart(3, '0');
    return `${mins}:${secs}.${ms}`;
  };

  const addLog = (text: string, type: 'info' | 'warn' | 'threat' | 'success' = 'info') => {
    setLogs((prev) => [
      ...prev.slice(-40),
      {
        timestamp: getElapsedTimestamp(),
        text,
        type,
      },
    ]);
  };

  // Continuous traffic generator interval
  useEffect(() => {
    trafficIntervalRef.current = setInterval(() => {
      setTrafficData((prev) => {
        let targetMbps = 45;
        let targetKpps = 18;
        let targetQueue = 15;

        if (currentStage === 'idle' || currentStage === 'normal-traffic') {
          targetMbps = 42 + Math.random() * 12;
          targetKpps = 17 + Math.random() * 4;
          targetQueue = 12 + Math.random() * 6;
        } else if (currentStage === 'suspicious-traffic') {
          // Surge up to 1240 Mbps
          targetMbps = 950 + Math.random() * 320;
          targetKpps = 140 + Math.random() * 40;
          targetQueue = 85 + Math.random() * 12;
        } else if (currentStage === 'anomaly-detected') {
          targetMbps = 1180 + Math.random() * 140;
          targetKpps = 160 + Math.random() * 25;
          targetQueue = 94 + Math.random() * 5;
        } else if (currentStage === 'ai-analysis') {
          targetMbps = 1120 + Math.random() * 100;
          targetKpps = 155 + Math.random() * 20;
          targetQueue = 92 + Math.random() * 4;
        } else if (currentStage === 'threat-identified' || currentStage === 'critical-alert') {
          if (isContained) {
            targetMbps = 0.2;
            targetKpps = 0.1;
            targetQueue = 2;
          } else {
            targetMbps = 1240 + Math.random() * 90;
            targetKpps = 175 + Math.random() * 20;
            targetQueue = 98;
          }
        }

        const newPoint: TrafficDataPoint = {
          time: 'now',
          mbps: Math.round(targetMbps),
          kpps: Math.round(targetKpps),
        };

        setCurrentThroughput(Math.round(targetMbps));
        setCurrentPacketRate(Math.round(targetKpps));
        setQueueFill(Math.round(targetQueue));

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, 450);

    return () => {
      if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
    };
  }, [currentStage, isContained]);

  // Handle stage transitions
  const transitionToStage = (stageId: SimulationStageId) => {
    setCurrentStage(stageId);
    setStageProgress(0);

    const stageMeta = SIMULATION_STAGES.find((s) => s.id === stageId);
    if (stageMeta) {
      const logType =
        stageId === 'critical-alert'
          ? 'threat'
          : stageId === 'threat-identified' || stageId === 'anomaly-detected'
          ? 'warn'
          : 'info';
      addLog(stageMeta.logMessage, logType);
    }

    if (stageId === 'critical-alert') {
      setAiConfidenceProgress(98.6);
      return;
    }

    if (!stageMeta || stageMeta.durationSec <= 0) return;

    const durationMs = (stageMeta.durationSec * 1000) / speedMultiplier;
    const intervalTick = 50;
    const stepIncrement = (intervalTick / durationMs) * 100;

    // Progress bar tick
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setStageProgress((prev) => {
        const next = prev + stepIncrement;
        if (stageId === 'ai-analysis') {
          setAiConfidenceProgress(Math.min(98.6, Math.round((next / 100) * 98.6 * 10) / 10));
        }
        return next >= 100 ? 100 : next;
      });
    }, intervalTick);

    // Timeout to advance to next stage
    const currentIndex = SIMULATION_STAGES.findIndex((s) => s.id === stageId);
    if (currentIndex >= 0 && currentIndex < SIMULATION_STAGES.length - 1) {
      const nextStage = SIMULATION_STAGES[currentIndex + 1].id;
      if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current);
      stageTimeoutRef.current = setTimeout(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        transitionToStage(nextStage);
      }, durationMs);
    }
  };

  // Run Simulation
  const handleStartSimulation = () => {
    clearAllTimers();
    startTimeRef.current = Date.now();
    setIsThreatAdded(false);
    setIsContained(false);
    setAiConfidenceProgress(0);
    addLog('[SIM_START] Simulation sequence initiated by SOC operator.', 'info');
    transitionToStage('normal-traffic');
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    clearAllTimers();
    setCurrentStage('idle');
    setStageProgress(0);
    setAiConfidenceProgress(0);
    setIsThreatAdded(false);
    setIsContained(false);
    setCurrentThroughput(46);
    setCurrentPacketRate(19);
    setQueueFill(14);
    addLog('[SIM_RESET] Simulation state reset. Optical diode telemetry restored to nominal idle baseline.', 'info');
  };

  // Computed active stage index
  const activeStageIndex = useMemo(() => {
    if (currentStage === 'idle') return 0;
    const idx = SIMULATION_STAGES.findIndex((s) => s.id === currentStage);
    return idx >= 0 ? idx + 1 : 0;
  }, [currentStage]);

  // Mock threat object synthesized during critical alert
  const mockGeneratedThreat: Threat = useMemo(
    () => ({
      id: 'DG-SIM-904',
      threatType: 'Anomalous Optical Egress Rate',
      severity: 'critical',
      direction: 'Unidirectional',
      sourceIP: '10.240.12.18',
      destinationIP: '198.51.100.42',
      sourcePort: 51413,
      destinationPort: 443,
      protocol: 'UDP / Raw Stream',
      detectedAt: new Date().toISOString(),
      durationSeconds: 142,
      trafficVolumeMB: 842.6,
      packetCount: 948210,
      aiConfidence: 98.6,
      riskScore: 96,
      status: isContained ? 'contained' : 'detected',
      recommendedActions: [
        'Hardware Diode TX port optical isolation',
        'Revoke Kerberos session on source host 10.240.12.18',
        'Quarantine upstream switch port Gi1/0/22',
        'Capture optical ring buffer frame dumps',
      ],
      explanations: [
        {
          factor: 'Traffic significantly above baseline',
          description: 'Observed egress velocity breached 14-day optical threshold by 26x.',
          weight: 96,
        },
        {
          factor: 'High-entropy payload distribution',
          description: 'Shannon entropy calculated at 7.94 / 8.00, indicative of encrypted covert exfiltration.',
          weight: 88,
        },
        {
          factor: 'Repeated micro-burst interval',
          description: 'Inter-arrival jitter divergence collapsed to 0.04ms constant streaming.',
          weight: 79,
        },
      ],
      dnaMetrics: {
        packetFrequency: 95,
        portDiversity: 15,
        destinationSpread: 10,
        trafficVolume: 98,
        protocolAnomaly: 92,
      },
    }),
    [isContained]
  );

  const handleAddThreatToGlobal = () => {
    if (onAddThreat && !isThreatAdded) {
      onAddThreat(mockGeneratedThreat);
      setIsThreatAdded(true);
      addLog(`[FEED_SYNC] Mock threat ${mockGeneratedThreat.id} added to live session dashboard.`, 'success');
    }
  };

  const handleContainThreat = () => {
    setIsContained(true);
    addLog('[CONTAINMENT] Hardware optical port DG-TX-01 gated. Simulated exfiltration link severed.', 'success');
  };

  // SVG Chart Dimensions & Path Calculation
  const chartWidth = 600;
  const chartHeight = 160;
  const maxScaleMbps = 1400;

  const chartPoints = useMemo(() => {
    if (trafficData.length === 0) return '';
    return trafficData
      .map((d, i) => {
        const x = (i / (trafficData.length - 1)) * chartWidth;
        const y = chartHeight - (Math.min(maxScaleMbps, d.mbps) / maxScaleMbps) * (chartHeight - 20) - 10;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [trafficData]);

  const chartAreaPoints = useMemo(() => {
    if (!chartPoints) return '';
    return `0,${chartHeight} ${chartPoints} ${chartWidth},${chartHeight}`;
  }, [chartPoints]);

  return (
    <div className="space-y-6 animate-fade-in select-none text-[#263238]" id="simulation-view">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DCE3E3]">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EEF3F5] border border-[#DCE3E3] text-[#173F4F]">
              <Play className="w-6 h-6 text-[#173F4F]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#263238] font-display flex items-center gap-2.5">
                <span>Threat Simulation Lab</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1] font-normal">
                  Safe Sandbox Mode
                </span>
              </h1>
              <p className="text-xs md:text-sm text-[#718096] mt-0.5">
                Demonstration sandbox testing IPthreat AI’s optical anomaly detection pipeline through simulated industrial exfiltration scenarios.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE3E3] text-xs font-mono text-[#718096] flex items-center gap-2.5 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#5C8D6B] shrink-0" />
          <span>
            <strong className="text-[#263238]">Isolated Sandbox:</strong> 100% simulated client-side telemetry. Zero outbound requests or active scanning.
          </span>
        </div>
      </div>

      {/* Primary Action & Control Bar */}
      <div className="p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Buttons & Clarifying Caption */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Run Simulation Button */}
            <button
              type="button"
              onClick={handleStartSimulation}
              disabled={currentStage !== 'idle' && currentStage !== 'critical-alert'}
              className={`min-h-[44px] py-2.5 px-6 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs ${
                currentStage === 'idle' || currentStage === 'critical-alert'
                  ? 'bg-[#173F4F] hover:bg-[#234E5E] text-white active:scale-98'
                  : 'bg-[#EEF3F5] text-[#718096] border border-[#DCE3E3] cursor-not-allowed'
              }`}
            >
              {currentStage !== 'idle' && currentStage !== 'critical-alert' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#173F4F] animate-ping"></span>
                  <span>Simulation Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>

            {/* Reset Simulation Button */}
            <button
              type="button"
              onClick={handleResetSimulation}
              disabled={currentStage === 'idle'}
              className={`min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-colors border ${
                currentStage !== 'idle'
                  ? 'bg-[#F4F6F6] hover:bg-[#E2E8F0] text-[#263238] border-[#DCE3E3] cursor-pointer'
                  : 'bg-[#F8FAF9] text-[#A0AEC0] border-[#E2E8F0] cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulation</span>
            </button>

            {/* Speed Selector Toggle */}
            <div className="flex items-center gap-1 bg-[#F8FAF9] p-1 rounded-xl border border-[#DCE3E3] text-xs font-mono">
              <span className="text-[10px] text-[#718096] px-2 uppercase font-semibold">Speed:</span>
              <button
                type="button"
                onClick={() => setSpeedMultiplier(1)}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[11px] cursor-pointer transition-colors ${
                  speedMultiplier === 1
                    ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                1x (Normal)
              </button>
              <button
                type="button"
                onClick={() => setSpeedMultiplier(2)}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[11px] cursor-pointer transition-colors ${
                  speedMultiplier === 2
                    ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                2x (Fast)
              </button>
            </div>
          </div>

          {/* User Clarifying Caption */}
          <p className="text-xs text-[#718096] font-sans flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#173F4F] shrink-0" />
            <span>
              This is a safe demo using simulated data only. No real packets are dispatched or received.
            </span>
          </p>
        </div>

        {/* Right: Simulation State Status Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono">
            <span className="text-[10px] text-[#718096] uppercase block font-semibold">Active Phase</span>
            <span className="text-xs font-bold text-[#263238]">
              {currentStage === 'idle'
                ? 'Standby / Ready'
                : SIMULATION_STAGES.find((s) => s.id === currentStage)?.name}
            </span>
          </div>
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 ${
              currentStage === 'idle'
                ? 'border-[#CBD5E1] bg-[#F4F6F6]'
                : currentStage === 'critical-alert'
                ? 'border-[#B94A48] bg-[#B94A48] animate-pulse'
                : 'border-[#173F4F] bg-[#173F4F]'
            }`}
          ></div>
        </div>
      </div>

      {/* 6-Stage Sequential Progress Stepper */}
      <div className="p-5 md:p-6 rounded-xl bg-white border border-[#DCE3E3] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCE3E3]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm md:text-base font-semibold text-[#263238] font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#173F4F]" />
              Simulation Lifecycle Progression
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1]">
              {currentStage === 'idle' ? '0/6 Completed' : `${activeStageIndex}/6 Active`}
            </span>
          </div>

          <div className="text-xs font-mono text-[#718096]">
            {currentStage === 'idle' && 'Awaiting operator trigger'}
            {currentStage === 'critical-alert' && (
              <span className="text-[#B94A48] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Simulation Reached Terminal Alert
              </span>
            )}
            {currentStage !== 'idle' && currentStage !== 'critical-alert' && (
              <span className="text-[#173F4F] font-semibold">Phase Progress: {Math.round(stageProgress)}%</span>
            )}
          </div>
        </div>

        {/* Stepper Horizontal Node Bar */}
        <div className="pt-2 pb-1 overflow-x-auto">
          <div className="min-w-[680px] relative px-4">
            {/* Background connecting rail */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#E2E8F0] -z-0"></div>

            {/* Active filled progress rail */}
            <div
              className="absolute top-5 left-8 h-0.5 bg-[#173F4F] -z-0 transition-all duration-300"
              style={{
                width: `${
                  currentStage === 'idle'
                    ? 0
                    : Math.min(
                        100,
                        ((activeStageIndex - 1 + stageProgress / 100) / (SIMULATION_STAGES.length - 1)) *
                          100
                      )
                }%`,
              }}
            ></div>

            {/* Nodes */}
            <div className="flex items-start justify-between relative z-10">
              {SIMULATION_STAGES.map((stage, idx) => {
                const stageNum = idx + 1;
                const isCompleted = activeStageIndex > stageNum;
                const isActive = activeStageIndex === stageNum;

                let circleStyle = 'border-[#CBD5E1] bg-[#F8FAF9] text-[#718096]';
                let labelColor = 'text-[#718096]';

                if (isCompleted) {
                  circleStyle = 'border-[#5C8D6B] bg-[#F0FDF4] text-[#5C8D6B]';
                  labelColor = 'text-[#263238]';
                } else if (isActive) {
                  if (stage.id === 'critical-alert') {
                    circleStyle = 'border-[#B94A48] bg-[#FDF2F2] text-[#B94A48] font-bold shadow-xs';
                    labelColor = 'text-[#B94A48] font-bold';
                  } else {
                    circleStyle = 'border-[#173F4F] bg-[#EEF3F5] text-[#173F4F] font-bold shadow-xs';
                    labelColor = 'text-[#173F4F] font-bold';
                  }
                }

                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center text-center transition-all duration-200"
                    style={{ width: `${100 / SIMULATION_STAGES.length}%` }}
                  >
                    {/* Circle Node */}
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all relative ${circleStyle}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[#5C8D6B]" />
                      ) : (
                        <span>0{stageNum}</span>
                      )}
                    </div>

                    {/* Stage Label */}
                    <span
                      className={`mt-2 text-[11px] font-display font-semibold transition-colors px-1 leading-tight ${labelColor}`}
                    >
                      {stage.name}
                    </span>

                    {/* Status Badge */}
                    <span className="mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#DCE3E3] bg-[#F8FAF9] text-[#718096]">
                      {isCompleted ? 'Done' : isActive ? 'Active' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Active Stage Description Callout */}
        {currentStage !== 'idle' && (
          <div className="p-3.5 rounded-lg bg-[#F8FAF9] border border-[#DCE3E3] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#173F4F] font-bold">
                Stage {activeStageIndex}: {SIMULATION_STAGES[activeStageIndex - 1]?.name}
              </span>
              <span className="text-[#718096]">—</span>
              <span className="text-[#263238] font-sans">
                {SIMULATION_STAGES[activeStageIndex - 1]?.shortDesc}
              </span>
            </div>

            {/* Progress percentage bar inside callout */}
            {currentStage !== 'critical-alert' && (
              <div className="w-32 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden shrink-0">
                <div
                  className="bg-[#173F4F] h-full transition-all duration-100"
                  style={{ width: `${stageProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Mini-Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. Live Optical Traffic Chart (7 cols on LG) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE3E3]">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-[#263238] font-display flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#173F4F]" />
                Live Optical Egress Throughput
              </h3>
              <p className="text-xs text-[#718096] mt-0.5">
                Real-time telemetry stream sampled at the hardware diode TX laser boundary.
              </p>
            </div>

            {/* Spike indicator badge */}
            <div className="flex items-center gap-2 font-mono text-xs">
              {currentThroughput > 120 ? (
                <span className="px-2.5 py-1 rounded-full bg-[#FDF2F2] text-[#B94A48] border border-[#F8D7DA] font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#B94A48]" />
                  Traffic Surge (Spiking)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#5C8D6B] border border-[#DCFCE7] font-medium">
                  Normal Baseline
                </span>
              )}
            </div>
          </div>

          {/* Metric Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Throughput</span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-bold ${
                    currentThroughput > 120 ? 'text-[#B94A48]' : 'text-[#173F4F]'
                  }`}
                >
                  {currentThroughput}
                </span>
                <span className="text-[11px] text-[#718096]">Mbps</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Packet Rate</span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-bold ${
                    currentPacketRate > 50 ? 'text-[#B94A48]' : 'text-[#263238]'
                  }`}
                >
                  {currentPacketRate}
                </span>
                <span className="text-[11px] text-[#718096]">kpps</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Diode FIFO Fill</span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-bold ${
                    queueFill > 75 ? 'text-[#B94A48]' : 'text-[#263238]'
                  }`}
                >
                  {queueFill}%
                </span>
                <span className="text-[11px] text-[#718096]">Capacity</span>
              </div>
            </div>
          </div>

          {/* SVG Traffic Chart */}
          <div className="relative p-3 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] overflow-hidden">
            {/* Threshold line label */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#718096] mb-1">
              <span>Peak: 1,400 Mbps</span>
              <span className="text-[#B94A48] font-bold">--- Anomaly Threshold: 120 Mbps</span>
              <span>0 Mbps</span>
            </div>

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={currentThroughput > 120 ? 'var(--sev-crit)' : 'var(--primary-teal)'}
                    stopOpacity="0.2"
                  />
                  <stop
                    offset="100%"
                    stopColor={currentThroughput > 120 ? 'var(--sev-crit)' : 'var(--primary-teal)'}
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2={chartWidth} y2="30" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2={chartWidth} y2="80" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2={chartWidth} y2="130" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Anomaly Threshold Line (120 Mbps) */}
              <line
                x1="0"
                y1={chartHeight - (120 / maxScaleMbps) * (chartHeight - 20) - 10}
                x2={chartWidth}
                y2={chartHeight - (120 / maxScaleMbps) * (chartHeight - 20) - 10}
                stroke="var(--sev-crit)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Filled Area */}
              {chartAreaPoints && (
                <polygon points={chartAreaPoints} fill="url(#trafficGradient)" />
              )}

              {/* Main Line */}
              {chartPoints && (
                <polyline
                  fill="none"
                  stroke={currentThroughput > 120 ? 'var(--sev-crit)' : 'var(--primary-teal)'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartPoints}
                />
              )}
            </svg>

            {/* Annotation Overlay when spiking */}
            {currentThroughput > 120 && (
              <div className="absolute top-6 right-6 p-2 rounded-lg bg-white border border-[#F8D7DA] text-[11px] font-mono text-[#B94A48] flex items-center gap-1.5 shadow-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B94A48]" />
                <span>Egress Surge: 26x over baseline</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. AI Analysis Scanning & Radar Animation (5 cols on LG) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE3E3]">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-[#263238] font-display flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#173F4F]" />
                AI Inference & Radar Analysis
              </h3>
              <p className="text-xs text-[#718096] mt-0.5">
                TreeSHAP feature extraction and threat fingerprinting engine.
              </p>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1]">
              Neural Core
            </span>
          </div>

          {/* Interactive Radar Scanning Box */}
          <div className="p-4 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] relative overflow-hidden flex flex-col items-center justify-center min-h-[190px]">
            {/* Animated Radar Sweep during AI Analysis */}
            {currentStage === 'ai-analysis' || currentStage === 'threat-identified' ? (
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Concentric Radar Circles */}
                <div className="absolute inset-0 rounded-full border border-[#CBD5E1]"></div>
                <div className="absolute inset-4 rounded-full border border-[#E2E8F0]"></div>
                <div className="absolute inset-8 rounded-full border border-[#CBD5E1]"></div>

                {/* Rotating Scanning Radar Sweep */}
                <div className="absolute inset-0 rounded-full animate-spin [animation-duration:2.5s]">
                  <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#173F4F]/25 via-[#173F4F]/05 to-transparent rounded-tl-full origin-bottom-right"></div>
                </div>

                {/* Center Target Indicator */}
                <div className="relative z-10 p-2.5 rounded-full bg-[#173F4F] border border-[#173F4F] text-white shadow-xs">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>

                {/* Scanning blips */}
                <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-[#B94A48] animate-ping"></div>
                <div className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-[#C87545] animate-pulse"></div>
              </div>
            ) : currentStage === 'critical-alert' ? (
              <div className="text-center space-y-2 py-2">
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#FDF2F2] border border-[#F8D7DA] flex items-center justify-center text-[#B94A48]">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <span className="text-xs font-mono font-bold text-[#B94A48] block">
                  Classification Complete (98.6% Conf)
                </span>
                <span className="text-[11px] text-[#718096]">
                  Target: Diode Egress Stream DG-TX-01
                </span>
              </div>
            ) : (
              <div className="text-center space-y-2 py-4">
                <div className="w-12 h-12 mx-auto rounded-lg bg-[#EEF3F5] border border-[#DCE3E3] flex items-center justify-center text-[#718096]">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-[#718096] font-semibold block">
                  Awaiting Telemetry Anomaly Trigger
                </span>
                <span className="text-[11px] text-[#A0AEC0]">
                  Model in background observation mode
                </span>
              </div>
            )}

            {/* Live Progress Bar for AI Analysis */}
            <div className="w-full mt-4 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#718096]">Model Confidence Attribution:</span>
                <span className="text-[#173F4F] font-bold">{aiConfidenceProgress}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#173F4F] h-full transition-all duration-200"
                  style={{ width: `${aiConfidenceProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* TreeSHAP Neural Feature Weights */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#718096] uppercase tracking-wider block font-semibold">
              TreeSHAP Anomaly Weights:
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="p-2 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[#263238]">Optical Packet Burst Velocity</span>
                <span className="text-[#B94A48] font-bold">+0.44 SHAP</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[#263238]">Payload Shannon Entropy (7.94)</span>
                <span className="text-[#B94A48] font-bold">+0.32 SHAP</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[#263238]">Arrival Jitter Divergence</span>
                <span className="text-[#C87545] font-bold">+0.18 SHAP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Critical Alert Banner & Mock Threat Card (Appears during 'critical-alert') */}
      {currentStage === 'critical-alert' && (
        <div className="space-y-4 animate-fade-in" id="critical-alert-section">
          {/* Alert Banner */}
          <div className="p-4 md:p-5 rounded-xl bg-[#FDF2F2] border-2 border-[#B94A48] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-lg bg-[#B94A48] text-white shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#B94A48] text-white">
                    CRITICAL ALERT
                  </span>
                  <span className="text-xs font-mono text-[#B94A48] font-bold">
                    Incident ID: DG-SIM-904
                  </span>
                </div>
                <h2 className="text-base md:text-lg font-bold text-[#263238] font-display mt-0.5">
                  High-Entropy Data Exfiltration Detected Across Diode TX Boundary
                </h2>
                <p className="text-xs text-[#718096] font-sans mt-0.5">
                  Automated containment recommended: Optical burst violates unidirectional physical baseline.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {!isContained ? (
                <button
                  type="button"
                  onClick={handleContainThreat}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#B94A48] hover:bg-[#A83836] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-98"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Contain Optical Port</span>
                </button>
              ) : (
                <span className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F0FDF4] text-[#5C8D6B] border border-[#DCFCE7] text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#5C8D6B]" />
                  Diode Port Contained
                </span>
              )}

              {onAddThreat && (
                <button
                  type="button"
                  onClick={handleAddThreatToGlobal}
                  disabled={isThreatAdded}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    isThreatAdded
                      ? 'bg-[#EEF3F5] text-[#718096] border-[#DCE3E3] cursor-not-allowed'
                      : 'bg-white hover:bg-[#F4F6F6] text-[#263238] border-[#DCE3E3] cursor-pointer active:scale-98'
                  }`}
                >
                  {isThreatAdded ? 'Added to Feed' : 'Add to Threat Feed'}
                </button>
              )}
            </div>
          </div>

          {/* Synthesized Mock Threat Card */}
          <div className="p-5 md:p-6 rounded-xl bg-white border border-[#F8D7DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE3E3]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FDF2F2] text-[#B94A48] border border-[#F8D7DA]">
                  {mockGeneratedThreat.id}
                </span>
                <div>
                  <h4 className="text-base font-bold text-[#263238] font-display">
                    {mockGeneratedThreat.threatType}
                  </h4>
                  <span className="text-xs text-[#718096] font-mono">
                    MITRE ATT&CK T1048.003 — Exfiltration Over Alternative Protocol
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#718096]">AI Confidence:</span>
                <span className="px-2 py-0.5 rounded bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1] font-bold">
                  98.6%
                </span>
              </div>
            </div>

            {/* Threat Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[10px] text-[#718096] uppercase font-semibold">Origin Source</span>
                <p className="font-bold text-[#263238]">{mockGeneratedThreat.sourceIP}:{mockGeneratedThreat.sourcePort}</p>
                <span className="text-[10px] text-[#718096]">Compromised Host</span>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[10px] text-[#718096] uppercase font-semibold">Destination Drop</span>
                <p className="font-bold text-[#B94A48]">{mockGeneratedThreat.destinationIP}:{mockGeneratedThreat.destinationPort}</p>
                <span className="text-[10px] text-[#718096]">Untrusted WAN</span>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[10px] text-[#718096] uppercase font-semibold">Payload Volume</span>
                <p className="font-bold text-[#263238]">{mockGeneratedThreat.trafficVolumeMB} MB</p>
                <span className="text-[10px] text-[#718096]">948,210 Packets</span>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-0.5">
                <span className="text-[10px] text-[#718096] uppercase font-semibold">Diode Enforcement</span>
                <p className="font-bold text-[#173F4F]">Forward Only</p>
                <span className="text-[10px] text-[#5C8D6B]">Zero Reverse ACK</span>
              </div>
            </div>

            {/* Recommended Response Steps */}
            <div className="p-4 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#263238] font-bold block">
                Automated Containment Playbook Actions:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[#263238]">
                {mockGeneratedThreat.recommendedActions?.map((action, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#173F4F] shrink-0"></span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deep Investigation Navigation Link */}
            {onNavigateToInvestigation && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigateToInvestigation(mockGeneratedThreat.id)}
                  className="py-2.5 px-5 rounded-lg bg-[#173F4F] hover:bg-[#234E5E] text-white text-xs font-mono font-bold flex items-center gap-2 shadow-xs active:scale-98 transition-colors cursor-pointer"
                >
                  <span>Open Full Forensic Investigation ({mockGeneratedThreat.id})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-Time Simulation Event Log (Console Output) */}
      <div className="p-5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCE3E3]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#173F4F]" />
            <h3 className="text-sm font-semibold text-[#263238] font-display">
              Optical Kernel & Detection Engine Log
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#718096]">
            {logs.length} telemetry event entries
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] font-mono text-xs max-h-48 overflow-y-auto space-y-1.5">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
              <span className="text-[#718096] shrink-0 select-none">[{log.timestamp}]</span>
              <span
                className={
                  log.type === 'threat'
                    ? 'text-[#B94A48] font-bold'
                    : log.type === 'warn'
                    ? 'text-[#C87545]'
                    : log.type === 'success'
                    ? 'text-[#5C8D6B] font-semibold'
                    : 'text-[#263238]'
                }
              >
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimulationView;
