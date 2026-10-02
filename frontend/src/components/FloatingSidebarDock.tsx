import React from 'react';
import { LineChart, Clock, FileText, Leaf, Bell, Settings, LogOut, Flame } from 'lucide-react';

interface FloatingSidebarDockProps {
  onOpenAudit: () => void;
}

export const FloatingSidebarDock: React.FC<FloatingSidebarDockProps> = ({ onOpenAudit }) => {
  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-15 py-6 px-2 bg-[#12151e] rounded-[30px] shadow-2xl border border-white/10 shrink-0 sticky top-6 h-[calc(100vh-3rem)] max-h-[720px]">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-950 shadow-md">
          <Flame className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
        </div>

        {/* Primary Navigation Icons */}
        <nav className="flex flex-col items-center gap-3">
          <a
            href="#section-ike-baseline"
            className="w-10 h-10 rounded-2xl bg-white/15 text-white flex items-center justify-center shadow-inner transition-all hover:bg-white/25"
            title="IKE Baseline & Forecasting"
          >
            <LineChart className="w-4 h-4 text-emerald-400" />
          </a>
          <a
            href="#section-data-ingestion"
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            title="Ingesti Telemetri Data"
          >
            <Clock className="w-4 h-4" />
          </a>
          <a
            href="#section-cng-simulator"
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            title="Simulator Transisi CNG"
          >
            <Leaf className="w-4 h-4" />
          </a>
          <a
            href="#section-decision-report"
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            title="Laporan Eksekutif"
          >
            <FileText className="w-4 h-4" />
          </a>
          <button
            onClick={onOpenAudit}
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-cyan-300 hover:bg-white/10 flex items-center justify-center transition-all"
            title="Matriks Ketertelusuran Audit"
          >
            <Bell className="w-4 h-4" />
          </button>
        </nav>
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onOpenAudit}
          className="w-10 h-10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
          title="Pengaturan Audit"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-10 h-10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
          title="Kembali ke Atas"
        >
          <LogOut className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </aside>
  );
};
