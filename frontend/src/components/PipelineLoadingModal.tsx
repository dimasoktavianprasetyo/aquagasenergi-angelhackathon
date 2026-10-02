import React, { useState, useEffect } from 'react';
import { CircularGauge } from './CircularGauge';

interface PipelineLoadingModalProps {
  isOpen: boolean;
  progress: number;
  stageMessage: string;
}

export const PipelineLoadingModal: React.FC<PipelineLoadingModalProps> = ({
  isOpen,
  progress,
  stageMessage
}) => {
  if (!isOpen) return null;

  // Smooth 1-by-1 counter so numbers count up organically without sudden jumping
  const [displayProgress, setDisplayProgress] = useState(0);

  // Whenever modal opens, reset counter immediately to 0 so it never counts backwards from previous 100%
  useEffect(() => {
    if (isOpen) {
      setDisplayProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (progress === displayProgress) return;
    const diff = progress - displayProgress;
    // If progress resets or drops, snap immediately to 0 instead of counting downward
    if (diff < 0) {
      setDisplayProgress(progress);
      return;
    }
    // Paced interval: smooth and responsive forward-only counting
    const speed = Math.max(16, Math.min(60, 220 / Math.abs(diff)));
    const timer = setTimeout(() => {
      setDisplayProgress(prev => Math.min(prev + 1, progress));
    }, speed);
    return () => clearTimeout(timer);
  }, [progress, displayProgress, isOpen]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-white/75 backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-col items-center text-center gap-4 max-w-sm animate-in zoom-in-95 duration-200">
        {/* Circular Progress Gauge (Exact Image 2, Floating Free with ZERO BOX) */}
        <div className="flex items-center justify-center">
          <CircularGauge
            value={displayProgress}
            size={124}
            strokeWidth={9}
            variant="circle"
            colorGradient="green"
            textColor="dark"
            unit="%"
          />
        </div>

        {/* Floating Title & Explanation (No Container / No Card) */}
        <div className="space-y-1.5 px-4">
          <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
            Memproses Pipeline Copilot...
          </h3>
          <p className="text-xs text-slate-600 font-light leading-relaxed max-w-xs text-center min-h-[32px] flex items-center justify-center">
            {stageMessage || 'Mengoptimasi baseline dan evaluasi transisi CNG...'}
          </p>
        </div>

        {/* Minimal Floating Progress Track */}
        <div className="w-56 bg-slate-200/90 rounded-full h-1.5 overflow-hidden mt-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
