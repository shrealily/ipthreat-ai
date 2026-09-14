// Mock Model Monitoring Telemetry & Ground-Truth Evaluation Data
// Aligned with the physical optical data diode inspection environment

export interface ModelKPIs {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
}

export interface PredictionStats {
  totalPredictions: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
  actualPositives: number;
  actualNegatives: number;
  predictedPositives: number;
  predictedNegatives: number;
}

export interface MetricTrendPoint {
  date: string;
  fullDate: string;
  timestamp: string;
  dayIndex: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  evalLoss: number;
  avgLatencyMs: number;
}

export interface ModelMetadata {
  modelName: string;
  version: string;
  architecture: string;
  weightsHash: string;
  lastRetrained: string;
  nextScheduledRetrain: string;
  benchmarkSuite: string;
  trainingSamples: number;
  validationSplitSize: number;
  framework: string;
  quantization: string;
  status: 'optimal' | 'recalibrating' | 'drift_detected';
}

export const CURRENT_MODEL_METADATA: ModelMetadata = {
  modelName: 'IPthreat-DPI-Net',
  version: 'v2.4.3-prod',
  architecture: 'Bidirectional Optical LSTM + 1D-CNN Entropy Autoencoder',
  weightsHash: 'sha256:4f8a29e10c73...b8e9',
  lastRetrained: '2026-09-08T04:00:00.000Z',
  nextScheduledRetrain: '2026-09-15T04:00:00.000Z',
  benchmarkSuite: 'Golden-OT-Suite-v2026.09 (Standard IEC 62443 / NERC CIP Evaluation Matrix)',
  trainingSamples: 850000,
  validationSplitSize: 25000,
  framework: 'TensorFlow Lite for Microcontrollers + FPGA Offload',
  quantization: 'INT8 Post-Training Quantized (Zero-Latency Inference Engine)',
  status: 'optimal',
};

// Current ground-truth evaluation metrics (Mathematically consistent with the confusion matrix)
// Total Evaluation Set = 25,000 samples
// Actual Positives (Threats) = 8,535
// Actual Negatives (Benign) = 16,465
// True Positives (TP) = 8,228
// False Positives (FP) = 470
// False Negatives (FN) = 307
// True Negatives (TN) = 15,995
//
// Recall = 8228 / 8535 = 96.40%
// Precision = 8228 / (8228 + 470) = 8228 / 8698 = 94.60%
// Accuracy = (8228 + 15995) / 25000 = 24223 / 25000 = 96.89% (~96.9%)
// F1 Score = 2 * (0.9460 * 0.9640) / (0.9460 + 0.9640) = 1.8239 / 1.9100 = 95.49% (~95.5%)
// False Positive Rate = 470 / 16465 = 2.85% (~2.9%)
export const CURRENT_MODEL_KPIS: ModelKPIs = {
  accuracy: 96.9,
  precision: 94.6,
  recall: 96.4,
  f1Score: 95.5,
  falsePositiveRate: 2.9,
};

export const CURRENT_PREDICTION_STATS: PredictionStats = {
  totalPredictions: 25000,
  truePositives: 8228,
  falsePositives: 470,
  falseNegatives: 307,
  trueNegatives: 15995,
  actualPositives: 8535,
  actualNegatives: 16465,
  predictedPositives: 8698,
  predictedNegatives: 16302,
};

// Generate 30 days of evaluation benchmark trend data leading up to 2026-09-11
export function generateModelTrendData(): MetricTrendPoint[] {
  const points: MetricTrendPoint[] = [];
  const baseTime = new Date('2026-09-11T07:30:00.000Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  // 30 days history: from day 29 ago down to day 0 (today)
  for (let i = 29; i >= 0; i--) {
    const pointTime = new Date(baseTime - i * dayMs);
    const dateLabel = pointTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const fullDate = pointTime.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Gradual model improvement curve with realistic daily evaluation noise
    // 30 days ago (around Aug 13): model version v2.3.9
    // Retrained around day 17 ago (v2.4.0), day 10 ago (v2.4.2), day 3 ago (v2.4.3)
    const progressFactor = (30 - i) / 30; // 0 to 1

    // Accuracy: 94.4% -> 96.9%
    const accBase = 94.4 + progressFactor * 2.3;
    const accNoise = Math.sin(i * 1.7) * 0.35 + Math.cos(i * 0.9) * 0.2;
    const accuracy = Number(Math.min(97.2, Math.max(93.8, accBase + accNoise)).toFixed(1));

    // Precision: 92.1% -> 94.6%
    const precBase = 92.1 + progressFactor * 2.4;
    const precNoise = Math.cos(i * 2.1) * 0.45;
    const precision = Number(Math.min(95.4, Math.max(91.5, precBase + precNoise)).toFixed(1));

    // Recall: 94.8% -> 96.4%
    const recBase = 94.8 + progressFactor * 1.5;
    const recNoise = Math.sin(i * 1.3) * 0.4;
    const recall = Number(Math.min(97.3, Math.max(93.9, recBase + recNoise)).toFixed(1));

    // F1 Score: harmonic mean
    const f1Computed = (2 * (precision * recall)) / (precision + recall);
    const f1Score = Number(f1Computed.toFixed(1));

    // False Positive Rate: 4.8% -> 2.9%
    const fprBase = 4.8 - progressFactor * 1.85;
    const fprNoise = Math.sin(i * 2.3) * 0.3;
    const falsePositiveRate = Number(Math.min(5.6, Math.max(2.4, fprBase + fprNoise)).toFixed(1));

    // Evaluation Loss (Cross-Entropy): 0.142 down to 0.068
    const evalLoss = Number((0.142 - progressFactor * 0.07 + Math.sin(i * 1.5) * 0.008).toFixed(3));

    // Latency ms: 12.8ms down to 11.4ms
    const avgLatencyMs = Number((12.8 - progressFactor * 1.3 + Math.cos(i * 0.8) * 0.2).toFixed(1));

    points.push({
      date: dateLabel,
      fullDate,
      timestamp: pointTime.toISOString(),
      dayIndex: 29 - i,
      accuracy,
      precision,
      recall,
      f1Score,
      falsePositiveRate,
      evalLoss,
      avgLatencyMs,
    });
  }

  // Ensure last point matches CURRENT_MODEL_KPIS exactly
  if (points.length > 0) {
    points[points.length - 1].accuracy = CURRENT_MODEL_KPIS.accuracy;
    points[points.length - 1].precision = CURRENT_MODEL_KPIS.precision;
    points[points.length - 1].recall = CURRENT_MODEL_KPIS.recall;
    points[points.length - 1].f1Score = CURRENT_MODEL_KPIS.f1Score;
    points[points.length - 1].falsePositiveRate = CURRENT_MODEL_KPIS.falsePositiveRate;
  }

  return points;
}

export const MOCK_TREND_POINTS = generateModelTrendData();
