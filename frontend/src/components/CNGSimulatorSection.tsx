import React from 'react';
import {
  Flame,
  ArrowRight,
  TrendingDown,
  Clock,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Sliders,
  Sparkles
} from 'lucide-react';
import { CNGSimResult } from '../types';

interface CNGSimulatorProps {
  cngResult: CNGSimResult | null;
  params: {
    current_fuel: string;
    current_fuel_price_idr: number;
    current_thermal_efficiency: number;
    cng_price_idr_per_mmbtu: number;
    target_cng_efficiency: number;
    retrofit_capex_idr: number;
  };
  onParamChange: (key: string, value: number) => void;
  onRunSimulation: () => void;
  isProcessing: boolean;
}

export const CNGSimulatorSection: React.FC<CNGSimulatorProps> = ({
  cngResult,
  params,
  onParamChange,
  onRunSimulation,
  isProcessing
}) => {
  return (
    <div className="glass-panel p-6 mb-6" id="section-cng-simulator">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">3. Simulator Transisi CNG & Penilaian Panas Berguna</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluasi tekno-ekonomi komparasi LPG vs CNG berdasarkan <em>Cost per Useful Thermal Energy (LHV Basis)</em>, Payback CAPEX, dan Reduksi Emisi CO₂.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-cyan text-xs">Jaringan Suplai: PT Aqua Gas Energi</span>
          <span className="badge-emerald text-xs">Blue Flame Transition</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Sliders & Parameter Controls */}
        <div className="lg:col-span-5 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Parameter Finansial & Teknis</span>
            </span>
            <button
              onClick={onRunSimulation}
              disabled={isProcessing}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Hitung Ulang
            </button>
          </div>

          {/* Current Fuel Price */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Harga {params.current_fuel}:</span>
              <span className="font-mono font-bold text-amber-400">
                Rp {params.current_fuel_price_idr.toLocaleString('id-ID')} / {params.current_fuel === 'DIESEL' ? 'liter' : 'kg'}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="22000"
              step="250"
              value={params.current_fuel_price_idr}
              onChange={(e) => onParamChange('current_fuel_price_idr', parseFloat(e.target.value))}
            />
          </div>

          {/* Current Thermal Efficiency */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Efisiensi Termal Eksisting (Boiler):</span>
              <span className="font-mono font-bold text-amber-400">
                {(params.current_thermal_efficiency * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.65"
              max="0.88"
              step="0.01"
              value={params.current_thermal_efficiency}
              onChange={(e) => onParamChange('current_thermal_efficiency', parseFloat(e.target.value))}
            />
          </div>

          {/* CNG Price per MMBTU (Aqua Gas Energy) */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-cyan-300">
                <span>Tarif CNG (PT Aqua Gas Energi):</span>
              </span>
              <span className="font-mono font-bold text-cyan-400">
                Rp {params.cng_price_idr_per_mmbtu.toLocaleString('id-ID')} / MMBTU
              </span>
            </div>
            <input
              type="range"
              min="170000"
              max="260000"
              step="2500"
              value={params.cng_price_idr_per_mmbtu}
              onChange={(e) => onParamChange('cng_price_idr_per_mmbtu', parseFloat(e.target.value))}
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Kondisi acuan standar gas industri (~$13.5/MMBTU)</span>
          </div>

          {/* Target CNG Burner Efficiency */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Efisiensi Burner Retrofit (CNG):</span>
              <span className="font-mono font-bold text-cyan-400">
                {(params.target_cng_efficiency * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="0.92"
              step="0.01"
              value={params.target_cng_efficiency}
              onChange={(e) => onParamChange('target_cng_efficiency', parseFloat(e.target.value))}
            />
          </div>

          {/* Retrofit CAPEX */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Estimasi CAPEX Retrofit & PRS:</span>
              <span className="font-mono font-bold text-emerald-400">
                Rp {(params.retrofit_capex_idr / 1000000).toFixed(0)} Juta
              </span>
            </div>
            <input
              type="range"
              min="50000000"
              max="300000000"
              step="5000000"
              value={params.retrofit_capex_idr}
              onChange={(e) => onParamChange('retrofit_capex_idr', parseFloat(e.target.value))}
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Termasuk modifikasi dual-fuel burner & piping skid</span>
          </div>
        </div>

        {/* Results & Economic Comparison */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {cngResult ? (
            <>
              {/* Cost per Useful GJ Comparison Card */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold block mb-3">
                  Komparasi Biaya per Energi Panas Berguna (Useful Heat)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Existing */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/20">
                    <span className="text-[11px] text-amber-400 uppercase font-semibold">Bahan Bakar Eksisting ({params.current_fuel})</span>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      Rp {cngResult.current_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      <span className="text-xs text-slate-400 font-normal"> / GJ Useful</span>
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Dasar: LHV 46.1 MJ/kg @ {params.current_thermal_efficiency * 100}% efisiensi
                    </span>
                  </div>

                  {/* CNG */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-cyan-400 uppercase font-semibold">Solusi Transisi CNG (AGE)</span>
                      <span className="badge-emerald text-[10px]">
                        -{cngResult.cost_savings_percent.toFixed(1)}% Lebih Hemat
                      </span>
                    </div>
                    <p className="text-xl font-bold font-mono text-cyan-300 mt-1">
                      Rp {cngResult.cng_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      <span className="text-xs text-slate-400 font-normal"> / GJ Useful</span>
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Dasar: LHV 1.055 GJ/MMBTU @ {params.target_cng_efficiency * 100}% efisiensi
                    </span>
                  </div>
                </div>
              </div>

              {/* Economic & Environmental Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Annual Savings */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Penghematan Bruto / Thn</span>
                  </div>
                  <p className="text-lg font-bold font-mono text-emerald-400">
                    Rp {(cngResult.annual_gross_savings_idr / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} Jt
                  </p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Net OPEX fuel reduction</span>
                </div>

                {/* Payback Period */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Payback CAPEX</span>
                  </div>
                  <p className="text-lg font-bold font-mono text-cyan-300">
                    {cngResult.payback_period_months.toFixed(1)} <span className="text-xs font-normal text-slate-400">Bulan</span>
                  </p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">ROI: {cngResult.simple_roi_percent.toFixed(0)}% per tahun</span>
                </div>

                {/* Carbon Emission Reduction */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reduksi Emisi CO₂</span>
                  </div>
                  <p className="text-lg font-bold font-mono text-emerald-300">
                    {cngResult.co2_reduction_tonnes.toFixed(1)} <span className="text-xs font-normal text-slate-400">Ton/Thn</span>
                  </p>
                  <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                    -{cngResult.co2_reduction_percent.toFixed(1)}% faktor emisi IPCC
                  </span>
                </div>
              </div>

              {/* Recommendation Banner */}
              <div className={`p-4 rounded-xl border ${cngResult.is_recommended ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' : 'bg-amber-950/20 border-amber-500/40 text-amber-200'}`}>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Rekomendasi Keputusan Copilot (Traceable Verdict):
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed text-slate-300">
                      {cngResult.recommendation_summary}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-slate-900/30 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
              Jalankan pipeline analitik untuk memuat data simulasi transisi CNG.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
