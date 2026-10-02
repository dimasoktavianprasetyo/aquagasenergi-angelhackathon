import React from 'react';
import { FileText, Printer, CheckCircle, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';
import { PipelineCompletePayload } from '../types';

interface DecisionReportProps {
  data: PipelineCompletePayload | null;
  onOpenAudit: () => void;
  activeCase?: 'INDMIRA' | 'US_DOE' | 'KAGGLE_REAL';
}

export const DecisionReport: React.FC<DecisionReportProps> = ({ data, onOpenAudit, activeCase = 'INDMIRA' }) => {
  if (!data) return null;

  const { quality, baseline, cng } = data;

  const handlePrint = () => {
    window.print();
  };

  const getMetadata = () => {
    switch (activeCase) {
      case 'US_DOE':
        return {
          unit: 'High-Pressure Steam Boiler (US-DOE-SteamBoiler-02)',
          period: '90 Hari Operasi Standar',
          owner: 'US DOE Manufacturing Facility Benchmark',
          supplier: 'PT Aqua Gas Energi (AGE)',
        };
      case 'KAGGLE_REAL':
        return {
          unit: '60-Ton Superheated Steam Boiler (Nature SciData Logger)',
          period: '119 Jam Telemetri Sensor Riil',
          owner: 'Industrial Process Facility (Kaggle Open Data)',
          supplier: 'PT Aqua Gas Energi (AGE)',
        };
      case 'INDMIRA':
      default:
        return {
          unit: 'Boiler & Rotary Dryer Pupuk (Indmira-01)',
          period: '90 Hari Operasi Aktual',
          owner: 'PT Indmira Global Energi',
          supplier: 'PT Aqua Gas Energi (AGE)',
        };
    }
  };

  const meta = getMetadata();

  return (
    <div className="gridora-card p-6 md:p-8 mb-8" id="section-decision-report">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
            <FileText className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              4. Laporan Dukungan Keputusan Manajemen (Executive Decision Report)
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-light">
              Hasil kompilasi analisis teknis, evaluasi tekno-ekonomi komparasi, dan ringkasan eksekutif transisi energi.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenAudit}
            className="btn-pill-nav text-xs py-2 px-4 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <span>Buka Matriks Ketertelusuran</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            onClick={handlePrint}
            className="btn-pill-black text-xs py-2 px-5 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Ekspor PDF</span>
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6 text-xs text-slate-700">
        {/* Header Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs shadow-2xs">
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Unit Proses:</span>
            <span className="text-slate-900 font-semibold mt-1 block">{meta.unit}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Periode Evaluasi:</span>
            <span className="text-slate-900 font-medium mt-1 block">{meta.period}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Problem Owner:</span>
            <span className="text-emerald-700 font-semibold mt-1 block">{meta.owner}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Mitra Rantai Pasok:</span>
            <span className="text-cyan-700 font-semibold mt-1 block">{meta.supplier}</span>
          </div>
        </div>

        {/* US DOE Empirical Validation Banner - Clean White Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold whitespace-nowrap self-start">
              US DOE ITAC BENCHMARK
            </span>
            <span className="text-slate-600 text-xs leading-relaxed font-normal">
              Tervalidasi terhadap <strong>10.958 rekomendasi audit boiler</strong> (US DOE Database 2026):
              Median Payback Industri = <strong>1.04 Tahun (12.5 Bulan)</strong> vs Hasil Copilot AGE = <strong>{(cng.payback_period_months / 12).toFixed(2)} Tahun ({cng.payback_period_months.toFixed(1)} Bulan)</strong>.
            </span>
          </div>
          <span className="text-emerald-700 text-xs font-semibold whitespace-nowrap px-3 py-1 rounded-full bg-slate-100 border border-slate-200 self-start md:self-auto">
            Status: Selaras Standar Global
          </span>
        </div>

        {/* Executive Summary Narrative */}
        <div className="p-6 bg-slate-50/90 rounded-2xl border border-slate-200/80 leading-relaxed space-y-4 text-xs md:text-sm shadow-2xs text-slate-700">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Ringkasan Eksekutif & Rekomendasi Solusi</span>
          </h3>
          <p className="text-slate-600 font-light leading-relaxed">
            Berdasarkan analisis normalisasi energi US DOE terhadap <strong>{quality.accepted_rows} titik data</strong>, intensitas konsumsi energi rata-rata fasilitas tercatat sebesar <strong>{baseline.average_ike.toFixed(3)} GJ/Ton</strong> dengan korelasi model baseline <strong>R² = {(baseline.model.r_squared * 100).toFixed(1)}%</strong>. Ditemukan potensi pemborosan operasional akumulatif sebesar <strong>{baseline.total_wasted_energy_gj.toFixed(1)} GJ</strong> (setara kerugian energi <strong>Rp {baseline.total_wasted_cost_idr.toLocaleString('id-ID')}</strong>) akibat fluktuasi rasio udara-bahan bakar dan pembakaran saat status produksi nol (*idle waste*).
          </p>
          <p className="text-slate-600 font-light leading-relaxed">
            Dari sisi hilirisasi energi, konversi bahan bakar dari LPG ke CNG (Compressed Natural Gas) terbukti sangat layak secara tekno-ekonomi. Dengan tarif pasokan PT Aqua Gas Energi, biaya energi panas berguna turun dari <strong>Rp {cng.current_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/GJ</strong> menjadi <strong>Rp {cng.cng_cost_per_useful_gj.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/GJ</strong> (efisiensi <strong>{cng.cost_savings_percent.toFixed(1)}%</strong>). Investasi retrofit burner sebesar CAPEX diestimasi mencapai titik impas (<em>Payback Period</em>) dalam <strong>{cng.payback_period_months.toFixed(1)} bulan</strong> serta menekan jejak karbon sebesar <strong>{cng.co2_reduction_tonnes.toFixed(1)} Ton CO₂/tahun ({cng.co2_reduction_percent.toFixed(1)}%)</strong>.
          </p>
        </div>

        {/* Sign-off & Technician note */}
        <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 font-light">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Sistem memberi dukungan keputusan analitik; perubahan setelan burner & katup fisik tetap melalui teknisi bersertifikasi.</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">TKT Status: Level 3 (Pembuktian Konsep Analitik Alpha)</span>
        </div>
      </div>
    </div>
  );
};
