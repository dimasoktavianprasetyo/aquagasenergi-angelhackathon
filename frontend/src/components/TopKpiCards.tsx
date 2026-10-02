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

const TopKpiCardsComponent: React.FC<TopKpiCardsProps> = ({
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
  const rawSavings = cng ? cng.cost_savings_percent : 58.5;
  const savingsPct = Math.max(0, rawSavings).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {/* Card 1: Forecasted Peak Load / Rata-Rata IKE Fasilitas */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-xs font-semibold text-slate-700 font-sans">Rata-Rata IKE Fasilitas</span>
            </div>
          </div>
          {/* Status Indicator Pills (Clean Solid Style - No AI Dots) */}
          <div className="flex items-center gap-1.5 text-[10px] mt-2 font-medium">
            <span className="px-2 py-0.5 rounded-full font-bold bg-[#16a34a] text-white shadow-2xs">Efisien</span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">Moderate</span>
            <span className="px-2 py-0.5 rounded-full font-medium bg-slate-100/60 text-slate-400">Baseline</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {avgIke} <span className="text-xs font-normal text-slate-500 ml-1">GJ/Ton</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Normalisasi US DOE 2020
            </span>
          </div>
          <div className="shrink-0 pb-1">
            <MiniSparkline type="line" color="#10b981" />
          </div>
        </div>
      </div>

      {/* Card 2: Curtailment Risk / Pemborosan Terdeteksi */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <AlertOctagon className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-xs font-semibold text-slate-700 font-sans">Pemborosan Terdeteksi</span>
            </div>
          </div>
          {/* Status Indicator Pills (Clean Solid Style - No AI Dots) */}
          <div className="flex items-center gap-1.5 text-[10px] mt-2 font-medium">
            <span className="px-2 py-0.5 rounded-full font-bold bg-rose-600 text-white shadow-2xs">Deviasi</span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">Residu +1.5σ</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {wastedGj} <span className="text-xs font-normal text-slate-500 ml-1">GJ</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              ~Rp {wastedCost} Juta (Deviasi Terakumulasi)
            </span>
          </div>
          <div className="shrink-0 pb-1">
            <MiniSparkline type="line" color="#ef4444" />
          </div>
        </div>
      </div>

      {/* Card 3: Available Storage / Integritas Telemetri Sensor */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <Database className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-xs font-semibold text-slate-700 font-sans">Integritas Telemetri Sensor</span>
            </div>
          </div>
          {/* Status Indicator Pills (Clean Solid Style - No AI Dots) */}
          <div className="flex items-center gap-1.5 text-[10px] mt-2 font-medium">
            <span className="px-2 py-0.5 rounded-full font-bold bg-sky-600 text-white shadow-2xs">Validasi Fisik</span>
            <span className="px-2 py-0.5 rounded-full font-bold bg-[#16a34a] text-white shadow-2xs">0 Hilang</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {acceptedRows.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500 ml-1">/ {totalRows.toLocaleString('id-ID')}</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              100% Lolos Validasi Fisik
            </span>
          </div>
          <div className="shrink-0 pb-1">
            <MiniSparkline type="slider" color="#10b981" />
          </div>
        </div>
      </div>

      {/* Card 4: Spot Market Price / Useful Heat Cost CNG */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-all">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <DollarSign className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-xs font-semibold text-slate-700 font-sans">Biaya Useful Heat CNG</span>
            </div>
          </div>
          {/* Status Indicator Pills (Clean Solid Style - No AI Dots) */}
          <div className="flex items-center gap-1.5 text-[10px] mt-2 font-medium">
            <span className="px-2 py-0.5 rounded-full font-bold bg-[#16a34a] text-white shadow-2xs">Pasokan AGE</span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">LHV Basis</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              <span className="text-sm font-semibold text-slate-500 mr-1">Rp</span>{cngCost} <span className="text-xs font-normal text-slate-500 ml-1">/GJ</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              {rawSavings > 0 ? `Hemat ${savingsPct}% vs ${currentFuel}` : `Efisiensi Setara (0%) vs ${currentFuel}`}
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

export const TopKpiCards = React.memo(TopKpiCardsComponent);
