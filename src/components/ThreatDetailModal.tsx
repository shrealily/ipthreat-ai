import React from 'react';
import {
  X,
  ShieldAlert,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  Dna,
} from 'lucide-react';
import { Threat } from '../types';

interface ThreatDetailModalProps {
  threat: Threat | null;
  onClose: () => void;
  onUpdateStatus?: (threatId: string, newStatus: Threat['status']) => void;
  onNavigateToInvestigation?: (threatId: string) => void;
}

export const ThreatDetailModal: React.FC<ThreatDetailModalProps> = ({
  threat,
  onClose,
  onUpdateStatus,
  onNavigateToInvestigation,
}) => {
  if (!threat) return null;

  const severityBadgeClass = {
    critical: 'bg-[#B94A48]/15 text-[#B94A48] border-[#B94A48]/30',
    high: 'bg-[#C87545]/15 text-[#C87545] border-[#C87545]/30',
    medium: 'bg-[#C39A45]/15 text-[#C39A45] border-[#C39A45]/30',
    low: 'bg-[#5C8D6B]/15 text-[#5C8D6B] border-[#5C8D6B]/30',
  }[threat.severity];

  const statusBadgeClass = {
    detected: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
    investigating: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30',
    confirmed: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
    contained: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    resolved: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  }[threat.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        id="threat-detail-modal"
        className="bg-white border border-[#DCE3E3] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#DCE3E3] bg-[#F6F7F5] flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl border ${
                threat.severity === 'critical'
                  ? 'bg-[#B94A48]/15 border-[#B94A48]/30 text-[#B94A48]'
                  : threat.severity === 'high'
                  ? 'bg-[#C87545]/15 border-[#C87545]/30 text-[#C87545]'
                  : 'bg-[#173F4F]/10 border-[#173F4F]/20 text-[#173F4F]'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-[#173F4F] font-bold text-base">
                  {threat.id}
                </span>
                <span
                  className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${severityBadgeClass}`}
                >
                  {threat.severity}
                </span>
                <span
                  className={`text-xs font-mono capitalize px-2.5 py-0.5 rounded-full font-semibold border ${statusBadgeClass}`}
                >
                  {threat.status}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-[#263238] border border-[#DCE3E3]">
                  {threat.direction} Traffic
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#263238] mt-1">
                {threat.threatType}
              </h2>
              <div className="text-xs font-mono text-[#718096] flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#718096]" />
                  Detected: {new Date(threat.detectedAt).toLocaleString()}
                </span>
                <span>&bull;</span>
                <span>Duration: {threat.durationSeconds}s</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-[#718096] hover:text-[#263238] hover:bg-[#DCE3E3]/40 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* IP & Telemetry Quick Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[11px] font-mono text-[#718096] uppercase tracking-wider block mb-1">
                Source IP & Port
              </span>
              <div className="font-mono text-sm font-semibold text-[#263238]">
                {threat.sourceIP}
              </div>
              <div className="text-xs font-mono text-[#718096]">
                Port: {threat.sourcePort}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[11px] font-mono text-[#718096] uppercase tracking-wider block mb-1">
                Destination IP & Port
              </span>
              <div className="font-mono text-sm font-semibold text-[#263238]">
                {threat.destinationIP}
              </div>
              <div className="text-xs font-mono text-[#718096]">
                Port: {threat.destinationPort}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[11px] font-mono text-[#718096] uppercase tracking-wider block mb-1">
                Risk Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#B94A48]">
                  {threat.riskScore}
                </span>
                <span className="text-xs text-[#718096] font-mono">/ 100</span>
              </div>
              <div className="w-full bg-[#DCE3E3] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#B94A48] h-full rounded-full"
                  style={{ width: `${threat.riskScore}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
              <span className="text-[11px] font-mono text-[#718096] uppercase tracking-wider block mb-1">
                AI Model Confidence
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#173F4F]">
                  {threat.aiConfidence}%
                </span>
                <span className="text-xs text-[#5C8D6B] font-mono font-semibold">Verified</span>
              </div>
              <div className="w-full bg-[#DCE3E3] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#173F4F] h-full rounded-full"
                  style={{ width: `${threat.aiConfidence}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Traffic Metrics */}
          <div className="grid grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3] flex items-center justify-between">
              <span className="text-[#718096]">Protocol:</span>
              <span className="text-[#173F4F] font-bold px-2 py-0.5 bg-white rounded border border-[#DCE3E3]">
                {threat.protocol}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3] flex items-center justify-between">
              <span className="text-[#718096]">Traffic Volume:</span>
              <span className="text-[#263238] font-semibold">
                {threat.trafficVolumeMB} MB
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3] flex items-center justify-between">
              <span className="text-[#718096]">Packet Count:</span>
              <span className="text-[#263238] font-semibold">
                {threat.packetCount.toLocaleString()} pkts
              </span>
            </div>
          </div>

          {/* AI Threat DNA Metrics */}
          <div className="p-4 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
            <div className="flex items-center gap-2 mb-3">
              <Dna className="w-4 h-4 text-[#173F4F]" />
              <h3 className="text-sm font-semibold text-[#263238]">
                AI Threat DNA Signature Metrics (0 - 100)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {(
                Object.entries(threat.dnaMetrics) as [
                  keyof typeof threat.dnaMetrics,
                  number
                ][]
              ).map(([key, numVal]) => (
                <div key={key} className="p-2.5 rounded-lg bg-white border border-[#DCE3E3]">
                  <div className="text-[10px] font-mono text-[#718096] capitalize mb-1 truncate">
                    {String(key).replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="flex justify-between items-baseline mb-1 font-mono">
                    <span className="text-sm font-bold text-[#263238]">{numVal}</span>
                    <span className="text-[10px] text-[#718096]">%</span>
                  </div>
                  <div className="w-full bg-[#DCE3E3] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        numVal > 80
                          ? 'bg-[#B94A48]'
                          : numVal > 50
                          ? 'bg-[#C39A45]'
                          : 'bg-[#173F4F]'
                      }`}
                      style={{ width: `${numVal}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Detection Factor Explanations */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#263238] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2F6978]" />
              IPthreat AI Neural Explanations & Evidence
            </h3>
            <div className="space-y-2">
              {threat.explanations.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#173F4F]">
                      {exp.factor}
                    </div>
                    <p className="text-xs text-[#263238] mt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-mono uppercase text-[#718096] block">
                      Factor Weight
                    </span>
                    <span className="text-xs font-mono font-bold text-[#173F4F] px-2 py-0.5 bg-white rounded border border-[#DCE3E3] inline-block mt-0.5">
                      {exp.weight}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#263238] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#5C8D6B]" />
              SOC Mitigation & Diode Safeguards
            </h3>
            <div className="space-y-2">
              {threat.recommendedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-white border border-[#DCE3E3] flex items-center gap-3 text-xs text-[#263238] font-sans"
                >
                  <div className="w-5 h-5 rounded bg-[#5C8D6B]/15 text-[#5C8D6B] flex items-center justify-center shrink-0 border border-[#5C8D6B]/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="flex-1">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#DCE3E3] bg-[#F6F7F5] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#718096] flex-wrap">
            <span className="font-semibold text-[11px] mr-1">Status:</span>
            {(['investigating', 'confirmed', 'contained', 'resolved'] as Threat['status'][]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => onUpdateStatus?.(threat.id, s)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer flex items-center justify-center ${
                    threat.status === s
                      ? 'bg-[#173F4F] text-white border border-[#173F4F] font-bold shadow-xs'
                      : 'bg-white text-[#718096] border border-[#DCE3E3] hover:text-[#263238] hover:bg-[#EEF3F2]'
                  }`}
                >
                  {s}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToInvestigation && (
              <button
                id="btn-modal-open-investigation"
                onClick={() => {
                  onNavigateToInvestigation(threat.id);
                  onClose();
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#173F4F] hover:bg-[#2F6978] text-white text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
              >
                <span>Full Investigation View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-[#DCE3E3] hover:bg-[#EEF3F2] text-[#263238] text-xs font-medium cursor-pointer transition-colors flex items-center justify-center active:scale-98"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
