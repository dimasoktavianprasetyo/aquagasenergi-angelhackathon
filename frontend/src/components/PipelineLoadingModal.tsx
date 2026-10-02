import React, { useState, useEffect, useRef } from 'react';
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
  // Always initializes at 0
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isRendered, setIsRendered] = useState<boolean>(isOpen);
  const [isVisible, setIsVisible] = useState<boolean>(isOpen);
  const animRef = useRef<number | null>(null);
  const currentValRef = useRef<number>(0);
  const targetRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Smooth exit transition handler
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manage body scroll lock and cleanup on unmount/close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen]);

  // Keep targetRef monotonically updated with incoming progress
  useEffect(() => {
    if (!isOpen) return;
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    targetRef.current = Math.max(targetRef.current, clamped);
  }, [progress, isOpen]);

  // Continuous smooth 60fps animation loop: ticks organically step-by-step
  useEffect(() => {
    if (!isOpen) return;

    // Reset internal state cleanly on every open so it NEVER starts at 100%
    currentValRef.current = 0;
    targetRef.current = Math.max(progress, 15);
    setDisplayValue(0);
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05); // Delta in seconds, max 50ms
      lastTimeRef.current = time;

      const current = currentValRef.current;
      const target = targetRef.current;

      let next = current;

      if (target >= 100) {
        // Final rapid sprint to 100% (smooth finish within ~250ms)
        const remaining = 100 - current;
        const speed = Math.max(30, remaining * 10);
        next = Math.min(100, current + speed * dt);
      } else if (current < target) {
        // Approaching target milestone: smooth natural velocity, never jumping coarsely
        const dist = target - current;
        const speed = Math.max(16, dist * 2.5);
        next = Math.min(target, current + speed * dt);
      } else if (current < 95) {
        // Gentle crawl between stages (~2.5% per second) so it NEVER freezes dead while waiting
        next = Math.min(95, current + 2.5 * dt);
      }

      currentValRef.current = next;
      const rounded = Math.floor(next);
      setDisplayValue(rounded);

      if (rounded < 100 || target < 100) {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ease-out backdrop-blur-xl bg-white/85 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`flex flex-col items-center text-center gap-4 max-w-sm transition-all duration-250 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
      >
        {/* Circular Progress Gauge - Ticks smoothly 1-by-1 */}
        <div className="flex items-center justify-center">
          <CircularGauge
            value={displayValue}
            size={124}
            strokeWidth={9}
            variant="circle"
            colorGradient="green"
            textColor="dark"
            unit="%"
            transitionDuration="duration-75"
          />
        </div>

        {/* Floating Title & Explanation */}
        <div className="space-y-1.5 px-4">
          <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
            Memproses Pipeline Copilot...
          </h3>
          <p className="text-xs text-slate-600 font-light leading-relaxed max-w-xs text-center min-h-[32px] flex items-center justify-center">
            {stageMessage || 'Mengoptimasi baseline dan evaluasi transisi CNG...'}
          </p>
        </div>

        {/* Minimal Floating Progress Track - Exactly in sync with CircularGauge */}
        <div className="w-56 bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-75 ease-out"
            style={{ width: `${displayValue}%` }}
          />
        </div>
      </div>
    </div>
  );
};
