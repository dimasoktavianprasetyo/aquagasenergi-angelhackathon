import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CircularGauge } from './CircularGauge';

interface GridoraFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit?: string;
  priorityText?: string;
  priorityColor?: 'green' | 'blue' | 'amber';
  benefitLabel: string;
  benefitValue: string;
  benefitColor?: string;
  gaugeValue: number;
  gaugeMax?: number;
  gaugeGradient?: 'green' | 'blue' | 'emerald' | 'amber';
  gaugeUnit?: string;
  gaugeSublabel?: string;
  description: string;
  onAction?: () => void;
  className?: string;
}

export const GridoraFeatureCard: React.FC<GridoraFeatureCardProps> = ({
  icon,
  title,
  value,
  unit,
  priorityText = 'High priority',
  priorityColor = 'green',
  benefitLabel,
  benefitValue,
  benefitColor = 'text-emerald-600',
  gaugeValue,
  gaugeMax = 100,
  gaugeGradient = 'green',
  gaugeUnit = '%',
  gaugeSublabel,
  description,
  onAction,
  className = ''
}) => {
  const getBadgeStyle = () => {
    switch (priorityColor) {
      case 'blue':
        return 'bg-[#0284c7] text-white';
      case 'amber':
        return 'bg-[#d97706] text-white';
      case 'green':
      default:
        return 'bg-[#22c55e] text-white';
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            {icon}
          </div>
          <span className="text-xs font-semibold text-slate-700 font-sans truncate">
            {title}
          </span>
        </div>
        {priorityText && (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs shrink-0 self-start ${getBadgeStyle()}`}
          >
            {priorityText}
          </span>
        )}
      </div>

      {/* Main Metric Value (Proportionate, Clean, Single-line) */}
      <div className="mt-3 mb-2">
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-slate-500 font-mono">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Metric Row with Circular Gauge */}
      <div className="flex items-end justify-between gap-2 mt-auto pt-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {benefitLabel}
          </span>
          <span
            className={`text-base sm:text-lg font-bold font-sans mt-0.5 block truncate ${benefitColor}`}
          >
            {benefitValue}
          </span>
        </div>
        <div className="shrink-0 pl-2">
          <CircularGauge
            value={gaugeValue}
            max={gaugeMax}
            size={68}
            strokeWidth={6}
            colorGradient={gaugeGradient}
            textColor="dark"
            trackColor="rgba(0, 0, 0, 0.05)"
            unit={gaugeUnit}
            sublabel={gaugeSublabel}
          />
        </div>
      </div>

      {/* Subtle Description Footer */}
      {description && (
        <div
          onClick={onAction}
          className={`mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500 font-light leading-relaxed ${
            onAction ? 'cursor-pointer hover:text-slate-800' : ''
          }`}
        >
          <p className="line-clamp-2">{description}</p>
          {onAction && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
        </div>
      )}
    </div>
  );
};
