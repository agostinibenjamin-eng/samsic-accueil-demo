'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BellRing, Filter, UserX, Shield, CalendarDays, BarChart3, BookOpen, Scale, AlertTriangle 
} from 'lucide-react';

interface AlertsSidebarProps {
  filter?: string | null;
  onFilterChange?: (val: string | null) => void;
  categoryCounts?: Record<string, number>;
  totalAlerts?: number;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  ABSENCE:       { label: 'Absences',      icon: UserX,        color: 'text-[#C62828]' },
  COVERAGE:      { label: 'Couverture',    icon: Shield,       color: 'text-[#E87A1E]' },
  TURNOVER:      { label: 'Turnover',      icon: CalendarDays, color: 'text-[#7B1FA2]' },
  FRAGILITY:     { label: 'Fragilité',     icon: BarChart3,    color: 'text-[#0078b0]' },
  CERTIFICATION: { label: 'Certification', icon: BookOpen,     color: 'text-[#2E7D32]' },
  LEGAL:         { label: 'Légal',         icon: Scale,        color: 'text-[#C62828]' },
};

export function AlertsSidebar({
  filter = null,
  onFilterChange,
  categoryCounts = {},
  totalAlerts = 0,
}: AlertsSidebarProps) {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0 shadow-sm z-20">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Moteur IA v2.0</h3>
        <p className="text-[10px] text-gray-500 font-medium">Détection d'anomalies en temps réel</p>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Catégories</h3>
          {filter !== null && (
            <button 
              onClick={() => onFilterChange?.(null)}
              className="text-[10px] text-samsic-bleu font-bold bg-samsic-bleu/10 px-2 py-1 rounded-full hover:bg-samsic-bleu/20 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onFilterChange?.(null)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all border border-transparent flex items-center justify-between ${
              filter === null
                ? 'bg-samsic-bleu/5 text-samsic-marine font-semibold border-samsic-bleu/10 shadow-sm'
                : 'text-gray-500 font-medium hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter size={16} />
              Toutes les alertes
            </div>
            {totalAlerts > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${filter === null ? 'bg-white font-bold' : 'bg-gray-100'}`}>
                {totalAlerts}
              </span>
            )}
          </button>

          <div className="pt-2"></div>
          
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const count = categoryCounts[key] || 0;
            const CatIcon = cfg.icon;
            
            return (
              <button
                key={key}
                onClick={() => onFilterChange?.(filter === key ? null : key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all border border-transparent flex items-center justify-between ${
                  filter === key
                    ? 'bg-samsic-bleu/5 text-samsic-marine font-semibold border-samsic-bleu/10 shadow-sm'
                    : 'text-gray-500 font-medium hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CatIcon size={16} className={count > 0 ? cfg.color : 'text-gray-400'} />
                  <span className={count > 0 ? 'text-gray-700' : 'text-gray-400'}>{cfg.label}</span>
                </div>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${filter === key ? 'bg-white font-bold' : 'bg-gray-100'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
         <nav className="flex flex-col gap-1">
            <Link href="/alerts" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${pathname === '/alerts' ? 'bg-white shadow-sm border border-gray-100 text-samsic-marine' : 'text-gray-500 hover:text-black'}`}>
              <BellRing size={16} /> Centre d'Alertes
            </Link>
         </nav>
      </div>
    </aside>
  );
}
