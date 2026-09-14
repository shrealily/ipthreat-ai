import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Radio,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  ArrowUpRight,
  Flame,
  Pause,
  Play,
  RefreshCw,
  PlusCircle,
  Clock,
  Sparkles,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  X,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Threat, ThreatSeverity, ThreatStatus, ThreatDirection } from '../types';
import { generateSingleLiveThreat } from '../data/mockThreats';

interface LiveThreatsViewProps {
  threats: Threat[];
  onAddThreat: (threat: Threat) => void;
  onSelectThreat: (threat: Threat) => void;
  onNavigateToInvestigation: (threatId: string) => void;
}

export const LiveThreatsView: React.FC<LiveThreatsViewProps> = ({
  threats,
  onAddThreat,
  onSelectThreat,
  onNavigateToInvestigation,
}) => {
  // Filters state
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [threatTypeFilter, setThreatTypeFilter] = useState<string>('all');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [ipSearchQuery, setIpSearchQuery] = useState<string>('');

  // Selected threat in local state
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null);

  // Live simulation feed controls
  const [isLiveFeedActive, setIsLiveFeedActive] = useState<boolean>(true);
  const [secondsUntilNext, setSecondsUntilNext] = useState<number>(7);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());

  // References for live timer
  const nextThreatTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Helper to trigger one mock threat injection
  const injectThreat = () => {
    const newThreat = generateSingleLiveThreat();
    onAddThreat(newThreat);

    // Add to recently added set for visual highlight animation
    setRecentlyAddedIds((prev) => {
      const next = new Set(prev);
      next.add(newThreat.id);
      return next;
    });

    // Remove animation highlight after 5 seconds
    window.setTimeout(() => {
      setRecentlyAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(newThreat.id);
        return next;
      });
    }, 5000);
  };

  // Schedule the next live threat injection (every 6-10 seconds)
  useEffect(() => {
    if (!isLiveFeedActive) {
      if (nextThreatTimeoutRef.current) clearTimeout(nextThreatTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    // Pick random delay between 6000 and 10000 ms (6-10 seconds)
    const delayMs = Math.floor(Math.random() * 4000) + 6000;
    const delaySec = Math.round(delayMs / 1000);
    setSecondsUntilNext(delaySec);

    // Countdown ticker for user feedback
    countdownIntervalRef.current = window.setInterval(() => {
      setSecondsUntilNext((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    // Injection timer
    nextThreatTimeoutRef.current = window.setTimeout(() => {
      injectThreat();
      // Restart cycle by re-running effect via state update or self-invocation
      setSecondsUntilNext(Math.floor(Math.random() * 4) + 6);
    }, delayMs);

    return () => {
      if (nextThreatTimeoutRef.current) clearTimeout(nextThreatTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isLiveFeedActive, threats.length]);

  // Unique types and protocols for filter dropdowns
  const availableThreatTypes = useMemo(() => {
    const types = new Set<string>();
    threats.forEach((t) => types.add(t.threatType));
    return Array.from(types).sort();
  }, [threats]);

  const availableProtocols = useMemo(() => {
    const protos = new Set<string>();
    threats.forEach((t) => protos.add(t.protocol));
    return Array.from(protos).sort();
  }, [threats]);

  // Filter threats
  const filteredThreats = useMemo(() => {
    return threats.filter((threat) => {
      // Severity
      if (severityFilter !== 'all' && threat.severity !== severityFilter) {
        return false;
      }
      // Threat Type
      if (threatTypeFilter !== 'all' && threat.threatType !== threatTypeFilter) {
        return false;
      }
      // Protocol
      if (protocolFilter !== 'all' && threat.protocol !== protocolFilter) {
        return false;
      }
      // Direction
      if (directionFilter !== 'all' && threat.direction !== directionFilter) {
        return false;
      }
      // IP or Keyword Search
      if (ipSearchQuery.trim()) {
        const query = ipSearchQuery.trim().toLowerCase();
        const matchSource = threat.sourceIP.toLowerCase().includes(query);
        const matchDest = threat.destinationIP.toLowerCase().includes(query);
        const matchId = threat.id.toLowerCase().includes(query);
        const matchType = threat.threatType.toLowerCase().includes(query);
        if (!matchSource && !matchDest && !matchId && !matchType) {
          return false;
        }
      }
      return true;
    });
  }, [threats, severityFilter, threatTypeFilter, protocolFilter, directionFilter, ipSearchQuery]);

  const hasActiveFilters =
    severityFilter !== 'all' ||
    threatTypeFilter !== 'all' ||
    protocolFilter !== 'all' ||
    directionFilter !== 'all' ||
    ipSearchQuery.trim() !== '';

  const clearFilters = () => {
    setSeverityFilter('all');
    setThreatTypeFilter('all');
    setProtocolFilter('all');
    setDirectionFilter('all');
    setIpSearchQuery('');
  };

  // Row selection handler
  const handleRowClick = (threat: Threat) => {
    setSelectedThreatId(threat.id);
    onSelectThreat(threat);
    onNavigateToInvestigation(threat.id);
  };

  // Severity color badge helper
  const renderSeverityBadge = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase bg-[#B94A48]/15 text-[#B94A48] border border-[#B94A48]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B94A48] animate-pulse"></span>
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase bg-[#C87545]/15 text-[#C87545] border border-[#C87545]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C87545]"></span>
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase bg-[#C39A45]/15 text-[#C39A45] border border-[#C39A45]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C39A45]"></span>
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium uppercase bg-[#5C8D6B]/15 text-[#5C8D6B] border border-[#5C8D6B]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C8D6B]"></span>
            Low
          </span>
        );
    }
  };

  // Relative timestamp helper
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

      if (diffSec < 15) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  // Counters for filter quick tabs
  const criticalCount = useMemo(() => threats.filter((t) => t.severity === 'critical').length, [threats]);
  const highCount = useMemo(() => threats.filter((t) => t.severity === 'high').length, [threats]);
  const mediumCount = useMemo(() => threats.filter((t) => t.severity === 'medium').length, [threats]);
  const lowCount = useMemo(() => threats.filter((t) => t.severity === 'low').length, [threats]);
  const unidirectionalCount = useMemo(() => threats.filter((t) => t.direction === 'Unidirectional').length, [threats]);

  return (
    <div id="live-threats-view" className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DCE3E3]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20">
              <span className="w-2 h-2 rounded-full bg-[#173F4F] animate-pulse"></span>
              REAL-TIME INGESTION
            </span>
            <span className="text-[11px] font-mono text-[#718096] hidden sm:inline">
              Hardware Diode DPI (10 Gbps Air-Gap Optical Link)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#263238] font-display flex items-center gap-3">
            <Radio className="w-7 h-7 text-[#173F4F]" />
            Live Threat Stream
          </h1>
          <p className="text-xs text-[#718096] mt-1 max-w-3xl">
            Continuous telemetry packets traversing the hardware unidirectional optical diode. New detections arrive every 6–10 seconds. Select any row to open full forensic investigation.
          </p>
        </div>

        {/* Action Buttons & Simulation Live Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Ingestion Feed Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCE3E3] text-xs font-mono shadow-xs">
            <div className="relative flex items-center justify-center">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isLiveFeedActive ? 'bg-[#5C8D6B]' : 'bg-[#C39A45]'
                }`}
              ></span>
              {isLiveFeedActive && (
                <span className="absolute w-4 h-4 rounded-full bg-[#5C8D6B]/40 animate-ping-slow"></span>
              )}
            </div>
            <span className="text-[#263238]">
              {isLiveFeedActive ? (
                <span>
                  Feed: <strong className="text-[#5C8D6B]">ACTIVE</strong> (~{secondsUntilNext}s)
                </span>
              ) : (
                <span className="text-[#C39A45] font-medium">Feed Paused</span>
              )}
            </span>
          </div>

          {/* Pause / Resume Feed Button */}
          <button
            id="btn-toggle-live-feed"
            onClick={() => setIsLiveFeedActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              isLiveFeedActive
                ? 'bg-white hover:bg-[#EEF3F2] text-[#263238] border-[#DCE3E3]'
                : 'bg-[#5C8D6B]/15 hover:bg-[#5C8D6B]/25 text-[#5C8D6B] border-[#5C8D6B]/40'
            }`}
            title={isLiveFeedActive ? 'Pause live threat generation' : 'Resume live threat stream'}
          >
            {isLiveFeedActive ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#C39A45]" />
                <span>Pause Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#5C8D6B]" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          {/* Manual Threat Injection Button */}
          <button
            id="btn-inject-threat"
            onClick={injectThreat}
            className="px-3.5 py-1.5 rounded-xl bg-[#173F4F] hover:bg-[#2F6978] text-white text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
            title="Inject simulated DPI anomaly packet immediately"
          >
            <Zap className="w-3.5 h-3.5 text-[#DCE5E2]" />
            <span>Simulate Anomaly</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#718096] uppercase block">Total Logged</span>
            <span className="text-xl font-bold font-mono text-[#263238]">{threats.length}</span>
          </div>
          <Activity className="w-5 h-5 text-[#173F4F]/60" />
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#173F4F]/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#173F4F] uppercase block flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#173F4F]" />
              Unidirectional Diode
            </span>
            <span className="text-xl font-bold font-mono text-[#173F4F]">
              {unidirectionalCount} <span className="text-xs text-[#718096] font-normal">({Math.round((unidirectionalCount / threats.length) * 100)}%)</span>
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/20">
            Specialty
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#B94A48]/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#B94A48] uppercase block">Critical Severity</span>
            <span className="text-xl font-bold font-mono text-[#B94A48]">{criticalCount}</span>
          </div>
          <Flame className="w-5 h-5 text-[#B94A48]/70" />
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#718096] uppercase block">Active Ingest Rate</span>
            <span className="text-xl font-bold font-mono text-[#263238]">8.42 <span className="text-xs text-[#718096] font-normal">kpps</span></span>
          </div>
          <RefreshCw className={`w-4 h-4 text-[#5C8D6B] ${isLiveFeedActive ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </div>
      </div>

      {/* Filter Toolbar Controls */}
      <div className="p-4 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* IP & Keyword Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-3" />
            <input
              id="filter-ip-search"
              type="text"
              value={ipSearchQuery}
              onChange={(e) => setIpSearchQuery(e.target.value)}
              placeholder="Search by IP address (e.g. 10.240...), ID, or keyword..."
              className="w-full bg-[#F6F7F5] text-[#263238] text-xs rounded-xl pl-10 pr-9 py-2.5 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] focus:ring-1 focus:ring-[#173F4F]/30 font-mono placeholder:text-[#718096] transition-colors"
            />
            {ipSearchQuery && (
              <button
                onClick={() => setIpSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#718096] hover:text-[#263238] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F6F7F5] hover:bg-[#EEF3F2] text-[#263238] border border-[#DCE3E3] text-xs font-mono cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Severity Quick Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[#DCE3E3]">
          {/* Severity Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#718096] block mb-1">
              Severity Level
            </label>
            <select
              id="select-filter-severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#F6F7F5] text-[#263238] text-xs rounded-lg px-3 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono cursor-pointer"
            >
              <option value="all">All Severities ({threats.length})</option>
              <option value="critical">Critical Only ({criticalCount})</option>
              <option value="high">High ({highCount})</option>
              <option value="medium">Medium ({mediumCount})</option>
              <option value="low">Low ({lowCount})</option>
            </select>
          </div>

          {/* Threat Type Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#718096] block mb-1">
              Threat Type
            </label>
            <select
              id="select-filter-threat-type"
              value={threatTypeFilter}
              onChange={(e) => setThreatTypeFilter(e.target.value)}
              className="w-full bg-[#F6F7F5] text-[#263238] text-xs rounded-lg px-3 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-sans cursor-pointer truncate"
            >
              <option value="all">All Threat Types</option>
              {availableThreatTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Protocol Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#718096] block mb-1">
              Protocol
            </label>
            <select
              id="select-filter-protocol"
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="w-full bg-[#F6F7F5] text-[#263238] text-xs rounded-lg px-3 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono cursor-pointer"
            >
              <option value="all">All Protocols</option>
              {availableProtocols.map((proto) => (
                <option key={proto} value={proto}>
                  {proto}
                </option>
              ))}
            </select>
          </div>

          {/* Direction Filter (Highlighting Unidirectional) */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#173F4F] block mb-1 font-semibold">
              Diode Direction
            </label>
            <select
              id="select-filter-direction"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-full bg-[#F6F7F5] text-[#263238] text-xs rounded-lg px-3 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono cursor-pointer"
            >
              <option value="all">All Directions</option>
              <option value="Unidirectional">Unidirectional Only (Air-Gap Specialty)</option>
              <option value="Inbound">Inbound (External ➔ DMZ)</option>
              <option value="Outbound">Outbound (Enclave ➔ Out)</option>
            </select>
          </div>
        </div>

        {/* Results Counter Banner */}
        <div className="flex items-center justify-between text-xs font-mono text-[#718096] pt-1">
          <span className="flex items-center gap-2">
            <span>Showing</span>
            <strong className="text-[#173F4F] font-bold">{filteredThreats.length}</strong>
            <span>of {threats.length} total captured anomalies</span>
          </span>
          <span className="text-[11px] text-[#718096] hidden sm:inline">
            Click any row to investigate in depth
          </span>
        </div>
      </div>

      {/* Threat List: Stacked Cards on Mobile (<md), Full Table on Desktop (>=md) */}
      <div className="rounded-2xl bg-white border border-[#DCE3E3] shadow-xs overflow-hidden">
        {/* Mobile Stacked Card View (< md) */}
        <div className="block md:hidden divide-y divide-[#DCE3E3]">
          {filteredThreats.length === 0 ? (
            <div className="py-12 px-4 text-center text-[#718096]">
              <ShieldAlert className="w-8 h-8 text-[#718096] mx-auto mb-2" />
              <div className="text-sm font-semibold text-[#263238]">No threats matched the filters</div>
              <p className="text-xs text-[#718096] font-mono mt-1">Try clearing severity or search filters.</p>
              <button
                onClick={clearFilters}
                className="mt-3 px-4 py-2 min-h-[44px] rounded-xl bg-[#173F4F] text-white text-xs font-mono cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredThreats.map((threat) => {
              const isUnidirectional = threat.direction === 'Unidirectional';

              return (
                <div
                  key={threat.id}
                  id={`threat-card-mobile-${threat.id}`}
                  className="p-4 bg-white hover:bg-[#F8FAF9] transition-colors space-y-3"
                >
                  {/* Row 1: Severity + Threat ID + Timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {renderSeverityBadge(threat.severity)}
                      <span className="font-mono text-xs font-bold text-[#173F4F]">
                        {threat.id}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#718096] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#718096]" />
                      {formatTime(threat.detectedAt)}
                    </span>
                  </div>

                  {/* Row 2: Threat Type Headline */}
                  <div>
                    <h3 className="font-bold text-sm text-[#263238] leading-snug">
                      {threat.threatType}
                    </h3>
                    <div className="text-[11px] font-mono text-[#718096] mt-0.5">
                      Status: <span className="capitalize font-semibold text-[#263238]">{threat.status}</span>
                    </div>
                  </div>

                  {/* Row 3: 4 Key Fields Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#F6F7F5] border border-[#DCE3E3] text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase block">Source</span>
                      <span className="text-[#263238] font-medium truncate block">
                        {threat.sourceIP}:{threat.sourcePort}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase block">Destination</span>
                      <span className="text-[#263238] font-medium truncate block">
                        {threat.destinationIP}:{threat.destinationPort}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase block">Protocol &amp; Diode</span>
                      <span className="text-[#173F4F] font-semibold flex items-center gap-1">
                        {threat.protocol} {isUnidirectional && <Zap className="w-3 h-3 text-[#173F4F]" />}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase block">Risk Score</span>
                      <span className="font-bold text-[#B94A48]">
                        {threat.riskScore}% <span className="text-[10px] font-normal text-[#718096] font-sans">(AI: {threat.aiConfidence}%)</span>
                      </span>
                    </div>
                  </div>

                  {/* Row 4: View Details Tap-Through Button (44px min touch height) */}
                  <button
                    type="button"
                    onClick={() => handleRowClick(threat)}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#173F4F] hover:bg-[#2F6978] text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs active:scale-[0.99]"
                  >
                    <span>View Threat Details &amp; Forensics</span>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Full-Width Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table id="live-threats-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DCE3E3] bg-[#F6F7F5] text-[11px] font-mono uppercase tracking-wider text-[#718096]">
                <th className="py-3 px-4 w-[110px]">Severity</th>
                <th className="py-3 px-4 min-w-[200px]">Threat Type</th>
                <th className="py-3 px-4 min-w-[150px]">Source IP:Port</th>
                <th className="py-3 px-4 min-w-[150px]">Destination IP:Port</th>
                <th className="py-3 px-3 w-[90px]">Protocol</th>
                <th className="py-3 px-4 min-w-[160px]">
                  <span className="text-[#173F4F] font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#173F4F]" />
                    Direction
                  </span>
                </th>
                <th className="py-3 px-4 min-w-[110px]">Detection Time</th>
                <th className="py-3 px-4 min-w-[120px]">Risk Score</th>
                <th className="py-3 px-4 min-w-[110px]">AI Confidence</th>
                <th className="py-3 px-3 w-[80px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3E3] font-sans text-xs">
              {filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-[#718096]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-[#718096]" />
                      <span className="text-sm font-semibold text-[#263238]">
                        No threats matched the selected filters
                      </span>
                      <p className="text-xs text-[#718096] font-mono">
                        Try resetting your severity, protocol, or IP filter query.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[#173F4F] hover:bg-[#2F6978] text-white text-xs font-mono cursor-pointer transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredThreats.map((threat) => {
                  const isRecentlyAdded = recentlyAddedIds.has(threat.id);
                  const isSelected = selectedThreatId === threat.id;
                  const isUnidirectional = threat.direction === 'Unidirectional';

                  return (
                    <tr
                      key={threat.id}
                      id={`threat-row-${threat.id}`}
                      onClick={() => handleRowClick(threat)}
                      className={`group cursor-pointer transition-all duration-150 ${
                        isRecentlyAdded
                          ? 'bg-[#EEF3F2] border-l-4 border-l-[#173F4F]'
                          : isSelected
                          ? 'bg-[#EEF3F2] border-l-4 border-l-[#173F4F]'
                          : 'hover:bg-[#F6F7F5] border-l-4 border-l-transparent'
                      }`}
                      title="Click to view detailed forensic investigation"
                    >
                      {/* 1. Severity Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderSeverityBadge(threat.severity)}
                      </td>

                      {/* 2. Threat Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#263238] group-hover:text-[#173F4F] transition-colors flex items-center gap-1.5">
                          <span>{threat.threatType}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-[#173F4F] font-bold">
                            {threat.id}
                          </span>
                          <span className="text-[10px] font-mono text-[#718096] capitalize">
                            • {threat.status}
                          </span>
                        </div>
                      </td>

                      {/* 3. Source IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="text-[#263238] font-medium">{threat.sourceIP}</div>
                        <div className="text-[11px] text-[#718096]">Port {threat.sourcePort}</div>
                      </td>

                      {/* 4. Destination IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="text-[#263238] font-medium">{threat.destinationIP}</div>
                        <div className="text-[11px] text-[#718096]">Port {threat.destinationPort}</div>
                      </td>

                      {/* 5. Protocol */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F6F7F5] text-[#173F4F] border border-[#DCE3E3]">
                          {threat.protocol}
                        </span>
                      </td>

                      {/* 6. Direction (Unidirectional distinctly highlighted) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isUnidirectional ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#173F4F]/10 text-[#173F4F] border border-[#173F4F]/30">
                            <Zap className="w-3 h-3 text-[#173F4F] shrink-0" />
                            <span>UNIDIRECTIONAL (TX➔RX)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-[#718096] bg-[#F6F7F5] border border-[#DCE3E3]">
                            <span>{threat.direction}</span>
                          </span>
                        )}
                      </td>

                      {/* 7. Detection Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-[#263238]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#718096]" />
                          <span>{formatTime(threat.detectedAt)}</span>
                        </div>
                        <div className="text-[10px] text-[#718096]">
                          {new Date(threat.detectedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* 8. Risk Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-sm font-bold ${
                              threat.riskScore > 85
                                ? 'text-[#B94A48]'
                                : threat.riskScore > 65
                                ? 'text-[#C87545]'
                                : 'text-[#C39A45]'
                            }`}
                          >
                            {threat.riskScore}
                          </span>
                          <span className="text-[10px] text-[#718096]">/ 100</span>
                        </div>
                        <div className="w-20 bg-[#DCE3E3] h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              threat.riskScore > 85
                                ? 'bg-[#B94A48]'
                                : threat.riskScore > 65
                                ? 'bg-[#C87545]'
                                : 'bg-[#C39A45]'
                            }`}
                            style={{ width: `${threat.riskScore}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* 9. AI Confidence */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <div className="text-xs font-bold text-[#173F4F]">
                          {threat.aiConfidence}%
                        </div>
                        <div className="w-16 bg-[#DCE3E3] h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-[#173F4F] h-full rounded-full"
                            style={{ width: `${threat.aiConfidence}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* 10. Action */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(threat);
                          }}
                          className="p-1.5 rounded-lg bg-[#F6F7F5] hover:bg-[#173F4F]/10 text-[#718096] hover:text-[#173F4F] border border-[#DCE3E3] hover:border-[#173F4F]/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Open in Forensic Investigation View"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-3.5 bg-[#F6F7F5] border-t border-[#DCE3E3] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#718096] gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#173F4F]"></span>
            <span>IPthreat AI Neural Deep Packet Inspection Pipeline</span>
          </div>
          <div>
            Showing <strong className="text-[#263238]">{filteredThreats.length}</strong> records
          </div>
        </div>
      </div>
    </div>
  );
};
