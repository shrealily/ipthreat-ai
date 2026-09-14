import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Keyboard,
  ShieldAlert,
  Info,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { NavPageId } from '../types';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePage: (pageId: NavPageId) => void;
  onStartTour: () => void;
}

type TabType = 'overview' | 'shortcuts' | 'glossary' | 'about';

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onNavigatePage,
  onStartTour,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#202727] border border-[#DCE3E3] dark:border-[#34403F] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#DCE3E3] dark:border-[#34403F] flex items-center justify-between bg-[#F6F7F5]/60 dark:bg-[#1A2121]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#173F4F]/10 dark:bg-[#6D9C98]/20 flex items-center justify-center text-[#173F4F] dark:text-[#6D9C98]">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#263238] dark:text-[#DCE5E2]">
                IPthreat AI Assistance
              </h3>
              <p className="text-[11px] text-[#718096] dark:text-[#A8B7B4]">
                SOC Operations and Platform Help
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2] min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DCE3E3] dark:border-[#34403F] bg-white dark:bg-[#202727] text-xs font-medium px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`min-h-[44px] py-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-[#173F4F] text-[#173F4F] dark:border-[#6D9C98] dark:text-[#6D9C98] font-semibold'
                : 'border-transparent text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2]'
            }`}
          >
            How to Use
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`min-h-[44px] py-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'shortcuts'
                ? 'border-[#173F4F] text-[#173F4F] dark:border-[#6D9C98] dark:text-[#6D9C98] font-semibold'
                : 'border-transparent text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2]'
            }`}
          >
            Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`min-h-[44px] py-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'glossary'
                ? 'border-[#173F4F] text-[#173F4F] dark:border-[#6D9C98] dark:text-[#6D9C98] font-semibold'
                : 'border-transparent text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2]'
            }`}
          >
            Security Terms
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`min-h-[44px] py-2.5 px-3 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'about'
                ? 'border-[#173F4F] text-[#173F4F] dark:border-[#6D9C98] dark:text-[#6D9C98] font-semibold'
                : 'border-transparent text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2]'
            }`}
          >
            About
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F6F7F5] dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F]">
                <h4 className="font-semibold text-[#173F4F] dark:text-[#DCE5E2] mb-1">
                  Getting Started with IPthreat AI
                </h4>
                <p className="text-[#718096] dark:text-[#A8B7B4] leading-relaxed">
                  IPthreat AI monitors unidirectional network traffic across physical optical diodes.
                  Detect anomalies, evaluate explainable AI factors, inspect packet captures, and track incident mitigation workflows.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onNavigatePage('how-to-use');
                  }}
                  className="p-3 text-left rounded-lg border border-[#DCE3E3] dark:border-[#34403F] hover:bg-[#F6F7F5] dark:hover:bg-[#283131] transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-[#263238] dark:text-[#DCE5E2] flex items-center justify-between">
                    <span>Full Onboarding Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#173F4F] dark:text-[#6D9C98] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#718096] dark:text-[#A8B7B4] mt-1">
                    Complete 13-topic system tutorial
                  </div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onStartTour();
                  }}
                  className="p-3 text-left rounded-lg bg-[#173F4F]/10 dark:bg-[#6D9C98]/15 border border-[#173F4F]/20 dark:border-[#6D9C98]/30 hover:bg-[#173F4F]/15 dark:hover:bg-[#6D9C98]/25 transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-[#173F4F] dark:text-[#6D9C98] flex items-center justify-between">
                    <span>Interactive Guided Tour</span>
                    <Zap className="w-3.5 h-3.5 text-[#173F4F] dark:text-[#6D9C98]" />
                  </div>
                  <div className="text-[11px] text-[#718096] dark:text-[#A8B7B4] mt-1">
                    Walk through the real application UI
                  </div>
                </button>
              </div>

              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#718096] dark:text-[#A8B7B4] font-semibold">
                  Quick Navigation
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigatePage('dashboard');
                    }}
                    className="p-2 rounded bg-white dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] text-left hover:border-[#173F4F] dark:hover:border-[#6D9C98] transition-colors cursor-pointer"
                  >
                    &rarr; Dashboard Overview
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigatePage('live-threats');
                    }}
                    className="p-2 rounded bg-white dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] text-left hover:border-[#173F4F] dark:hover:border-[#6D9C98] transition-colors cursor-pointer"
                  >
                    &rarr; Live Threats Feed
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigatePage('investigation');
                    }}
                    className="p-2 rounded bg-white dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] text-left hover:border-[#173F4F] dark:hover:border-[#6D9C98] transition-colors cursor-pointer"
                  >
                    &rarr; Deep Investigation
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigatePage('settings');
                    }}
                    className="p-2 rounded bg-white dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] text-left hover:border-[#173F4F] dark:hover:border-[#6D9C98] transition-colors cursor-pointer"
                  >
                    &rarr; Preferences & Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <p className="text-[#718096] dark:text-[#A8B7B4] text-[11px]">
                Global keyboard shortcuts are active when you are not typing in search boxes or inputs.
              </p>
              <div className="border border-[#DCE3E3] dark:border-[#34403F] rounded-xl overflow-hidden divide-y divide-[#DCE3E3] dark:divide-[#34403F]">
                {[
                  { key: 'D', action: 'Navigate to Dashboard' },
                  { key: 'T', action: 'Navigate to Live Threats' },
                  { key: 'N', action: 'Open Network Map' },
                  { key: 'I', action: 'Open Incident Kanban Board' },
                  { key: 'H', action: 'Open Threat History' },
                  { key: 'S', action: 'Open Settings' },
                  { key: '?', action: 'Open This Help Center' },
                  { key: 'Esc', action: 'Dismiss Modals & Popups' },
                ].map((sc) => (
                  <div key={sc.key} className="flex items-center justify-between p-2.5">
                    <span className="text-[#263238] dark:text-[#DCE5E2] font-medium">{sc.action}</span>
                    <kbd className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#F6F7F5] dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] text-[#173F4F] dark:text-[#6D9C98] shadow-xs">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="space-y-3">
              {[
                {
                  term: 'Optical Data Diode',
                  def: 'Physical one-way hardware enforcement using a LED/laser transmitter and photodiode receiver with no reverse fiber cable, guaranteeing 0% return packets.',
                },
                {
                  term: 'Risk Score',
                  def: 'Estimated composite severity (0–100) factoring in packet rate anomalies, destination port sensitivity, and protocol command violations.',
                },
                {
                  term: 'AI Confidence',
                  def: 'Mathematical certainty of the neural anomaly detector comparing current packet headers against the learned baseline traffic envelope.',
                },
                {
                  term: 'Threat DNA',
                  def: 'Multi-dimensional heuristic fingerprint capturing packet size variance, timing dispersion, and entropy distribution.',
                },
                {
                  term: 'F1 Score',
                  def: 'Harmonic mean of precision and recall that provides an objective benchmark for attack detection without bias toward normal traffic.',
                },
              ].map((item) => (
                <div
                  key={item.term}
                  className="p-3 rounded-lg border border-[#DCE3E3] dark:border-[#34403F] bg-[#F6F7F5]/40 dark:bg-[#1A2121]"
                >
                  <div className="font-semibold text-[#173F4F] dark:text-[#DCE5E2] mb-0.5">
                    {item.term}
                  </div>
                  <div className="text-[11px] text-[#718096] dark:text-[#A8B7B4] leading-relaxed">
                    {item.def}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-[#DCE3E3] dark:border-[#34403F] bg-[#F6F7F5] dark:bg-[#1A2121] space-y-2">
                <div className="font-bold text-sm text-[#173F4F] dark:text-[#DCE5E2]">
                  IPthreat AI
                </div>
                <p className="text-[11px] text-[#718096] dark:text-[#A8B7B4] leading-relaxed">
                  CyberShield SOC Prototype engineered for detecting, analyzing, and mitigating cyber threats across unidirectional industrial enclaves.
                </p>
                <div className="pt-2 border-t border-[#DCE3E3] dark:border-[#34403F] text-[11px] font-mono text-[#718096] dark:text-[#A8B7B4] space-y-1">
                  <div>Version: <span className="text-[#263238] dark:text-[#DCE5E2]">1.0.0</span></div>
                  <div>Environment: <span className="text-[#263238] dark:text-[#DCE5E2]">Simulation / Demo Mode</span></div>
                  <div>Backend Connection: <span className="text-[#263238] dark:text-[#DCE5E2]">Local Mock Data</span></div>
                  <div>Target Audience: <span className="text-[#263238] dark:text-[#DCE5E2]">SIH Cybersecurity Showcase</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#DCE3E3] dark:border-[#34403F] bg-[#F6F7F5] dark:bg-[#1A2121] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onNavigatePage('how-to-use');
            }}
            className="min-h-[44px] px-2 text-xs font-semibold text-[#173F4F] dark:text-[#6D9C98] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Full Interactive Guide</span>
          </button>
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-medium text-[#263238] dark:text-[#DCE5E2] hover:bg-[#DCE3E3] dark:hover:bg-[#283131] rounded-xl transition-colors cursor-pointer flex items-center justify-center active:scale-98"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
