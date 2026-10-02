import React from 'react';
import { Flame, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react';
import { BaselineResponse, CNGSimResult } from '../types';
import { CircularGauge } from './CircularGauge';

interface RightSidebarPanelProps {
  baseline: BaselineResponse | null;
  cng: CNGSimResult | null;
  currentFuel: string;
  onOpenSimulator: () => void;
}

export const RightSidebarPanel: React.FC<RightSidebarPanelProps> = React.memo(({
  baseline,
  cng,
  currentFuel,
  onOpenSimulator
}) => {
  const rSquared = baseline ? (baseline.model.r_squared * 100).toFixed(0) : '92';
  const annualSavings = cng ? (cng.annual_gross_savings_idr / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '321';
  const paybackMonths = cng ? cng.payback_period_months.toFixed(1) : '6.2';
  const rawSavings = cng ? cng.cost_savings_percent : 58.5;
  const savingsPct = Math.max(0, rawSavings).toFixed(1);
  const cngCost = cng ? cng.cng_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '156.402';
  const existingCost = cng ? cng.current_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '376.540';
  const co2Tonnes = cng ? cng.co2_reduction_tonnes.toFixed(1) : '48.2';
  const co2Pct = cng ? cng.co2_reduction_percent.toFixed(1) : '24.1';

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Upper Card: Forest Green Gradient Recommendation Card (Exact from User Screenshot) */}
      <div className="gridora-card-forest p-6 flex flex-col justify-between shadow-lg">
        <div>
          {/* Top Row: Icon + Badge + Arrow Action */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
                <Flame className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/25">
                Recommended
              </span>
            </div>
            <button
              onClick={onOpenSimulator}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all backdrop-blur-sm"
              title="Buka Parameter Simulator"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Description */}
          <h3 className="text-2xl font-bold tracking-tight text-white font-sans">
            Solusi Transisi CNG (AGE)
          </h3>
          <p className="text-xs text-emerald-50/90 font-light mt-1.5 leading-relaxed font-sans">
            Konversi bahan bakar dari {currentFuel} ke CNG (Compressed Natural Gas) menekan biaya Useful Heat dan meminimalisir emisi karbon industri.
          </p>
        </div>

        {/* Bottom 3-Metric Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-5 mt-5 border-t border-white/15 text-xs">
          <div>
            <span className="text-[10px] text-emerald-200/90 uppercase tracking-wider block font-medium">Confidence</span>
            <span className="text-base font-bold text-white font-sans mt-0.5 block">R² {rSquared}%</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200/90 uppercase tracking-wider block font-medium">Expected Benefit</span>
            <span className="text-base font-bold text-emerald-300 font-sans mt-0.5 block">Rp {annualSavings} Jt</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200/90 uppercase tracking-wider block font-medium">Timescale</span>
            <span className="text-base font-bold text-white font-sans mt-0.5 block">{paybackMonths} Bulan</span>
          </div>
        </div>
      </div>

      {/* Lower Card: Generation Sources & Useful Heat Breakdown (Exact from User Screenshot) */}
      <div className="gridora-card-white p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
            Komparasi Biaya Useful Heat & Emisi
          </h4>
          <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {rawSavings > 0 ? `Hemat ${savingsPct}%` : 'Optimal (0%)'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Left: Donut / Circular Gauge */}
          <div className="shrink-0 flex flex-col items-center">
            <CircularGauge
              value={Number(savingsPct)}
              size={110}
              strokeWidth={9}
              colorGradient="green"
              textColor="dark"
              variant="circle"
              unit="%"
              sublabel="EFISIENSI"
            />
            <span className="text-[11px] text-slate-500 font-medium mt-1">Efisiensi Biaya</span>
          </div>

          {/* Right: Colored Bullet Points Breakdown */}
          <div className="flex-1 w-full space-y-2 text-xs">
            {/* Source 1: Existing Fuel */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>{currentFuel} Eksisting:</span>
              </span>
              <span className="font-semibold text-slate-900 font-mono">Rp {existingCost}</span>
            </div>

            {/* Source 2: CNG PT Aqua Gas Energi */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                <span>CNG (Aqua Gas Energi):</span>
              </span>
              <span className="font-bold text-emerald-700 font-mono">Rp {cngCost}</span>
            </div>

            {/* Source 3: Reduksi Emisi CO2 */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0"></span>
                <span>Reduksi Emisi CO₂:</span>
              </span>
              <span className="font-semibold text-teal-700 font-mono">-{co2Pct}%</span>
            </div>

            {/* Source 4: Payback Period */}
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>Payback CAPEX:</span>
              </span>
              <span className="font-semibold text-blue-700 font-mono">{paybackMonths} Bln</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
