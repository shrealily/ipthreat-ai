import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Sliders,
  ShieldCheck,
  Server,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

  const handleConfirmReset = () => {
    resetSettings();
    setShowResetConfirm(false);
    setResetSuccessMessage(true);
    setTimeout(() => setResetSuccessMessage(false), 3500);
  };

  return (
    <div id="settings-view" className="space-y-6 animate-fadeIn pb-12 max-w-5xl">
      {/* Page Header */}
      <div className="pb-2 border-b border-[#DCE3E3]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#173F4F]/10 text-[#173F4F]">
            Platform Configuration
          </span>
          <span className="text-xs text-[#718096]">
            Local Workspace State
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#263238] font-display">
          Settings
        </h1>
        <p className="text-xs text-[#718096] mt-0.5">
          Manage console appearance, alert notifications, dashboard card visibility, and security display filters.
        </p>
      </div>

      {resetSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-[#5C8D6B]/15 border border-[#5C8D6B]/30 text-[#5C8D6B] flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>All workspace settings have been restored to default values.</span>
        </div>
      )}

      {/* SECTION A — Appearance */}
      <section className="rounded-xl bg-white border border-[#DCE3E3] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE3E3]">
          <div className="p-2 rounded-lg bg-[#173F4F]/10 text-[#173F4F]">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#263238]">
              Section A &bull; Appearance & Interface
            </h2>
            <p className="text-[11px] text-[#718096]">
              Theme mode, information density, and layout animations.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Theme Mode Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
            <div>
              <div className="font-semibold text-[#263238]">
                Console Theme Mode
              </div>
              <div className="text-[11px] text-[#718096]">
                Choose between Default Dark Mode (#171B1B) and High-Contrast Light Mode (#EDEBE8).
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#F6F7F5] p-1 rounded-lg border border-[#DCE3E3]">
              <button
                type="button"
                id="theme-select-dark"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'bg-white text-[#173F4F] shadow-xs font-bold border border-[#DCE3E3]'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#6D9C98]" />
                <span>Dark Mode</span>
              </button>
              <button
                type="button"
                id="theme-select-light"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  settings.theme === 'light'
                    ? 'bg-white text-[#173F4F] shadow-xs font-bold border border-[#DCE3E3]'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-[#C49A50]" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* Dashboard Density */}
          <div className="flex items-center justify-between py-1 border-t border-[#DCE3E3]/60 pt-3">
            <div>
              <div className="font-semibold text-[#263238]">
                Dashboard Information Density
              </div>
              <div className="text-[11px] text-[#718096]">
                Compact mode tightens table row heights for dense displays.
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#F6F7F5] p-1 rounded-lg border border-[#DCE3E3]">
              <button
                type="button"
                onClick={() => updateSettings({ density: 'comfortable' })}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  settings.density === 'comfortable'
                    ? 'bg-white text-[#173F4F] shadow-xs font-bold'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ density: 'compact' })}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  settings.density === 'compact'
                    ? 'bg-white text-[#173F4F] shadow-xs font-bold'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                Compact
              </button>
            </div>
          </div>

          {/* Interface Animations Toggle */}
          <div className="flex items-center justify-between py-1 border-t border-[#DCE3E3]/60 pt-3">
            <div>
              <div className="font-semibold text-[#263238]">
                Interface Transitions & Fade Effects
              </div>
              <div className="text-[11px] text-[#718096]">
                Subtle view transitions and dialog animations.
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#DCE3E3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#173F4F]"></div>
            </label>
          </div>

          {/* Chart Animation Toggle */}
          <div className="flex items-center justify-between py-1 border-t border-[#DCE3E3]/60 pt-3">
            <div>
              <div className="font-semibold text-[#263238]">
                Telemetry & Chart Animations
              </div>
              <div className="text-[11px] text-[#718096]">
                Animate bar chart transitions and live data stream ticks.
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.chartAnimationsEnabled}
                onChange={(e) => updateSettings({ chartAnimationsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#DCE3E3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#173F4F]"></div>
            </label>
          </div>
        </div>
      </section>

      {/* SECTION B — Notifications */}
      <section className="rounded-xl bg-white border border-[#DCE3E3] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE3E3]">
          <div className="p-2 rounded-lg bg-[#173F4F]/10 text-[#173F4F]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#263238]">
              Section B &bull; Notifications & Sound Alerts
            </h2>
            <p className="text-[11px] text-[#718096]">
              Configure which alerts trigger visual badges and console notifications (Local mock state).
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              key: 'notifyCritical',
              title: 'Critical Threat Alerts',
              desc: 'High-urgency events requiring immediate physical containment.',
              badge: 'Critical',
              badgeColor: 'text-[#B94A48] bg-[#B94A48]/10 border-[#B94A48]/30',
            },
            {
              key: 'notifyHigh',
              title: 'High Severity Alerts',
              desc: 'Suspicious payload patterns crossing security thresholds.',
              badge: 'High',
              badgeColor: 'text-[#C87545] bg-[#C87545]/10 border-[#C87545]/30',
            },
            {
              key: 'notifyAnomalies',
              title: 'New Anomaly Alerts',
              desc: 'Unsupervised deviations from the normal traffic baseline.',
              badge: 'Anomaly',
              badgeColor: 'text-[#C39A45] bg-[#C39A45]/10 border-[#C39A45]/30',
            },
            {
              key: 'notifyIncidents',
              title: 'Incident Stage Updates',
              desc: 'Notifications when incidents change triage status on the Kanban board.',
              badge: 'Workflow',
              badgeColor: 'text-[#173F4F] bg-[#173F4F]/10 border-[#173F4F]/30',
            },
            {
              key: 'notifySimulation',
              title: 'Simulation Notifications',
              desc: 'Receive alerts when attack scenarios are triggered in the sandbox.',
              badge: 'Lab',
              badgeColor: 'text-[#718096] bg-[#718096]/10 border-[#718096]/30',
            },
          ].map((item, idx) => (
            <div
              key={item.key}
              className={`flex items-center justify-between py-1.5 ${
                idx > 0 ? 'border-t border-[#DCE3E3]/60 pt-2.5' : ''
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#263238]">
                    {item.title}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <div className="text-[11px] text-[#718096]">
                  {item.desc}
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings as any)[item.key]}
                  onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#DCE3E3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#173F4F]"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION C — Dashboard Preferences */}
      <section className="rounded-xl bg-white border border-[#DCE3E3] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE3E3]">
          <div className="p-2 rounded-lg bg-[#173F4F]/10 text-[#173F4F]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#263238]">
              Section C &bull; Dashboard Preferences
            </h2>
            <p className="text-[11px] text-[#718096]">
              Choose which operational telemetry widgets are displayed on the main Dashboard view.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              key: 'showRiskStatistics',
              title: 'Risk Statistics & Top Stat Cards',
              desc: 'Active critical alerts, diode throughput, AI confidence, and volume metrics.',
            },
            {
              key: 'showNetworkHealth',
              title: 'Hardware Diode Enforcement Architecture',
              desc: 'Schematic illustrating physical optical isolation and forward-only transmission.',
            },
            {
              key: 'showThreatDistribution',
              title: 'Threat Severity Distribution Spectrum',
              desc: 'Horizontal bar breaking down incidents by Critical, High, Medium, and Low.',
            },
            {
              key: 'showLiveThreatFeed',
              title: 'Detected Threat Feed Table',
              desc: 'Primary records table with filtering pills and inspection buttons.',
            },
            {
              key: 'showTrafficChart',
              title: 'Optical Stream Telemetry Summary',
              desc: 'FIFO queue health, buffer fill metrics, and line rate statistics.',
            },
            {
              key: 'showRecentIncidents',
              title: 'Triage Shortcuts & Quick Links',
              desc: 'Links to Live Monitor and deep packet dissection workspace.',
            },
          ].map((item, idx) => (
            <div
              key={item.key}
              className={`flex items-center justify-between py-1.5 ${
                idx > 0 ? 'border-t border-[#DCE3E3]/60 pt-2.5' : ''
              }`}
            >
              <div>
                <div className="font-semibold text-[#263238]">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#718096]">
                  {item.desc}
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings as any)[item.key]}
                  onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#DCE3E3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#173F4F]"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION D — Security Display Preferences */}
      <section className="rounded-xl bg-white border border-[#DCE3E3] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE3E3]">
          <div className="p-2 rounded-lg bg-[#173F4F]/10 text-[#173F4F]">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#263238]">
              Section D &bull; Security Display Preferences
            </h2>
            <p className="text-[11px] text-[#718096]">
              Control visibility of sensitive telemetry fields and forensic columns across the application.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              key: 'showIpAddresses',
              title: 'Show Source & Destination IP Addresses',
              desc: 'Display explicit IPv4 addresses and port numbers in threat lists and tables.',
            },
            {
              key: 'showRiskScore',
              title: 'Show Risk Score (0–100)',
              desc: 'Display normalized severity scores alongside threats and incident cards.',
            },
            {
              key: 'showAiConfidence',
              title: 'Show AI Confidence Percentage',
              desc: 'Display neural network classification certainty metrics.',
            },
            {
              key: 'showThreatExplanations',
              title: 'Show Explainable AI (XAI) Factors',
              desc: 'Include human-readable breakdown factors explaining why traffic was flagged.',
            },
          ].map((item, idx) => (
            <div
              key={item.key}
              className={`flex items-center justify-between py-1.5 ${
                idx > 0 ? 'border-t border-[#DCE3E3]/60 pt-2.5' : ''
              }`}
            >
              <div>
                <div className="font-semibold text-[#263238]">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#718096]">
                  {item.desc}
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings as any)[item.key]}
                  onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#DCE3E3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#173F4F]"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION E — System */}
      <section className="rounded-xl bg-white border border-[#DCE3E3] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE3E3]">
          <div className="p-2 rounded-lg bg-[#173F4F]/10 text-[#173F4F]">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#263238]">
              Section E &bull; System Information & Prototype Diagnostics
            </h2>
            <p className="text-[11px] text-[#718096]">
              Runtime build parameters and demonstration environment metadata.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]">
            <span className="text-[11px] font-mono text-[#718096] block mb-0.5">
              Application Name
            </span>
            <span className="font-semibold text-[#263238]">
              IPthreat AI
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]">
            <span className="text-[11px] font-mono text-[#718096] block mb-0.5">
              Frontend Version
            </span>
            <span className="font-mono font-semibold text-[#263238]">
              v1.0.0
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]">
            <span className="text-[11px] font-mono text-[#718096] block mb-0.5">
              Execution Environment
            </span>
            <span className="font-semibold text-[#173F4F] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5C8D6B]"></span>
              Demo (SIH Cybersecurity Competition Showcase)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]">
            <span className="text-[11px] font-mono text-[#718096] block mb-0.5">
              AI Detection Engine
            </span>
            <span className="font-semibold text-[#263238]">
              Simulation Mode (Local Heuristic Generator)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3] md:col-span-2">
            <span className="text-[11px] font-mono text-[#718096] block mb-0.5">
              Backend Connection
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#718096]">
                Not Connected / Demo Mode (Mock In-Memory Telemetry)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C39A45]/15 text-[#C39A45] font-bold border border-[#C39A45]/30">
                CLIENT-ONLY PROTOTYPE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION F — Reset */}
      <section className="rounded-xl bg-white border border-[#DCE3E3] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE3E3]">
          <div className="p-2 rounded-lg bg-[#B94A48]/10 text-[#B94A48]">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#263238]">
              Section F &bull; Workspace Reset
            </h2>
            <p className="text-[11px] text-[#718096]">
              Restore all appearance, notification, and dashboard toggles to clean initial defaults.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-semibold text-[#263238]">
              Reset Local Settings
            </div>
            <div className="text-[11px] text-[#718096]">
              Clears saved preferences in localStorage and applies default Light Mode configuration.
            </div>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#B94A48] hover:text-white bg-[#B94A48]/10 hover:bg-[#B94A48] border border-[#B94A48]/30 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center active:scale-98"
          >
            Reset Settings
          </button>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#DCE3E3] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#B94A48]">
              <div className="p-2.5 rounded-full bg-[#B94A48]/10">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#263238]">
                Reset All Settings?
              </h3>
            </div>

            <p className="text-xs text-[#718096] leading-relaxed">
              This will restore all theme, density, notification, and dashboard visibility preferences to their original defaults. Your mock threat data and history will remain intact.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-[#263238] hover:bg-[#F6F7F5] border border-[#DCE3E3] rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-[#B94A48] hover:bg-[#B94A48]/90 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center active:scale-98"
              >
                Yes, Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
