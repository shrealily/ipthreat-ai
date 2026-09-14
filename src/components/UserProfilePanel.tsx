import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Clock,
  Building2,
  BadgeCheck,
  Settings as SettingsIcon,
  LogOut,
  User,
  ExternalLink,
  Lock,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export interface AnalystProfile {
  name: string;
  role: string;
  badgeId: string;
  photoUrl: string;
  email: string;
  isVerified: boolean;
  mfaMethod: string;
  accessLevel: string;
  department: string;
  lastLogin: string;
  sessionIp: string;
  clearance: string;
  certifications: string[];
}

export const MOCK_ANALYST: AnalystProfile = {
  name: 'Elena Rostova',
  role: 'Senior SOC Analyst',
  badgeId: 'SOC-8492-AX',
  photoUrl:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
  email: 'e.rostova@ipthreat.ai',
  isVerified: true,
  mfaMethod: 'FIDO2 YubiKey 5C • Okta Enterprise SSO',
  accessLevel: 'Tier 2 Analyst',
  clearance: 'Level 4 Unidirectional Core',
  department: 'OT/ICS Cyber Defense Unit',
  lastLogin: 'Today, 07:42 UTC (via Optical Terminal 04)',
  sessionIp: '10.240.18.94 (Direct Optical Link)',
  certifications: ['GICSP (ICS Security)', 'CISSP', 'SANS GRID (Incident Response)'],
};

interface UserProfileControlProps {
  onNavigateSettings?: () => void;
}

