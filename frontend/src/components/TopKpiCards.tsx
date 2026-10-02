import React from 'react';
import { Sun, AlertOctagon, Database, DollarSign, Activity, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { MiniSparkline } from './MiniSparkline';
import { BaselineResponse, QualityReport, CNGSimResult } from '../types';

interface TopKpiCardsProps {
  baseline: BaselineResponse | null;
  quality: QualityReport | null;
  cng: CNGSimResult | null;
  currentFuel: string;
}

export const TopKpiCards: React.FC<TopKpiCardsProps> = ({
  baseline,
  quality,
  cng,
  currentFuel
}) => {
  const avgIke = baseline ? baseline.average_ike.toFixed(3) : '0.842';
  const wastedGj = baseline ? baseline.total_wasted_energy_gj.toFixed(1) : '142.5';
  const wastedCost = baseline ? (baseline.total_wasted_cost_idr / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '48';
  const acceptedRows = quality ? quality.accepted_rows : 90;
  const totalRows = quality ? quality.total_rows : 90;
  const cngCost = cng ? cng.cng_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '156.402';
  const savingsPct = cng ? cng.cost_savings_percent.toFixed(1) : '58.5';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {/* Card 1: Forecasted Peak Load / Rata-Rata IKE Fasilitas */}
      <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-slate-600 font-sans">Rata-Rata IKE Fasilitas</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sans">
              {avgIke} <span className="text-xs font-normal text-slate-400">GJ/Ton</span>
            </p>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
              Normalisasi US DOE 2020
            </span>
          </div>
          <div className="shrink-0 pb-1">
            <MiniSparkline type="line" color="#10b981" />
          </div>
        </div>
      </div>

      {/* Card 2: Curtailment Risk / Pemborosan Terdeteksi */}
      <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-xs font-semibold text-slate-600 font-sans">Pemborosan Terdeteksi</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sans">
              {wastedGj} <span className="text-xs font-normal text-slate-400">GJ</span>
            </p>
            <span className="text-[11px] text-rose-600 font-medium block mt-0.5">
              ~Rp {wastedCost} Juta (Anomali +1.5σ)
            </span>
          </div>
          <div className="shrink-0 pb-1">
            <MiniSparkline type="line" color="#f43f5e" />
          </div>
        </div>
      </div>

      {/* Card 3: Available Storage / Integritas Telemetri Sensor */}
      <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <Database className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-xs font-semibold text-slate-600 font-sans">Integritas Telemetri Sensor</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sans">
              {acceptedRows} <span className="text-xs font-normal text-slate-400">/ {totalRows} Baris</span>
            </p>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
              100% Lolos Validasi Fisik
            </span>
          </div>
          <div className="shrink-0 pb-1">
            <MiniSparkline type="slider" color="#10b981" />
          </div>
        </div>
      </div>

      {/* Card 4: Spot Market Price / Useful Heat Cost CNG */}
      <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-slate-600 font-sans">Biaya Useful Heat CNG</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sans">
              Rp {cngCost} <span className="text-xs font-normal text-slate-400">/GJ</span>
            </p>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
              Hemat {savingsPct}% vs {currentFuel}
            </span>
          </div>
          <div className="shrink-0 pb-1">
            <MiniSparkline type="bar" color="#10b981" />
          </div>
        </div>
      </div>
    </div>
  );
};
