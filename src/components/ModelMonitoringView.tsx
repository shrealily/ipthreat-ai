import React, { useState, useMemo, useRef } from 'react';
import {
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RotateCw,
  Info,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Sliders,
  Sparkles,
  BarChart3,
  Scale,
  SearchCheck,
  TrendingUp,
} from 'lucide-react';
import {
  CURRENT_MODEL_KPIS,
  CURRENT_PREDICTION_STATS,
  CURRENT_MODEL_METADATA,
  MOCK_TREND_POINTS,
  MetricTrendPoint,
} from '../data/mockModelData';

type MetricKey = 'accuracy' | 'precision' | 'recall' | 'f1Score' | 'falsePositiveRate';
type TimeframeDays = 14 | 30;

interface MetricConfig {
  key: MetricKey;
  label: string;
  shortLabel: string;
  color: string;
  strokeColor: string;
  fillGradientId: string;
  description: string;
  targetRange: string;
}

const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  accuracy: {
    key: 'accuracy',
    label: 'Accuracy',
    shortLabel: 'ACC',
    color: 'var(--primary-teal)',
    strokeColor: 'var(--primary-teal)',
    fillGradientId: 'grad-accuracy',
    description: 'Proportion of all diode packet classifications that were correct (threat vs benign)',
    targetRange: '90 - 97%',
  },
  precision: {
    key: 'precision',
    label: 'Precision',
    shortLabel: 'PREC',
    color: '#2B6CB0',
    strokeColor: '#2B6CB0',
    fillGradientId: 'grad-precision',
    description: 'When the model predicts a packet anomaly, probability that it is a real intrusion',
    targetRange: '90 - 97%',
  },
  recall: {
    key: 'recall',
    label: 'Recall (Sensitivity)',
    shortLabel: 'REC',
    color: 'var(--sev-low)',
    strokeColor: 'var(--sev-low)',
    fillGradientId: 'grad-recall',
    description: 'Ratio of true cyber threats intercepted vs missed through the physical diode',
    targetRange: '90 - 97%',
  },
  f1Score: {
    key: 'f1Score',
    label: 'F1 Score',
    shortLabel: 'F1',
    color: '#4A5568',
    strokeColor: '#4A5568',
    fillGradientId: 'grad-f1',
    description: 'Harmonic mean balancing precision and recall under class-imbalanced OT telemetry',
    targetRange: '90 - 97%',
  },
  falsePositiveRate: {
    key: 'falsePositiveRate',
    label: 'False Positive Rate',
    shortLabel: 'FPR',
    color: 'var(--sev-high)',
    strokeColor: 'var(--sev-high)',
    fillGradientId: 'grad-fpr',
    description: 'Benign SCADA & PLC telemetry frames erroneously flagged as security anomalies',
    targetRange: '2 - 6%',
  },
};

