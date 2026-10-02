import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area
} from 'recharts';
import { TrendingUp, AlertOctagon, Activity, CheckCircle2, Zap } from 'lucide-react';
import { BaselineResponse } from '../types';
import { CircularGauge } from './CircularGauge';

interface IKEBaselineProps {
  baselineData: BaselineResponse | null;
  granularity?: 'DAILY' | 'HOURLY';
  onSelectGranularity?: (granularity: 'DAILY' | 'HOURLY') => void;
  isProcessing?: boolean;
}

export const IKEBaselineSection: React.FC<IKEBaselineProps> = ({
  baselineData,
  granularity = 'DAILY',
  onSelectGranularity,
  isProcessing
}) => {
  if (!baselineData) return null;

  const { model, points, average_ike, total_wasted_energy_gj, total_wasted_cost_idr } = baselineData;

  // Chart dataset
  const chartData = points.map((p) => ({
    timestamp: p.timestamp,
    actual: Number(p.actual_energy_gj.toFixed(2)),
    baseline: Number(p.baseline_energy_gj.toFixed(2)),
    anomalyValue: p.is_anomaly ? Number(p.actual_energy_gj.toFixed(2)) : null,
    deviation: Number(p.deviation_gj.toFixed(2)),
    deviationPercent: Number(p.deviation_percent.toFixed(1)),
    excessCost: p.estimated_excess_cost_idr,
    cause: p.probable_cause,
    isAnomaly: p.is_anomaly
  }));

  const anomalyCount = points.filter((p) => p.is_anomaly).length;

  return (
    <div className="flex flex-col gap-5 h-full" id="section-ike-baseline">
      {/* Chart Section - Load Forecast vs. Actual (Exact User Screenshot Style) */}
      <div className="bg-[#12151e] p-6 md:p-7 rounded-[28px] border border-white/[0.08] shadow-2xl flex flex-col justify-between flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-lg md:text-xl font-bold text-white font-sans">
                Load Forecast vs. Actual (Konsumsi Energi vs Baseline DOE)
              </span>
              {anomalyCount > 0 && (
                <span className="px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                  {anomalyCount} Anomali Terdeteksi (+1.5σ)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
              Normalisasi konsumsi bahan bakar terhadap volume produksi dan jam operasi berdasarkan <em>US DOE Guidance (2020)</em>.
            </p>
          </div>

          {/* Time Resolution Tabs (Exact from Desain 2: Today / Tomorrow) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-full border border-white/10 shrink-0 text-xs">
            <button
              onClick={() => onSelectGranularity && onSelectGranularity('DAILY')}
              disabled={isProcessing}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                granularity === 'DAILY'
                  ? 'bg-[#ea580c] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => onSelectGranularity && onSelectGranularity('HOURLY')}
              disabled={isProcessing}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                granularity === 'HOURLY'
                  ? 'bg-[#ea580c] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Per Jam (SCADA)
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickMargin={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} unit=" GJ" tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#131722]/95 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[220px]">
                        <p className="font-semibold text-white border-b border-white/10 pb-1.5">{data.timestamp}</p>
                        <p className="text-emerald-400 flex justify-between">
                          <span>Aktual:</span>
                          <span className="font-bold">{data.actual} GJ</span>
                        </p>
                        <p className="text-cyan-400 flex justify-between">
                          <span>Baseline DOE:</span>
                          <span className="font-bold">{data.baseline} GJ</span>
                        </p>
                        <p className={`flex justify-between ${data.deviation > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          <span>Deviasi:</span>
                          <span className="font-bold">{data.deviation > 0 ? `+${data.deviation}` : data.deviation} GJ ({data.deviationPercent}%)</span>
                        </p>
                        {data.isAnomaly && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <span className="pill-tag bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] mb-1.5 inline-block">
                              ANOMALI PEMBOROSAN
                            </span>
                            <p className="text-rose-300 font-semibold">Estimasi Kerugian: Rp {data.excessCost.toLocaleString('id-ID')}</p>
                            <p className="text-slate-400 text-[11px] mt-1 font-light leading-relaxed">{data.cause}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }} />
              <Area type="monotone" dataKey="actual" name="Konsumsi Aktual (GJ)" stroke="#10b981" fill="url(#actualGradient)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="baseline" name="Baseline US DOE (GJ)" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Scatter dataKey="anomalyValue" name="Anomali Inefisiensi" fill="#f43f5e" shape="circle" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Annotation (Peak Indicator + US DOE Model Formula) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-2 border-t border-white/[0.06] text-xs gap-3">
          <div className="flex items-center gap-2 text-slate-400 font-light flex-wrap">
            <span className="font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Formula: {model.regression_formula}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium">R² = {(model.r_squared * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-baseline gap-2 self-end sm:self-auto">
            <span className="text-slate-400 text-xs">Peak:</span>
            <span className="text-2xl font-bold text-white font-sans">
              {Math.max(...chartData.map((d) => d.actual))} <span className="text-xs font-normal text-slate-400">GJ</span>
            </span>
          </div>
        </div>
      </div>

      {/* Anomaly Details Table */}
      {anomalyCount > 0 && (
        <div className="bg-[#12151e] p-6 rounded-[28px] border border-rose-500/20 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-rose-400 tracking-wide uppercase">
              Panduan Investigasi Anomali & Deviasi Efisiensi ({anomalyCount} Kejadian)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400">
                  <th className="pb-3 px-3 font-semibold">Tanggal</th>
                  <th className="pb-3 px-3 font-semibold">Aktual (GJ)</th>
                  <th className="pb-3 px-3 font-semibold">Baseline (GJ)</th>
                  <th className="pb-3 px-3 font-semibold">Kelebihan</th>
                  <th className="pb-3 px-3 font-semibold">Estimasi Biaya Terbuang</th>
                  <th className="pb-3 px-3 font-semibold">Panduan Investigasi (Operator Triase)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {points
                  .filter((p) => p.is_anomaly)
                  .map((p, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-3 text-slate-200 font-medium">{p.timestamp}</td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold">{p.actual_energy_gj.toFixed(2)}</td>
                      <td className="py-3 px-3 text-cyan-400">{p.baseline_energy_gj.toFixed(2)}</td>
                      <td className="py-3 px-3 text-rose-400 font-bold">+{p.deviation_gj.toFixed(2)} GJ (+{p.deviation_percent.toFixed(1)}%)</td>
                      <td className="py-3 px-3 text-rose-300 font-semibold">Rp {p.estimated_excess_cost_idr.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-slate-400 font-light max-w-xs">{p.probable_cause}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 font-light leading-relaxed">
            *Catatan Metodologi: Anomali dideteksi secara statistik melalui deviasi residual (+1.5σ) terhadap model regresi multivariat baseline. Penyebab di atas dirancang sebagai <em>investigation prompts</em> (panduan triase operasional) untuk memandu inspeksi fisik prioritas oleh operator boiler.
          </p>
        </div>
      )}
    </div>
  );
};
