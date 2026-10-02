import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DataIngestionSection } from './components/DataIngestionSection';
import { IKEBaselineSection } from './components/IKEBaselineSection';
import { CNGSimulatorSection } from './components/CNGSimulatorSection';
import { DecisionReport } from './components/DecisionReport';
import { TraceabilityModal } from './components/TraceabilityModal';
import { copilotSocket } from './services/websocket';
import { getSampleDataset, CaseStudyType, GranularityType, INDMIRA_AGRO_CSV } from './services/sampleData';
import { PipelineCompletePayload, WebSocketMessage } from './types';
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
          setIsProcessing(false);
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
    setProgress(15);
    setStageMessage('Memulai Inisiasi Pipeline Analitik...');

    const paramsToSend = { ...currentParams, current_fuel: fuelType };

    const sent = copilotSocket.sendAction('RUN_FULL_PIPELINE', {
      csv_raw: csvData,
      fuel_type: fuelType,
      cng_params: paramsToSend
    });

    // If WebSocket is not open, use resilient REST fallback
    if (!sent) {
      try {
        setStageMessage('Memproses melalui REST API Gateway fallback...');
        setProgress(50);
        const result = await copilotSocket.runPipelineRestFallback(csvData, fuelType, paramsToSend);
        setPipelineResult(result);
        setProgress(100);
        setStageMessage('Analisis Selesai via REST Gateway.');
      } catch (err) {
        console.error('REST Fallback Error:', err);
        setStageMessage('Koneksi backend belum aktif. Pastikan backend/run_all.py berjalan.');
      } finally {
        setIsProcessing(false);
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

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-7xl mx-auto selection:bg-cyan-500 selection:text-slate-900">
      {/* App Header with Case Switcher & Granularity Toggle */}
      <Header
        wsConnected={wsConnected}
        activeCase={activeCase}
        onSelectCase={handleSelectCase}
        granularity={granularity}
        onSelectGranularity={handleSelectGranularity}
        isProcessing={isProcessing}
      />

      {/* Real-time Streaming Progress Bar */}
      {isProcessing && (
        <div className="glass-panel p-4 mb-6 border border-cyan-500/40 animate-pulse">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-mono mb-2">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>{stageMessage}</span>
            </span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300 shadow-sm shadow-cyan-400/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Section 1: Ingestion & Quality */}
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

      {/* Section 2: IKE & Baseline Analytics */}
      <IKEBaselineSection
        baselineData={pipelineResult?.baseline || null}
      />

      {/* Section 3: CNG Simulator */}
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
      <footer className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
        <p className="font-medium text-slate-400">
          Industrial Energy Efficiency Copilot • Prioritas 1: Industrial Energy Efficiency Copilot
        </p>
        <p>
          ANGEL Innovation Hackathon 2026 | Pengusul: <span className="text-cyan-400 font-semibold">PT Aqua Gas Energi (AGE)</span> | Target Klien: <span className="text-emerald-400 font-semibold">PT Indmira Global Energi</span>
        </p>
        <p className="text-[11px] text-slate-600">
          Tim Pengusul: Dimas Oktavian Prasetyo (Product Lead & UI/UX) & Tim Rekayasa Termal PT Aqua Gas Energi
        </p>
      </footer>
    </div>
  );
};
