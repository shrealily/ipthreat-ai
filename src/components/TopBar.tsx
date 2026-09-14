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
  Shield,
  ArrowLeft,
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
  onReplaySplash?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  threats,
  onSelectThreat,
  onOpenHelp,
  onNavigatePage,
  onToggleMobileMenu,
  onReplaySplash,
}) => {
  const { settings, toggleTheme } = useSettings();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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
      className="h-16 bg-white dark:bg-[#202727] border-b border-[#DCE3E3] dark:border-[#34403F] sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-colors select-none"
    >
      {/* Mobile Search Active Mode */}
      {isMobileSearchOpen ? (
        <div className="flex md:hidden items-center gap-2 w-full">
          <button
            onClick={() => {
              setIsMobileSearchOpen(false);
              onSearchChange('');
            }}
            className="min-w-[44px] min-h-[44px] p-2 text-[#718096] hover:text-[#263238] dark:text-[#A8B7B4] dark:hover:text-[#DCE5E2] rounded-xl hover:bg-[#F6F7F5] dark:hover:bg-[#283131] flex items-center justify-center transition-colors cursor-pointer border border-[#DCE3E3] dark:border-[#34403F] shrink-0"
            aria-label="Close search"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1 min-w-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#718096] dark:text-[#A8B7B4] absolute left-3 pointer-events-none shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search threats, IPs, protocols..."
                className="w-full bg-[#F6F7F5] dark:bg-[#1A2121] text-[#263238] dark:text-[#DCE5E2] text-xs rounded-xl pl-9 pr-9 py-2 min-h-[44px] border border-[#DCE3E3] dark:border-[#34403F] focus:outline-none focus:border-[#173F4F] dark:focus:border-[#6D9C98] font-sans transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 p-1.5 text-[#718096] hover:text-[#263238] dark:text-[#A8B7B4] dark:hover:text-[#DCE5E2] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Dropdown Search Results */}
            {searchQuery.trim() && (
              <div className="fixed inset-x-3 top-[4.5rem] bg-white dark:bg-[#202727] border border-[#DCE3E3] dark:border-[#34403F] rounded-2xl shadow-2xl p-2.5 z-50 max-h-[70vh] overflow-y-auto">
                <div className="text-[10px] font-mono uppercase text-[#718096] dark:text-[#A8B7B4] px-2 py-1 flex justify-between">
                  <span>Matching Threats ({searchResults.length})</span>
                  <button
                    onClick={() => {
                      setIsMobileSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-[#173F4F] dark:text-[#6D9C98] font-semibold"
                  >
                    Close
                  </button>
                </div>
                {searchResults.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#718096] dark:text-[#A8B7B4]">
                    No matching threat records found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (onSelectThreat) onSelectThreat(t);
                          setIsMobileSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F6F7F5] dark:hover:bg-[#283131] text-left text-xs transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#173F4F] dark:text-[#6D9C98] font-semibold">
                              {t.id}
                            </span>
                            <span className="text-[#263238] dark:text-[#DCE5E2] font-medium">
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
                          <div className="font-mono text-[11px] text-[#718096] dark:text-[#A8B7B4] mt-0.5">
                            {t.sourceIP} &rarr; {t.destinationIP} ({t.protocol})
                          </div>
                        </div>
                        <span className="text-[11px] text-[#718096] dark:text-[#A8B7B4] group-hover:text-[#173F4F] dark:group-hover:text-[#6D9C98] flex items-center gap-1 font-mono">
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
      ) : (
        /* Regular TopBar Header (Uncluttered, Spacious, Beautiful) */
        <>
          {/* Left: Mobile Menu Toggle & Brand Logo Mark */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {onToggleMobileMenu && (
              <button
                id="mobile-sidebar-toggle"
                onClick={onToggleMobileMenu}
                className="md:hidden min-w-[44px] min-h-[44px] p-2 text-[#718096] hover:text-[#263238] dark:text-[#A8B7B4] dark:hover:text-[#DCE5E2] rounded-xl hover:bg-[#F6F7F5] dark:hover:bg-[#283131] flex items-center justify-center transition-colors cursor-pointer border border-[#DCE3E3] dark:border-[#34403F] shrink-0"
                aria-label="Open Navigation Menu"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 text-[#263238] dark:text-[#DCE5E2]" />
              </button>
            )}

            {/* Brand Logo & Wordmark (Tappable to replay Welcome Intro or return to Dashboard) */}
            <button
              onClick={() => {
                if (onReplaySplash) {
                  onReplaySplash();
                } else if (onNavigatePage) {
                  onNavigatePage('dashboard');
                }
              }}
              className="flex items-center gap-2 cursor-pointer select-none text-left rounded-xl p-1 -ml-1 hover:bg-[#F6F7F5] dark:hover:bg-[#283131] transition-colors shrink-0 group"
              title="IPthreat AI (Tap to view Welcome Screen)"
              aria-label="IPthreat AI home"
            >
              <div className="w-8 h-8 rounded-lg bg-[#173F4F] dark:bg-[#6D9C98]/20 flex items-center justify-center text-white dark:text-[#6D9C98] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col justify-center leading-none">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm sm:text-base tracking-wide text-[#173F4F] dark:text-[#6D9C98] font-display">
                    IP<span className="text-[#263238] dark:text-[#DCE5E2]">threat</span>
                  </span>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1 py-0.2 rounded bg-[#173F4F]/10 dark:bg-[#6D9C98]/20 text-[#173F4F] dark:text-[#6D9C98] border border-[#173F4F]/20 dark:border-[#6D9C98]/30">
                    AI
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-[#718096] dark:text-[#A8B7B4] tracking-tight hidden xs:inline mt-0.5">
                  UNIDIRECTIONAL SOC
                </span>
              </div>
            </button>

            {/* Desktop Inline Search (Hidden on mobile to eliminate clustering) */}
            <div className="hidden md:block relative flex-1 max-w-md min-w-0 ml-2">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#718096] dark:text-[#A8B7B4] absolute left-3 pointer-events-none shrink-0" />
                <input
                  id="global-threat-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search threats, IPs, protocols..."
                  className="w-full bg-[#F6F7F5] dark:bg-[#1A2121] text-[#263238] dark:text-[#DCE5E2] text-xs rounded-xl pl-9 pr-8 py-2 min-h-[40px] border border-[#DCE3E3] dark:border-[#34403F] focus:outline-none focus:border-[#173F4F] dark:focus:border-[#6D9C98] focus:ring-1 focus:ring-[#173F4F]/20 placeholder:text-[#718096] dark:placeholder:text-[#A8B7B4] font-sans transition-all truncate"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2 p-1 text-[#718096] hover:text-[#263238] dark:text-[#A8B7B4] dark:hover:text-[#DCE5E2] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Desktop Instant Search Dropdown */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#202727] border border-[#DCE3E3] dark:border-[#34403F] rounded-xl shadow-xl p-2 z-50">
                  <div className="text-[10px] font-mono uppercase text-[#718096] dark:text-[#A8B7B4] px-2 py-1 flex justify-between">
                    <span>Matching Threats ({searchResults.length})</span>
                    <span>Press ESC to dismiss</span>
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#718096] dark:text-[#A8B7B4]">
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
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F6F7F5] dark:hover:bg-[#283131] text-left text-xs transition-colors cursor-pointer group"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[#173F4F] dark:text-[#6D9C98] font-semibold">
                                {t.id}
                              </span>
                              <span className="text-[#263238] dark:text-[#DCE5E2] font-medium">
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
                            <div className="font-mono text-[11px] text-[#718096] dark:text-[#A8B7B4] mt-0.5">
                              {t.sourceIP} &rarr; {t.destinationIP} ({t.protocol})
                            </div>
                          </div>
                          <span className="text-[11px] text-[#718096] dark:text-[#A8B7B4] group-hover:text-[#173F4F] dark:group-hover:text-[#6D9C98] flex items-center gap-1 font-mono">
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

          {/* Right Controls: Streamlined, Spacious, Fully Responsive */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Monitoring Status Pill (Compact Beacon on mobile, full pill on sm+) */}
            <div
              id="monitoring-status-pill"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#5C8D6B]/10 border border-[#5C8D6B]/30 text-[#5C8D6B] text-xs font-mono select-none shrink-0"
              title="Optical Diode Status: Monitoring (100% Forward-Only Physical Air-Gap)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5C8D6B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5C8D6B]"></span>
              </span>
              <span className="font-semibold tracking-wider text-[10px] sm:text-[11px] uppercase hidden sm:inline">
                Monitoring
              </span>
            </div>

            {/* UTC Clock (Large screens only) */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F6F7F5] dark:bg-[#1A2121] border border-[#DCE3E3] dark:border-[#34403F] text-[11px] font-mono text-[#718096] dark:text-[#A8B7B4]">
              <Radio className="w-3 h-3 text-[#173F4F] dark:text-[#6D9C98]" />
              <span>{currentTime || 'SYNCHRONIZING...'}</span>
            </div>

            {/* Mobile Search Button (Tap to toggle full mobile search bar) */}
            <button
              id="mobile-search-trigger-btn"
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden min-w-[44px] min-h-[44px] p-2.5 text-[#718096] hover:text-[#173F4F] dark:text-[#A8B7B4] dark:hover:text-[#6D9C98] hover:bg-[#F6F7F5] dark:hover:bg-[#283131] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#DCE3E3] dark:hover:border-[#34403F] flex items-center justify-center shrink-0"
              aria-label="Search threats"
              title="Search threats"
            >
              <Search className="w-5 h-5 text-[#263238] dark:text-[#DCE5E2]" />
            </button>

            {/* Theme Toggle Button (Sun / Moon) */}
            <button
              id="theme-toggle-topbar"
              onClick={toggleTheme}
              className="min-w-[44px] min-h-[44px] p-2.5 text-[#718096] hover:text-[#173F4F] dark:text-[#A8B7B4] dark:hover:text-[#6D9C98] hover:bg-[#F6F7F5] dark:hover:bg-[#283131] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#DCE3E3] dark:hover:border-[#34403F] flex items-center justify-center group shrink-0"
              title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-5 h-5 sm:w-4 sm:h-4 text-[#C49A50] group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 sm:w-4 sm:h-4 text-[#4C5A70] group-hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Help / ? Button (Desktop / Tablet) */}
            {onOpenHelp && (
              <button
                id="help-button-topbar"
                onClick={onOpenHelp}
                className="hidden sm:flex min-w-[44px] min-h-[44px] p-2.5 text-[#718096] hover:text-[#173F4F] dark:text-[#A8B7B4] dark:hover:text-[#6D9C98] hover:bg-[#F6F7F5] dark:hover:bg-[#283131] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#DCE3E3] dark:hover:border-[#34403F] items-center justify-center shrink-0"
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
                className="relative min-w-[44px] min-h-[44px] p-2.5 text-[#718096] hover:text-[#173F4F] dark:text-[#A8B7B4] dark:hover:text-[#6D9C98] hover:bg-[#F6F7F5] dark:hover:bg-[#283131] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#DCE3E3] dark:hover:border-[#34403F] flex items-center justify-center shrink-0"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 sm:w-4 sm:h-4 text-[#263238] dark:text-[#DCE5E2]" />
                {criticalThreats.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#B94A48] rounded-full ring-2 ring-white dark:ring-[#202727]"></span>
                )}
              </button>

              {/* Notifications Dropdown Panel (Responsive positioning) */}
              {showNotifications && (
                <div
                  id="notifications-dropdown"
                  className="fixed inset-x-3 top-[4.5rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white dark:bg-[#202727] border border-[#DCE3E3] dark:border-[#34403F] rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE3E3] dark:border-[#34403F] mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#263238] dark:text-[#DCE5E2]">
                        High Priority Alerts
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-[#B94A48]/15 text-[#B94A48] px-1.5 py-0.5 rounded">
                        {criticalThreats.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2] text-xs cursor-pointer"
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
                        className="p-2.5 rounded-xl bg-[#F6F7F5] dark:bg-[#1A2121] hover:bg-[#EEF3F2] dark:hover:bg-[#283131] border border-[#DCE3E3] dark:border-[#34403F] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-[#173F4F] dark:text-[#6D9C98] font-semibold">
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
                        <div className="text-xs font-medium text-[#263238] dark:text-[#DCE5E2] truncate">
                          {threat.threatType}
                        </div>
                        <div className="text-[11px] font-mono text-[#718096] dark:text-[#A8B7B4] mt-1 flex justify-between">
                          <span>{threat.protocol} / Port {threat.destinationPort}</span>
                          <span>Risk: {threat.riskScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#DCE3E3] dark:border-[#34403F] text-center">
                    <span className="text-[11px] font-mono text-[#173F4F] dark:text-[#6D9C98] hover:underline cursor-pointer">
                      Optical link telemetry verified &bull; 0 packet drops
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Control */}
            <div className="pl-1 sm:pl-2 border-l border-[#DCE3E3] dark:border-[#34403F]">
              <UserProfileControl
                onNavigateSettings={() => {
                  if (onNavigatePage) {
                    onNavigatePage('settings');
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </header>
  );
};
