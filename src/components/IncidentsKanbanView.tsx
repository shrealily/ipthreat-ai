import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  SearchCheck,
  Radio,
  Clock,
  ArrowRight,
  ArrowLeft,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  Activity,
  Zap,
  RotateCcw,
  PlusCircle,
  SlidersHorizontal,
  Info,
  Server,
  ExternalLink,
  Shield,
  Eye,
  Flame,
} from 'lucide-react';
import { Threat, ThreatSeverity, ThreatStatus } from '../types';
import { generateSingleLiveThreat } from '../data/mockThreats';

interface IncidentsKanbanViewProps {
  threats: Threat[];
  onUpdateStatus: (threatId: string, newStatus: ThreatStatus) => void;
  onSelectThreat?: (threat: Threat) => void;
  onNavigateToInvestigation?: (threatId: string) => void;
  onAddThreat?: (threat: Threat) => void;
}

interface ColumnConfig {
  id: ThreatStatus;
  title: string;
  description: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  columnBorder: string;
  dropBorder: string;
  dropBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'detected',
    title: 'Detected',
    description: 'Newly flagged by diode optical filter & DPI',
    accentColor: 'text-[#173F4F]',
    badgeBg: 'bg-[#EEF3F5]',
    badgeText: 'text-[#173F4F]',
    badgeBorder: 'border-[#CBD5E1]',
    columnBorder: 'border-[#DCE3E3]',
    dropBorder: 'border-[#173F4F]',
    dropBg: 'bg-[#EEF3F5]',
    icon: Radio,
  },
  {
    id: 'investigating',
    title: 'Investigating',
    description: 'Assigned to SOC analyst / PCAP inspection',
    accentColor: 'text-[#2B6CB0]',
    badgeBg: 'bg-[#EBF8FF]',
    badgeText: 'text-[#2B6CB0]',
    badgeBorder: 'border-[#BEE3F8]',
    columnBorder: 'border-[#DCE3E3]',
    dropBorder: 'border-[#2B6CB0]',
    dropBg: 'bg-[#EBF8FF]',
    icon: SearchCheck,
  },
  {
    id: 'confirmed',
    title: 'Confirmed',
    description: 'Verified malicious diode breach or exfiltration',
    accentColor: 'text-[#B94A48]',
    badgeBg: 'bg-[#FDF2F2]',
    badgeText: 'text-[#B94A48]',
    badgeBorder: 'border-[#F8D7DA]',
    columnBorder: 'border-[#DCE3E3]',
    dropBorder: 'border-[#B94A48]',
    dropBg: 'bg-[#FDF2F2]',
    icon: ShieldAlert,
  },
  {
    id: 'contained',
    title: 'Contained',
    description: 'Optical laser gate severed or source IP isolated',
    accentColor: 'text-[#C87545]',
    badgeBg: 'bg-[#FFF8F0]',
    badgeText: 'text-[#C87545]',
    badgeBorder: 'border-[#FEEBC8]',
    columnBorder: 'border-[#DCE3E3]',
    dropBorder: 'border-[#C87545]',
    dropBg: 'bg-[#FFF8F0]',
    icon: Lock,
  },
  {
    id: 'resolved',
    title: 'Resolved',
    description: 'Attack mitigated, post-mortem logged & verified',
    accentColor: 'text-[#5C8D6B]',
    badgeBg: 'bg-[#F0FDF4]',
    badgeText: 'text-[#5C8D6B]',
    badgeBorder: 'border-[#DCFCE7]',
    columnBorder: 'border-[#DCE3E3]',
    dropBorder: 'border-[#5C8D6B]',
    dropBg: 'bg-[#F0FDF4]',
    icon: CheckCircle2,
  },
];

const STATUS_ORDER: ThreatStatus[] = [
  'detected',
  'investigating',
  'confirmed',
  'contained',
  'resolved',
];

