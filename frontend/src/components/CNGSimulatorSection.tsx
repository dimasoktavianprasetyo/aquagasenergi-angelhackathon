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
import { CircularGauge } from './CircularGauge';
import { GridoraFeatureCard } from './GridoraFeatureCard';

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

const CNGSimulatorSectionComponent: React.FC<CNGSimulatorProps> = ({
  cngResult,
  params,
  onParamChange,
  onRunSimulation,
  isProcessing
}) => {
  return (
    <div className="gridora-card p-6 md:p-8 mb-8" id="section-cng-simulator">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
            <Flame className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                3. Simulator Transisi CNG & Penilaian Panas Berguna
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1 font-light leading-relaxed">
              Evaluasi tekno-ekonomi komparasi LPG vs CNG berdasarkan <em>Cost per Useful Thermal Energy (LHV Basis)</em>, Payback CAPEX, dan Reduksi Emisi CO₂.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
            Simulasi Skenario Pasokan AGE
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
            Parameter Konfigurabel
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Sliders & Parameter Controls */}
        <div className="lg:col-span-5 bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Parameter Finansial & Teknis</span>
            </span>
            <button
              onClick={onRunSimulation}
              disabled={isProcessing}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline transition-colors"
            >
              Hitung Ulang
            </button>
          </div>

          {/* Current Fuel Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Harga {params.current_fuel}:</span>
              <span className="font-sans font-bold text-amber-600">
                Rp {params.current_fuel_price_idr.toLocaleString('id-ID')} / {params.current_fuel === 'CNG' ? 'MMBTU' : params.current_fuel === 'DIESEL' ? 'liter' : 'kg'}
              </span>
            </div>
            <input
              type="range"
              min={params.current_fuel === 'CNG' ? '180000' : '10000'}
              max={params.current_fuel === 'CNG' ? '290000' : '22000'}
              step={params.current_fuel === 'CNG' ? '2500' : '250'}
              value={params.current_fuel_price_idr}
              onChange={(e) => onParamChange('current_fuel_price_idr', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Current Thermal Efficiency */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Efisiensi Termal Eksisting (Boiler):</span>
              <span className="font-sans font-bold text-amber-600">
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* CNG Price per MMBTU (Aqua Gas Energy) */}
          <div className="pt-3 border-t border-slate-200/80 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1 text-slate-800 font-semibold">
                <span>Asumsi Tarif CNG (Skenario AGE):</span>
              </span>
              <span className="font-sans font-bold text-cyan-700">
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <span className="text-[11px] text-slate-500 font-light block">Kondisi acuan standar gas industri (~$13.5/MMBTU)</span>
          </div>

          {/* Target CNG Burner Efficiency */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Efisiensi Burner Retrofit (CNG):</span>
              <span className="font-sans font-bold text-cyan-700">
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
          </div>

          {/* Retrofit CAPEX */}
          <div className="pt-3 border-t border-slate-200/80 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Estimasi CAPEX Retrofit & PRS:</span>
              <span className="font-sans font-bold text-emerald-700">
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[11px] text-slate-500 font-light block">Termasuk modifikasi dual-fuel burner & piping skid</span>
          </div>
        </div>

        {/* Results & Economic Comparison */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {cngResult ? (
            <>
              {/* Cost per Useful GJ Comparison Cards - Exact Gridora Feature Cards */}
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Komparasi Biaya per Energi Panas Berguna (Useful Heat)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gridora Card 1: Solusi Transisi CNG (AGE) */}
                  <GridoraFeatureCard
                    icon={<Flame className="w-4 h-4 text-emerald-600" />}
                    title="Skenario Transisi CNG (AGE)"
                    value={`Rp ${cngResult.cng_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`}
                    unit="/ GJ"
                    priorityText="High priority"
                    priorityColor="green"
                    benefitLabel="Expected Benefit"
                    benefitValue={`Rp ${(Math.max(0, cngResult.annual_gross_savings_idr) / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} Jt`}
                    benefitColor="text-emerald-600"
                    gaugeValue={Number(Math.max(0, cngResult.cost_savings_percent).toFixed(1))}
                    gaugeGradient="green"
                    gaugeSublabel={cngResult.cost_savings_percent >= 0 ? "HEMAT" : "OPTIMAL"}
                    description={`Efisiensi LHV 1.055 GJ/MMBTU @ ${(params.target_cng_efficiency * 100).toFixed(0)}% efisiensi. Payback investasi ${cngResult.annual_gross_savings_idr > 0 ? `${cngResult.payback_period_months.toFixed(1)} bulan.` : 'N/A (biaya setara).'}`}
                  />

                  {/* Gridora Card 2: Bahan Bakar Eksisting */}
                  <GridoraFeatureCard
                    icon={<Flame className="w-4 h-4 text-sky-600" />}
                    title={`Bahan Bakar Eksisting (${params.current_fuel})`}
                    value={`Rp ${cngResult.current_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`}
                    unit="/ GJ"
                    priorityText="Medium priority"
                    priorityColor="blue"
                    benefitLabel="Biaya Eksisting"
                    benefitValue={`Rp ${params.current_fuel_price_idr.toLocaleString('id-ID')} / ${params.current_fuel === 'CNG' ? 'MMBTU' : params.current_fuel === 'DIESEL' ? 'liter' : 'kg'}`}
                    benefitColor="text-sky-600"
                    gaugeValue={Number((params.current_thermal_efficiency * 100).toFixed(0))}
                    gaugeGradient="blue"
                    gaugeSublabel="EFISIENSI"
                    description={
                      params.current_fuel === 'CNG'
                        ? `Dasar acuan: LHV 1.055 GJ/MMBTU @ ${(params.current_thermal_efficiency * 100).toFixed(0)}% efisiensi termal pasokan retail eksisting.`
                        : params.current_fuel === 'DIESEL'
                        ? `Dasar acuan: LHV 35.8 MJ/liter @ ${(params.current_thermal_efficiency * 100).toFixed(0)}% efisiensi termal pembakaran eksisting.`
                        : `Dasar acuan: LHV 46.1 MJ/kg @ ${(params.current_thermal_efficiency * 100).toFixed(0)}% efisiensi termal pembakaran eksisting.`
                    }
                  />
                </div>
              </div>

              {/* Economic & Environmental Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Annual Savings */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Penghematan Bruto / Thn</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold font-sans text-slate-900">
                    Rp {(Math.max(0, cngResult.annual_gross_savings_idr) / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} Jt
                  </p>
                  <span className="text-xs text-emerald-600 font-medium mt-1 block">Net OPEX fuel reduction</span>
                </div>

                {/* Payback Period */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <span>Payback CAPEX</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold font-sans text-slate-900">
                    {cngResult.annual_gross_savings_idr > 0 ? `${cngResult.payback_period_months.toFixed(1)} ` : 'Optimal '}
                    <span className="text-sm font-normal text-slate-500">Bulan</span>
                  </p>
                  <span className="text-xs text-slate-500 font-normal mt-1 block">ROI: {cngResult.annual_gross_savings_idr > 0 ? cngResult.simple_roi_percent.toFixed(0) : '0'}% per tahun</span>
                </div>

                {/* Carbon Emission Reduction */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>Reduksi Emisi CO₂</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold font-sans text-slate-900">
                    {cngResult.co2_reduction_tonnes.toFixed(1)} <span className="text-sm font-normal text-slate-500">Ton/Thn</span>
                  </p>
                  <span className="text-xs text-emerald-600 font-medium mt-1 block">
                    -{cngResult.co2_reduction_percent.toFixed(1)}% faktor emisi IPCC
                  </span>
                </div>
              </div>

              {/* Recommendation Banner - Clean Neutral Executive Card */}
              <div className="p-5 rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Evaluasi Kelayakan Skenario (Simulation Decision-Support):
                    </h4>
                    <p className="text-xs mt-1.5 leading-relaxed text-slate-600 font-normal">
                      {cngResult.recommendation_summary}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[220px] flex items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center text-sm text-slate-500 font-light">
              Jalankan pipeline analitik untuk memuat data simulasi transisi CNG.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Simulation Assumption Disclaimer */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-light">
        <span>*Catatan Integritas: Seluruh kalkulasi tekno-ekonomi merupakan hasil simulasi berbasis parameter input yang dapat disesuaikan, bukan komitmen penawaran tarif komersial final AGE.</span>
        <span className="font-mono text-[10px] text-slate-400 shrink-0">LHV Basis: 1.055 GJ/MMBTU</span>
      </div>
    </div>
  );
};

export const CNGSimulatorSection = React.memo(CNGSimulatorSectionComponent);
