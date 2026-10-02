import React, { useEffect } from 'react';
import { X, ShieldCheck, Calculator, BookOpen } from 'lucide-react';
import { TraceabilityStep } from '../types';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrail: TraceabilityStep[];
}

const TraceabilityModalComponent: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  auditTrail
}) => {
  // Prevent background body and html from scrolling while modal is open, and restore cleanly on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-fadeIn overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Solid White Enterprise Modal Shell (Crisp rounded-lg, 0 bubbly curve, no dark bleed) */}
      <div 
        className="bg-white border border-slate-200 rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-slate-900/5 overscroll-contain"
        style={{ colorScheme: 'light' }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Audit Trail &amp; Ketertelusuran Keputusan (<em>Traceability Matrix</em>)
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Memenuhi Kriteria Penerimaan Alpha: Bebas dari model <em>black-box</em>, seluruh rumus dan asumsi dapat diverifikasi teknisi berwenang.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
            title="Tutup"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Content - Crisp Architectural Cards with Moderate rounded-md */}
        <div 
          className="modal-scrollable p-5 sm:p-6 overflow-y-auto space-y-3.5 text-xs bg-slate-50/60 overscroll-contain flex-1"
          style={{ colorScheme: 'light' }}
        >
          {auditTrail.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-normal">
              Belum ada log audit yang dihasilkan. Jalankan pipeline data terlebih dahulu.
            </div>
          ) : (
            auditTrail.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-4 sm:p-5 rounded-md border border-slate-200 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
              >
                {/* Step Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 font-sans">
                      {step.step_name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{step.standard_reference}</span>
                  </span>
                </div>

                {/* Crisp Formula Bar */}
                <div className="bg-slate-50 px-3.5 py-2 rounded border border-slate-200 font-mono text-xs text-emerald-800 flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold break-all">{step.formula_applied}</span>
                </div>

                {/* 2-Column Inputs & Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Parameter Masukan:
                    </span>
                    <span className="font-mono text-xs text-slate-800 block leading-relaxed">
                      {step.input_parameters}
                    </span>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                      Hasil Kalkulasi:
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-950 block leading-relaxed">
                      {step.calculation_result}
                    </span>
                  </div>
                </div>

                {/* Engineering Rationale */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs text-slate-600 leading-relaxed font-sans">
                  <strong className="text-slate-900 font-semibold">Rasional Rekayasa:</strong> {step.engineering_rationale}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-3 text-xs shrink-0">
          <span className="text-slate-500 font-normal text-center sm:text-left">
            Standar: US DOE Guidance (2020) • ASHRAE 14 • IPCC 2006 • Standar Mutu Gas PT Aqua Gas Energi
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer text-xs shadow-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

export const TraceabilityModal = React.memo(TraceabilityModalComponent);
