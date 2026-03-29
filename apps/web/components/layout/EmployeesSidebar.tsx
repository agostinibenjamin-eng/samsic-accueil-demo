'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Clock, Search, Globe, Filter } from 'lucide-react';

interface EmployeesSidebarProps {
  search?: string;
  onSearchChange?: (val: string) => void;
  filterType?: string;
  onFilterTypeChange?: (val: string) => void;
  filterLang?: string;
  onFilterLangChange?: (val: string) => void;
  isDetailView?: boolean;
}

const TYPE_CONFIG = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'TEAM_LEADER', label: 'Team Leader' },
  { value: 'TITULAR', label: 'Titulaire' },
  { value: 'BACKUP', label: 'Backup' },
];

const LANG_CONFIG = [
  { value: 'ALL', label: 'Toutes les langues' },
  { value: 'en', label: 'Anglais (EN)' },
  { value: 'de', label: 'Allemand (DE)' },
  { value: 'lu', label: 'Luxembourgeois (LU)' },
];

export function EmployeesSidebar({
  search = '',
  onSearchChange,
  filterType = 'ALL',
  onFilterTypeChange,
  filterLang = 'ALL',
  onFilterLangChange,
  isDetailView = false,
}: EmployeesSidebarProps) {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0 shadow-sm z-20">
      {!isDetailView && (
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recherche</h3>
        
        {/* Global Search */}
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-samsic-bleu transition-colors" />
          <input 
            type="text" 
            placeholder="Nom, matricule..." 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-samsic-bleu-30 focus:bg-white transition-all"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
      )}

      {!isDetailView && (
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtres</h3>
          {(filterType !== 'ALL' || filterLang !== 'ALL' || search !== '') && (
            <button 
              onClick={() => {
                onSearchChange?.('');
                onFilterTypeChange?.('ALL');
                onFilterLangChange?.('ALL');
              }}
              className="text-[10px] text-samsic-bleu font-bold bg-samsic-bleu/10 px-2 py-1 rounded-full hover:bg-samsic-bleu/20 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Filter Categories */}
        <div className="space-y-4">
          {/* Statut filter */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-1"><Filter size={10} className="inline mr-1"/>Type de profil</span>
            <div className="space-y-1">
              {TYPE_CONFIG.map(type => (
                <button
                  key={type.value}
                  onClick={() => onFilterTypeChange?.(type.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all border border-transparent flex items-center justify-between ${
                    filterType === type.value
                      ? 'bg-samsic-bleu/5 text-samsic-marine font-semibold border-samsic-bleu/10 shadow-sm'
                      : 'text-gray-500 font-medium hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Langue filter */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-1"><Globe size={10} className="inline mr-1"/>Langue parlée</span>
            <div className="space-y-1">
              {LANG_CONFIG.map(lang => (
                <button
                  key={lang.value}
                  onClick={() => onFilterLangChange?.(lang.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all border border-transparent flex items-center justify-between ${
                    filterLang === lang.value
                      ? 'bg-samsic-bleu/5 text-samsic-marine font-semibold border-samsic-bleu/10 shadow-sm'
                      : 'text-gray-500 font-medium hover:bg-gray-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
      
      {/* Footer Navigation */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
         <nav className="flex flex-col gap-1">
            <Link href="/employees" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/employees' ? 'bg-white shadow-sm border border-gray-100 text-samsic-marine' : 'text-gray-500 hover:text-black'}`}>
              <Users size={16} /> Annuaire Employés
            </Link>
            <Link href="/absences" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/absences' ? 'bg-white shadow-sm border border-gray-100 text-samsic-marine' : 'text-gray-500 hover:text-black'}`}>
              <Clock size={16} /> Gestion Absences
            </Link>
         </nav>
      </div>
    </aside>
  );
}
