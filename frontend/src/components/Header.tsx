import React, { useState, useRef, useEffect } from 'react';
import { Flame, Cpu, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronDown, UploadCloud, Check } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  activeCase: 'INDMIRA' | 'US_DOE' | 'KAGGLE_REAL';
  onSelectCase: (caseType: 'INDMIRA' | 'US_DOE' | 'KAGGLE_REAL') => void;
  isProcessing: boolean;
  onTriggerUpload?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  activeCase,
  onSelectCase,
  isProcessing,
  onTriggerUpload
}) => {
  const cases: ('INDMIRA' | 'US_DOE' | 'KAGGLE_REAL')[] = ['INDMIRA', 'US_DOE', 'KAGGLE_REAL'];
  const currentIndex = cases.indexOf(activeCase);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevCase = () => {
    const nextIndex = (currentIndex - 1 + cases.length) % cases.length;
    onSelectCase(cases[nextIndex]);
  };

  const handleNextCase = () => {
    const nextIndex = (currentIndex + 1) % cases.length;
    onSelectCase(cases[nextIndex]);
  };

  const caseOptions = [
    {
      id: 'INDMIRA' as const,
      label: '1. PT Indmira Agro-Industrial (LPG)',
      shortLabel: '1. PT Indmira (LPG)',
      tag: 'LPG Baseline',
      desc: 'Audit 90 hari boiler steam, anomali idle pembakaran'
    },
    {
      id: 'US_DOE' as const,
      label: '2. US DOE Benchmark (Solar)',
      shortLabel: '2. US DOE (Solar)',
      tag: 'Solar HSD',
      desc: '10.958 rekomendasi audit boiler ITAC Database 2026'
    },
    {
      id: 'KAGGLE_REAL' as const,
      label: '3. Kaggle 60T (Sensor Riil)',
      shortLabel: '3. Kaggle 60T (Sensor)',
      tag: 'IoT Sensor',
      desc: 'Telemetri boiler industri 60 Ton/Jam stream riil'
    }
  ];

  return (
    <header className="mb-7" id="app-header">
      {/* Top Desktop Navigation Bar (Exact Gridora Desktop Style) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        {/* Left: Brand Icon Pill & Top Nav Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md shrink-0">
            <Flame className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <a href="#section-data-ingestion" className="btn-pill-nav">
              Overview
            </a>
            <a href="#section-ike-baseline" className="btn-pill-nav-active">
              Forecast & Balancing
            </a>
            <a href="#section-cng-simulator" className="btn-pill-nav">
              Operations
            </a>
            <a href="#section-decision-report" className="btn-pill-nav">
              Assets & Reports
            </a>
            <span className="text-slate-300 mx-1 hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
                <span className={wsConnected ? 'text-emerald-700 font-medium' : 'text-rose-600'}>
                  {wsConnected ? 'WS: 8000' : 'WS Offline'}
                </span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-600" />
                <span>gRPC: 50051</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Search & Team Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-xs hover:bg-slate-50 cursor-pointer transition-all">
            <Search className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-slate-200/80 rounded-full shadow-xs">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              AG
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans hidden sm:inline">PT Aqua Gas Energi</span>
          </div>
        </div>
      </div>

      {/* Main Title & Action Row (Exact Clean Executive Style from Desain 2) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mt-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 font-sans">
            Industrial Energy Efficiency Copilot
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-normal mt-1 leading-relaxed font-sans">
            AI-powered forecasting and optimization for a cleaner, more profitable energy system.
          </p>
        </div>

        {/* Right: Dataset Switcher + Upload CSV + Simulasi Ulang (All in ONE single sleek row with IDENTICAL h-10 HEIGHT) */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch lg:self-auto justify-start lg:justify-end">
          {/* Custom Case Study Switcher Dropdown (Height: h-10) */}
          <div ref={dropdownRef} className="relative">
            <div className="h-10 flex items-center bg-white border border-slate-200/80 rounded-full shadow-2xs px-1 text-xs text-slate-700 font-medium">
              <button
                onClick={handlePrevCase}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors shrink-0"
                title="Kasus Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold text-slate-900 hover:text-slate-950 transition-colors cursor-pointer select-none"
              >
                <span className="truncate max-w-[210px] text-left">
                  {caseOptions.find((c) => c.id === activeCase)?.shortLabel || 'Pilih Kasus'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-slate-900' : ''}`} />
              </button>

              <button
                onClick={handleNextCase}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors shrink-0"
                title="Kasus Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom Floating Dropdown Menu Card */}
            {isDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Kasus Industri
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                    3 Skenario
                  </span>
                </div>
                <div className="p-1.5 space-y-1">
                  {caseOptions.map((opt) => {
                    const isSelected = activeCase === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onSelectCase(opt.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100/90 text-slate-900 shadow-2xs'
                            : 'hover:bg-slate-50 text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-semibold block ${isSelected ? 'text-slate-950' : 'text-slate-800'}`}>
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-slate-500 font-light block mt-0.5 leading-relaxed">
                            {opt.desc}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.tag}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Upload CSV Button (Height: h-10) */}
          <button
            id="btn-upload-dataset-header"
            onClick={onTriggerUpload}
            className="h-10 flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 px-4 rounded-full text-xs font-semibold shadow-2xs transition-all hover:border-slate-300"
            title="Unggah File CSV Dataset Fasilitas"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Upload CSV</span>
          </button>

          {/* Black Pill Button (Simulasi Ulang) (Height: h-10) */}
          <button
            onClick={() => onSelectCase(activeCase)}
            disabled={isProcessing}
            className="h-10 inline-flex items-center gap-2 bg-[#0f172a] hover:bg-black text-white px-5 rounded-full text-xs font-semibold shadow-xs transition-all hover:-translate-y-0.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Simulasi Ulang</span>
          </button>
        </div>
      </div>
    </header>
  );
};

