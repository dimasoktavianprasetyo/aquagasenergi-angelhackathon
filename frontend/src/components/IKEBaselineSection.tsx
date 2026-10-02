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
import { TrendingUp, AlertOctagon, Activity, FileCode, CheckCircle2, Zap } from 'lucide-react';
import { BaselineResponse } from '../types';

interface IKEBaselineProps {
  baselineData: BaselineResponse | null;
}

export const IKEBaselineSection: React.FC<IKEBaselineProps> = ({ baselineData }) => {
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
    <div className="glass-panel p-6 mb-6" id="section-ike-baseline">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">2. Intensitas Konsumsi Energi (IKE) & Baseline US DOE</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Normalisasi konsumsi bahan bakar terhadap volume produksi dan jam operasi berdasarkan <em>US DOE Guidance (2020)</em>.
          </p>
        </div>
        <span className="badge-cyan text-xs font-mono">Metodologi Regresi Multivariat</span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Average IKE */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-400">Rata-Rata IKE Fasilitas</span>
            <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {average_ike.toFixed(3)}
              <span className="text-xs font-normal text-slate-400 ml-1.5">GJ/Ton</span>
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Intensitas energi per ton output</span>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Model Equation */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Formula Baseline Terkoreksi</span>
          <p className="text-xs font-mono font-semibold text-slate-200 mt-2 p-2 bg-slate-950/70 rounded border border-slate-800 break-all">
            {model.regression_formula}
          </p>
          <span className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Memisahkan jam kerja & produksi</span>
          </span>
        </div>

        {/* R-Squared Goodness of Fit */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-400">Goodness of Fit (R²)</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {(model.r_squared * 100).toFixed(1)}%
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {model.r_squared > 0.8 ? 'Korelasi Sangat Kuat (>0.8)' : 'Korelasi Cukup'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Wasted Energy & Loss */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-400">Pemborosan Terdeteksi</span>
            <p className="text-xl font-bold font-mono text-rose-400 mt-1">
              {total_wasted_energy_gj.toFixed(1)} <span className="text-xs text-slate-400">GJ</span>
            </p>
            <span className="text-xs font-mono text-rose-300 font-semibold block mt-0.5">
              ~Rp {total_wasted_cost_idr.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span>Visualisasi Konsumsi Aktual vs US DOE Baseline (GJ)</span>
            {anomalyCount > 0 && (
              <span className="badge-rose text-[11px]">
                {anomalyCount} Anomali Terdeteksi (+1.5σ)
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline-block">
            Titik merah menandai pemborosan operasional yang dapat ditindaklanjuti
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickMargin={8} />
              <YAxis stroke="#64748b" fontSize={11} unit=" GJ" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-semibold text-white border-b border-slate-800 pb-1">{data.timestamp}</p>
                        <p className="text-cyan-400">Aktual: <span className="font-mono font-bold">{data.actual} GJ</span></p>
                        <p className="text-emerald-400">Baseline DOE: <span className="font-mono font-bold">{data.baseline} GJ</span></p>
                        <p className={data.deviation > 0 ? 'text-rose-400' : 'text-slate-400'}>
                          Deviasi: <span className="font-mono font-bold">{data.deviation > 0 ? `+${data.deviation}` : data.deviation} GJ ({data.deviationPercent}%)</span>
                        </p>
                        {data.isAnomaly && (
                          <div className="mt-2 pt-1 border-t border-slate-800">
                            <span className="badge-rose text-[10px] mb-1">ANOMALI PEMBOROSAN</span>
                            <p className="text-rose-300 font-mono">Estimasi Kerugian: Rp {data.excessCost.toLocaleString('id-ID')}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">{data.cause}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="actual" name="Konsumsi Aktual (GJ)" stroke="#00e5ff" fill="url(#actualGradient)" strokeWidth={2} />
              <Line type="monotone" dataKey="baseline" name="Baseline US DOE (GJ)" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Scatter dataKey="anomalyValue" name="Anomali Inefisiensi" fill="#f43f5e" shape="circle" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly Details Table */}
      {anomalyCount > 0 && (
        <div className="mt-4 bg-slate-950/70 p-4 rounded-xl border border-rose-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-rose-400 tracking-wide uppercase">
              Rincian Insiden Anomali Pemborosan ({anomalyCount} Kejadian)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-2">Tanggal</th>
                  <th className="pb-2">Aktual (GJ)</th>
                  <th className="pb-2">Baseline (GJ)</th>
                  <th className="pb-2">Kelebihan</th>
                  <th className="pb-2">Estimasi Biaya Terbuang</th>
                  <th className="pb-2">Diagnosa Kemungkinan Penyebab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {points
                  .filter((p) => p.is_anomaly)
                  .map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="py-2.5 text-slate-200">{p.timestamp}</td>
                      <td className="py-2.5 text-cyan-300 font-semibold">{p.actual_energy_gj.toFixed(2)}</td>
                      <td className="py-2.5 text-emerald-300">{p.baseline_energy_gj.toFixed(2)}</td>
                      <td className="py-2.5 text-rose-400 font-bold">+{p.deviation_gj.toFixed(2)} GJ (+{p.deviation_percent.toFixed(1)}%)</td>
                      <td className="py-2.5 text-rose-300 font-semibold">Rp {p.estimated_excess_cost_idr.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 text-slate-400 font-sans text-[11px] max-w-xs">{p.probable_cause}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
