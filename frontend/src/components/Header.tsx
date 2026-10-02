import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import mainImg from '../assets/Main.png';
import indmiraImg from '../assets/INDMIRA.png';
import usdoeImg from '../assets/USDOE.png';
import kaggleImg from '../assets/Kaggle.png';
import upCsvImg from '../assets/UploadSCV-New.png';
import simulasiUlangImg from '../assets/Simulasikan.png';
import bgImage from '../assets/BG.png';

interface HeaderProps {
  wsConnected: boolean;
  activeCase: 'INDMIRA' | 'US_DOE' | 'KAGGLE_REAL';
  onSelectCase: (caseType: 'INDMIRA' | 'US_DOE' | 'KAGGLE_REAL') => void;
  isProcessing: boolean;
  onTriggerUpload?: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  wsConnected,
  activeCase,
  onSelectCase,
  isProcessing,
  onTriggerUpload
}) => {
  const scenarios = [
    {
      id: 'INDMIRA' as const,
      label: 'Skenario Indmira (Simulasi Terkalibrasi)',
      shortLabel: '1. Indmira [Skenario Alpha]',
      tier: 'Tier 2: Simulasi',
      image: indmiraImg,
    },
    {
      id: 'US_DOE' as const,
      label: 'US DOE ITAC (Dataset Acuan Benchmark)',
      shortLabel: '2. US DOE [Acuan Benchmark]',
      tier: 'Tier 3: Benchmark',
      image: usdoeImg,
    },
    {
      id: 'KAGGLE_REAL' as const,
      label: 'Kaggle / Nature (Telemetri Riil 60T)',
      shortLabel: '3. Kaggle 60T [Data Riil]',
      tier: 'Tier 1: Data Riil',
      image: kaggleImg,
    },
  ];

  const currentIndex = scenarios.findIndex((s) => s.id === activeCase);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const [previewIndex, setPreviewIndex] = useState<number>(safeIndex);

  useEffect(() => {
    setPreviewIndex(safeIndex);
  }, [safeIndex]);

  const currentScenario = scenarios[previewIndex];
  const isApplied = currentScenario.id === activeCase;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewIndex((prev) => (prev - 1 + scenarios.length) % scenarios.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewIndex((prev) => (prev + 1) % scenarios.length);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectCase(currentScenario.id);
  };

  return (
    <header className="mb-7" id="app-header">
      {/* 
        Layout:
        - Kolom 1 (Kiri): MAIN.png (Judul Utama)
        - Kolom 2 (Tengah): Carousel (INDMIRA / USDOE / KAGGLE di 1 posisi dengan tombol < dan >)
        - Kolom 3 (Kanan): Kartu 3 & 4 Kecil Atas-Bawah (UpCSV & SimulasiUlang) dengan ukuran rasio asli 16:9 (Uncropped)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 items-stretch">

        {/* 1. MAIN CARD (Judul Utama - Sebelah Kiri, Ukuran Asli 16:9) */}
        <div className="lg:col-span-5 w-full min-w-0 max-w-full relative rounded-2xl md:rounded-[22px] overflow-hidden border border-white/60 shadow-xs bg-white/40 backdrop-blur-xl aspect-[1672/941] group flex items-center justify-center">
          {/* Blurred Background Texture Layer */}
          <div
            className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-45 scale-105"
            style={{
              backgroundImage: `url(${bgImage})`,
              filter: 'blur(8px)',
            }}
          />

          <img
            src={mainImg}
            alt="Industrial Energy Efficiency Copilot - Main"
            className="w-full h-full object-contain select-none transition-transform duration-500 group-hover:scale-[1.01] relative z-[1]"
            draggable={false}
          />

          {/* Soft Bottom Space Blur Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/40 via-white/10 to-transparent backdrop-blur-sm pointer-events-none z-[2]" />

          {/* TKT Status Badge (Solid Green Pill, No AI dot) */}
          <div className="absolute top-2.5 left-2.5 bg-[#16a34a] text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-xs pointer-events-none select-none z-10 tracking-wide uppercase">
            TKT 3 / Alpha
          </div>
        </div>

        {/* 2. SCENARIO CAROUSEL (INDMIRA, KAGGLE, USDOE di 1 Posisi dengan < >, Ukuran Asli 16:9) */}
        <div className="lg:col-span-5 w-full min-w-0 max-w-full relative rounded-2xl md:rounded-[22px] overflow-hidden border border-white/60 shadow-xs bg-white/40 backdrop-blur-xl aspect-[1672/941] group flex items-center justify-center">
          {/* Blurred Background Texture Layer */}
          <div
            className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-45 scale-105"
            style={{
              backgroundImage: `url(${bgImage})`,
              filter: 'blur(8px)',
            }}
          />

          <div className="relative w-full h-full flex items-center justify-center overflow-hidden z-[1]">
            <img
              src={currentScenario.image}
              alt={currentScenario.label}
              key={currentScenario.id}
              className="w-full h-full object-contain select-none transition-all duration-300 animate-in fade-in"
              draggable={false}
            />

            {/* Soft Bottom Space Blur Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/40 via-white/10 to-transparent backdrop-blur-sm pointer-events-none z-[5]" />

            {/* Bottom Navigation Dock: [<] [dots] [>] | [Apply] */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
              {/* Prev Button (<) */}
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Skenario Sebelumnya"
                aria-label="Previous Scenario"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Dot & Pill Indicators */}
              <div className="flex items-center gap-1.5 px-1">
                {scenarios.map((sc, idx) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIndex(idx);
                    }}
                    className={`transition-all rounded-full cursor-pointer ${
                      idx === previewIndex
                        ? 'w-4 h-1.5 bg-emerald-400 shadow-xs'
                        : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                    }`}
                    title={sc.label}
                    aria-label={sc.label}
                  />
                ))}
              </div>

              {/* Next Button (>) */}
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Skenario Berikutnya"
                aria-label="Next Scenario"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Divider */}
              <div className="w-px h-4 bg-white/20 mx-1" />

              {/* Apply Button (Solid Pill, No AI dots/icons, Blue #0284c7 when Applied) */}
              <button
                type="button"
                onClick={handleApply}
                disabled={isProcessing}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all tracking-normal cursor-pointer select-none ${
                  isApplied
                    ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xs'
                    : 'bg-[#16a34a] hover:bg-[#15803d] text-white shadow-xs hover:scale-105 active:scale-95'
                }`}
                title={isApplied ? 'Skenario ini sedang aktif (Klik untuk muat ulang)' : 'Terapkan skenario yang dipilih'}
              >
                {isApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {/* 3 & 4. ACTION BUTTONS: KECIL ATAS-BAWAH (PAS / FLUSH TANPA BAR PUTIH) */}
        <div className="lg:col-span-2 w-full min-w-0 max-w-full flex flex-row lg:flex-col justify-between items-center gap-2.5 lg:gap-3">

          {/* Card 3: UploadCSV New Button */}
          <button
            id="btn-upload-dataset-header"
            type="button"
            onClick={onTriggerUpload}
            className="flex-1 lg:flex-none aspect-square w-auto h-full max-h-[calc(50%-6px)] max-w-full relative rounded-xl md:rounded-[18px] overflow-hidden border border-white/60 shadow-xs bg-white/40 backdrop-blur-xl hover:border-emerald-400 hover:shadow-md transition-all duration-200 active:scale-[0.98] group cursor-pointer flex items-center justify-center p-0"
            title="Upload CSV Dataset Fasilitas"
          >
            <img
              src={upCsvImg}
              alt="Upload CSV"
              className="w-full h-full object-cover select-none group-hover:scale-[1.02] transition-transform duration-300 block"
              draggable={false}
            />
          </button>

          {/* Card 4: Simulasikan Button */}
          <button
            type="button"
            onClick={() => onSelectCase(activeCase)}
            disabled={isProcessing}
            className={`flex-1 lg:flex-none aspect-square w-auto h-full max-h-[calc(50%-6px)] max-w-full relative rounded-xl md:rounded-[18px] overflow-hidden border border-white/60 shadow-xs bg-white/40 backdrop-blur-xl hover:border-sky-400 hover:shadow-md transition-all duration-200 active:scale-[0.98] group cursor-pointer flex items-center justify-center p-0 ${
              isProcessing ? 'opacity-70 cursor-wait' : ''
            }`}
            title="Simulasikan Ulang Skenario"
          >
            <img
              src={simulasiUlangImg}
              alt="Simulasikan Ulang"
              className="w-full h-full object-cover select-none group-hover:scale-[1.02] transition-transform duration-300 block"
              draggable={false}
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="bg-white/95 rounded-full px-2.5 py-1 shadow-lg flex items-center gap-1.5 text-slate-900 text-[10px] font-semibold">
                  <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                  <span>Memproses...</span>
                </div>
              </div>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
