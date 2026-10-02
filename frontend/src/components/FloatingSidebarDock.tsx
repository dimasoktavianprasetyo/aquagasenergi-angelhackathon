import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Clock,
  FileText,
  Leaf,
  Bell,
  ArrowUp,
  Flame,
  AlertOctagon
} from 'lucide-react';

interface FloatingSidebarDockProps {
  onOpenAudit: () => void;
}

const FloatingSidebarDockComponent: React.FC<FloatingSidebarDockProps> = ({ onOpenAudit }) => {
  const [activeSection, setActiveSection] = useState<string>('app-header');

  const scrollToSection = (id: string) => {
    if (id === 'top' || id === 'app-header') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sectionIds = [
            'app-header',
            'section-ike-baseline',
            'section-anomaly-table',
            'section-data-ingestion',
            'section-cng-simulator',
            'section-decision-report'
          ];

          const scrollPosition = window.scrollY + 220;

          for (let i = sectionIds.length - 1; i >= 0; i--) {
            const id = sectionIds[i];
            const el = document.getElementById(id);
            if (el && scrollPosition >= el.offsetTop) {
              setActiveSection(id);
              break;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      id: 'section-ike-baseline',
      label: 'IKE Baseline & Forecasting (US DOE)',
      icon: LineChart,
      activeClasses: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105',
      inactiveClasses: 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50',
    },
    {
      id: 'section-anomaly-table',
      label: 'Panduan Investigasi Anomali (+1.5σ)',
      icon: AlertOctagon,
      activeClasses: 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105',
      inactiveClasses: 'text-slate-500 hover:text-rose-600 hover:bg-rose-50',
    },
    {
      id: 'section-data-ingestion',
      label: 'Ingesti Telemetri Data & Sensor Audit',
      icon: Clock,
      activeClasses: 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30 scale-105',
      inactiveClasses: 'text-slate-500 hover:text-cyan-600 hover:bg-cyan-50',
    },
    {
      id: 'section-cng-simulator',
      label: 'Simulator Tekno-Ekonomi CNG (AGE)',
      icon: Leaf,
      activeClasses: 'bg-lime-600 text-white shadow-md shadow-lime-600/30 scale-105',
      inactiveClasses: 'text-slate-500 hover:text-lime-600 hover:bg-lime-50',
    },
    {
      id: 'section-decision-report',
      label: 'Laporan Rekomendasi Eksekutif',
      icon: FileText,
      activeClasses: 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105',
      inactiveClasses: 'text-slate-500 hover:text-amber-600 hover:bg-amber-50',
    }
  ];

  return (
    <aside className="flex flex-col items-center justify-between w-14 sm:w-16 py-4 sm:py-6 px-2 sm:px-2.5 bg-white/95 rounded-[28px] sm:rounded-[32px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-slate-200/90 ring-1 ring-slate-100 shrink-0 sticky top-4 sm:top-6 h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] max-h-[720px] backdrop-blur-xl z-30">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Flame Button (Scrolls to top) */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => scrollToSection('top')}
            className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
            title="Kembali ke Paling Atas"
          >
            <Flame className="w-5 h-5 stroke-[2.5]" />
          </button>
          {/* Tooltip */}
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-slate-900 shadow-xl whitespace-nowrap transition-all duration-200 z-50">
            Aqua Gas Energy Copilot
          </div>
        </div>

        {/* Primary Navigation Icons */}
        <nav className="flex flex-col items-center gap-3 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <div key={item.id} className="relative group flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isActive
                      ? item.activeClasses
                      : item.inactiveClasses
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </button>

                {/* Floating Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-14 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-slate-900 shadow-xl whitespace-nowrap transition-all duration-200 z-50">
                  {item.label}
                </div>
              </div>
            );
          })}

          {/* Audit Matrix Modal Trigger Button (Notif / Bell) */}
          <div className="relative group flex items-center justify-center">
            <button
              type="button"
              onClick={onOpenAudit}
              className="w-10 h-10 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all duration-300 cursor-pointer"
              title="Notifikasi & Matriks Audit"
              aria-label="Notifikasi & Matriks Audit"
            >
              <Bell className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-14 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-slate-900 shadow-xl whitespace-nowrap transition-all duration-200 z-50">
              Notifikasi &amp; Audit Trail
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-3 w-full">


        {/* Scroll to Top Arrow Button */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            onClick={() => scrollToSection('top')}
            className="w-10 h-10 rounded-2xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            title="Kembali ke Atas"
            aria-label="Kembali ke Atas"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-14 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-slate-900 shadow-xl whitespace-nowrap transition-all duration-200 z-50">
            Kembali ke Atas
          </div>
        </div>
      </div>
    </aside>
  );
};

export const FloatingSidebarDock = React.memo(FloatingSidebarDockComponent);