export const IncidentsKanbanView: React.FC<IncidentsKanbanViewProps> = ({
  threats,
  onUpdateStatus,
  onSelectThreat,
  onNavigateToInvestigation,
  onAddThreat,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [draggedThreatId, setDraggedThreatId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ThreatStatus | null>(null);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<ThreatStatus | 'all'>('all');

  // Relative time helper
  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

      if (diffSec < 20) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      const days = Math.floor(diffSec / 86400);
      return `${days}d ago`;
    } catch {
      return 'Recent';
    }
  };

  // Filtered threats based on search & severity
  const filteredThreats = useMemo(() => {
    return threats.filter((threat) => {
      // Severity filter
      if (severityFilter !== 'all' && threat.severity !== severityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchId = threat.id.toLowerCase().includes(query);
        const matchType = threat.threatType.toLowerCase().includes(query);
        const matchSrc = threat.sourceIP.toLowerCase().includes(query);
        const matchDst = threat.destinationIP.toLowerCase().includes(query);
        const matchProto = threat.protocol.toLowerCase().includes(query);
        if (!matchId && !matchType && !matchSrc && !matchDst && !matchProto) {
          return false;
        }
      }
      return true;
    });
  }, [threats, severityFilter, searchQuery]);

  // Group threats by status column
  const groupedThreats = useMemo(() => {
    const groups: Record<ThreatStatus, Threat[]> = {
      detected: [],
      investigating: [],
      confirmed: [],
      contained: [],
      resolved: [],
    };

    filteredThreats.forEach((t) => {
      if (groups[t.status]) {
        groups[t.status].push(t);
      } else {
        groups.detected.push(t);
      }
    });

    return groups;
  }, [filteredThreats]);

  // Severity counts for badges
  const severityCounts = useMemo(() => {
    return {
      all: threats.length,
      critical: threats.filter((t) => t.severity === 'critical').length,
      high: threats.filter((t) => t.severity === 'high').length,
      medium: threats.filter((t) => t.severity === 'medium').length,
      low: threats.filter((t) => t.severity === 'low').length,
    };
  }, [threats]);

  // Overall workflow counts
  const totalActive = useMemo(
    () => threats.filter((t) => t.status !== 'resolved').length,
    [threats]
  );
  const totalCritical = useMemo(
    () => threats.filter((t) => t.severity === 'critical' && t.status !== 'resolved').length,
    [threats]
  );
  const totalResolved = useMemo(
    () => threats.filter((t) => t.status === 'resolved').length,
    [threats]
  );

  // Status transition handlers (move forward / backward)
  const handleMoveStatus = (threat: Threat, direction: 'forward' | 'backward') => {
    const currentIndex = STATUS_ORDER.indexOf(threat.status);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < STATUS_ORDER.length) {
      const newStatus = STATUS_ORDER[nextIndex];
      onUpdateStatus(threat.id, newStatus);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, threatId: string) => {
    e.dataTransfer.setData('text/plain', threatId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedThreatId(threatId);
  };

  const handleDragEnd = () => {
    setDraggedThreatId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: ThreatStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: ThreatStatus) => {
    // Only reset if leaving the column element itself
    const related = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!currentTarget.contains(related)) {
      if (dragOverColumn === status) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ThreatStatus) => {
    e.preventDefault();
    const threatId = e.dataTransfer.getData('text/plain') || draggedThreatId;
    if (threatId) {
      onUpdateStatus(threatId, targetStatus);
    }
    setDraggedThreatId(null);
    setDragOverColumn(null);
  };

  // Quick Inject Mock Threat
  const handleInjectSimulatedIncident = () => {
    const newThreat = generateSingleLiveThreat();
    if (onAddThreat) {
      onAddThreat(newThreat);
    } else {
      // Fallback update status if onAddThreat not provided directly
      onUpdateStatus(newThreat.id, 'detected');
    }
  };

  // Severity styling helper matching theme
  const getSeverityBadge = (sev: ThreatSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FDF2F2] text-[#B94A48] border border-[#F8D7DA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B94A48]"></span>
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FFF8F0] text-[#C87545] border border-[#FEEBC8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C87545]"></span>
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-[#FEFCE8] text-[#C39A45] border border-[#FEF08A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C39A45]"></span>
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-[#EEF3F5] text-[#173F4F] border border-[#DCE3E3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#173F4F]"></span>
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none text-[#263238]" id="incidents-kanban-view">
      {/* 1. Header & Overview Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DCE3E3]">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EEF3F5] border border-[#DCE3E3] text-[#173F4F]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#263238] font-display flex items-center gap-2.5">
                <span>Incidents Kanban Board</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1] font-normal">
                  {totalActive} Active Triage
                </span>
              </h1>
              <p className="text-xs md:text-sm text-[#718096] mt-0.5">
                Manage incident containment lifecycles across five stages. Drag cards between columns or use the arrow controls to advance workflow.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onAddThreat && (
            <button
              type="button"
              id="btn-inject-kanban-incident"
              onClick={handleInjectSimulatedIncident}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#173F4F] hover:bg-[#234E5E] text-white border border-[#173F4F] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-95"
              title="Spawn a new simulated incident into Detected stage"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Simulate Incident</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#DCE3E3] text-xs font-mono text-[#718096] flex items-center gap-2 shadow-xs">
            <Info className="w-3.5 h-3.5 text-[#173F4F] shrink-0" />
            <span className="hidden sm:inline">Drag & drop cards or click ◀ ▶ to transition</span>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-[#DCE3E3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#718096] uppercase block font-semibold">Total Tracked</span>
            <span className="text-xl font-bold text-[#263238]">{threats.length}</span>
          </div>
          <Activity className="w-5 h-5 text-[#173F4F]/60" />
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#F8D7DA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#B94A48] uppercase block flex items-center gap-1 font-semibold">
              <Flame className="w-3 h-3 text-[#B94A48]" />
              Active Critical
            </span>
            <span className="text-xl font-bold text-[#B94A48]">{totalCritical}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FDF2F2] text-[#B94A48] border border-[#F8D7DA] font-semibold">
            Needs Action
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#FEEBC8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#C87545] uppercase block flex items-center gap-1 font-semibold">
              <Lock className="w-3 h-3 text-[#C87545]" />
              Contained
            </span>
            <span className="text-xl font-bold text-[#C87545]">
              {threats.filter((t) => t.status === 'contained').length}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F0] text-[#C87545] border border-[#FEEBC8] font-semibold">
            Gate Severed
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#DCFCE7] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#5C8D6B] uppercase block flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#5C8D6B]" />
              Resolved
            </span>
            <span className="text-xl font-bold text-[#5C8D6B]">{totalResolved}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0FDF4] text-[#5C8D6B] border border-[#DCFCE7] font-semibold">
            Closed
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DCE3E3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="kanban-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, threat type, source or dest IP..."
            className="w-full bg-[#F8FAF9] text-[#263238] text-xs rounded-lg pl-9 pr-8 py-2 border border-[#DCE3E3] focus:outline-none focus:border-[#173F4F] focus:ring-1 focus:ring-[#173F4F]/30 font-mono placeholder:text-[#718096]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#263238] text-xs font-mono px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Severity Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-[#718096] uppercase tracking-wider mr-1 flex items-center gap-1 font-semibold">
            <Filter className="w-3 h-3 text-[#173F4F]" />
            Severity:
          </span>

          <button
            type="button"
            onClick={() => setSeverityFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              severityFilter === 'all'
                ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                : 'bg-[#F4F6F6] hover:bg-[#EEF3F5] text-[#263238] border border-[#DCE3E3]'
            }`}
          >
            All ({severityCounts.all})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('critical')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              severityFilter === 'critical'
                ? 'bg-[#B94A48] text-white font-bold shadow-xs'
                : 'bg-[#FDF2F2] hover:bg-[#FEE2E2] text-[#B94A48] border border-[#F8D7DA]'
            }`}
          >
            Critical ({severityCounts.critical})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('high')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              severityFilter === 'high'
                ? 'bg-[#C87545] text-white font-bold shadow-xs'
                : 'bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C87545] border border-[#FEEBC8]'
            }`}
          >
            High ({severityCounts.high})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('medium')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              severityFilter === 'medium'
                ? 'bg-[#C39A45] text-white font-bold shadow-xs'
                : 'bg-[#FEFCE8] hover:bg-[#FEF9C3] text-[#C39A45] border border-[#FEF08A]'
            }`}
          >
            Medium ({severityCounts.medium})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('low')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              severityFilter === 'low'
                ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                : 'bg-[#EEF3F5] hover:bg-[#E2E8F0] text-[#173F4F] border border-[#DCE3E3]'
            }`}
          >
            Low ({severityCounts.low})
          </button>

          {(severityFilter !== 'all' || searchQuery.trim() !== '') && (
            <button
              type="button"
              onClick={() => {
                setSeverityFilter('all');
                setSearchQuery('');
              }}
              className="ml-2 px-2 py-1 rounded-lg text-xs font-mono text-[#718096] hover:text-[#263238] hover:bg-[#EEF3F5] transition-colors flex items-center gap-1 cursor-pointer border border-[#DCE3E3]"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Stage Selector (Visible on mobile < md) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 -mt-2">
        <span className="text-[11px] font-mono text-[#718096] uppercase font-semibold shrink-0">Stage:</span>
        <button
          type="button"
          onClick={() => setMobileActiveColumn('all')}
          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-colors ${
            mobileActiveColumn === 'all'
              ? 'bg-[#173F4F] text-white shadow-xs'
              : 'bg-white text-[#263238] border border-[#DCE3E3]'
          }`}
        >
          All Stages ({threats.length})
        </button>
        {KANBAN_COLUMNS.map((col) => (
          <button
            key={col.id}
            type="button"
            onClick={() => setMobileActiveColumn(col.id)}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-colors ${
              mobileActiveColumn === col.id
                ? 'bg-[#173F4F] text-white shadow-xs'
                : 'bg-white text-[#263238] border border-[#DCE3E3]'
            }`}
          >
            {col.title} ({(groupedThreats[col.id] || []).length})
          </button>
        ))}
      </div>

      {/* 4. Kanban 5-Column Grid */}
      <div id="incidents-kanban-board" className="overflow-x-auto pb-4">
        <div className={`flex gap-4 items-start ${mobileActiveColumn === 'all' ? 'min-w-[1300px]' : 'min-w-full md:min-w-[1300px]'}`}>
          {KANBAN_COLUMNS.filter((col) => mobileActiveColumn === 'all' || col.id === mobileActiveColumn).map((column) => {
            const columnThreats = groupedThreats[column.id] || [];
            const isDragTarget = dragOverColumn === column.id;
            const ColumnIcon = column.icon;

            return (
              <div
                key={column.id}
                id={`kanban-col-${column.id}`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={(e) => handleDragLeave(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex-1 ${mobileActiveColumn !== 'all' ? 'w-full md:min-w-[250px] md:max-w-[320px]' : 'min-w-[250px] max-w-[320px]'} rounded-xl bg-[#F8FAF9] border transition-all duration-200 flex flex-col max-h-[calc(100vh-250px)] ${
                  isDragTarget
                    ? `${column.dropBorder} ${column.dropBg} ring-2 ring-[#173F4F]/30 shadow-md`
                    : `${column.columnBorder} shadow-xs`
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#DCE3E3] bg-white rounded-t-xl space-y-1 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${column.badgeBg} ${column.accentColor}`}>
                        <ColumnIcon className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-bold text-[#263238] font-display">
                        {column.title}
                      </h2>
                    </div>

                    {/* Count Badge on Column Header */}
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${column.badgeBg} ${column.badgeText} ${column.badgeBorder}`}
                    >
                      {columnThreats.length}
                    </span>
                  </div>

                  {/* Subtitle description */}
                  <p className="text-[11px] text-[#718096] font-sans leading-tight">
                    {column.description}
                  </p>
                </div>

                {/* Column Body: Scrollable Cards List */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[360px]">
                  {columnThreats.length === 0 ? (
                    <div
                      className={`h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                        isDragTarget
                          ? 'border-[#173F4F] bg-[#EEF3F5] text-[#173F4F]'
                          : 'border-[#DCE3E3] text-[#718096]'
                      }`}
                    >
                      <ColumnIcon className="w-7 h-7 mb-2 opacity-50" />
                      <span className="text-xs font-mono font-semibold">
                        {isDragTarget ? 'Drop incident here' : 'No incidents in this stage'}
                      </span>
                      <span className="text-[10px] text-[#718096] mt-1 max-w-[180px]">
                        Drag an incident card or click arrow controls to move here.
                      </span>
                    </div>
                  ) : (
                    columnThreats.map((threat) => {
                      const isBeingDragged = draggedThreatId === threat.id;
                      const currentColIndex = STATUS_ORDER.indexOf(threat.status);
                      const canMoveBack = currentColIndex > 0;
                      const canMoveForward = currentColIndex < STATUS_ORDER.length - 1;
                      const prevColName = canMoveBack ? KANBAN_COLUMNS[currentColIndex - 1].title : '';
                      const nextColName = canMoveForward ? KANBAN_COLUMNS[currentColIndex + 1].title : '';

                      return (
                        <div
                          key={threat.id}
                          id={`kanban-card-${threat.id}`}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, threat.id)}
                          onDragEnd={handleDragEnd}
                          className={`p-3.5 rounded-xl bg-white border transition-all duration-150 relative group cursor-grab active:cursor-grabbing hover:border-[#173F4F] hover:shadow-md ${
                            isBeingDragged
                              ? 'opacity-40 border-[#173F4F] scale-95 shadow-md'
                              : threat.severity === 'critical'
                              ? 'border-[#F8D7DA]'
                              : 'border-[#DCE3E3]'
                          }`}
                        >
                          {/* Card Top: ID + Severity + Drag Grip */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="text-[#A0AEC0] group-hover:text-[#718096] transition-colors"
                                title="Drag card to another column"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <span
                                onClick={() => onSelectThreat && onSelectThreat(threat)}
                                className="font-mono text-xs font-bold text-[#173F4F] hover:underline cursor-pointer"
                                title="Click to view threat details"
                              >
                                {threat.id}
                              </span>
                            </div>

                            {/* Severity Badge */}
                            <div>{getSeverityBadge(threat.severity)}</div>
                          </div>

                          {/* Threat Type */}
                          <h3
                            onClick={() => onSelectThreat && onSelectThreat(threat)}
                            className="text-xs font-bold text-[#263238] font-display line-clamp-1 hover:text-[#173F4F] transition-colors cursor-pointer"
                            title={threat.threatType}
                          >
                            {threat.threatType}
                          </h3>

                          {/* Source IP & Protocol */}
                          <div className="mt-2 p-2 rounded-lg bg-[#F8FAF9] border border-[#E2E8F0] space-y-1 font-mono text-[11px]">
                            <div className="flex items-center justify-between text-[#263238]">
                              <span className="flex items-center gap-1 text-[#718096] text-[10px]">
                                <Server className="w-3 h-3 text-[#173F4F]" />
                                SRC:
                              </span>
                              <span className="font-bold text-[#263238]">
                                {threat.sourceIP}
                                {threat.sourcePort ? `:${threat.sourcePort}` : ''}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[#718096] text-[10px]">
                              <span>DST:</span>
                              <span className="text-[#718096]">
                                {threat.destinationIP}
                                {threat.destinationPort ? `:${threat.destinationPort}` : ''}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] text-[10px]">
                              <span className="text-[#173F4F] font-bold">{threat.protocol}</span>
                              <span className="text-[#718096]">{threat.trafficVolumeMB} MB</span>
                            </div>
                          </div>

                          {/* Time Since Detection & Risk Score */}
                          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-[#718096]">
                            <span
                              className="flex items-center gap-1 text-[#718096]"
                              title={`Detected: ${new Date(threat.detectedAt).toLocaleString()}`}
                            >
                              <Clock className="w-3 h-3 text-[#718096]" />
                              <span>{formatTimeAgo(threat.detectedAt)}</span>
                            </span>

                            <span
                              className={`font-bold ${
                                threat.riskScore > 85
                                  ? 'text-[#B94A48]'
                                  : threat.riskScore > 65
                                  ? 'text-[#C87545]'
                                  : 'text-[#C39A45]'
                              }`}
                            >
                              Risk: {threat.riskScore}/100
                            </span>
                          </div>

                          {/* Card Footer: Navigation & Move Forward / Back Controls */}
                          <div className="mt-3 pt-2.5 border-t border-[#DCE3E3] flex items-center justify-between gap-1">
                            {/* Move Backward Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStatus(threat, 'backward');
                              }}
                              disabled={!canMoveBack}
                              className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-1 ${
                                canMoveBack
                                  ? 'bg-[#F4F6F6] hover:bg-[#E2E8F0] text-[#263238] border border-[#DCE3E3] cursor-pointer active:scale-95'
                                  : 'opacity-30 text-[#A0AEC0] cursor-not-allowed border border-transparent'
                              }`}
                              title={canMoveBack ? `Move back to ${prevColName}` : 'Already at first stage'}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span className="text-[10px] hidden sm:inline">Back</span>
                            </button>

                            {/* Quick Investigation Button */}
                            {onNavigateToInvestigation && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToInvestigation(threat.id);
                                }}
                                className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-[#EEF3F5] hover:bg-[#E2E8F0] text-[#173F4F] border border-[#CBD5E1] text-[10px] font-mono font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                                title="Open PCAP dissection and AI forensic investigation"
                              >
                                <span>Investigate</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}

                            {/* Move Forward Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStatus(threat, 'forward');
                              }}
                              disabled={!canMoveForward}
                              className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-1 ${
                                canMoveForward
                                  ? 'bg-[#173F4F] hover:bg-[#234E5E] text-white border border-[#173F4F] cursor-pointer active:scale-95 shadow-xs'
                                  : 'opacity-30 text-[#A0AEC0] cursor-not-allowed border border-transparent'
                              }`}
                              title={canMoveForward ? `Move forward to ${nextColName}` : 'Already resolved'}
                            >
                              <span className="text-[10px] hidden sm:inline">Next</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IncidentsKanbanView;