export const UserProfileControl: React.FC<UserProfileControlProps> = ({
  onNavigateSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signOutNotice, setSignOutNotice] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = () => {
    setIsOpen(false);
    setSignOutNotice(true);
    setTimeout(() => {
      setSignOutNotice(false);
    }, 3500);
  };

  const handleOpenSettings = () => {
    setIsOpen(false);
    if (onNavigateSettings) {
      onNavigateSettings();
    }
  };

  const handleOpenProfileModal = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TopBar Trigger Button */}
      <button
        id="user-profile-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 pl-1.5 pr-1 sm:pl-2.5 sm:pr-2 py-1 min-h-[44px] rounded-xl border border-transparent hover:border-[#DCE3E3] hover:bg-[#F6F7F5] transition-all cursor-pointer group select-none text-left shrink-0"
        title="User Profile & SOC Credentials"
      >
        <div className="relative">
          <img
            src={MOCK_ANALYST.photoUrl}
            alt={MOCK_ANALYST.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#DCE3E3] group-hover:ring-[#173F4F] transition-all"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.avatar-fallback');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div className="avatar-fallback hidden w-8 h-8 rounded-lg bg-[#173F4F] text-white items-center justify-center text-xs font-bold ring-1 ring-[#DCE3E3]">
            ER
          </div>
          {/* Active online dot with verified ring */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#5C8D6B] rounded-full ring-2 ring-[var(--bg-card)]" />
        </div>

        <div className="hidden sm:block text-left">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="text-xs font-semibold text-[#263238] group-hover:text-[#173F4F] transition-colors">
              {MOCK_ANALYST.name}
            </span>
            <BadgeCheck className="w-3.5 h-3.5 text-[#5C8D6B]" />
          </div>
          <div className="text-[10px] font-mono text-[#718096] leading-tight">
            {MOCK_ANALYST.accessLevel}
          </div>
        </div>
      </button>

      {/* Profile Dropdown Panel */}
      {isOpen && (
        <div
          id="user-profile-dropdown"
          className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white border border-[#DCE3E3] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Card with Photo and Title */}
          <div className="flex items-start gap-3.5 pb-3.5 border-b border-[#DCE3E3]">
            <div className="relative shrink-0">
              <img
                src={MOCK_ANALYST.photoUrl}
                alt={MOCK_ANALYST.name}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#DCE3E3]"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#5C8D6B] text-white rounded-full p-0.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-sm font-bold text-[#263238] truncate font-display">
                  {MOCK_ANALYST.name}
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20 shrink-0">
                  {MOCK_ANALYST.badgeId}
                </span>
              </div>
              <div className="text-xs font-medium text-[#173F4F] mt-0.5">
                {MOCK_ANALYST.role}
              </div>
              <div className="text-[11px] text-[#718096] font-mono mt-0.5 truncate">
                {MOCK_ANALYST.email}
              </div>
            </div>
          </div>

          {/* Identity Verified Badge & Security Posture */}
          <div className="my-3 p-2.5 rounded-xl bg-[#F0F4F2] border border-[#DCE3E3]/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#5C8D6B]/15 text-[#5C8D6B] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-[#263238]">
                  Identity Verified
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#5C8D6B] bg-[#5C8D6B]/15 px-2 py-0.5 rounded-full">
                ACTIVE SESSION
              </span>
            </div>
            <div className="flex items-start gap-1.5 text-[11px] text-[#718096] font-mono leading-relaxed">
              <Key className="w-3.5 h-3.5 text-[#173F4F] shrink-0 mt-0.5" />
              <span>{MOCK_ANALYST.mfaMethod}</span>
            </div>
          </div>

          {/* Credentials & Access Info Grid */}
          <div className="space-y-2 py-1 text-xs">
            {/* Access Level */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]/60">
              <span className="text-[#718096] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#173F4F]" />
                Access Level
              </span>
              <span className="font-semibold text-[#263238] font-mono">
                {MOCK_ANALYST.accessLevel}
              </span>
            </div>

            {/* Department */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]/60">
              <span className="text-[#718096] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#173F4F]" />
                Department
              </span>
              <span className="font-semibold text-[#263238] truncate max-w-[180px] text-right">
                {MOCK_ANALYST.department}
              </span>
            </div>

            {/* Last Login */}
            <div className="flex items-start justify-between p-2 rounded-lg bg-[#F6F7F5] border border-[#DCE3E3]/60">
              <span className="text-[#718096] flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#173F4F]" />
                Last Login
              </span>
              <span className="font-mono text-[11px] text-[#263238] text-right">
                {MOCK_ANALYST.lastLogin}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-3 border-t border-[#DCE3E3] grid grid-cols-3 gap-2">
            <button
              id="profile-view-details-btn"
              onClick={handleOpenProfileModal}
              className="flex items-center justify-center gap-1 px-2 py-2 min-h-[44px] rounded-xl bg-[#F6F7F5] hover:bg-[#EEF3F2] text-[#263238] hover:text-[#173F4F] border border-[#DCE3E3] text-xs font-semibold transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              id="profile-view-settings-btn"
              onClick={handleOpenSettings}
              className="flex items-center justify-center gap-1 px-2 py-2 min-h-[44px] rounded-xl bg-[#F6F7F5] hover:bg-[#EEF3F2] text-[#263238] hover:text-[#173F4F] border border-[#DCE3E3] text-xs font-semibold transition-colors cursor-pointer"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              id="profile-sign-out-btn"
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1 px-2 py-2 min-h-[44px] rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B94A48] border border-[#FECACA] text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Full Operational Profile Modal (when "View Profile" is clicked) */}
      {isModalOpen && (
        <div
          id="analyst-profile-modal-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="analyst-profile-modal"
            className="bg-white border border-[#DCE3E3] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 text-[#263238] relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE3E3]">
              <div className="flex items-center gap-3">
                <img
                  src={MOCK_ANALYST.photoUrl}
                  alt={MOCK_ANALYST.name}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#173F4F]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-display">
                      {MOCK_ANALYST.name}
                    </h2>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-[#5C8D6B] bg-[#5C8D6B]/15 px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-[#173F4F] font-semibold mt-0.5">
                    {MOCK_ANALYST.role} &bull; Badge {MOCK_ANALYST.badgeId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#718096] hover:text-[#263238] rounded-lg hover:bg-[#F6F7F5] transition-colors cursor-pointer"
                aria-label="Close Profile Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4 text-xs">
              {/* Security Credentials Section */}
              <div>
                <h4 className="font-semibold text-[#718096] uppercase tracking-wider text-[10px] mb-2 font-mono">
                  Authorization &amp; Security Clearance
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
                    <div className="text-[11px] text-[#718096]">Security Clearance</div>
                    <div className="font-bold text-[#263238] mt-0.5 font-mono">
                      {MOCK_ANALYST.clearance}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
                    <div className="text-[11px] text-[#718096]">Assigned Node</div>
                    <div className="font-bold text-[#263238] mt-0.5 font-mono">
                      DG-OPT-CORE-01
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
                    <div className="text-[11px] text-[#718096]">Operational Access</div>
                    <div className="font-bold text-[#263238] mt-0.5 font-mono">
                      {MOCK_ANALYST.accessLevel}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3]">
                    <div className="text-[11px] text-[#718096]">Current Session IP</div>
                    <div className="font-bold text-[#263238] mt-0.5 font-mono text-[11px]">
                      {MOCK_ANALYST.sessionIp}
                    </div>
                  </div>
                </div>
              </div>

              {/* MFA & SSO Verification Details */}
              <div className="p-3 rounded-xl bg-[#F0F4F2] border border-[#DCE3E3] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#173F4F]">
                  <Key className="w-4 h-4 text-[#5C8D6B]" />
                  <span>MFA Token Authentication Status</span>
                </div>
                <p className="text-[11px] text-[#718096] font-mono leading-relaxed">
                  Cryptographic challenge-response signed via hardware security module (HSM).
                  Session certificate expires in 7 hours 18 minutes.
                </p>
              </div>

              {/* Verified Professional Certifications */}
              <div>
                <h4 className="font-semibold text-[#718096] uppercase tracking-wider text-[10px] mb-2 font-mono">
                  Verified Industry Certifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {MOCK_ANALYST.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-2.5 py-1 rounded-lg bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20 font-mono text-[11px] font-semibold"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#DCE3E3] flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[var(--primary-teal)] text-white dark:text-[#171B1B] text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Sign Out Notice Toast */}
      {signOutNotice && (
        <div
          id="mock-sign-out-toast"
          className="fixed bottom-6 right-6 z-[110] bg-white border border-[#DCE3E3] p-4 rounded-xl shadow-2xl flex items-center gap-3 text-xs text-[#263238] animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-[#5C8D6B]/15 text-[#5C8D6B] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">Console Session Locked</div>
            <div className="text-[11px] text-[#718096]">
              {MOCK_ANALYST.name} signed out. Hardware key disengaged safely.
            </div>
          </div>
          <button
            onClick={() => setSignOutNotice(false)}
            className="ml-2 text-xs font-semibold text-[#173F4F] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
