import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CircularGauge } from './CircularGauge';

interface GridoraFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
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
    <div className={`bg-[#141720] rounded-[32px] p-2.5 pb-4 border border-white/[0.08] shadow-2xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/30 ${className}`}>
      {/* Top Pure White / Off-White Card */}
      <div className="bg-[#f2f4f7] rounded-[26px] p-6 md:p-7 text-slate-900 shadow-sm flex flex-col justify-between">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200/90 flex items-center justify-center shrink-0 text-emerald-600">
              {icon}
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700 block leading-tight">{title}</span>
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950 block mt-0.5 font-sans">
                {value}
              </span>
            </div>
          </div>
          {priorityText && (
            <span className={`px-3.5 py-1 rounded-full text-xs font-semibold shadow-sm shrink-0 ${getBadgeStyle()}`}>
              {priorityText}
            </span>
          )}
        </div>

        {/* Bottom Metric Row with Circular Gauge */}
        <div className="flex items-end justify-between mt-6 pt-2">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">{benefitLabel}</span>
            <span className={`text-2xl md:text-3xl font-bold block mt-1 font-sans ${benefitColor}`}>
              {benefitValue}
            </span>
          </div>
          <div className="shrink-0 pl-3">
            <CircularGauge
              value={gaugeValue}
              max={gaugeMax}
              size={98}
              strokeWidth={8}
              colorGradient={gaugeGradient}
              textColor="dark"
              trackColor="rgba(0, 0, 0, 0.07)"
              unit={gaugeUnit}
              sublabel={gaugeSublabel}
            />
          </div>
        </div>
      </div>

      {/* Bottom Sub-card Drawer (Dark) */}
      <div
        onClick={onAction}
        className={`px-5 pt-4 pb-2 flex items-center justify-between gap-3 text-xs text-slate-400 font-light leading-relaxed ${onAction ? 'cursor-pointer hover:text-slate-200' : ''}`}
      >
        <p className="line-clamp-2 pr-2">{description}</p>
        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
      </div>
    </div>
  );
};
