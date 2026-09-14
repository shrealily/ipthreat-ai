import React, { useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { NavPageId } from '../types';

export interface TourStep {
  stepNumber: number;
  title: string;
  description: string;
  targetPage: NavPageId;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'center';
}

export const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    title: 'Welcome to IPthreat AI',
    description:
      'IPthreat AI is a professional security operations dashboard for detecting cyber threats in unidirectional (one-way) IP traffic across optical data diodes.',
    targetPage: 'dashboard',
    position: 'center',
  },
  {
    stepNumber: 2,
    title: 'Dashboard Overview',
    description:
      'The Dashboard provides a quick, consolidated overview of the current network security posture, active alarms, and physical diode link status.',
    targetPage: 'dashboard',
    targetSelector: '#nav-link-dashboard',
    position: 'bottom',
  },
  {
    stepNumber: 3,
    title: 'Security Telemetry Statistics',
    description:
      'These cards summarize total flows, anomalies, high-risk threats, and critical incidents requiring immediate SOC analyst triage.',
    targetPage: 'dashboard',
    targetSelector: '#dashboard-stats-grid',
    position: 'bottom',
  },
  {
    stepNumber: 4,
    title: 'Live Threat Feed',
    description:
      'Use this live streaming section to inspect newly detected suspicious activity, optical anomalies, and payload alerts in real-time.',
    targetPage: 'live-threats',
    targetSelector: '#live-threats-view',
    position: 'bottom',
  },
  {
    stepNumber: 5,
    title: 'Threat Deep Inspection',
    description:
      'Click any threat record in the table or timeline to open deep packet inspection, hex decodes, and forensic analysis.',
    targetPage: 'investigation',
    targetSelector: '#investigation-view',
    position: 'bottom',
  },
  {
    stepNumber: 6,
    title: 'Risk Score (0–100)',
    description:
      'This composite score represents the estimated severity and operational danger of the detected behavior.',
    targetPage: 'investigation',
    targetSelector: '#metric-risk-score',
    position: 'bottom',
  },
  {
    stepNumber: 7,
    title: 'AI Detection Confidence',
    description:
      'This metric indicates how strongly the machine learning model supports its anomaly classification against baseline normal patterns.',
    targetPage: 'investigation',
    targetSelector: '#metric-ai-confidence',
    position: 'bottom',
  },
  {
    stepNumber: 8,
    title: 'Why did AI flag this?',
    description:
      'This section provides human-readable, explainable AI evidence breaking down why the traffic was classified as malicious.',
    targetPage: 'investigation',
    targetSelector: '#ai-explanation-panel',
    position: 'top',
  },
  {
    stepNumber: 9,
    title: 'Network Topology Map',
    description:
      'Use the network topology to visualize communication between internal PLCs, diodes, and IT servers to identify suspicious flows.',
    targetPage: 'network-map',
    targetSelector: '#network-map-canvas',
    position: 'top',
  },
  {
    stepNumber: 10,
    title: 'Traffic & Timeline Analysis',
    description:
      'Compare normal baseline traffic against suspicious burst patterns to verify protocol timing and Shannon entropy shifts.',
    targetPage: 'threat-history',
    targetSelector: '#threat-history-view',
    position: 'bottom',
  },
  {
    stepNumber: 11,
    title: 'Attack Simulation Engine',
    description:
      'Use the simulation sandbox to safely trigger sample attacks and demonstrate how abnormal behavior progresses into threat alerts.',
    targetPage: 'simulation',
    targetSelector: '#simulation-view',
    position: 'bottom',
  },
  {
    stepNumber: 12,
    title: 'Incident Management Kanban',
    description:
      'Track incidents from detection through investigation, confirmation, containment, and resolution across structured workflow lanes.',
    targetPage: 'incidents',
    targetSelector: '#incidents-kanban-board',
    position: 'bottom',
  },
  {
    stepNumber: 13,
    title: 'Threat History Archive',
    description:
      'Review previous threats, historical trends, and export audit-ready evidence for IEC 62443 and NERC CIP compliance.',
    targetPage: 'threat-history',
    targetSelector: '#threat-history-view',
    position: 'bottom',
  },
  {
    stepNumber: 14,
    title: 'AI Model Observability',
    description:
      'Review model accuracy, precision, recall, F1 score, confusion matrices, and monitor for baseline dataset drift.',
    targetPage: 'model-monitoring',
    targetSelector: '#model-monitoring-view',
    position: 'bottom',
  },
  {
    stepNumber: 15,
    title: 'Settings & Customization',
    description:
      'Customize appearance (Light/Dark mode), alert notifications, dashboard card visibility, and security display preferences.',
    targetPage: 'settings',
    targetSelector: '#settings-view',
    position: 'bottom',
  },
  {
    stepNumber: 16,
    title: 'Guided Tour Complete',
    description:
      'You now know how to use IPthreat AI! Explore the live feeds, investigate simulated incidents, and tailor the dashboard to your preferences.',
    targetPage: 'dashboard',
    position: 'center',
  },
];

interface GuidedTourProps {
  currentStepIndex: number;
  isOpen: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onNavigatePage: (page: NavPageId) => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  currentStepIndex,
  isOpen,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  onNavigatePage,
}) => {
  const step = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  // Navigate to target page if different
  useEffect(() => {
    if (isOpen && step && step.targetPage) {
      onNavigatePage(step.targetPage);
    }
  }, [isOpen, currentStepIndex, step, onNavigatePage]);

  if (!isOpen) return null;

  return (
    <div
      id="guided-tour-overlay"
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4 bg-black/30 backdrop-blur-[1px]"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#202727] border-2 border-[#173F4F] dark:border-[#6D9C98] rounded-2xl shadow-2xl p-6 pointer-events-auto transition-all animate-fadeIn"
      >
        {/* Step Progress & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E3] dark:border-[#34403F] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#173F4F] dark:bg-[#6D9C98]"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#173F4F] dark:text-[#6D9C98]">
              Interactive Tour &bull; Step {step.stepNumber} of {totalSteps}
            </span>
          </div>
          <button
            onClick={onSkip}
            className="text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2] min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer"
            aria-label="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[#F6F7F5] dark:bg-[#1A2121] mb-4 overflow-hidden">
          <div
            className="h-full bg-[#173F4F] dark:bg-[#6D9C98] transition-all duration-300"
            style={{ width: `${((step.stepNumber) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Body */}
        <div className="space-y-2 mb-6">
          <h3 className="text-base font-bold text-[#263238] dark:text-[#DCE5E2]">
            {step.title}
          </h3>
          <p className="text-xs text-[#718096] dark:text-[#A8B7B4] leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onSkip}
            className="text-xs text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2] hover:underline cursor-pointer min-h-[44px] px-2 flex items-center"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center justify-center gap-1 min-h-[44px] px-3.5 py-2 text-xs font-medium text-[#263238] dark:text-[#DCE5E2] bg-[#F6F7F5] dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] hover:bg-[#DCE3E3] dark:hover:bg-[#283131] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {isLast ? (
              <button
                onClick={onFinish}
                className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-[#173F4F] hover:bg-[#2F6978] dark:bg-[#6D9C98] dark:hover:bg-[#507774] rounded-xl transition-colors shadow-xs cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-[#173F4F] hover:bg-[#2F6978] dark:bg-[#6D9C98] dark:hover:bg-[#507774] rounded-xl transition-colors shadow-xs cursor-pointer active:scale-98"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
