import React, { useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Layers, ShieldCheck, HelpCircle } from 'lucide-react';
import { QualityReport } from '../types';

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

  return (
    <div className="glass-panel p-6 mb-6" id="section-data-ingestion">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">1. Data Ingestion & Quality Audit (Tahap Alpha)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validasi format, konsistensi satuan, penanganan nilai hilang, dan identifikasi pembakaran idle (*zero output*).
          </p>
        </div>

        {/* Fuel selector */}
        <div className="flex items-center gap-3 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 pl-2">Bahan Bakar Eksisting:</span>
          {(['LPG', 'DIESEL', 'CNG'] as const).map((fuel) => (
            <button
              key={fuel}
              type="button"
              onClick={() => onFuelChange(fuel)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedFuel === fuel
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Upload Zone */}
        <div className="lg:col-span-1 flex flex-col justify-center">
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
            className="border-2 border-dashed border-slate-700 hover:border-cyan-400/60 bg-slate-900/40 hover:bg-slate-900/70 p-6 rounded-2xl cursor-pointer text-center transition-all flex flex-col items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-cyan-500/20 flex items-center justify-center mb-3 transition-colors">
              <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Klik untuk Unggah CSV Fasilitas</p>
            <p className="text-xs text-slate-400 mt-1">Kolom wajib: timestamp, production_output, operating_hours, fuel_consumption</p>
            <span className="mt-3 badge-cyan text-xs">Atau gunakan tombol "Muat Dataset Demo"</span>
          </div>
        </div>

        {/* Quality Audit Summary */}
        <div className="lg:col-span-2">
          {qualityReport ? (
            <div className="flex flex-col h-full justify-between">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Total Baris</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">{qualityReport.total_rows}</p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Diterima (Valid)</span>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{qualityReport.accepted_rows}</p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Ditolak (Cacat)</span>
                  <p className="text-xl font-bold font-mono text-rose-400 mt-1">{qualityReport.rejected_rows}</p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Status Mutu</span>
                  <p className="text-sm font-bold text-cyan-300 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{qualityReport.is_valid ? 'Lolos Audit' : 'Perlu Koreksi'}</span>
                  </p>
                </div>
              </div>

              {/* Message Banner */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{qualityReport.summary_message}</span>
              </div>

              {/* Quality Issues / Edge Cases Table */}
              {qualityReport.issues.length > 0 && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
                  <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Catatan Audit & Anomali Operasional ({qualityReport.issues.length} Temuan):</span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {qualityReport.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800/80">
                        <span className="badge-amber text-[10px] shrink-0">{issue.issue_type}</span>
                        <span className="text-slate-300 font-mono text-[11px]">{issue.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900/20 rounded-2xl border border-slate-800/60 text-center">
              <FileSpreadsheet className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">Belum ada data yang dianalisis.</p>
              <p className="text-xs text-slate-500 mt-1">Unggah file CSV atau klik "Muat Dataset Demo Boiler" di atas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
