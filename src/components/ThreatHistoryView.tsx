import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  ArrowUpRight,
  ShieldAlert,
  Server,
  Activity,
  CheckCircle2,
  Lock,
  SearchCheck,
  Radio,
  Clock,
  FileSpreadsheet,
  Layers,
  Zap,
} from 'lucide-react';
import { Threat, ThreatSeverity, ThreatStatus } from '../types';

interface ThreatHistoryViewProps {
  threats: Threat[];
  onSelectThreat: (threat: Threat) => void;
  onNavigateToInvestigation: (threatId: string) => void;
}

type SortColumn =
  | 'detectedAt'
  | 'threatType'
  | 'sourceIP'
  | 'destinationIP'
  | 'severity'
  | 'riskScore'
  | 'status';

type SortDirection = 'asc' | 'desc';

type DatePreset = 'all' | '24h' | '7d' | '14d' | '30d' | 'custom';

const SEVERITY_WEIGHT: Record<ThreatSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const STATUS_WEIGHT: Record<ThreatStatus, number> = {
  detected: 1,
  investigating: 2,
  confirmed: 3,
  contained: 4,
  resolved: 5,
};

export const ThreatHistoryView: React.FC<ThreatHistoryViewProps> = ({
  threats,
  onSelectThreat,
  onNavigateToInvestigation,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [threatTypeFilter, setThreatTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Date Range State
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Sorting State (default newest first)
  const [sortColumn, setSortColumn] = useState<SortColumn>('detectedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination State (10-15 rows/page)
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Available unique threat types in data
  const uniqueThreatTypes = useMemo(() => {
    const types = new Set<string>();
    threats.forEach((t) => types.add(t.threatType));
    return Array.from(types).sort();
  }, [threats]);

  // Handle Sort Toggle
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection(column === 'detectedAt' || column === 'riskScore' || column === 'severity' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  // Filtered Threats
  const filteredThreats = useMemo(() => {
    // Determine reference time from the latest threat or now
    const latestThreatTime = threats.length > 0
      ? Math.max(...threats.map((t) => new Date(t.detectedAt).getTime()))
      : Date.now();

    return threats.filter((threat) => {
      const threatTime = new Date(threat.detectedAt).getTime();

      // 1. Search filter: IP (Source or Destination) or threat type or ID
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchSrc = threat.sourceIP.toLowerCase().includes(query);
        const matchDst = threat.destinationIP.toLowerCase().includes(query);
        const matchType = threat.threatType.toLowerCase().includes(query);
        const matchId = threat.id.toLowerCase().includes(query);
        const matchProto = threat.protocol.toLowerCase().includes(query);
        if (!matchSrc && !matchDst && !matchType && !matchId && !matchProto) {
          return false;
        }
      }

      // 2. Severity filter
      if (severityFilter !== 'all' && threat.severity !== severityFilter) {
        return false;
      }

      // 3. Threat Type filter
      if (threatTypeFilter !== 'all' && threat.threatType !== threatTypeFilter) {
        return false;
      }

      // 4. Status filter
      if (statusFilter !== 'all' && threat.status !== statusFilter) {
        return false;
      }

      // 5. Date Range filter
      if (datePreset === '24h') {
        const threshold = latestThreatTime - 24 * 60 * 60 * 1000;
        if (threatTime < threshold) return false;
      } else if (datePreset === '7d') {
        const threshold = latestThreatTime - 7 * 24 * 60 * 60 * 1000;
        if (threatTime < threshold) return false;
      } else if (datePreset === '14d') {
        const threshold = latestThreatTime - 14 * 24 * 60 * 60 * 1000;
        if (threatTime < threshold) return false;
      } else if (datePreset === '30d') {
        const threshold = latestThreatTime - 30 * 24 * 60 * 60 * 1000;
        if (threatTime < threshold) return false;
      } else if (datePreset === 'custom') {
        if (customStartDate) {
          const startMs = new Date(customStartDate).setHours(0, 0, 0, 0);
          if (threatTime < startMs) return false;
        }
        if (customEndDate) {
          const endMs = new Date(customEndDate).setHours(23, 59, 59, 999);
          if (threatTime > endMs) return false;
        }
      }

      return true;
    });
  }, [
    threats,
    searchQuery,
    severityFilter,
    threatTypeFilter,
    statusFilter,
    datePreset,
    customStartDate,
    customEndDate,
  ]);

  // Sorted Threats
  const sortedThreats = useMemo(() => {
    const list = [...filteredThreats];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'detectedAt':
          comparison = new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
          break;
        case 'threatType':
          comparison = a.threatType.localeCompare(b.threatType);
          break;
        case 'sourceIP':
          comparison = a.sourceIP.localeCompare(b.sourceIP);
          break;
        case 'destinationIP':
          comparison = a.destinationIP.localeCompare(b.destinationIP);
          break;
        case 'severity':
          comparison = SEVERITY_WEIGHT[a.severity] - SEVERITY_WEIGHT[b.severity];
          break;
        case 'riskScore':
          comparison = a.riskScore - b.riskScore;
          break;
        case 'status':
          comparison = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredThreats, sortColumn, sortDirection]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(sortedThreats.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedThreats.length);
  const paginatedThreats = sortedThreats.slice(startIndex, endIndex);

  // Active filter count
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    severityFilter !== 'all' ||
    threatTypeFilter !== 'all' ||
    statusFilter !== 'all' ||
    datePreset !== 'all' ||
    customStartDate !== '' ||
    customEndDate !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSeverityFilter('all');
    setThreatTypeFilter('all');
    setStatusFilter('all');
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortColumn('detectedAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  // Export Filtered Table to CSV
  const handleExportCSV = () => {
    const headers = [
      'Incident ID',
      'Detected Timestamp (ISO)',
      'Threat Type',
      'Severity',
      'Risk Score',
      'Status',
      'Source IP',
      'Source Port',
      'Destination IP',
      'Destination Port',
      'Protocol',
      'Direction',
      'Traffic (MB)',
      'Packet Count',
    ];

    const rows = sortedThreats.map((t) => [
      `"${t.id}"`,
      `"${t.detectedAt}"`,
      `"${t.threatType}"`,
      `"${t.severity}"`,
      t.riskScore,
      `"${t.status}"`,
      `"${t.sourceIP}"`,
      t.sourcePort,
      `"${t.destinationIP}"`,
      t.destinationPort,
      `"${t.protocol}"`,
      `"${t.direction}"`,
      t.trafficVolumeMB,
      t.packetCount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ipthreat-threat-history-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Relative Time Formatter
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      const days = Math.floor(diffSec / 86400);
      if (days === 1) return 'Yesterday';
      if (days < 30) return `${days}d ago`;
      return `${Math.floor(days / 30)}mo ago`;
    } catch {
      return 'Archive';
    }
  };

  // Severity Badge Helper
  const renderSeverityBadge = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FDF2F2] text-[#B94A48] border border-[#F8D7DA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B94A48]"></span>
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FFF8F0] text-[#C87545] border border-[#FEEBC8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C87545]"></span>
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#FEFCE8] text-[#C39A45] border border-[#FEF08A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C39A45]"></span>
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium uppercase tracking-wider bg-[#EEF3F5] text-[#173F4F] border border-[#DCE3E3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#173F4F]"></span>
            Low
          </span>
        );
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: ThreatStatus) => {
    switch (status) {
      case 'detected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold capitalize bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1]">
            <Radio className="w-3 h-3 text-[#173F4F]" />
            Detected
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold capitalize bg-[#EBF8FF] text-[#2B6CB0] border border-[#BEE3F8]">
            <SearchCheck className="w-3 h-3 text-[#2B6CB0]" />
            Investigating
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize bg-[#FDF2F2] text-[#B94A48] border border-[#F8D7DA]">
            <ShieldAlert className="w-3 h-3 text-[#B94A48]" />
            Confirmed
          </span>
        );
      case 'contained':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize bg-[#FFF8F0] text-[#C87545] border border-[#FEEBC8]">
            <Lock className="w-3 h-3 text-[#C87545]" />
            Contained
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold capitalize bg-[#F0FDF4] text-[#5C8D6B] border border-[#DCFCE7]">
            <CheckCircle2 className="w-3 h-3 text-[#5C8D6B]" />
            Resolved
          </span>
        );
    }
  };

  // Risk Score Color & Gauge Helper
  const getRiskScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#B94A48]';
    if (score >= 70) return 'text-[#C87545]';
    if (score >= 50) return 'text-[#C39A45]';
    return 'text-[#173F4F]';
  };

  const getRiskScoreBg = (score: number) => {
    if (score >= 85) return 'bg-[#B94A48]';
    if (score >= 70) return 'bg-[#C87545]';
    if (score >= 50) return 'bg-[#C39A45]';
    return 'bg-[#173F4F]';
  };

  // Sort Icon Renderer
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
    );
  };

  // Row Click Handler (Matches Live Threats view behavior)
  const handleRowClick = (threat: Threat) => {
    onSelectThreat(threat);
    onNavigateToInvestigation(threat.id);
  };

  return (
    <div id="threat-history-view" className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Top Header & Export Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DCE3E3]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-[#EEF3F5] border border-[#CBD5E1] text-[#173F4F]">
              <History className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1]">
              FORENSIC TELEMETRY ARCHIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#263238] font-display flex items-center gap-2.5">
            <span>Threat History Archive</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1] font-normal">
              {threats.length} Total Records
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Complete historical audit log of optical data diode telemetry, unauthorized reverse-channel attempts, and containment events. Select any record to open detailed forensic investigation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#173F4F] hover:bg-[#234E5E] text-white border border-[#173F4F] text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
            title="Download current filtered dataset as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Export CSV ({filteredThreats.length})</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              id="btn-reset-filters"
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#EEF3F5] text-[#718096] hover:text-[#263238] border border-[#DCE3E3] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title="Reset all search queries and active filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#173F4F]" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#718096] uppercase block">Filtered / Total</span>
            <span className="text-xl font-bold text-[#263238]">
              {filteredThreats.length}{' '}
              <span className="text-xs text-[#718096] font-normal">/ {threats.length}</span>
            </span>
          </div>
          <Layers className="w-5 h-5 text-[#173F4F]" />
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#F8D7DA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#B94A48] uppercase block">Critical Incidents</span>
            <span className="text-xl font-bold text-[#B94A48]">
              {threats.filter((t) => t.severity === 'critical').length}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FDF2F2] text-[#B94A48] border border-[#F8D7DA]">
            {Math.round(
              (threats.filter((t) => t.severity === 'critical').length / (threats.length || 1)) * 100
            )}
            %
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#FEEBC8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#C39A45] uppercase block">Mean Risk Score</span>
            <span className="text-xl font-bold text-[#C39A45]">
              {threats.length > 0
                ? Math.round(
                    threats.reduce((acc, curr) => acc + curr.riskScore, 0) / threats.length
                  )
                : 0}
              <span className="text-xs text-[#718096] font-normal">/100</span>
            </span>
          </div>
          <Activity className="w-5 h-5 text-[#C39A45]" />
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#DCFCE7] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#5C8D6B] uppercase block">Mitigation Rate</span>
            <span className="text-xl font-bold text-[#5C8D6B]">
              {Math.round(
                (threats.filter((t) => t.status === 'contained' || t.status === 'resolved').length /
                  (threats.length || 1)) *
                  100
              )}
              %
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0FDF4] text-[#5C8D6B] border border-[#DCFCE7]">
            Contained / Resolved
          </span>
        </div>
      </div>

      {/* 3. Comprehensive Search & Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-3.5">
        {/* Row 1: Search Box & Date Range Preset */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Box: IP or Threat Type or ID */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="history-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by IP (Source/Destination), Threat Type, or ID (e.g. 10.240, Modbus, DG-84)..."
              className="w-full bg-[#F8FAF9] text-[#263238] text-xs rounded-xl pl-9 pr-8 py-2.5 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] focus:ring-1 focus:ring-[#173F4F]/30 font-mono placeholder:text-[#718096] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#263238] text-xs font-mono px-1 cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Range Presets */}
          <div className="flex flex-wrap items-center gap-1 bg-[#F8FAF9] p-1 rounded-xl border border-[#DCE3E3]">
            <span className="text-[11px] font-mono text-[#718096] px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#173F4F]" />
              <span className="hidden sm:inline">Range:</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setDatePreset('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                datePreset === 'all'
                  ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                  : 'text-[#718096] hover:text-[#263238] hover:bg-[#EEF3F5]'
              }`}
            >
              All Time
            </button>

            <button
              type="button"
              onClick={() => {
                setDatePreset('24h');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                datePreset === '24h'
                  ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                  : 'text-[#718096] hover:text-[#263238] hover:bg-[#EEF3F5]'
              }`}
            >
              Last 24h
            </button>

            <button
              type="button"
              onClick={() => {
                setDatePreset('7d');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                datePreset === '7d'
                  ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                  : 'text-[#718096] hover:text-[#263238] hover:bg-[#EEF3F5]'
              }`}
            >
              Last 7d
            </button>

            <button
              type="button"
              onClick={() => {
                setDatePreset('14d');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                datePreset === '14d'
                  ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                  : 'text-[#718096] hover:text-[#263238] hover:bg-[#EEF3F5]'
              }`}
            >
              Last 14d
            </button>

            <button
              type="button"
              onClick={() => {
                setDatePreset('30d');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                datePreset === '30d'
                  ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                  : 'text-[#718096] hover:text-[#263238] hover:bg-[#EEF3F5]'
              }`}
            >
              Last 30d
            </button>

            <button
              type="button"
              onClick={() => {
                setDatePreset('custom');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                datePreset === 'custom'
                  ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                  : 'text-[#718096] hover:text-[#263238] hover:bg-[#EEF3F5]'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Optional Custom Date Range Picker Fields */}
        {datePreset === 'custom' && (
          <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#CBD5E1] flex flex-wrap items-center gap-3 animate-fadeIn">
            <span className="text-xs font-mono text-[#173F4F] font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#173F4F]" />
              Custom Date Window:
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="custom-start-date" className="text-xs font-mono text-[#718096]">
                Start:
              </label>
              <input
                type="date"
                id="custom-start-date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white text-[#263238] text-xs rounded-lg px-2.5 py-1.5 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="custom-end-date" className="text-xs font-mono text-[#718096]">
                End:
              </label>
              <input
                type="date"
                id="custom-end-date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white text-[#263238] text-xs rounded-lg px-2.5 py-1.5 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono"
              />
            </div>

            {(customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setCurrentPage(1);
                }}
                className="text-xs font-mono text-[#173F4F] hover:underline ml-auto cursor-pointer"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}

        {/* Row 2: Filter Dropdowns for Severity, Threat Type, Status, and Page Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-[#DCE3E3]">
          {/* 1. Severity Dropdown */}
          <div className="space-y-1">
            <label htmlFor="filter-severity" className="text-[10px] font-mono text-[#718096] uppercase tracking-wider block">
              Severity
            </label>
            <select
              id="filter-severity"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAF9] text-[#263238] text-xs rounded-xl px-3 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* 2. Threat Type Dropdown */}
          <div className="space-y-1">
            <label htmlFor="filter-threat-type" className="text-[10px] font-mono text-[#718096] uppercase tracking-wider block">
              Threat Type
            </label>
            <select
              id="filter-threat-type"
              value={threatTypeFilter}
              onChange={(e) => {
                setThreatTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAF9] text-[#263238] text-xs rounded-xl px-3 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono cursor-pointer truncate"
            >
              <option value="all">All Threat Types ({uniqueThreatTypes.length})</option>
              {uniqueThreatTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Status Dropdown */}
          <div className="space-y-1">
            <label htmlFor="filter-status" className="text-[10px] font-mono text-[#718096] uppercase tracking-wider block">
              Status
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAF9] text-[#263238] text-xs rounded-xl px-3 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="investigating">Investigating</option>
              <option value="confirmed">Confirmed</option>
              <option value="contained">Contained</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* 4. Page Size Dropdown */}
          <div className="space-y-1">
            <label htmlFor="select-page-size" className="text-[10px] font-mono text-[#718096] uppercase tracking-wider block">
              Rows Per Page
            </label>
            <select
              id="select-page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAF9] text-[#263238] text-xs rounded-xl px-3 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] font-mono cursor-pointer"
            >
              <option value={10}>10 rows per page</option>
              <option value={15}>15 rows per page</option>
              <option value={25}>25 rows per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Archive Records: Stacked Cards on Mobile (<md), Full Table on Desktop (>=md) */}
      <div className="rounded-2xl bg-white border border-[#DCE3E3] shadow-xs overflow-hidden">
        {/* Mobile Stacked Cards (< md) */}
        <div className="block md:hidden divide-y divide-[#DCE3E3]">
          {paginatedThreats.length === 0 ? (
            <div className="py-12 px-4 text-center text-[#718096] font-mono">
              <Filter className="w-8 h-8 text-[#718096] mx-auto mb-2" />
              <div className="text-sm font-bold text-[#263238]">No archive records matched criteria</div>
              <p className="text-xs text-[#718096] mt-1">Try clearing date or severity filters.</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 px-4 py-2 min-h-[44px] rounded-xl bg-[#173F4F] text-white text-xs font-mono cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            paginatedThreats.map((threat) => {
              const isUnidirectional = threat.direction === 'Unidirectional';

              return (
                <div
                  key={threat.id}
                  id={`archive-card-mobile-${threat.id}`}
                  className="p-4 bg-white hover:bg-[#F8FAF9] transition-colors space-y-3"
                >
                  {/* Row 1: Severity + Threat ID + Date */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {renderSeverityBadge(threat.severity)}
                      <span className="font-mono text-xs font-bold text-[#173F4F]">
                        {threat.id}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#718096] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#718096]" />
                      {new Date(threat.detectedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Row 2: Threat Type + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#263238] leading-snug">
                      {threat.threatType}
                    </h3>
                    <div className="shrink-0">
                      {renderStatusBadge(threat.status)}
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
                      <span className={`font-bold ${getRiskScoreColor(threat.riskScore)}`}>
                        {threat.riskScore} <span className="text-[10px] font-normal text-[#718096] font-sans">({threat.aiConfidence}% conf)</span>
                      </span>
                    </div>
                  </div>

                  {/* Row 4: View Details Tap-Through Button */}
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

        {/* Desktop Table Viewport (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="threat-history-table">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#DCE3E3] text-[#718096] font-mono text-[11px] select-none">
                {/* 1. Detected Date */}
                <th
                  onClick={() => handleSort('detectedAt')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-[#173F4F] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Detected Date</span>
                    {renderSortIcon('detectedAt')}
                  </div>
                </th>

                {/* 2. Threat Type */}
                <th
                  onClick={() => handleSort('threatType')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-[#173F4F] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Threat Type</span>
                    {renderSortIcon('threatType')}
                  </div>
                </th>

                {/* 3. Source IP */}
                <th
                  onClick={() => handleSort('sourceIP')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-[#173F4F] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Source IP</span>
                    {renderSortIcon('sourceIP')}
                  </div>
                </th>

                {/* 4. Destination IP */}
                <th
                  onClick={() => handleSort('destinationIP')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-[#173F4F] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Destination IP</span>
                    {renderSortIcon('destinationIP')}
                  </div>
                </th>

                {/* 5. Severity */}
                <th
                  onClick={() => handleSort('severity')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-[#173F4F] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Severity</span>
                    {renderSortIcon('severity')}
                  </div>
                </th>

                {/* 6. Risk Score */}
                <th
                  onClick={() => handleSort('riskScore')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-[#173F4F] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Score</span>
                    {renderSortIcon('riskScore')}
                  </div>
                </th>

                {/* 7. Status */}
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-[#173F4F] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                {/* Action Column */}
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#DCE3E3] font-sans">
              {paginatedThreats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#718096] font-mono">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#EEF3F5] border border-[#CBD5E1] flex items-center justify-center mx-auto text-[#173F4F]">
                        <Filter className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-[#263238]">
                        No archive records matched your criteria
                      </div>
                      <p className="text-xs text-[#718096]">
                        Try modifying your search term, expanding the date range window, or clearing specific filters.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-3.5 py-1.5 rounded-lg bg-[#EEF3F5] text-[#173F4F] hover:bg-[#DCE3E3] border border-[#CBD5E1] text-xs font-mono font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear All Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedThreats.map((threat) => {
                  const isUnidirectional = threat.direction === 'Unidirectional';

                  return (
                    <tr
                      key={threat.id}
                      id={`archive-row-${threat.id}`}
                      onClick={() => handleRowClick(threat)}
                      className="group cursor-pointer transition-all duration-150 hover:bg-[#F8FAF9] border-l-4 border-l-transparent hover:border-l-[#173F4F]"
                      title="Click to open forensic investigation for this incident"
                    >
                      {/* 1. Detected Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-[#263238]">
                        <div className="flex items-center gap-1.5 text-[#263238] font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#718096]" />
                          <span>
                            {new Date(threat.detectedAt).toLocaleDateString([], {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#718096] flex items-center gap-1 mt-0.5">
                          <span>
                            {new Date(threat.detectedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                          <span className="text-[#173F4F] font-semibold">({formatRelativeTime(threat.detectedAt)})</span>
                        </div>
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
                          <span className="text-[10px] font-mono text-[#718096] uppercase">
                            • {threat.protocol}
                          </span>
                          {isUnidirectional && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1]">
                              Diode 1-Way
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Source IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="text-[#263238] font-medium flex items-center gap-1">
                          <Server className="w-3 h-3 text-[#173F4F]" />
                          <span>{threat.sourceIP}</span>
                        </div>
                        <div className="text-[11px] text-[#718096]">
                          Port {threat.sourcePort}
                        </div>
                      </td>

                      {/* 4. Destination IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="text-[#263238] font-medium">{threat.destinationIP}</div>
                        <div className="text-[11px] text-[#718096]">
                          Port {threat.destinationPort}
                        </div>
                      </td>

                      {/* 5. Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderSeverityBadge(threat.severity)}
                      </td>

                      {/* 6. Risk Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-[#E2E8F0] rounded-full h-2 overflow-hidden border border-[#CBD5E1]">
                            <div
                              className={`h-full rounded-full ${getRiskScoreBg(threat.riskScore)}`}
                              style={{ width: `${threat.riskScore}%` }}
                            ></div>
                          </div>
                          <span
                            className={`font-mono font-bold text-xs ${getRiskScoreColor(
                              threat.riskScore
                            )}`}
                          >
                            {threat.riskScore}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#718096] block mt-0.5">
                          {threat.aiConfidence}% conf
                        </span>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(threat.status)}
                      </td>

                      {/* 8. Action Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(threat);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#EEF3F5] group-hover:bg-[#173F4F] group-hover:text-white text-[#173F4F] border border-[#CBD5E1] text-xs font-mono font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="Open detailed forensic investigation"
                        >
                          <span>Investigate</span>
                          <ExternalLink className="w-3 h-3 text-[#173F4F] group-hover:text-white" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination & Counter Footer */}
        <div className="p-4 border-t border-[#DCE3E3] bg-[#F8FAF9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          {/* Row Count Info */}
          <div className="text-[#718096]">
            {sortedThreats.length > 0 ? (
              <span>
                Showing <strong className="text-[#263238]">{startIndex + 1}</strong> to{' '}
                <strong className="text-[#263238]">{endIndex}</strong> of{' '}
                <strong className="text-[#173F4F]">{sortedThreats.length}</strong> records
                {hasActiveFilters && (
                  <span className="text-[#718096] ml-1.5">(filtered from {threats.length} total)</span>
                )}
              </span>
            ) : (
              <span>0 records to display</span>
            )}
          </div>

          {/* Pagination Navigation Controls */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 self-center sm:self-auto">
            {/* First Page */}
            <button
              type="button"
              id="btn-page-first"
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                validCurrentPage === 1
                  ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                  : 'border-[#DCE3E3] hover:bg-[#EEF3F5] text-[#263238] cursor-pointer'
              }`}
              title="First Page"
              aria-label="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              id="btn-page-prev"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                validCurrentPage === 1
                  ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                  : 'border-[#DCE3E3] hover:bg-[#EEF3F5] text-[#263238] cursor-pointer'
              }`}
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers Indicator */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show current page, edges, and adjacent pages
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - validCurrentPage) <= 1
                  );
                })
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && page - prev > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="px-1 text-[#718096]">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[44px] min-h-[44px] rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                          page === validCurrentPage
                            ? 'bg-[#173F4F] text-white shadow-xs'
                            : 'bg-white hover:bg-[#EEF3F5] text-[#263238] border border-[#DCE3E3]'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              id="btn-page-next"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                validCurrentPage === totalPages
                  ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                  : 'border-[#DCE3E3] hover:bg-[#EEF3F5] text-[#263238] cursor-pointer'
              }`}
              title="Next Page"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              id="btn-page-last"
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                validCurrentPage === totalPages
                  ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                  : 'border-[#DCE3E3] hover:bg-[#EEF3F5] text-[#263238] cursor-pointer'
              }`}
              title="Last Page"
              aria-label="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatHistoryView;
