import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  CheckCircle2,
  X,
  Radio,
  ExternalLink,
  HelpCircle,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import { Threat } from '../types';
import { useSettings } from '../context/SettingsContext';
import { UserProfileControl } from './UserProfilePanel';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  threats: Threat[];
  onSelectThreat?: (threat: Threat) => void;
  onOpenHelp?: () => void;
  onNavigatePage?: (pageId: string) => void;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  threats,
  onSelectThreat,
  onOpenHelp,
  onNavigatePage,
  onToggleMobileMenu,
}) => {
  const { settings, toggleTheme } = useSettings();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update SOC UTC Clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalThreats = threats.filter(
    (t) => t.severity === 'critical' || t.severity === 'high'
  ).slice(0, 5);

  const searchResults = searchQuery.trim()
    ? threats.filter((t) =>
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.threatType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sourceIP.includes(searchQuery) ||
        t.destinationIP.includes(searchQuery) ||
        t.protocol.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header
      id="soc-topbar"
      className="h-16 bg-white border-b border-[#DCE3E3] sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4"
    >
      {/* Left: Mobile Menu Toggle & Global Search Input */}
      <div className="flex items-center gap-2 flex-1 max-w-lg min-w-0">
        {onToggleMobileMenu && (
          <button
            id="mobile-sidebar-toggle"
            onClick={onToggleMobileMenu}
            className="md:hidden min-w-[44px] min-h-[44px] p-2 text-[#718096] hover:text-[#263238] rounded-xl hover:bg-[#F6F7F5] flex items-center justify-center transition-colors cursor-pointer border border-[#DCE3E3] shrink-0"
            aria-label="Open Navigation Menu"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#263238]" />
          </button>
        )}

        {/* Compact Mobile Brand Logo Mark */}
        <div className="flex md:hidden items-center gap-1 shrink-0 mr-1 select-none">
          <span className="font-bold text-sm tracking-wide text-[var(--primary-teal)] font-display">
            IP<span className="text-[var(--text-main)]">threat</span>
          </span>
          <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20">
            AI
          </span>
        </div>

        <div className="relative flex-1 min-w-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#718096] absolute left-3 pointer-events-none shrink-0" />
            <input
              id="global-threat-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search threats, IPs, protocols..."
              className="w-full bg-[#F6F7F5] text-[#263238] text-xs rounded-xl pl-9 pr-8 py-2 min-h-[40px] sm:min-h-[44px] border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] focus:ring-1 focus:ring-[#173F4F]/20 placeholder:text-[#718096] font-sans transition-all truncate"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 p-1 text-[#718096] hover:text-[#263238] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        {/* Instant Search Dropdown */}
        {searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#DCE3E3] rounded-lg shadow-xl p-2 z-50">
            <div className="text-[10px] font-mono uppercase text-[#718096] px-2 py-1 flex justify-between">
              <span>Matching Threats ({searchResults.length})</span>
              <span>Press ESC to dismiss</span>
            </div>
            {searchResults.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#718096]">
                No matching threat records found
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (onSelectThreat) onSelectThreat(t);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-[#F6F7F5] text-left text-xs transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#173F4F] font-semibold">
                          {t.id}
                        </span>
                        <span className="text-[#263238] font-medium">
                          {t.threatType}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                            t.severity === 'critical'
                              ? 'bg-[#B94A48]/15 text-[#B94A48]'
                              : t.severity === 'high'
                              ? 'bg-[#C87545]/15 text-[#C87545]'
                              : t.severity === 'medium'
                              ? 'bg-[#C39A45]/15 text-[#C39A45]'
                              : 'bg-[#5C8D6B]/15 text-[#5C8D6B]'
                          }`}
                        >
                          {t.severity}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-[#718096] mt-0.5">
                        {t.sourceIP} &rarr; {t.destinationIP} ({t.protocol})
                      </div>
                    </div>
                    <span className="text-[11px] text-[#718096] group-hover:text-[#173F4F] flex items-center gap-1 font-mono">
                      Risk: {t.riskScore} <ExternalLink className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Monitoring Status Pill */}
        <div
          id="monitoring-status-pill"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5C8D6B]/10 border border-[#5C8D6B]/30 text-[#5C8D6B] text-xs font-mono select-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#5C8D6B]"></span>
          <span className="font-semibold tracking-wider text-[11px] uppercase">
            Monitoring
          </span>
        </div>

        {/* UTC Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6F7F5] border border-[#DCE3E3] text-[11px] font-mono text-[#718096]">
          <Radio className="w-3 h-3 text-[#173F4F]" />
          <span>{currentTime || 'SYNCHRONIZING...'}</span>
        </div>

        {/* Theme Toggle Button (Sun / Moon) */}
        <button
          id="theme-toggle-topbar"
          onClick={toggleTheme}
          className="min-w-[44px] min-h-[44px] p-2.5 text-[#718096] hover:text-[#173F4F] hover:bg-[#F6F7F5] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#DCE3E3] flex items-center justify-center group shrink-0"
          title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-5 h-5 sm:w-4 sm:h-4 text-[#C49A50] group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 sm:w-4 sm:h-4 text-[#4C5A70] group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Help / ? Button */}
        {onOpenHelp && (
          <button
            id="help-button-topbar"
            onClick={onOpenHelp}
            className="hidden sm:flex min-w-[44px] min-h-[44px] p-2.5 text-[#718096] hover:text-[#173F4F] hover:bg-[#F6F7F5] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#DCE3E3] items-center justify-center shrink-0"
            title="Help, Documentation & Shortcuts (?)"
            aria-label="Help and Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative min-w-[44px] min-h-[44px] p-2.5 text-[#718096] hover:text-[#173F4F] hover:bg-[#F6F7F5] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#DCE3E3] flex items-center justify-center shrink-0"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 sm:w-4 sm:h-4" />
            {criticalThreats.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#B94A48] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-80 bg-white border border-[#DCE3E3] rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#DCE3E3] mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#263238]">
                    High Priority Alerts
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#B94A48]/15 text-[#B94A48] px-1.5 py-0.5 rounded">
                    {criticalThreats.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#718096] hover:text-[#263238] text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {criticalThreats.map((threat) => (
                  <div
                    key={threat.id}
                    onClick={() => {
                      if (onSelectThreat) onSelectThreat(threat);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-[#F6F7F5] hover:bg-[#EEF3F2] border border-[#DCE3E3] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-[#173F4F] font-semibold">
                        {threat.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          threat.severity === 'critical'
                            ? 'bg-[#B94A48]/15 text-[#B94A48]'
                            : 'bg-[#C87545]/15 text-[#C87545]'
                        }`}
                      >
                        {threat.severity}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-[#263238] truncate">
                      {threat.threatType}
                    </div>
                    <div className="text-[11px] font-mono text-[#718096] mt-1 flex justify-between">
                      <span>{threat.protocol} / Port {threat.destinationPort}</span>
                      <span>Risk: {threat.riskScore}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-[#DCE3E3] text-center">
                <span className="text-[11px] font-mono text-[#173F4F] hover:underline cursor-pointer">
                  Optical link telemetry verified &bull; 0 packet drops
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Control with Real Dropdown Panel */}
        <div className="pl-2 border-l border-[#DCE3E3]">
          <UserProfileControl
            onNavigateSettings={() => {
              if (onNavigatePage) {
                onNavigatePage('settings');
              }
            }}
          />
        </div>
      </div>
    </header>
  );
};
