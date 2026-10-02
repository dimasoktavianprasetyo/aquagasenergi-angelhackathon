import React, { useMemo } from 'react';
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

const IKEBaselineSectionComponent: React.FC<IKEBaselineProps> = ({
  baselineData,
  granularity = 'DAILY',
  onSelectGranularity,
  isProcessing
}) => {
  if (!baselineData) return null;

  const { model, points, average_ike, total_wasted_energy_gj, total_wasted_cost_idr } = baselineData;

  // Memoized Chart dataset with smart anomaly-preserving stride sampling for large datasets (e.g. 2,000 - 50,000 rows)
  const chartData = useMemo(() => {
    if (points.length <= 2500) {
      return points.map((p) => ({
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
    }

    // High performance stride for large telemetry datasets: preserve 100% of anomalies + sample background line
    const stride = Math.ceil(points.length / 1500);
    return points
      .filter((p, idx) => p.is_anomaly || idx % stride === 0 || idx === points.length - 1)
      .map((p) => ({
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
  }, [points]);

  const anomalyCount = useMemo(() => points.filter((p) => p.is_anomaly).length, [points]);

  return (
    <div className="flex flex-col gap-5 h-full" id="section-ike-baseline">
      {/* Chart Section - Load Forecast vs. Actual (Exact User Screenshot Style) */}
      <div className="bg-[#12151e] p-6 md:p-7 rounded-[28px] border border-[#262c3d] shadow-2xl flex flex-col justify-between flex-1">
        <div className="pb-4 border-b border-[#262c3d] mb-6 flex flex-col gap-2.5">
          {/* Baris 1: Judul dan Badge Anomali Langsung Berdampingan (Satu Baris Penuh) */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <h2 className="text-base sm:text-lg xl:text-xl font-bold text-white font-sans whitespace-nowrap tracking-tight">
              Load Forecast vs. Actual (Konsumsi Energi vs Baseline DOE)
            </h2>
            {anomalyCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#2d1217] text-rose-300 border border-[#881337] text-[11px] font-semibold whitespace-nowrap shrink-0">
                {anomalyCount} Anomali Terdeteksi (+1.5σ)
              </span>
            )}
          </div>

          {/* Baris 2: Sub-deskripsi & Tombol Resolusi Waktu (Ditaruh di Bawah) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Normalisasi konsumsi bahan bakar terhadap volume produksi dan jam operasi berdasarkan <em>US DOE Guidance (2020)</em>.
            </p>

            {/* Time Resolution Tabs (Ditaruh di bawah) */}
            <div className="flex items-center gap-1.5 bg-[#0f121a] p-1 rounded-full border border-slate-800 shrink-0 text-xs self-start sm:self-auto">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-2 border-t border-[#262c3d] text-xs gap-3">
          <div className="flex items-center gap-2 text-slate-400 font-light flex-wrap">
            <span className="font-mono text-slate-200 bg-[#1c2230] px-3 py-1 rounded-md border border-slate-700">
              <span className="text-slate-400 font-sans mr-1.5 font-normal">Formula:</span>
              <span className="font-semibold text-white">{model.regression_formula}</span>
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
    </div>
  );
};

export const IKEBaselineSection = React.memo(IKEBaselineSectionComponent);

interface AnomalyInvestigationTableProps {
  baselineData: BaselineResponse | null;
}

const AnomalyInvestigationTableComponent: React.FC<AnomalyInvestigationTableProps> = ({ baselineData }) => {
  if (!baselineData) return null;

  const { points } = baselineData;
  const anomalyPoints = useMemo(() => points.filter((p) => p.is_anomaly), [points]);
  if (anomalyPoints.length === 0) return null;

  return (
    <div className="bg-[#12151e] p-6 md:p-7 rounded-[28px] border border-[#881337] shadow-2xl mb-7 w-full overflow-hidden" id="section-anomaly-table">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#262c3d] gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#2d1217] border border-[#881337] flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-sm md:text-base font-bold text-white tracking-wide uppercase font-sans">
                Panduan Investigasi Anomali &amp; Deviasi Efisiensi
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#2d1217] text-rose-300 border border-[#881337] text-[11px] font-semibold whitespace-nowrap shrink-0">
                {anomalyPoints.length} Kejadian (+1.5σ)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-light">
              Daftar insiden konsumsi energi berlebih berdasarkan deteksi deviasi residual terhadap model baseline US DOE.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-slate-400">
              <th className="pb-3 px-4 font-semibold whitespace-nowrap">Tanggal</th>
              <th className="pb-3 px-4 font-semibold whitespace-nowrap">Aktual (GJ)</th>
              <th className="pb-3 px-4 font-semibold whitespace-nowrap">Baseline (GJ)</th>
              <th className="pb-3 px-4 font-semibold whitespace-nowrap">Kelebihan</th>
              <th className="pb-3 px-4 font-semibold whitespace-nowrap">Estimasi Biaya Terbuang</th>
              <th className="pb-3 px-4 font-semibold">Panduan Investigasi (Operator Triase)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {anomalyPoints.map((p, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                <td className="py-3.5 px-4 text-slate-200 font-medium whitespace-nowrap">{p.timestamp}</td>
                <td className="py-3.5 px-4 text-emerald-400 font-semibold whitespace-nowrap">{p.actual_energy_gj.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-cyan-400 whitespace-nowrap">{p.baseline_energy_gj.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-rose-400 font-bold whitespace-nowrap">
                  +{p.deviation_gj.toFixed(2)} GJ (+{p.deviation_percent.toFixed(1)}%)
                </td>
                <td className="py-3.5 px-4 text-rose-300 font-semibold whitespace-nowrap">
                  Rp {p.estimated_excess_cost_idr.toLocaleString('id-ID')}
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-light leading-relaxed">
                  {p.probable_cause}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 font-light leading-relaxed">
        *Catatan Metodologi: Anomali dideteksi secara statistik melalui deviasi residual (+1.5σ) terhadap model regresi multivariat baseline. Penyebab di atas dirancang sebagai <em>investigation prompts</em> (panduan triase operasional) untuk memandu inspeksi fisik prioritas oleh operator boiler.
      </p>
    </div>
  );
};

export const AnomalyInvestigationTable = React.memo(AnomalyInvestigationTableComponent);
