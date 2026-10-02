import React from 'react';
import { X, ShieldCheck, BookOpen, Layers, Calculator, CheckCircle2 } from 'lucide-react';
import { TraceabilityStep } from '../types';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrail: TraceabilityStep[];
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  auditTrail
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Audit Trail & Ketertelusuran Keputusan (*Traceability Matrix*)
              </h2>
              <p className="text-xs text-slate-400">
                Memenuhi Kriteria Penerimaan Alpha: Bebas dari model <em>black-box</em>, seluruh rumus dan asumsi dapat diverifikasi teknisi berwenang.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Timeline */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {auditTrail.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Belum ada log audit yang dihasilkan. Jalankan pipeline data terlebih dahulu.
            </div>
          ) : (
            auditTrail.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2.5 hover:border-cyan-500/30 transition-colors"
              >
                {/* Step header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-cyan-300">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono">
                      {idx + 1}
                    </span>
                    <span>{step.step_name}</span>
                  </div>
                  <span className="badge-cyan text-[10px] flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{step.standard_reference}</span>
                  </span>
                </div>

                {/* Formula */}
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{step.formula_applied}</span>
                </div>

                {/* Parameters & Result */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Parameter Masukan:</span>
                    <span className="font-mono text-[11px] text-slate-300">{step.input_parameters}</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Hasil Kalkulasi:</span>
                    <span className="font-mono text-[11px] text-cyan-300 font-semibold">{step.calculation_result}</span>
                  </div>
                </div>

                {/* Engineering Rationale */}
                <p className="text-slate-400 text-[11px] italic bg-slate-900/30 p-2 rounded border border-slate-900">
                  <strong>Rasional Rekayasa:</strong> {step.engineering_rationale}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Standar: US DOE Guidance (2020) • ASHRAE 14 • IPCC 2006 • Standar Mutu Gas PT Aqua Gas Energi
          </span>
          <button
            onClick={onClose}
            className="btn-secondary py-1.5 px-4 text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
