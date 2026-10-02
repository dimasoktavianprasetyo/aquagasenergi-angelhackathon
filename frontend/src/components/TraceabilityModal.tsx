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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f131a] border border-white/10 rounded-[28px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3.5">
            <div className="icon-circle-soft shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                Audit Trail & Ketertelusuran Keputusan (<em>Traceability Matrix</em>)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-light">
                Memenuhi Kriteria Penerimaan Alpha: Bebas dari model <em>black-box</em>, seluruh rumus dan asumsi dapat diverifikasi teknisi berwenang.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content / Timeline */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {auditTrail.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-light">
              Belum ada log audit yang dihasilkan. Jalankan pipeline data terlebih dahulu.
            </div>
          ) : (
            auditTrail.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 p-5 rounded-2xl border border-white/[0.06] space-y-3 hover:border-emerald-500/30 transition-all shadow-sm"
              >
                {/* Step header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 font-semibold text-emerald-300">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-white font-medium">{step.step_name}</span>
                  </div>
                  <span className="pill-tag bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[11px] flex items-center gap-1.5 self-start sm:self-auto">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{step.standard_reference}</span>
                  </span>
                </div>

                {/* Formula */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/[0.06] font-mono text-xs text-emerald-300 flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="break-all">{step.formula_applied}</span>
                </div>

                {/* Parameters & Result */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-medium">Parameter Masukan:</span>
                    <span className="font-mono text-xs text-slate-200 mt-1 block">{step.input_parameters}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-medium">Hasil Kalkulasi:</span>
                    <span className="font-mono text-xs text-cyan-300 font-semibold mt-1 block">{step.calculation_result}</span>
                  </div>
                </div>

                {/* Engineering Rationale */}
                <p className="text-slate-400 text-xs italic bg-slate-950/50 p-3 rounded-xl border border-white/[0.04] font-light leading-relaxed">
                  <strong className="text-slate-300 not-italic font-medium">Rasional Rekayasa:</strong> {step.engineering_rationale}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/[0.08] bg-slate-950/60 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <span className="text-slate-400 font-light text-center sm:text-left">
            Standar: US DOE Guidance (2020) • ASHRAE 14 • IPCC 2006 • Standar Mutu Gas PT Aqua Gas Energi
          </span>
          <button
            onClick={onClose}
            className="btn-gridora-secondary py-2 px-5 text-xs w-full sm:w-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
