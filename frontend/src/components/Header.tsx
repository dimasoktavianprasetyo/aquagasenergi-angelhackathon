import React from 'react';
import { Flame, Activity, Cpu, CheckCircle2, AlertCircle, PlayCircle, RefreshCw, Database, Clock } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  activeCase: 'INDMIRA' | 'US_DOE' | 'KAGGLE_REAL';
  onSelectCase: (caseType: 'INDMIRA' | 'US_DOE' | 'KAGGLE_REAL') => void;
  granularity: 'DAILY' | 'HOURLY';
  onSelectGranularity: (granularity: 'DAILY' | 'HOURLY') => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  activeCase,
  onSelectCase,
  granularity,
  onSelectGranularity,
  isProcessing
}) => {
  return (
    <header className="glass-panel p-5 mb-6 border-b border-cyan-500/20" id="app-header">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Branding & Hackathon identity */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
            <Flame className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Industrial Energy Efficiency <span className="text-cyan-400">Copilot</span>
              </h1>
              <span className="badge-cyan text-xs hidden sm:inline-flex">ALPHA PROTOTYPE</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span className="text-slate-300 font-medium">ANGEL Innovation Hackathon 2026</span>
              <span className="text-slate-600">•</span>
              <span>Pengusul Solusi: <strong className="text-cyan-400">PT Aqua Gas Energi (AGE)</strong></span>
              <span className="text-slate-600">•</span>
              <span>Problem Owner Target: <strong className="text-emerald-400">PT Indmira Global Energi</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Case Study Switcher, Granularity Toggle & Microservice Badges */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Microservice Badges */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
              <span className={wsConnected ? 'text-emerald-300' : 'text-rose-400'}>
                {wsConnected ? 'WS Gateway: 8000' : 'WS Disconnected'}
              </span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>gRPC: 50051/50052</span>
            </span>
          </div>

          {/* Granularity Switcher (Daily vs Hourly) */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Resolusi:</span>
            </span>
            <button
              id="btn-granularity-daily"
              onClick={() => onSelectGranularity('DAILY')}
              disabled={isProcessing}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                granularity === 'DAILY'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              📅 Harian
            </button>
            <button
              id="btn-granularity-hourly"
              onClick={() => onSelectGranularity('HOURLY')}
              disabled={isProcessing}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                granularity === 'HOURLY'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              ⏱️ Per Jam (SCADA)
            </button>
          </div>

          {/* Case Study Switcher Dropdown */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Database className="w-3 h-3 text-cyan-400" />
              <span>Studi Kasus:</span>
            </span>
            <button
              id="btn-case-indmira"
              onClick={() => onSelectCase('INDMIRA')}
              disabled={isProcessing}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCase === 'INDMIRA'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              1. PT Indmira (LPG)
            </button>
            <button
              id="btn-case-doe"
              onClick={() => onSelectCase('US_DOE')}
              disabled={isProcessing}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCase === 'US_DOE'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              2. US DOE Benchmark (Solar)
            </button>
            <button
              id="btn-case-kaggle"
              onClick={() => onSelectCase('KAGGLE_REAL')}
              disabled={isProcessing}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCase === 'KAGGLE_REAL'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              3. Kaggle / Nature (Sensor Riil 60T)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