export const ModelMonitoringView: React.FC = () => {
  // Timeframe state: 14 days or 30 days
  const [timeframe, setTimeframe] = useState<TimeframeDays>(30);

  // Selected or active highlighted metric filter (or 'all')
  const [activeMetric, setActiveMetric] = useState<MetricKey | 'all'>('all');

  // Chart hover scrubber state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Simulated Retraining & Evaluation state
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [lastRefreshedDate, setLastRefreshedDate] = useState<string>('Just now');
  const [showRetrainToast, setShowRetrainToast] = useState<boolean>(false);

  // Filtered trend points according to timeframe
  const trendPoints = useMemo(() => {
    if (timeframe === 14) {
      return MOCK_TREND_POINTS.slice(MOCK_TREND_POINTS.length - 14);
    }
    return MOCK_TREND_POINTS;
  }, [timeframe]);

  // Current hovered data point or latest point
  const activePoint: MetricTrendPoint = useMemo(() => {
    if (hoveredIndex !== null && trendPoints[hoveredIndex]) {
      return trendPoints[hoveredIndex];
    }
    return trendPoints[trendPoints.length - 1];
  }, [hoveredIndex, trendPoints]);

  // Handle simulated model re-evaluation
  const handleTriggerEvaluation = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      setLastRefreshedDate('Just now (Epoch #418 verified)');
      setShowRetrainToast(true);
      setTimeout(() => setShowRetrainToast(false), 4500);
    }, 1200);
  };

  // SVG Chart Geometry Constants
  const svgWidth = 840;
  const svgHeight = 280;
  const padding = { top: 25, right: 55, bottom: 40, left: 55 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Scales for primary metrics (90% to 100%)
  const primaryYMin = 90;
  const primaryYMax = 100;

  // Scales for FPR (0% to 8%)
  const fprYMin = 0;
  const fprYMax = 8;

  const getPrimaryY = (val: number) => {
    const clamped = Math.max(primaryYMin, Math.min(primaryYMax, val));
    const ratio = (clamped - primaryYMin) / (primaryYMax - primaryYMin);
    return padding.top + chartHeight - ratio * chartHeight;
  };

  const getFprY = (val: number) => {
    const clamped = Math.max(fprYMin, Math.min(fprYMax, val));
    const ratio = (clamped - fprYMin) / (fprYMax - fprYMin);
    return padding.top + chartHeight - ratio * chartHeight;
  };

  const getX = (index: number) => {
    if (trendPoints.length <= 1) return padding.left;
    return padding.left + (index / (trendPoints.length - 1)) * chartWidth;
  };

  // Generate SVG path for smooth curves
  const generateCurvePath = (metricKey: MetricKey) => {
    if (trendPoints.length === 0) return '';
    const points = trendPoints.map((pt, idx) => {
      const x = getX(idx);
      const y = metricKey === 'falsePositiveRate' ? getFprY(pt[metricKey]) : getPrimaryY(pt[metricKey]);
      return { x, y };
    });

    if (points.length < 2) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  // Generate gradient area path under the curve
  const generateAreaPath = (metricKey: MetricKey) => {
    const linePath = generateCurvePath(metricKey);
    if (!linePath) return '';
    const firstX = getX(0);
    const lastX = getX(trendPoints.length - 1);
    const bottomY = padding.top + chartHeight;
    return `${linePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  };

  // Mouse move over SVG chart to track hover index
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * svgWidth;

    if (relativeX < padding.left || relativeX > svgWidth - padding.right) {
      setHoveredIndex(null);
      return;
    }

    const ratio = (relativeX - padding.left) / chartWidth;
    const closestIdx = Math.round(ratio * (trendPoints.length - 1));
    const clampedIdx = Math.max(0, Math.min(trendPoints.length - 1, closestIdx));
    setHoveredIndex(clampedIdx);
  };

  const handleSvgMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div id="model-monitoring-view" className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Top Header & Model Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DCE3E3]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="p-1.5 rounded-xl bg-[#EEF3F5] border border-[#CBD5E1] text-[#173F4F]">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#EEF3F5] text-[#173F4F] border border-[#CBD5E1]">
              INFERENCE ENGINE MONITORING
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-[#F0FDF4] text-[#5C8D6B] border border-[#DCFCE7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5C8D6B] animate-pulse"></span>
              Model Status: Operational
            </span>
            <span className="text-[11px] font-mono text-[#718096]">
              {CURRENT_MODEL_METADATA.version}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#263238] font-display flex items-center gap-3">
            <span>Model Performance & Observability</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-3xl">
            Continuous evaluation metrics, calibration trends, and prediction statistics for the deep packet inspection neural network running on optical data diode enclaves.
          </p>
        </div>

        {/* Model Retrain & Benchmark Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono uppercase text-[#718096]">Evaluation Benchmark</div>
            <div className="text-xs font-mono font-semibold text-[#263238]">
              Golden-OT-Suite (25k frames)
            </div>
          </div>

          <button
            type="button"
            id="btn-trigger-model-eval"
            onClick={handleTriggerEvaluation}
            disabled={isRetraining}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border shadow-xs ${
              isRetraining
                ? 'bg-[#EEF3F5] text-[#718096] border-[#CBD5E1] cursor-not-allowed'
                : 'bg-[#173F4F] hover:bg-[#234E5E] text-white border-[#173F4F] active:scale-95'
            }`}
            title="Run validation benchmark against the 25,000 ground-truth evaluation set"
          >
            <RotateCw className={`w-3.5 h-3.5 text-white ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Evaluating Benchmark...' : 'Run Benchmark Eval'}</span>
          </button>
        </div>
      </div>

      {/* Retrain Alert Notification */}
      {showRetrainToast && (
        <div className="p-3 rounded-xl bg-[#E6F4F1] border border-[#173F4F]/30 text-[#173F4F] text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#173F4F] shrink-0" />
            <span>
              Evaluation benchmark re-calculated successfully across 25,000 ground-truth frames. All metrics within optimal bounds.
            </span>
          </div>
          <span className="text-[10px] text-[#173F4F] font-bold uppercase shrink-0">Model Verified</span>
        </div>
      )}

      {/* 2. KPI Cards Row (Accuracy, Precision, Recall, F1 Score, False Positive Rate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Accuracy */}
        <div
          id="kpi-card-accuracy"
          onClick={() => setActiveMetric(activeMetric === 'accuracy' ? 'all' : 'accuracy')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer group relative overflow-hidden shadow-xs ${
            activeMetric === 'accuracy'
              ? 'border-[#173F4F] shadow-md ring-2 ring-[#173F4F]/20'
              : 'border-[#DCE3E3] hover:border-[#173F4F]/40 hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider">
              Accuracy
            </span>
            <div className="p-1.5 rounded-lg bg-[#EEF3F5] border border-[#CBD5E1] text-[#173F4F]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#173F4F]">
              {CURRENT_MODEL_KPIS.accuracy}%
            </span>
            <span className="text-[11px] font-mono text-[#5C8D6B] flex items-center font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +1.8%
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#718096] pt-2.5 border-t border-[#DCE3E3] font-mono">
            <span>Target: 90-97%</span>
            <span className="text-[#173F4F] font-semibold">Optimal</span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#173F4F] h-full rounded-full transition-all duration-500"
              style={{ width: `${CURRENT_MODEL_KPIS.accuracy}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Precision */}
        <div
          id="kpi-card-precision"
          onClick={() => setActiveMetric(activeMetric === 'precision' ? 'all' : 'precision')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer group relative overflow-hidden shadow-xs ${
            activeMetric === 'precision'
              ? 'border-[#173F4F] shadow-md ring-2 ring-[#173F4F]/20'
              : 'border-[#DCE3E3] hover:border-[#173F4F]/40 hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider">
              Precision
            </span>
            <div className="p-1.5 rounded-lg bg-[#EEF3F5] border border-[#CBD5E1] text-[#173F4F]">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#173F4F]">
              {CURRENT_MODEL_KPIS.precision}%
            </span>
            <span className="text-[11px] font-mono text-[#5C8D6B] flex items-center font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +2.1%
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#718096] pt-2.5 border-t border-[#DCE3E3] font-mono">
            <span>Target: 90-97%</span>
            <span className="text-[#173F4F] font-semibold">Low Noise</span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#173F4F] h-full rounded-full transition-all duration-500"
              style={{ width: `${CURRENT_MODEL_KPIS.precision}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Recall */}
        <div
          id="kpi-card-recall"
          onClick={() => setActiveMetric(activeMetric === 'recall' ? 'all' : 'recall')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer group relative overflow-hidden shadow-xs ${
            activeMetric === 'recall'
              ? 'border-[#5C8D6B] shadow-md ring-2 ring-[#5C8D6B]/20'
              : 'border-[#DCE3E3] hover:border-[#5C8D6B]/40 hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider">
              Recall (Sens.)
            </span>
            <div className="p-1.5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[#5C8D6B]">
              <SearchCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#5C8D6B]">
              {CURRENT_MODEL_KPIS.recall}%
            </span>
            <span className="text-[11px] font-mono text-[#5C8D6B] flex items-center font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +1.2%
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#718096] pt-2.5 border-t border-[#DCE3E3] font-mono">
            <span>Target: 90-97%</span>
            <span className="text-[#5C8D6B] font-semibold">High Catch</span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#5C8D6B] h-full rounded-full transition-all duration-500"
              style={{ width: `${CURRENT_MODEL_KPIS.recall}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: F1 Score */}
        <div
          id="kpi-card-f1-score"
          onClick={() => setActiveMetric(activeMetric === 'f1Score' ? 'all' : 'f1Score')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer group relative overflow-hidden shadow-xs ${
            activeMetric === 'f1Score'
              ? 'border-[#173F4F] shadow-md ring-2 ring-[#173F4F]/20'
              : 'border-[#DCE3E3] hover:border-[#173F4F]/40 hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider">
              F1 Score
            </span>
            <div className="p-1.5 rounded-lg bg-[#EEF3F5] border border-[#CBD5E1] text-[#173F4F]">
              <Scale className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#173F4F]">
              {CURRENT_MODEL_KPIS.f1Score}%
            </span>
            <span className="text-[11px] font-mono text-[#5C8D6B] flex items-center font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +1.7%
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#718096] pt-2.5 border-t border-[#DCE3E3] font-mono">
            <span>Target: 90-97%</span>
            <span className="text-[#173F4F] font-semibold">Balanced</span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#173F4F] h-full rounded-full transition-all duration-500"
              style={{ width: `${CURRENT_MODEL_KPIS.f1Score}%` }}
            ></div>
          </div>
        </div>

        {/* Card 5: False Positive Rate */}
        <div
          id="kpi-card-fpr"
          onClick={() => setActiveMetric(activeMetric === 'falsePositiveRate' ? 'all' : 'falsePositiveRate')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer group relative overflow-hidden shadow-xs ${
            activeMetric === 'falsePositiveRate'
              ? 'border-[#C39A45] shadow-md ring-2 ring-[#C39A45]/20'
              : 'border-[#DCE3E3] hover:border-[#C39A45]/40 hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-mono uppercase text-[#718096] font-semibold tracking-wider">
              False Pos. Rate
            </span>
            <div className="p-1.5 rounded-lg bg-[#FEEBC8] border border-[#FEEBC8] text-[#C39A45]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#C39A45]">
              {CURRENT_MODEL_KPIS.falsePositiveRate}%
            </span>
            <span className="text-[11px] font-mono text-[#5C8D6B] flex items-center font-semibold">
              <ArrowDownRight className="w-3 h-3" /> -1.7%
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#718096] pt-2.5 border-t border-[#DCE3E3] font-mono">
            <span>Target: 2-6%</span>
            <span className="text-[#C39A45] font-semibold">Strict SLA</span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#C39A45] h-full rounded-full transition-all duration-500"
              style={{ width: `${(CURRENT_MODEL_KPIS.falsePositiveRate / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. Historical Evaluation Trend Chart (Last 14 - 30 Days) */}
      <div className="p-5 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-4">
        {/* Chart Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCE3E3]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#173F4F]" />
              <h2 className="text-base font-semibold text-[#263238]">
                Evaluation Benchmark Metric Trends
              </h2>
            </div>
            <p className="text-xs text-[#718096] mt-0.5">
              Daily evaluation metrics tracked across consecutive model checkpoint iterations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe selector: 14d vs 30d */}
            <div className="flex items-center bg-[#F8FAF9] p-1 rounded-xl border border-[#DCE3E3] text-xs font-mono">
              <span className="text-[10px] text-[#718096] uppercase px-2 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#173F4F]" /> Window:
              </span>
              <button
                type="button"
                onClick={() => setTimeframe(14)}
                className={`min-h-[36px] px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeframe === 14
                    ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframe(30)}
                className={`min-h-[36px] px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeframe === 30
                    ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                30 Days
              </button>
            </div>

            {/* Metric Filter Badges */}
            <div className="flex items-center bg-[#F8FAF9] p-1 rounded-xl border border-[#DCE3E3] text-xs font-mono flex-wrap">
              <button
                type="button"
                onClick={() => setActiveMetric('all')}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                  activeMetric === 'all'
                    ? 'bg-[#173F4F] text-white font-bold shadow-xs'
                    : 'text-[#718096] hover:text-[#263238]'
                }`}
              >
                All Series
              </button>
              {(['accuracy', 'precision', 'recall', 'f1Score', 'falsePositiveRate'] as MetricKey[]).map(
                (key) => {
                  const cfg = METRIC_CONFIGS[key];
                  const isSelected = activeMetric === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveMetric(isSelected ? 'all' : key)}
                      className={`min-h-[36px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] flex items-center gap-1 ${
                        isSelected
                          ? 'bg-white text-[#263238] font-bold border border-[#CBD5E1] shadow-xs'
                          : 'text-[#718096] hover:text-[#263238]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.strokeColor }}
                      ></span>
                      <span>{cfg.shortLabel}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart Container */}
        <div
          ref={svgContainerRef}
          className="relative w-full overflow-hidden select-none bg-[#F8FAF9] rounded-xl border border-[#DCE3E3] p-2"
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-64 sm:h-72 lg:h-80 overflow-visible cursor-crosshair"
            onMouseMove={handleSvgMouseMove}
            onMouseLeave={handleSvgMouseLeave}
          >
            <defs>
              {/* Metric Area Gradients */}
              <linearGradient id="grad-accuracy" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="grad-precision" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="grad-recall" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="grad-f1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="grad-fpr" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines & Y-Axis Labels (Left: 90% to 100%) */}
            {[90, 92, 94, 96, 98, 100].map((val) => {
              const y = getPrimaryY(val);
              return (
                <g key={`grid-${val}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="var(--border-subtle)"
                    strokeDasharray={val === 100 || val === 90 ? undefined : '3 3'}
                    strokeWidth={val === 100 || val === 90 ? '1' : '0.8'}
                  />
                  {/* Left Primary Axis Label */}
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="var(--text-muted)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Right Y-Axis Labels for False Positive Rate (0% to 8%) */}
            {[0, 2, 4, 6, 8].map((val) => {
              const y = getFprY(val);
              return (
                <text
                  key={`fpr-y-${val}`}
                  x={svgWidth - padding.right + 10}
                  y={y + 4}
                  textAnchor="start"
                  fill="var(--sev-med)"
                  fontSize="9"
                  fontFamily="monospace"
                  opacity={0.9}
                >
                  {val}% FPR
                </text>
              );
            })}

            {/* X-Axis Date Ticks */}
            {trendPoints.map((pt, idx) => {
              // Show approximately 6 to 8 date ticks evenly
              const tickStep = timeframe === 14 ? 2 : 4;
              const isTick = idx % tickStep === 0 || idx === trendPoints.length - 1;
              if (!isTick) return null;
              const x = getX(idx);
              const y = padding.top + chartHeight + 18;
              return (
                <text
                  key={`x-axis-${pt.date}-${idx}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {pt.date}
                </text>
              );
            })}

            {/* Area Fills for active or all metrics */}
            {(activeMetric === 'all'
              ? (['falsePositiveRate', 'recall', 'precision', 'accuracy', 'f1Score'] as MetricKey[])
              : [activeMetric]
            ).map((key) => {
              const cfg = METRIC_CONFIGS[key];
              const isHighlighted = activeMetric === 'all' || activeMetric === key;
              return (
                <path
                  key={`area-${key}`}
                  d={generateAreaPath(key)}
                  fill={`url(#${cfg.fillGradientId})`}
                  opacity={isHighlighted ? (activeMetric === 'all' ? 0.35 : 0.8) : 0.05}
                />
              );
            })}

            {/* Line Curves */}
            {(['falsePositiveRate', 'recall', 'precision', 'f1Score', 'accuracy'] as MetricKey[]).map(
              (key) => {
                const cfg = METRIC_CONFIGS[key];
                const isSelected = activeMetric === 'all' || activeMetric === key;
                return (
                  <path
                    key={`line-${key}`}
                    d={generateCurvePath(key)}
                    fill="none"
                    stroke={cfg.strokeColor}
                    strokeWidth={isSelected ? (activeMetric === key ? 3.2 : 2.0) : 0.8}
                    strokeDasharray={key === 'falsePositiveRate' ? '4 2' : undefined}
                    opacity={isSelected ? 1 : 0.15}
                    style={{ transition: 'stroke-width 0.2s, opacity 0.2s' }}
                  />
                );
              }
            )}

            {/* Scrubber Vertical Line & Halos upon hover */}
            {hoveredIndex !== null && (
              <g>
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={padding.top + chartHeight}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />

                {/* Point Halos for each metric */}
                {(['accuracy', 'precision', 'recall', 'f1Score', 'falsePositiveRate'] as MetricKey[]).map(
                  (key) => {
                    const cfg = METRIC_CONFIGS[key];
                    const pt = trendPoints[hoveredIndex];
                    const cx = getX(hoveredIndex);
                    const cy =
                      key === 'falsePositiveRate' ? getFprY(pt[key]) : getPrimaryY(pt[key]);

                    const isHighlighted = activeMetric === 'all' || activeMetric === key;
                    if (!isHighlighted) return null;

                    return (
                      <g key={`scrub-pt-${key}`}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={activeMetric === key ? 6 : 4.5}
                          fill="var(--bg-card)"
                          stroke={cfg.strokeColor}
                          strokeWidth="2.5"
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={activeMetric === key ? 10 : 8}
                          fill="none"
                          stroke={cfg.strokeColor}
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      </g>
                    );
                  }
                )}
              </g>
            )}
          </svg>

          {/* Floating Scrubber Tooltip Card */}
          {hoveredIndex !== null && (
            <div
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-[#173F4F]/30 rounded-xl p-3 shadow-xl font-mono text-xs z-20 pointer-events-none max-w-xs animate-fadeIn"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#DCE3E3] pb-1.5 mb-2">
                <span className="text-[#263238] font-bold">{activePoint.fullDate}</span>
                <span className="text-[10px] text-[#173F4F] bg-[#EEF3F5] px-1.5 py-0.5 rounded border border-[#CBD5E1] font-semibold">
                  Day {activePoint.dayIndex + 1} of 30
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#718096] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#173F4F]"></span>
                    Accuracy:
                  </span>
                  <span className="text-[#173F4F] font-bold">{activePoint.accuracy}%</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#718096] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2B6CB0]"></span>
                    Precision:
                  </span>
                  <span className="text-[#2B6CB0] font-bold">{activePoint.precision}%</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#718096] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#5C8D6B]"></span>
                    Recall:
                  </span>
                  <span className="text-[#5C8D6B] font-bold">{activePoint.recall}%</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#718096] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4A5568]"></span>
                    F1 Score:
                  </span>
                  <span className="text-[#4A5568] font-bold">{activePoint.f1Score}%</span>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#DCE3E3]">
                  <span className="text-[#718096] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C87545]"></span>
                    False Pos. Rate:
                  </span>
                  <span className="text-[#C87545] font-bold">{activePoint.falsePositiveRate}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Legend Ribbon */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#173F4F] rounded-full"></span>
              <span className="text-[#263238]">Accuracy (90-100% axis)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#2B6CB0] rounded-full"></span>
              <span className="text-[#263238]">Precision</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#5C8D6B] rounded-full"></span>
              <span className="text-[#263238]">Recall</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#4A5568] rounded-full"></span>
              <span className="text-[#263238]">F1 Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 border-b-2 border-dashed border-[#C87545]"></span>
              <span className="text-[#C87545] font-medium">False Positive Rate (0-8% axis)</span>
            </div>
          </div>

          <div className="text-[#718096] text-[11px]">
            Hover over chart line to scrub historical data points
          </div>
        </div>
      </div>

      {/* 4. Prediction Statistics Panel */}
      <div className="p-5 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-5">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE3E3]">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#173F4F]" />
              <h2 className="text-base font-semibold text-[#263238]">
                Prediction Statistics & Evaluation Confusion Matrix
              </h2>
            </div>
            <p className="text-xs text-[#718096] mt-0.5">
              Comprehensive breakdown of ground-truth test frame classifications across the golden evaluation suite.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-[#F8FAF9] border border-[#DCE3E3] text-[#263238]">
              Corpus: <strong className="text-[#173F4F]">{CURRENT_PREDICTION_STATS.totalPredictions.toLocaleString()}</strong> frames
            </span>
          </div>
        </div>

        {/* 5 High-Level Prediction Summary Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
          {/* Total Predictions */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#DCE3E3]">
            <span className="text-[10px] text-[#718096] uppercase tracking-wider block">
              Total Predictions
            </span>
            <div className="text-xl font-bold text-[#263238] mt-1">
              {CURRENT_PREDICTION_STATS.totalPredictions.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#718096] mt-0.5 block">100% Evaluation Set</span>
          </div>

          {/* True Positives */}
          <div className="p-3.5 rounded-xl bg-[#EEF3F5] border border-[#CBD5E1]">
            <span className="text-[10px] text-[#173F4F] uppercase tracking-wider block font-semibold">
              True Positives (TP)
            </span>
            <div className="text-xl font-bold text-[#173F4F] mt-1">
              {CURRENT_PREDICTION_STATS.truePositives.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#718096] mt-0.5 block">
              {((CURRENT_PREDICTION_STATS.truePositives / CURRENT_PREDICTION_STATS.totalPredictions) * 100).toFixed(1)}% of corpus
            </span>
          </div>

          {/* False Positives */}
          <div className="p-3.5 rounded-xl bg-[#FEF9E7] border border-[#FDE68A]">
            <span className="text-[10px] text-[#C39A45] uppercase tracking-wider block font-semibold">
              False Positives (FP)
            </span>
            <div className="text-xl font-bold text-[#C39A45] mt-1">
              {CURRENT_PREDICTION_STATS.falsePositives.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#718096] mt-0.5 block">
              {((CURRENT_PREDICTION_STATS.falsePositives / CURRENT_PREDICTION_STATS.totalPredictions) * 100).toFixed(1)}% of corpus
            </span>
          </div>

          {/* False Negatives */}
          <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#FECACA]">
            <span className="text-[10px] text-[#E76F51] uppercase tracking-wider block font-semibold">
              False Negatives (FN)
            </span>
            <div className="text-xl font-bold text-[#E76F51] mt-1">
              {CURRENT_PREDICTION_STATS.falseNegatives.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#718096] mt-0.5 block">
              {((CURRENT_PREDICTION_STATS.falseNegatives / CURRENT_PREDICTION_STATS.totalPredictions) * 100).toFixed(1)}% of corpus
            </span>
          </div>

          {/* True Negatives */}
          <div className="p-3.5 rounded-xl bg-[#EDF7ED] border border-[#C8E6C9]">
            <span className="text-[10px] text-[#5C8D6B] uppercase tracking-wider block font-semibold">
              True Negatives (TN)
            </span>
            <div className="text-xl font-bold text-[#5C8D6B] mt-1">
              {CURRENT_PREDICTION_STATS.trueNegatives.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#718096] mt-0.5 block">
              {((CURRENT_PREDICTION_STATS.trueNegatives / CURRENT_PREDICTION_STATS.totalPredictions) * 100).toFixed(1)}% of corpus
            </span>
          </div>
        </div>

        {/* Visual 2x2 Confusion Matrix Grid */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold text-[#263238] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#173F4F]" />
            <span>2×2 Classification Outcome Matrix</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
            {/* Cell 1: True Positive */}
            <div className="p-4 rounded-xl bg-[#EEF3F5] border border-[#CBD5E1] relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#173F4F] text-white text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> True Positive (TP)
                  </span>
                  <div className="text-2xl font-bold text-[#263238] mt-2">
                    {CURRENT_PREDICTION_STATS.truePositives.toLocaleString()}{' '}
                    <span className="text-xs text-[#173F4F] font-normal">frames</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#173F4F]">
                    {(
                      (CURRENT_PREDICTION_STATS.truePositives /
                        CURRENT_PREDICTION_STATS.actualPositives) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  <span className="text-[10px] text-[#718096] block">of Actual Threats</span>
                </div>
              </div>
              <p className="text-[#718096] text-[11px] mt-2 font-sans leading-relaxed">
                Malicious traffic traversing the diode was <strong>correctly intercepted</strong>.
                Includes Modbus register injection, DNP3 flood, and optical egress timing channels.
              </p>
            </div>

            {/* Cell 2: False Positive */}
            <div className="p-4 rounded-xl bg-[#FEF9E7] border border-[#FDE68A] relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#C39A45] text-white text-[10px] font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" /> False Positive (FP)
                  </span>
                  <div className="text-2xl font-bold text-[#263238] mt-2">
                    {CURRENT_PREDICTION_STATS.falsePositives.toLocaleString()}{' '}
                    <span className="text-xs text-[#C39A45] font-normal">frames</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#C39A45]">
                    {(
                      (CURRENT_PREDICTION_STATS.falsePositives /
                        CURRENT_PREDICTION_STATS.actualNegatives) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  <span className="text-[10px] text-[#718096] block">False Alarm Rate</span>
                </div>
              </div>
              <p className="text-[#718096] text-[11px] mt-2 font-sans leading-relaxed">
                Legitimate benign SCADA frames were <strong>flagged as threats</strong> (benign packet jitter or non-standard industrial telemetry variance).
              </p>
            </div>

            {/* Cell 3: False Negative */}
            <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#FECACA] relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#E76F51] text-white text-[10px] font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" /> False Negative (FN)
                  </span>
                  <div className="text-2xl font-bold text-[#263238] mt-2">
                    {CURRENT_PREDICTION_STATS.falseNegatives.toLocaleString()}{' '}
                    <span className="text-xs text-[#E76F51] font-normal">frames</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#E76F51]">
                    {(
                      (CURRENT_PREDICTION_STATS.falseNegatives /
                        CURRENT_PREDICTION_STATS.actualPositives) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  <span className="text-[10px] text-[#718096] block">Miss Rate</span>
                </div>
              </div>
              <p className="text-[#718096] text-[11px] mt-2 font-sans leading-relaxed">
                Malicious frames <strong>evaded neural classification</strong>. Physical optical data diode hardware air-gap guarantees no reverse exfiltration occurred.
              </p>
            </div>

            {/* Cell 4: True Negative */}
            <div className="p-4 rounded-xl bg-[#EDF7ED] border border-[#C8E6C9] relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#5C8D6B] text-white text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> True Negative (TN)
                  </span>
                  <div className="text-2xl font-bold text-[#263238] mt-2">
                    {CURRENT_PREDICTION_STATS.trueNegatives.toLocaleString()}{' '}
                    <span className="text-xs text-[#5C8D6B] font-normal">frames</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#5C8D6B]">
                    {(
                      (CURRENT_PREDICTION_STATS.trueNegatives /
                        CURRENT_PREDICTION_STATS.actualNegatives) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  <span className="text-[10px] text-[#718096] block">of Benign Passed</span>
                </div>
              </div>
              <p className="text-[#718096] text-[11px] mt-2 font-sans leading-relaxed">
                Normal authorized industrial telemetry was <strong>correctly passed</strong> across the unidirectional interface without friction or operator delay.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Proportional Spectrum Bar (Consistent with Dashboard) */}
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#DCE3E3] space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#718096] uppercase">Test Corpus Classification Proportion</span>
            <span className="text-[#263238] font-bold">25,000 Total Ground-Truth Frames</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
            {/* TP */}
            <div
              title={`True Positives: ${CURRENT_PREDICTION_STATS.truePositives}`}
              className="bg-cyan-500 h-full transition-all duration-300"
              style={{
                width: `${(CURRENT_PREDICTION_STATS.truePositives / CURRENT_PREDICTION_STATS.totalPredictions) * 100}%`,
              }}
            ></div>
            {/* FP */}
            <div
              title={`False Positives: ${CURRENT_PREDICTION_STATS.falsePositives}`}
              className="bg-amber-500 h-full transition-all duration-300"
              style={{
                width: `${(CURRENT_PREDICTION_STATS.falsePositives / CURRENT_PREDICTION_STATS.totalPredictions) * 100}%`,
              }}
            ></div>
            {/* FN */}
            <div
              title={`False Negatives: ${CURRENT_PREDICTION_STATS.falseNegatives}`}
              className="bg-rose-500 h-full transition-all duration-300"
              style={{
                width: `${(CURRENT_PREDICTION_STATS.falseNegatives / CURRENT_PREDICTION_STATS.totalPredictions) * 100}%`,
              }}
            ></div>
            {/* TN */}
            <div
              title={`True Negatives: ${CURRENT_PREDICTION_STATS.trueNegatives}`}
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${(CURRENT_PREDICTION_STATS.trueNegatives / CURRENT_PREDICTION_STATS.totalPredictions) * 100}%`,
              }}
            ></div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <span className="text-[#718096]">TP:</span>
              <span className="text-[#173F4F] font-bold">
                {CURRENT_PREDICTION_STATS.truePositives.toLocaleString()} (32.9%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-[#718096]">FP:</span>
              <span className="text-[#C39A45] font-bold">
                {CURRENT_PREDICTION_STATS.falsePositives.toLocaleString()} (1.9%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-[#718096]">FN:</span>
              <span className="text-[#E76F51] font-bold">
                {CURRENT_PREDICTION_STATS.falseNegatives.toLocaleString()} (1.2%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[#718096]">TN:</span>
              <span className="text-[#5C8D6B] font-bold">
                {CURRENT_PREDICTION_STATS.trueNegatives.toLocaleString()} (64.0%)
              </span>
            </div>
          </div>
        </div>

        {/* 5. MANDATORY NOTIFICATION CAPTION */}
        <div
          id="model-monitoring-caption"
          className="p-4 rounded-xl bg-[#EEF3F5] border border-[#CBD5E1] flex items-start gap-3 shadow-xs"
        >
          <div className="p-1.5 rounded-lg bg-[#173F4F] text-white shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-[#173F4F] uppercase tracking-wide">
              Evaluation Benchmark Notice
            </h4>
            <p className="text-xs text-[#263238] leading-relaxed font-sans">
              These figures and prediction statistics are based on evaluation data from the standardized industrial test suite (Golden-OT-Suite-v2026.09, 25,000 ground-truth labeled frames) and will automatically refresh as the model is retrained on scheduled production cycles.
            </p>
            <div className="flex items-center gap-4 text-[11px] font-mono text-[#718096] pt-1">
              <span>
                Last Evaluated: <strong className="text-[#263238]">{lastRefreshedDate}</strong>
              </span>
              <span>•</span>
              <span>
                Next Retraining Epoch: <strong className="text-[#173F4F]">Sep 15, 2026 04:00 UTC</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Technical Architecture & Drift Observability Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-4 rounded-xl bg-white border border-[#DCE3E3] shadow-xs">
          <div className="flex items-center gap-2 text-[#718096] text-[11px] uppercase mb-1">
            <Zap className="w-3.5 h-3.5 text-[#173F4F]" />
            <span>Inference Latency</span>
          </div>
          <div className="text-xl font-bold text-[#263238]">11.4 ms</div>
          <p className="text-[10px] text-[#718096] mt-1 font-sans">
            Quantized INT8 execution offloaded to hardware FPGA at wire-speed line rate.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DCE3E3] shadow-xs">
          <div className="flex items-center gap-2 text-[#718096] text-[11px] uppercase mb-1">
            <Sliders className="w-3.5 h-3.5 text-[#173F4F]" />
            <span>Feature Drift (KS Test)</span>
          </div>
          <div className="text-xl font-bold text-[#5C8D6B]">p = 0.84 (Stable)</div>
          <p className="text-[10px] text-[#718096] mt-1 font-sans">
            No statistical protocol drift detected across OT telemetry distribution over 30 days.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DCE3E3] shadow-xs">
          <div className="flex items-center gap-2 text-[#718096] text-[11px] uppercase mb-1">
            <FileText className="w-3.5 h-3.5 text-[#173F4F]" />
            <span>Model Artifact Checksum</span>
          </div>
          <div className="text-xs font-bold text-[#263238] truncate">
            {CURRENT_MODEL_METADATA.weightsHash}
          </div>
          <p className="text-[10px] text-[#718096] mt-1 font-sans">
            Verified cryptographic signature matching enclave tamper-evident memory.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelMonitoringView;
