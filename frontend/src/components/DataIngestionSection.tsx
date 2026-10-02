import React, { useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Layers, ShieldCheck, HelpCircle, FileCheck, AlertCircle } from 'lucide-react';
import { QualityReport } from '../types';
import { CircularGauge } from './CircularGauge';

interface DataIngestionProps {
  qualityReport: QualityReport | null;
  onFileUpload: (fileContent: string, filename: string, fuelType: string) => void;
  selectedFuel: string;
  onFuelChange: (fuel: string) => void;
  isProcessing: boolean;
}

export const DataIngestionSection: React.FC<DataIngestionProps> = ({
  qualityReport,
  onFileUpload,
  selectedFuel,
  onFuelChange,
  isProcessing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onFileUpload(text, file.name, selectedFuel);
      };
      reader.readAsText(file);
    }
  };

  const validityPercentage = qualityReport && qualityReport.total_rows > 0
    ? Math.round((qualityReport.accepted_rows / qualityReport.total_rows) * 100)
    : 100;

  return (
    <div className="gridora-card p-6 md:p-8 mb-8" id="section-data-ingestion">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 shrink-0 shadow-2xs">
            <Layers className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 font-sans">
              1. Data Ingestion & Quality Audit (Tahap Alpha)
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Validasi format, konsistensi satuan, penanganan nilai hilang, dan identifikasi pembakaran idle (*zero output*).
            </p>
          </div>
        </div>

        {/* Fuel Selector as Rounded Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200 self-stretch md:self-auto justify-end">
          <span className="text-xs text-slate-600 font-medium px-2 font-sans">Bahan Bakar Eksisting:</span>
          {(['LPG', 'DIESEL', 'CNG'] as const).map((fuel) => (
            <button
              key={fuel}
              type="button"
              onClick={() => onFuelChange(fuel)}
              disabled={isProcessing}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                selectedFuel === fuel
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Upload Zone (Left Column) */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
            id="csv-file-input"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50/70 hover:bg-slate-100/70 p-7 rounded-[24px] cursor-pointer text-center transition-all flex flex-col items-center justify-center group h-full min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3.5 transition-all text-slate-700 group-hover:bg-slate-200">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900 font-sans">Klik untuk Unggah CSV Fasilitas Mandiri</p>
            <p className="text-xs text-slate-500 mt-1 font-sans max-w-xs">
              Kolom wajib: timestamp, production_output, operating_hours, fuel_consumption
            </p>
            <span className="mt-3 text-xs text-slate-400 font-normal">
              Atau uji dengan 3-Tier Kasus Industri (Sensor Riil / Skenario Simulasi) di atas
            </span>
          </div>
        </div>

        {/* Quality Audit Cards (Right Column) */}
        <div className="lg:col-span-8">
          {qualityReport ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Circular Gauge Validity */}
                <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Integritas Data</span>
                    <p className="text-2xl font-bold font-sans text-slate-900 mt-1">
                      {qualityReport.accepted_rows} <span className="text-xs text-slate-500 font-normal">/ {qualityReport.total_rows} baris</span>
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{qualityReport.is_valid ? 'Lolos Audit' : 'Perlu Koreksi'}</span>
                    </span>
                  </div>
                  <CircularGauge
                    value={validityPercentage}
                    size={76}
                    strokeWidth={6}
                    colorGradient="green"
                    textColor="dark"
                    variant="circle"
                    unit="%"
                  />
                </div>

                {/* Card 2: Valid Rows Count */}
                <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-semibold">Diterima (Valid)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-slate-900 my-2">
                    {qualityReport.accepted_rows}
                  </p>
                  <span className="text-xs text-slate-500 font-normal">Siap untuk regresi US DOE</span>
                </div>

                {/* Card 3: Rejected Rows Count */}
                <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-semibold">Ditolak (Cacat)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-slate-900 my-2">
                    {qualityReport.rejected_rows}
                  </p>
                  <span className="text-xs text-slate-500 font-normal">Nilai negatif / corrupt</span>
                </div>
              </div>

              {/* Message Banner - Clean Neutral Style */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-700 flex items-start gap-3 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-sans">{qualityReport.summary_message}</span>
              </div>

              {/* Quality Issues / Edge Cases Table */}
              {qualityReport.issues.length > 0 && (
                <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 max-h-40 overflow-y-auto shadow-2xs">
                  <div className="text-xs font-semibold text-slate-800 mb-2.5 flex items-center gap-2 font-sans">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Catatan Audit & Anomali Operasional ({qualityReport.issues.length} Temuan):</span>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {qualityReport.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[10px] shrink-0 font-bold">{issue.issue_type}</span>
                        <span className="text-slate-700 font-mono text-[11px] leading-relaxed">{issue.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 bg-slate-50 rounded-[24px] border border-slate-200 text-center">
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-base font-bold text-slate-800 font-sans">Belum ada data yang dianalisis.</p>
              <p className="text-xs text-slate-500 mt-1 font-sans">Unggah file CSV atau klik "Muat Dataset Demo Boiler" di atas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
