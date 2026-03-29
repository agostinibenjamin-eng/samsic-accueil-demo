'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ListTree, Handshake, Search, Filter } from 'lucide-react';

interface ClientsSidebarProps {
  search?: string;
  onSearchChange?: (val: string) => void;
  filterStatus?: string;
  onFilterStatusChange?: (val: string) => void;
  isDetailView?: boolean;
}

const STATUS_CONFIG = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'STABLE', label: 'Stable', dot: 'bg-success' },
  { value: 'WARNING', label: 'Vigilance', dot: 'bg-warning' },
  { value: 'CRITICAL', label: 'Critique', dot: 'bg-error' },
];

export function ClientsSidebar({
  search = '',
  onSearchChange,
  filterStatus = 'ALL',
  onFilterStatusChange,
  isDetailView = false,
}: ClientsSidebarProps) {
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
            placeholder="Nom, code, secteur..." 
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
          {(filterStatus !== 'ALL' || search !== '') && (
            <button 
              onClick={() => {
                onSearchChange?.('');
                onFilterStatusChange?.('ALL');
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
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-1"><Filter size={10} className="inline mr-1"/>Santé du contrat</span>
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
      )}
      
      {/* Footer Navigation */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
         <nav className="flex flex-col gap-1">
            <Link href="/clients" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${pathname === '/clients' ? 'bg-white shadow-sm border border-gray-100 text-samsic-marine' : 'text-gray-500 hover:text-black'}`}>
              <Building2 size={16} /> Sites & Clients
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white hover:shadow-sm hover:border-gray-100 transition-all border border-transparent">
              <ListTree size={16} /> Contrats
            </Link>
         </nav>
      </div>
    </aside>
  );
}
