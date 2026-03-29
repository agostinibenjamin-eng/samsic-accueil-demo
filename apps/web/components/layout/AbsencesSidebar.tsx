'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarOff, Users, Clock, Filter, AlertTriangle, Search } from 'lucide-react';

interface AbsencesSidebarProps {
  filterStatus?: string;
  onFilterStatusChange?: (val: string) => void;
}

const STATUS_CONFIG = [
  { value: 'ALL', label: 'Toutes les absences' },
  { value: 'PENDING_AI', label: 'En attente IA', dot: 'bg-danger' },
  { value: 'RESOLVED', label: 'Remplacées par IA', dot: 'bg-success' },
];

export function AbsencesSidebar({
  filterStatus = 'ALL',
  onFilterStatusChange,
}: AbsencesSidebarProps) {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0 shadow-sm z-20">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recherche</h3>
        
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-samsic-bleu transition-colors" />
          <input 
            type="text" 
            placeholder="Nom employé, site..." 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-samsic-bleu-30 focus:bg-white transition-all disabled:opacity-50"
            disabled
            title="Bientôt disponible"
          />
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtres</h3>
          {filterStatus !== 'ALL' && (
            <button 
              onClick={() => onFilterStatusChange?.('ALL')}
              className="text-[10px] text-samsic-bleu font-bold bg-samsic-bleu/10 px-2 py-1 rounded-full hover:bg-samsic-bleu/20 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-1"><Filter size={10} className="inline mr-1"/>Statut Traitement</span>
            <div className="space-y-1">
              {STATUS_CONFIG.map(status => (
                <button
                  key={status.value}
                  onClick={() => onFilterStatusChange?.(status.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all border border-transparent flex items-center justify-between ${
                    filterStatus === status.value
                      ? 'bg-samsic-bleu/5 text-samsic-marine font-semibold border-samsic-bleu/10 shadow-sm'
                      : 'text-gray-500 font-medium hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {status.dot && <div className={`w-2 h-2 rounded-full ${status.dot}`} />}
                    {status.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
         <nav className="flex flex-col gap-1">
            <Link href="/employees" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${pathname === '/employees' ? 'bg-white shadow-sm border border-gray-100 text-samsic-marine' : 'text-gray-500 hover:text-black'}`}>
              <Users size={16} /> Annuaire Employés
            </Link>
            <Link href="/absences" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${pathname === '/absences' ? 'bg-white shadow-sm border border-gray-100 text-samsic-marine' : 'text-gray-500 hover:text-black'}`}>
              <CalendarOff size={16} /> Gestion Absences
            </Link>
         </nav>
      </div>
    </aside>
  );
}
