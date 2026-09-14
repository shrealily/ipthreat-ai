import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Play,
  RotateCcw,
  LayoutDashboard,
  Radio,
  SearchCheck,
  Brain,
  ShieldAlert,
  Network,
  Activity,
  PlayCircle,
  Kanban,
  History,
  Cpu,
  Settings,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { NavPageId } from '../types';

interface GuideSection {
  id: string;
  title: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  pageTarget?: NavPageId;
  whatItDoes: string;
  whyUseful: string;
  whatToLookAt: string;
  whatActionToTake: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'getting-started',
    title: '1. Getting Started with IPthreat AI',
    shortLabel: 'Getting Started',
    icon: Compass,
    pageTarget: 'dashboard',
    whatItDoes:
      'Provides an end-to-end overview of physical data diode security monitoring. In an industrial or critical infrastructure environment, data diodes enforce strictly unidirectional (one-way) physical fiber communication to guarantee that external networks cannot send unauthorized commands into secure OT networks.',
    whyUseful:
      'Because return TCP handshakes are physically blocked by the hardware, standard bi-directional intrusion prevention systems fail. IPthreat AI uses specialized AI models trained on one-way UDP datagram streams to detect covert intrusion attempts without needing return traffic.',
    whatToLookAt:
      'Observe the physical diode status indicator ("Optical Diode Enforced") in the sidebar and top telemetry pill to verify that reverse leakage is locked at 0.00%.',
    whatActionToTake:
      'Start by reviewing the high-level metrics on the Dashboard, then drill down into newly flagged anomalies in the Live Threat Feed.',
  },
  {
    id: 'dashboard',
    title: '2. Security Operations Dashboard',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    pageTarget: 'dashboard',
    whatItDoes:
      'Consolidates all high-level security metrics into a single executive pane, displaying active critical alerts, monitored diode stream volumes, overall model confidence, and the threat severity distribution.',
    whyUseful:
      'Allows tier-1 and tier-2 SOC analysts to assess network health at a glance without having to parse raw packet logs.',
    whatToLookAt:
      'The top 4 stat cards (Active Critical Alerts, One-Way Diode Traffic, AI Detection Confidence, Monitored Diode Stream) and the Threat Severity Spectrum bar.',
    whatActionToTake:
      'Filter the detected threat feed by severity or direction, or click any threat row to open detailed mitigation options.',
  },
  {
    id: 'threat-detection',
    title: '3. Real-Time Threat Detection',
    shortLabel: 'Threat Detection',
    icon: Radio,
    pageTarget: 'live-threats',
    whatItDoes:
      'Streams live packet telemetry traversing the data diode, automatically applying deep packet inspection (DPI) and unsupervised anomaly heuristics.',
    whyUseful:
      'Enables continuous detection of packet anomalies, covert timing channels, buffer saturation attacks, and Modbus/SCADA register injections as they occur.',
    whatToLookAt:
      'The live streaming ticker, the animated highlight on newly detected rows, and the countdown timer indicating incoming packet evaluation intervals.',
    whatActionToTake:
      'Use the filter pills to isolate specific protocols (e.g. Modbus, DNP3, UDP) or click "Inject Threat" to test system responsiveness.',
  },
  {
    id: 'investigation',
    title: '4. Deep Threat Investigation',
    shortLabel: 'Investigation',
    icon: SearchCheck,
    pageTarget: 'investigation',
    whatItDoes:
      'Provides a forensic workbench for forensic analysts to dissect packet captures (PCAP), byte-level hex streams, and transmission timing patterns.',
    whyUseful:
      'Enables analysts to definitively confirm whether an alert is an active exploit or a benign protocol deviation before triggering emergency shutdowns.',
    whatToLookAt:
      'The payload hex viewer, the timeline of preceding packets, and the MITRE ATT&CK technique mapping.',
    whatActionToTake:
      'Change threat lifecycle status (e.g. from Detected to Investigating or Confirmed) and follow the step-by-step mitigation runbook checklist.',
  },
  {
    id: 'explainable-ai',
    title: '5. Explainable AI (XAI) Factors',
    shortLabel: 'Explainable AI',
    icon: Brain,
    pageTarget: 'investigation',
    whatItDoes:
      'Breaks down the neural network’s decision into plain-English, weighted contributor factors (such as packet size entropy, abnormal port diversity, and timing jitter).',
    whyUseful:
      'Removes the "black box" problem of AI in cybersecurity, giving human analysts transparent evidence to justify incident escalation.',
    whatToLookAt:
      'The "AI Anomaly Evidence & Explanations" panel inside the investigation view, showing percentage weights for each triggering factor.',
    whatActionToTake:
      'Evaluate whether the highest-weighted factor aligns with known facility maintenance or represents malicious adversary behavior.',
  },
  {
    id: 'risk-score',
    title: '6. Risk Score Assessment',
    shortLabel: 'Risk Score',
    icon: ShieldAlert,
    pageTarget: 'dashboard',
    whatItDoes:
      'Computes a normalized composite score between 0 and 100 representing the potential operational impact of the suspicious traffic flow.',
    whyUseful:
      'Prioritizes analyst attention so critical safety-system attacks are addressed ahead of minor port scans.',
    whatToLookAt:
      'The color-coded risk badge: Scores >85 are Critical (#B94A48 in light mode), 65–84 are High (#C87545), 40–64 are Medium (#C39A45), and <40 are Low (#5C8D6B).',
    whatActionToTake:
      'Triage threats with a Risk Score over 80 immediately by assigning them to Tier-3 incident response.',
  },
  {
    id: 'network-map',
    title: '7. Network Topology Map',
    shortLabel: 'Network Map',
    icon: Network,
    pageTarget: 'network-map',
    whatItDoes:
      'Renders an interactive topological graph depicting the physical separation between protected Industrial OT enclaves, the optical data diode, and corporate IT/DMZ subnets.',
    whyUseful:
      'Helps operators visualize data flow directions, identify compromised PLCs, and verify that optical forward-only link rules are intact.',
    whatToLookAt:
      'Red pulsing nodes indicating affected controllers and dashed orange links indicating anomalous data flows.',
    whatActionToTake:
      'Click any network node or link to inspect its IP address, MAC address, security zone, and active associated threats.',
  },
  {
    id: 'traffic-analysis',
    title: '8. Volumetric Traffic Analysis',
    shortLabel: 'Traffic Analysis',
    icon: Activity,
    pageTarget: 'threat-history',
    whatItDoes:
      'Monitors transmission volume (MB), packet rates, and FIFO buffer queue occupancy across the physical diode hardware.',
    whyUseful:
      'Detects denial-of-service attempts and buffer-overflow exploits designed to drop critical sensor telemetry.',
    whatToLookAt:
      'The Monitored Diode Stream stat card and historical volume trend charts in Threat History.',
    whatActionToTake:
      'Check if FIFO queue saturation exceeds 75%; if so, alert network engineering to adjust buffer allocation.',
  },
  {
    id: 'simulation',
    title: '9. Attack Simulation Sandbox',
    shortLabel: 'Simulation',
    icon: PlayCircle,
    pageTarget: 'simulation',
    whatItDoes:
      'Permits SOC teams and security students to safely execute simulated cyberattack scenarios (e.g. Modbus register injection, covert timing exfiltration, UDP packet floods).',
    whyUseful:
      'Demonstrates and validates how abnormal packet behaviors trigger AI detection rules without risking real factory equipment.',
    whatToLookAt:
      'The simulation scenario cards, packet generation graphs, and immediate alerts generated upon launching a scenario.',
    whatActionToTake:
      'Select a scenario (e.g. "Modbus Register Injection"), click "Execute Scenario", and observe how the incident is created.',
  },
  {
    id: 'incidents',
    title: '10. Incident Management Kanban',
    shortLabel: 'Incidents',
    icon: Kanban,
    pageTarget: 'incidents',
    whatItDoes:
      'Organizes active threats into five standardized SOC incident triage columns: Detected, Investigating, Confirmed, Contained, and Resolved.',
    whyUseful:
      'Ensures structured accountability and audit compliance under IEC 62443 / NERC CIP protocols.',
    whatToLookAt:
      'The Kanban columns, assignee badges, SLA response timers, and priority tags on each card.',
    whatActionToTake:
      'Advance incident status by clicking the stage transition buttons or drag cards forward as containment steps are completed.',
  },
  {
    id: 'threat-history',
    title: '11. Historical Audit Archive',
    shortLabel: 'Threat History',
    icon: History,
    pageTarget: 'threat-history',
    whatItDoes:
      'Maintains a permanent, searchable audit trail of resolved and historical threat records, attack vectors, and protocol anomalies.',
    whyUseful:
      'Enables forensic post-mortems, recurring adversary campaign correlation, and compliance reporting.',
    whatToLookAt:
      'The historical timeline graph, severity distribution breakdowns, and export action buttons.',
    whatActionToTake:
      'Filter historical logs by date range or threat type to generate compliance documentation.',
  },
  {
    id: 'model-monitoring',
    title: '12. AI Model Health & Observability',
    shortLabel: 'AI Model',
    icon: Cpu,
    pageTarget: 'model-monitoring',
    whatItDoes:
      'Exposes the telemetry and performance benchmarks of the neural anomaly detection engine, including Accuracy, Precision, Recall, F1 Score, and False Positive Rate.',
    whyUseful:
      'Detects concept drift, false-positive spikes, or latency degradation before they impact facility safety.',
    whatToLookAt:
      'The evaluation confusion matrix, historical metric trends, and inference latency percentiles.',
    whatActionToTake:
      'Review the false positive rate; if it exceeds 2.5%, flag the model for recalibration on updated baseline traffic captures.',
  },
  {
    id: 'settings',
    title: '13. Customization & Settings',
    shortLabel: 'Settings',
    icon: Settings,
    pageTarget: 'settings',
    whatItDoes:
      'Allows users to tailor the console: switch between Light and Dark mode, toggle dashboard widgets on or off, configure alert notifications, and control security display density.',
    whyUseful:
      'Adapts the workstation interface to personal analyst preferences and operational monitor sizes.',
    whatToLookAt:
      'The Light/Dark mode switcher, the Dashboard Preferences toggles, and the Security Display preferences.',
    whatActionToTake:
      'Toggle Dark mode if working in low-light SOC centers, or hide sections of the dashboard you don’t currently need.',
  },
];

