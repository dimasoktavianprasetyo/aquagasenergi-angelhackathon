import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FloatingSidebarDock } from './components/FloatingSidebarDock';
import { TopKpiCards } from './components/TopKpiCards';
import { RightSidebarPanel } from './components/RightSidebarPanel';
import { DataIngestionSection } from './components/DataIngestionSection';
import { IKEBaselineSection } from './components/IKEBaselineSection';
import { CNGSimulatorSection } from './components/CNGSimulatorSection';
import { DecisionReport } from './components/DecisionReport';
import { TraceabilityModal } from './components/TraceabilityModal';
import { copilotSocket } from './services/websocket';
import { getSampleDataset, CaseStudyType, GranularityType, INDMIRA_AGRO_CSV } from './services/sampleData';
import { PipelineCompletePayload, WebSocketMessage } from './types';
import { PipelineLoadingModal } from './components/PipelineLoadingModal';
import { Activity, ShieldCheck, Flame, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stageMessage, setStageMessage] = useState<string>('');
  
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
          setProgress(msg.progress || 0);
          setStageMessage(msg.message || '');
        } else if (msg.type === 'PIPELINE_COMPLETE') {
          setProgress(100);
          setStageMessage('Analisis Selesai. Hasil diverifikasi.');
          if (msg.payload) {
            setPipelineResult(msg.payload);
          }
          setTimeout(() => {
            setIsProcessing(false);
          }, 800);
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
    setIsProcessing(true);
    setProgress(0);
    setStageMessage('Memanggil gRPC Analytics: Validasi Integritas Data CSV...');

    const paramsToSend = { ...currentParams, current_fuel: fuelType };

    const sent = copilotSocket.sendAction('RUN_FULL_PIPELINE', {
      csv_raw: csvData,
      fuel_type: fuelType,
      cng_params: paramsToSend
    });

    // If WebSocket is not open, use resilient 5-second paced REST fallback
    if (!sent) {
      try {
        setStageMessage('Memanggil gRPC Analytics: Validasi Integritas Data CSV...');
        setProgress(20);
        await new Promise((r) => setTimeout(r, 1200));

        setStageMessage('Normalisasi Kalor Berhasil: titik data dikonversi ke basis GJ/MMBTU.');
        setProgress(45);
        await new Promise((r) => setTimeout(r, 1300));

        setStageMessage('Regresi Baseline US DOE & Deteksi Anomali Operasional (+1.5σ)...');
        setProgress(70);
        await new Promise((r) => setTimeout(r, 1300));

        setStageMessage('Menghitung Biaya Panas Berguna (LHV) & Reduksi Emisi CO₂...');
        setProgress(90);
        const result = await copilotSocket.runPipelineRestFallback(csvData, fuelType, paramsToSend);
        await new Promise((r) => setTimeout(r, 1200));

        setPipelineResult(result);
        setProgress(100);
        setStageMessage('Analisis Selesai via REST Gateway.');
        setTimeout(() => {
          setIsProcessing(false);
        }, 800);
      } catch (err) {
        console.error('REST Fallback Error:', err);
        setStageMessage('Koneksi backend belum aktif. Pastikan backend/run_all.py berjalan.');
        setTimeout(() => setIsProcessing(false), 1500);
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

  return (
    <div className="min-h-screen bg-[#edf0f5] text-slate-900 py-6 px-3 sm:px-5 md:px-8 selection:bg-emerald-500 selection:text-white font-sans">
      <div className="max-w-[1560px] mx-auto flex gap-6 items-start">
        {/* Left Floating Capsule Dock (Exact from user reference screenshot) */}
        <FloatingSidebarDock onOpenAudit={() => setIsAuditModalOpen(true)} />

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

          {/* Real-time Streaming Pipeline Loading Modal */}
          <PipelineLoadingModal
            isOpen={isProcessing}
            progress={progress}
            stageMessage={stageMessage}
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

          {/* Section 1: Ingestion & Quality (Upload CSV Dataset & Sensor Integrity Audit) */}
          <DataIngestionSection
            qualityReport={pipelineResult?.quality || null}
            onFileUpload={handleFileUpload}
            selectedFuel={selectedFuel}
            onFuelChange={(fuel) => {
              setSelectedFuel(fuel);
              const updated = { ...cngParams, current_fuel: fuel };
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
            onOpenAudit={() => setIsAuditModalOpen(true)}
            activeCase={activeCase}
          />

          {/* Traceability Audit Trail Modal */}
          <TraceabilityModal
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
            auditTrail={pipelineResult?.audit_trail || []}
          />

          {/* Hackathon Footer */}
          <footer className="mt-14 pt-8 pb-12 border-t border-slate-200/80 text-center text-xs text-slate-500 space-y-2 font-light">
            <p className="font-semibold text-slate-700">
              Industrial Energy Efficiency Copilot • Prioritas 1: Industrial Energy Efficiency Copilot
            </p>
            <p>
              ANGEL Innovation Hackathon 2026 | Pengusul: <span className="text-cyan-700 font-semibold">PT Aqua Gas Energi (AGE)</span> | Target Klien: <span className="text-emerald-700 font-semibold">PT Indmira Global Energi</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Tim Pengusul: Dimas Oktavian Prasetyo (Product Lead & UI/UX) & Tim Rekayasa Termal PT Aqua Gas Energi
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
