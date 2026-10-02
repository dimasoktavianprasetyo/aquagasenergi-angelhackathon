import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { FloatingSidebarDock } from './components/FloatingSidebarDock';
import { TopKpiCards } from './components/TopKpiCards';
import { RightSidebarPanel } from './components/RightSidebarPanel';
import { DataIngestionSection } from './components/DataIngestionSection';
import { IKEBaselineSection, AnomalyInvestigationTable } from './components/IKEBaselineSection';
import { CNGSimulatorSection } from './components/CNGSimulatorSection';
import { DecisionReport } from './components/DecisionReport';
import { TraceabilityModal } from './components/TraceabilityModal';
import { copilotSocket } from './services/websocket';
import { getSampleDataset, CaseStudyType, GranularityType, INDMIRA_AGRO_CSV } from './services/sampleData';
import { PipelineCompletePayload, WebSocketMessage } from './types';
import { PipelineLoadingModal } from './components/PipelineLoadingModal';
import { Activity, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import bgImage from './assets/BG.png';

export const App: React.FC = () => {
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPageRevealing, setIsPageRevealing] = useState<boolean>(false);
  const prevProcessingRef = useRef<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stageMessage, setStageMessage] = useState<string>('');
  const currentRunIdRef = useRef<number>(0);
  const [runSessionId, setRunSessionId] = useState<number>(1);

  // Trigger silky-smooth 60FPS defocus-to-focus reveal when processing completes
  useEffect(() => {
    if (prevProcessingRef.current && !isProcessing) {
      setIsPageRevealing(true);
      const timer = setTimeout(() => {
        setIsPageRevealing(false);
      }, 900);
      return () => clearTimeout(timer);
    }
    prevProcessingRef.current = isProcessing;
  }, [isProcessing]);

  const [activeCase, setActiveCase] = useState<CaseStudyType>('INDMIRA');
  const [granularity, setGranularity] = useState<GranularityType>('DAILY');
  const [selectedFuel, setSelectedFuel] = useState<string>('LPG');
  const [csvContent, setCsvContent] = useState<string>(INDMIRA_AGRO_CSV);
  const [pipelineResult, setPipelineResult] = useState<PipelineCompletePayload | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const [cngParams, setCngParams] = useState({
    current_fuel: 'LPG',
    current_fuel_price_idr: 14000,
    current_thermal_efficiency: 0.78,
    cng_price_idr_per_mmbtu: 215000,
    target_cng_efficiency: 0.84,
    retrofit_capex_idr: 150000000
  });

  useEffect(() => {
    copilotSocket.connect(
      (msg: WebSocketMessage) => {
        if (msg.type === 'PROGRESS') {
          // Jaminan monotonik: Angka progress hanya boleh naik, tidak boleh turun selama loading berlangsung
          setProgress((prev) => Math.max(prev, msg.progress || 0));
          setStageMessage(msg.message || '');
        } else if (msg.type === 'PIPELINE_COMPLETE') {
          setProgress(100);
          setStageMessage('Analisis Selesai. Hasil diverifikasi.');
          if (msg.payload) {
            setPipelineResult(msg.payload);
          }
          setTimeout(() => {
            setIsProcessing(false);
          }, 550);
        }
      },
      (connected: boolean) => {
        setWsConnected(connected);
      }
    );

    // Run demo automatically on initial mount with Indmira 90-day dataset
    runPipeline(INDMIRA_AGRO_CSV, 'LPG', cngParams);
  }, []);

  const runPipeline = async (csvData: string, fuelType: string, currentParams = cngParams) => {
    const runId = ++currentRunIdRef.current;
    setRunSessionId((prev) => prev + 1);
    setProgress(0);
    setIsProcessing(true);
    setStageMessage('Memanggil gRPC Analytics: Validasi Integritas Data CSV...');

    const paramsToSend = { ...currentParams, current_fuel: fuelType };

    const sent = copilotSocket.sendAction('RUN_FULL_PIPELINE', {
      run_id: runId,
      csv_raw: csvData,
      fuel_type: fuelType,
      cng_params: paramsToSend
    });

    // If WebSocket is not open, use resilient paced REST fallback with runId cancellation guard
    if (!sent) {
      try {
        if (currentRunIdRef.current !== runId) return;
        setStageMessage('Memanggil gRPC Analytics: Validasi Integritas Data CSV...');
        setProgress(20);
        await new Promise((r) => setTimeout(r, 800));

        if (currentRunIdRef.current !== runId) return;
        setStageMessage('Normalisasi Kalor Berhasil: titik data dikonversi ke basis GJ/MMBTU.');
        setProgress(45);
        await new Promise((r) => setTimeout(r, 900));

        if (currentRunIdRef.current !== runId) return;
        setStageMessage('Regresi Baseline US DOE & Deteksi Anomali Operasional (+1.5σ)...');
        setProgress(70);
        await new Promise((r) => setTimeout(r, 900));

        if (currentRunIdRef.current !== runId) return;
        setStageMessage('Menghitung Biaya Panas Berguna (LHV) & Reduksi Emisi CO₂...');
        setProgress(90);
        const result = await copilotSocket.runPipelineRestFallback(csvData, fuelType, paramsToSend);

        if (currentRunIdRef.current !== runId) return;
        await new Promise((r) => setTimeout(r, 600));

        if (currentRunIdRef.current !== runId) return;
        setPipelineResult(result);
        setProgress(100);
        setStageMessage('Analisis Selesai via REST Gateway.');
        setTimeout(() => {
          if (currentRunIdRef.current === runId) {
            setIsProcessing(false);
          }
        }, 500);
      } catch (err) {
        if (currentRunIdRef.current !== runId) return;
        console.error('REST Fallback Error:', err);
        setStageMessage('Koneksi backend belum aktif. Pastikan backend/run_all.py berjalan.');
        setTimeout(() => {
          if (currentRunIdRef.current === runId) {
            setIsProcessing(false);
          }
        }, 1500);
      }
    }
  };

  const handleSelectCase = (caseType: CaseStudyType) => {
    setActiveCase(caseType);
    const newCsv = getSampleDataset(caseType, granularity);
    setCsvContent(newCsv);

    if (caseType === 'INDMIRA') {
      const fuel = 'LPG';
      const updatedParams = {
        ...cngParams,
        current_fuel: fuel,
        current_fuel_price_idr: 14000,
        current_thermal_efficiency: 0.78,
        cng_price_idr_per_mmbtu: 215000,
        target_cng_efficiency: 0.84,
        retrofit_capex_idr: 150000000
      };
      setSelectedFuel(fuel);
      setCngParams(updatedParams);
      runPipeline(newCsv, fuel, updatedParams);
    } else if (caseType === 'US_DOE') {
      const fuel = 'DIESEL';
      const updatedParams = {
        ...cngParams,
        current_fuel: fuel,
        current_fuel_price_idr: 15500,
        current_thermal_efficiency: 0.74,
        cng_price_idr_per_mmbtu: 215000,
        target_cng_efficiency: 0.84,
        retrofit_capex_idr: 200000000
      };
      setSelectedFuel(fuel);
      setCngParams(updatedParams);
      runPipeline(newCsv, fuel, updatedParams);
    } else {
      // KAGGLE_REAL: 60-Ton Superheated Steam Industrial Boiler from Nature Scientific Data (Sensors: steam flow, flue gas temp, excess O2)
      const fuel = 'DIESEL';
      const updatedParams = {
        ...cngParams,
        current_fuel: fuel,
        current_fuel_price_idr: 15500,
        current_thermal_efficiency: 0.76,
        cng_price_idr_per_mmbtu: 215000,
        target_cng_efficiency: 0.85,
        retrofit_capex_idr: 350000000
      };
      setSelectedFuel(fuel);
      setCngParams(updatedParams);
      runPipeline(newCsv, fuel, updatedParams);
    }
  };

  const handleSelectGranularity = (gran: GranularityType) => {
    setGranularity(gran);
    const newCsv = getSampleDataset(activeCase, gran);
    setCsvContent(newCsv);
    runPipeline(newCsv, selectedFuel);
  };

  const handleFileUpload = (content: string, filename: string, fuelType: string) => {
    setCsvContent(content);
    runPipeline(content, fuelType);
  };

  const handleParamChange = (key: string, value: number) => {
    const updated = { ...cngParams, [key]: value };
    setCngParams(updated);
  };

  const handleReRunSimulation = () => {
    runPipeline(csvContent, selectedFuel);
  };

  const handleHeaderUploadClick = () => {
    const input = document.getElementById('csv-file-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
    const el = document.getElementById('section-data-ingestion');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAudit = useCallback(() => {
    setIsAuditModalOpen(true);
  }, []);

  const handleCloseAudit = useCallback(() => {
    setIsAuditModalOpen(false);
  }, []);

  return (
    <div className="relative min-h-screen text-slate-900 py-6 px-3 sm:px-5 md:px-8 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Blurred Industrial Energy Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: 'blur(6px)',
          backgroundColor: '#edf0f5',
        }}
      />

      {/* Real-time Streaming Pipeline Loading Modal with Smooth Dissolve */}
      <PipelineLoadingModal
        key={`loading-modal-${runSessionId}`}
        isOpen={isProcessing}
        progress={progress}
        stageMessage={stageMessage}
      />

      {/* Silky-Smooth 60FPS Hardware-Accelerated Blur Reveal Overlay */}
      {isPageRevealing && <div className="blur-reveal-overlay" />}

      {/* Traceability Audit Trail Modal */}
      <TraceabilityModal
        isOpen={isAuditModalOpen}
        onClose={handleCloseAudit}
        auditTrail={pipelineResult?.audit_trail || []}
      />

      <div className="max-w-[1560px] mx-auto flex gap-3 sm:gap-6 items-start relative z-0">
        {/* Left Floating Capsule Dock (Exact from user reference screenshot) */}
        <FloatingSidebarDock onOpenAudit={handleOpenAudit} />

        {/* Main Executive Content Canvas */}
        <main className="flex-1 min-w-0">
          {/* App Header with Case Switcher & Upload CSV */}
          <Header
            wsConnected={wsConnected}
            activeCase={activeCase}
            onSelectCase={handleSelectCase}
            isProcessing={isProcessing}
            onTriggerUpload={handleHeaderUploadClick}
          />

          {/* Top 4 Floating KPI Cards (Exact from user reference screenshot) */}
          <TopKpiCards
            baseline={pipelineResult?.baseline || null}
            quality={pipelineResult?.quality || null}
            cng={pipelineResult?.cng || null}
            currentFuel={selectedFuel}
          />

          {/* Desktop Split Grid (Exact from user reference screenshot) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-7 items-stretch">
            {/* Left Column (7-8 cols): Sleek Dark Card - Load Forecast vs. Actual */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
              <IKEBaselineSection
                baselineData={pipelineResult?.baseline || null}
                granularity={granularity}
                onSelectGranularity={handleSelectGranularity}
                isProcessing={isProcessing}
              />
            </div>

            {/* Right Column (4-5 cols): 2 Stacked Cards - Solusi Transisi CNG + Useful Heat Breakdown */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
              <RightSidebarPanel
                baseline={pipelineResult?.baseline || null}
                cng={pipelineResult?.cng || null}
                currentFuel={selectedFuel}
                onOpenSimulator={() => {
                  const el = document.getElementById('section-cng-simulator');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </div>

          {/* Full-width Anomaly Investigation Guide Table (reaches all the way to the right) */}
          <AnomalyInvestigationTable baselineData={pipelineResult?.baseline || null} />

          {/* Section 1: Ingestion & Quality (Upload CSV Dataset & Sensor Integrity Audit) */}
          <DataIngestionSection
            qualityReport={pipelineResult?.quality || null}
            onFileUpload={handleFileUpload}
            selectedFuel={selectedFuel}
            onFuelChange={(fuel) => {
              setSelectedFuel(fuel);
              let defaultPrice = cngParams.current_fuel_price_idr;
              if (fuel === 'CNG') {
                defaultPrice = 245000; // Standard non-contractual CNG price Rp 245.000/MMBTU
              } else if (fuel === 'DIESEL') {
                defaultPrice = 15500;  // Solar Industri Rp 15.500/liter
              } else {
                defaultPrice = 14000;  // LPG Industri Rp 14.000/kg
              }
              const updated = {
                ...cngParams,
                current_fuel: fuel,
                current_fuel_price_idr: defaultPrice
              };
              setCngParams(updated);
              runPipeline(csvContent, fuel, updated);
            }}
            isProcessing={isProcessing}
          />

          {/* Section 2: CNG Simulator & Techno-Economic Evaluation */}
          <CNGSimulatorSection
            cngResult={pipelineResult?.cng || null}
            params={cngParams}
            onParamChange={handleParamChange}
            onRunSimulation={handleReRunSimulation}
            isProcessing={isProcessing}
          />

          {/* Section 4: Decision Support Report */}
          <DecisionReport
            data={pipelineResult}
            onOpenAudit={handleOpenAudit}
            activeCase={activeCase}
          />


          {/* Hackathon Footer - Solid White Card (No Blur) */}
          <footer className="mt-12 mb-10 bg-white border border-slate-200 rounded-lg py-6 px-6 text-center text-xs text-slate-600 shadow-xs space-y-2">
            <p className="font-bold text-slate-800 text-sm">
              Industrial Energy Efficiency Copilot • Prioritas 1: Industrial Energy Efficiency Copilot
            </p>
            <p className="text-slate-600">
              ANGEL Innovation Hackathon 2026 | Pengusul: <span className="text-cyan-700 font-semibold">PT Aqua Gas Energi (AGE)</span> | Target Klien: <span className="text-emerald-700 font-semibold">PT Indmira Global Energi</span>
            </p>
            <p className="text-[11px] text-slate-500 font-normal">
              Tim Pengusul: Dimas Oktavian Prasetyo (Product Lead &amp; UI/UX) &amp; Tim Rekayasa Termal PT Aqua Gas Energi
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