interface HowToUseViewProps {
  onStartTour: () => void;
  onNavigatePage: (pageId: NavPageId) => void;
}

export const HowToUseView: React.FC<HowToUseViewProps> = ({
  onStartTour,
  onNavigatePage,
}) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean>(() => {
    return localStorage.getItem('ipthreat_tour_completed') === 'true';
  });

  const activeSection = GUIDE_SECTIONS[activeSectionIndex];
  const totalSections = GUIDE_SECTIONS.length;
  const isFirst = activeSectionIndex === 0;
  const isLast = activeSectionIndex === totalSections - 1;

  const handleNext = () => {
    if (!isLast) {
      setActiveSectionIndex((prev) => prev + 1);
    } else {
      localStorage.setItem('ipthreat_guide_completed', 'true');
      onNavigatePage('dashboard');
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setActiveSectionIndex((prev) => prev - 1);
    }
  };

  const handleResetTour = () => {
    localStorage.removeItem('ipthreat_tour_completed');
    setHasCompletedTour(false);
    onStartTour();
  };

  return (
    <div id="how-to-use-view" className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCE3E3] dark:border-[#34403F]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#173F4F]/10 dark:bg-[#6D9C98]/20 text-[#173F4F] dark:text-[#6D9C98]">
              Interactive Onboarding & Manual
            </span>
            <span className="text-xs text-[#718096] dark:text-[#A8B7B4]">
              Section {activeSectionIndex + 1} of {totalSections}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#263238] dark:text-[#DCE5E2] font-display">
            How to Use IPthreat AI
          </h1>
          <p className="text-xs text-[#718096] dark:text-[#A8B7B4] mt-0.5">
            Learn how to monitor, investigate and respond to network threats.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onStartTour}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#173F4F] hover:bg-[#2F6978] dark:bg-[#6D9C98] dark:hover:bg-[#507774] rounded-xl transition-colors shadow-xs cursor-pointer active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Guided Tour</span>
          </button>
          {hasCompletedTour && (
            <button
              onClick={handleResetTour}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#263238] dark:text-[#DCE5E2] bg-white dark:bg-[#202727] hover:bg-[#F6F7F5] dark:hover:bg-[#283131] border border-[#DCE3E3] dark:border-[#34403F] rounded-xl transition-colors cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Tour</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Section Index / Progress Sidebar */}
        <div className="lg:col-span-4 rounded-xl bg-white dark:bg-[#202727] border border-[#DCE3E3] dark:border-[#34403F] p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E3] dark:border-[#34403F] mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#173F4F] dark:text-[#6D9C98]" />
              <span className="text-xs font-bold text-[#263238] dark:text-[#DCE5E2] uppercase tracking-wider">
                Topics
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#718096] dark:text-[#A8B7B4]">
              {activeSectionIndex + 1} / {totalSections} completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#F6F7F5] dark:bg-[#1A2121] mb-3 overflow-hidden">
            <div
              className="h-full bg-[#173F4F] dark:bg-[#6D9C98] transition-all duration-300"
              style={{
                width: `${((activeSectionIndex + 1) / totalSections) * 100}%`,
              }}
            />
          </div>

          {/* Section List */}
          <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
            {GUIDE_SECTIONS.map((section, idx) => {
              const Icon = section.icon;
              const isCurrent = idx === activeSectionIndex;
              const isPast = idx < activeSectionIndex;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIndex(idx)}
                  className={`w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isCurrent
                      ? 'bg-[#173F4F]/10 dark:bg-[#6D9C98]/20 text-[#173F4F] dark:text-[#DCE5E2] font-semibold border border-[#173F4F]/20 dark:border-[#6D9C98]/30'
                      : 'text-[#718096] dark:text-[#A8B7B4] hover:bg-[#F6F7F5] dark:hover:bg-[#283131] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                        isCurrent
                          ? 'bg-[#173F4F] text-white dark:bg-[#6D9C98] dark:text-[#171B1B]'
                          : isPast
                          ? 'bg-[#5C8D6B]/20 text-[#5C8D6B]'
                          : 'bg-[#F6F7F5] dark:bg-[#1A2121] text-[#718096] dark:text-[#A8B7B4]'
                      }`}
                    >
                      {isPast ? '✓' : idx + 1}
                    </span>
                    <span className="truncate max-w-[170px]">
                      {section.shortLabel}
                    </span>
                  </div>
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isCurrent
                        ? 'text-[#173F4F] dark:text-[#6D9C98]'
                        : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Topic Content Card */}
        <div className="lg:col-span-8 rounded-xl bg-white dark:bg-[#202727] border border-[#DCE3E3] dark:border-[#34403F] p-6 shadow-xs space-y-6">
          {/* Section Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DCE3E3] dark:border-[#34403F] flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#173F4F]/10 dark:bg-[#6D9C98]/15 text-[#173F4F] dark:text-[#6D9C98]">
                {React.createElement(activeSection.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#718096] dark:text-[#A8B7B4] uppercase tracking-wider block">
                  Interactive Module Walkthrough
                </span>
                <h2 className="text-lg font-bold text-[#263238] dark:text-[#DCE5E2]">
                  {activeSection.title}
                </h2>
              </div>
            </div>

            {activeSection.pageTarget && (
              <button
                onClick={() => onNavigatePage(activeSection.pageTarget!)}
                className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-[#173F4F] dark:text-[#6D9C98] bg-[#173F4F]/5 dark:bg-[#6D9C98]/10 hover:bg-[#173F4F]/10 dark:hover:bg-[#6D9C98]/20 border border-[#173F4F]/20 dark:border-[#6D9C98]/30 rounded-xl transition-colors cursor-pointer shrink-0 active:scale-98"
              >
                <span>Jump to View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 4 Structured Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: What It Does */}
            <div className="p-4 rounded-xl bg-[#F6F7F5] dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#173F4F] dark:text-[#6D9C98] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#173F4F] dark:bg-[#6D9C98]"></span>
                What it does
              </div>
              <p className="text-xs text-[#263238] dark:text-[#DCE5E2] leading-relaxed">
                {activeSection.whatItDoes}
              </p>
            </div>

            {/* Card 2: Why Useful */}
            <div className="p-4 rounded-xl bg-[#F6F7F5] dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2F6978] dark:text-[#6D9C98] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F6978] dark:bg-[#6D9C98]"></span>
                Why it is useful
              </div>
              <p className="text-xs text-[#263238] dark:text-[#DCE5E2] leading-relaxed">
                {activeSection.whyUseful}
              </p>
            </div>

            {/* Card 3: What to Look At */}
            <div className="p-4 rounded-xl bg-[#F6F7F5] dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C39A45] dark:text-[#C49A50] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C39A45] dark:bg-[#C49A50]"></span>
                What the user should look at
              </div>
              <p className="text-xs text-[#263238] dark:text-[#DCE5E2] leading-relaxed">
                {activeSection.whatToLookAt}
              </p>
            </div>

            {/* Card 4: Action to Take */}
            <div className="p-4 rounded-xl bg-[#F6F7F5] dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] space-y-1.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5C8D6B] dark:text-[#5C8D6B] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5C8D6B]"></span>
                What action the user can take
              </div>
              <p className="text-xs text-[#263238] dark:text-[#DCE5E2] leading-relaxed">
                {activeSection.whatActionToTake}
              </p>
            </div>
          </div>

          {/* Navigation Controls: Previous / Next / Finish */}
          <div className="flex items-center justify-between pt-4 border-t border-[#DCE3E3] dark:border-[#34403F] flex-wrap gap-3">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer active:scale-98 ${
                isFirst
                  ? 'opacity-40 cursor-not-allowed text-[#718096]'
                  : 'text-[#263238] dark:text-[#DCE5E2] bg-[#F6F7F5] dark:bg-[#1A2121] hover:bg-[#DCE3E3] dark:hover:bg-[#283131] border border-[#DCE3E3] dark:border-[#34403F]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Topic</span>
            </button>

            <div className="text-xs text-[#718096] dark:text-[#A8B7B4] font-mono hidden sm:block">
              Topic {activeSectionIndex + 1} of {totalSections}
            </div>

            <button
              onClick={handleNext}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#173F4F] hover:bg-[#2F6978] dark:bg-[#6D9C98] dark:hover:bg-[#507774] rounded-xl transition-colors shadow-xs cursor-pointer active:scale-98"
            >
              <span>{isLast ? 'Complete & Go to Dashboard' : 'Next Topic'}</span>
              {isLast ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
