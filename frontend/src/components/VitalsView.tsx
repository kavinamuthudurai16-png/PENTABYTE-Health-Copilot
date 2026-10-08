import React, { useState } from 'react';
import { 
  HeartPulse, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Sparkles
} from 'lucide-react';
import { VitalMetricPoint } from '../types';

interface VitalsViewProps {
  vitalTrends: Record<string, VitalMetricPoint[]>;
}

export const VitalsView: React.FC<VitalsViewProps> = ({ vitalTrends }) => {
  const metricKeys = Object.keys(vitalTrends);
  const [selectedMetric, setSelectedMetric] = useState<string>(metricKeys[0] || 'HbA1c (%)');

  const currentPoints = vitalTrends[selectedMetric] || [];

  const firstVal = currentPoints[0]?.value || 0;
  const lastVal = currentPoints[currentPoints.length - 1]?.value || 0;
  const diff = lastVal - firstVal;

  const isImproving = (metric: string, change: number) => {
    if (metric.includes('HbA1c') || metric.includes('Sugar') || metric.includes('BP') || metric.includes('Cholesterol')) {
      return change < 0;
    }
    return change > 0;
  };

  const width = 650;
  const height = 220;
  const padding = 45;

  const minVal = Math.min(...currentPoints.map(p => p.value), 0);
  const maxVal = Math.max(...currentPoints.map(p => p.value), 10) * 1.15;

  const getX = (index: number) => {
    if (currentPoints.length <= 1) return width / 2;
    return padding + (index * (width - 2 * padding)) / (currentPoints.length - 1);
  };

  const getY = (val: number) => {
    return height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
  };

  const pointsString = currentPoints
    .map((p, idx) => `${getX(idx)},${getY(p.value)}`)
    .join(' ');

  return (
    <div className="space-y-6">
      
      {/* Metric Selector Tabs */}
      <div className="glass-panel p-4 flex flex-wrap items-center gap-2">
        {metricKeys.map((key) => {
          const pts = vitalTrends[key];
          const latest = pts[pts.length - 1];
          const isSelected = selectedMetric === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected 
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-sm' 
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{key}</div>
              <div className="text-base font-bold font-mono mt-0.5">
                {latest ? `${latest.value} ${latest.unit}` : 'N/A'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart Card */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 font-display">
              <HeartPulse className="w-5 h-5 text-cyan-500" />
              Biomarker Trajectory: {selectedMetric}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Longitudinal tracking across historical diagnostic reports
            </p>
          </div>

          {/* Trend Indicator Badge */}
          <div className="flex items-center gap-2">
            {diff !== 0 ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isImproving(selectedMetric, diff)
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
              }`}>
                {isImproving(selectedMetric, diff) ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Favorable Trajectory ({diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)})</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Elevating Trend (+{diff.toFixed(1)})</span>
                  </>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Minus className="w-3.5 h-3.5" /> Stable Baseline
              </span>
            )}
          </div>
        </div>

        {/* SVG Time Series Curve */}
        {currentPoints.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            No data points recorded for this parameter.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl mx-auto overflow-visible">
              
              {/* Background horizontal grid lines */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
                const yPos = padding + (height - 2 * padding) * (1 - ratio);
                const gridVal = (minVal + (maxVal - minVal) * ratio).toFixed(1);
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={yPos}
                      x2={width - padding}
                      y2={yPos}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding - 8}
                      y={yPos + 4}
                      fill="currentColor"
                      className="text-slate-400 dark:text-slate-500"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {gridVal}
                    </text>
                  </g>
                );
              })}

              {/* Connected Line */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Data points */}
              {currentPoints.map((pt, idx) => {
                const cx = getX(idx);
                const cy = getY(pt.value);
                const isAbnormal = pt.status !== 'NORMAL';

                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill={isAbnormal ? '#d97706' : '#059669'}
                      stroke="currentColor"
                      className="text-white dark:text-slate-900"
                      strokeWidth="2"
                    />
                    
                    {/* Value Pill above dot */}
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="currentColor"
                      className="text-slate-800 dark:text-slate-100 font-bold"
                      fontSize="11"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {pt.value}
                    </text>

                    {/* Date label at bottom */}
                    <text
                      x={cx}
                      y={height - 12}
                      fill="currentColor"
                      className="text-slate-400 dark:text-slate-500"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>
        )}

        {/* Clinical Interpretation for this Biomarker */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold block mb-0.5">
              AI Clinical Perspective on {selectedMetric}:
            </span>
            {selectedMetric.includes('HbA1c') ? (
              "Your HbA1c improved from 8.8% in June down to 8.2% in September. This demonstrates that therapy and lifestyle interventions are beginning to exert positive glycemic pressure. The recommended long-term target is < 6.5%."
            ) : selectedMetric.includes('Sugar') ? (
              "Fasting Blood Sugar dropped from 165 mg/dL to 148 mg/dL. Sustained adherence to morning Metformin and evening dietary adjustments will continue lowering morning glucose."
            ) : selectedMetric.includes('BP') ? (
              "Systolic pressure reduced from 144 mmHg to 138 mmHg following Telmisartan initiation. Target systolic is < 120-130 mmHg."
            ) : (
              "Monitoring this parameter across longitudinal timeframes helps verify therapeutic efficacy before chronic complications arise."
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
