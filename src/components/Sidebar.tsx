import React from 'react';
import {
  LayoutDashboard,
  Radio,
  SearchCheck,
  Network,
  PlayCircle,
  ShieldAlert,
  History,
  Cpu,
  Shield,
  ArrowRight,
  Zap,
  BookOpen,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import { NavPageId } from '../types';

interface SidebarProps {
  activePage: NavPageId;
  onSelectPage: (page: NavPageId) => void;
  activeCriticalCount: number;
  activeInvestigatingCount: number;
  activeIncidentsCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onReplaySplash?: () => void;
}

interface NavItem {
  id: NavPageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeType?: 'critical' | 'info' | 'neutral';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  activeCriticalCount,
  activeInvestigatingCount,
  activeIncidentsCount,
  isMobileOpen,
  onCloseMobile,
  onReplaySplash,
}) => {
  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'live-threats',
      label: 'Live Threats',
      icon: Radio,
      badge: activeCriticalCount > 0 ? `${activeCriticalCount} Crit` : undefined,
      badgeType: 'critical',
    },
    {
      id: 'investigation',
      label: 'Investigation',
      icon: SearchCheck,
      badge: activeInvestigatingCount > 0 ? activeInvestigatingCount : undefined,
      badgeType: 'info',
    },
    {
      id: 'network-map',
      label: 'Network Map',
      icon: Network,
    },
    {
      id: 'simulation',
      label: 'Simulation',
      icon: PlayCircle,
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: ShieldAlert,
      badge: activeIncidentsCount !== undefined && activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeType: 'neutral',
    },
    {
      id: 'threat-history',
      label: 'Threat History',
      icon: History,
    },
    {
      id: 'model-monitoring',
      label: 'AI Model',
      icon: Cpu,
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      id: 'how-to-use',
      label: 'How to Use',
      icon: BookOpen,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  const handleNavClick = (pageId: NavPageId) => {
    onSelectPage(pageId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        id="soc-sidebar"
        className={`
          fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30
          w-72 sm:w-80 md:w-64 bg-white border-r border-[#DCE3E3] flex flex-col shrink-0 h-screen select-none text-[#263238]
          transition-transform duration-200 ease-in-out
          ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#DCE3E3] flex items-center justify-between">
          <button
            onClick={() => {
              if (onReplaySplash) {
                if (onCloseMobile) onCloseMobile();
                onReplaySplash();
              } else {
                handleNavClick('dashboard');
              }
            }}
            className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity cursor-pointer select-none"
            title="IPthreat AI (Tap to view Welcome Screen)"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--primary-teal)] text-[var(--bg-card)] shadow-xs shrink-0">
              <Shield className="w-5 h-5 text-[var(--bg-card)]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-wide text-[var(--primary-teal)] font-display">
                  IP<span className="text-[var(--text-main)]">threat</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#718096] font-mono mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5C8D6B]"></span>
                UNIDIRECTIONAL SOC
              </p>
            </div>
          </button>

          {/* Close button for Mobile Drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-[#718096] hover:text-[#263238] hover:bg-[#F6F7F5] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[#718096] font-semibold">
            Console Navigation
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF3F5] text-[#173F4F] font-bold shadow-xs border border-[#CBD5E1]'
                    : 'text-[#4A5568] hover:text-[#173F4F] hover:bg-[#F6F7F5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#173F4F]' : 'text-[#718096]'
                    }`}
                  />
                  <span className="tracking-tight text-sm md:text-xs">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.badgeType === 'critical'
                        ? 'bg-[#B94A48] text-white'
                        : 'bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Support & System Section */}
          <div className="pt-3 px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[#718096] font-semibold">
            Configuration &amp; Help
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF3F5] text-[#173F4F] font-bold shadow-xs border border-[#CBD5E1]'
                    : 'text-[#4A5568] hover:text-[#173F4F] hover:bg-[#F6F7F5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#173F4F]' : 'text-[#718096]'
                    }`}
                  />
                  <span className="tracking-tight text-sm md:text-xs">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Optical Diode Status Module */}
        <div className="p-3 m-3 rounded-xl bg-[#F8FAF9] border border-[#DCE3E3] text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[#263238] font-medium">
              <Zap className="w-3.5 h-3.5 text-[#C39A45]" />
              <span className="font-mono text-[11px] font-semibold">OPTICAL DIODE</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#5C8D6B] bg-[#5C8D6B]/15 px-1.5 py-0.5 rounded border border-[#5C8D6B]/30">
              ENFORCED
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px] text-[#718096]">
            <div className="flex justify-between items-center py-0.5">
              <span>Direction:</span>
              <span className="text-[#173F4F] font-semibold flex items-center gap-1">
                TX <ArrowRight className="w-3 h-3 inline text-[#173F4F]" /> RX
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Air-Gap State:</span>
              <span className="text-[#263238] font-medium">Physical Isolation</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Reverse Leak:</span>
              <span className="text-[#5C8D6B] font-bold">0.00% (Locked)</span>
            </div>
          </div>
        </div>

        {/* Footer Analyst Session */}
        <div className="p-3 border-t border-[#DCE3E3] bg-[#F8FAF9] flex items-center justify-between text-xs text-[#718096]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5C8D6B]"></div>
            <span className="font-mono text-[11px]">Node: <span className="text-[#263238] font-medium">US-EAST-OT1</span></span>
          </div>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
      </aside>
    </>
  );
};
