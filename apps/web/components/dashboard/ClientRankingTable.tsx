'use client';

/**
 * ClientRankingTable — Classement Top Clients CEO
 * Style: Lignes alternées, trait statut gauche 4px, pastille carrée de couleur.
 */

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Maximize } from 'lucide-react';
import { DashboardModal } from '@/components/ui/DashboardModal';

interface ClientRank {
  id: string;
  name: string;
  industry: string;
  coverageRate: number;
  openAlerts: number;
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
}

const MOCK_CLIENTS: ClientRank[] = [
  { id: '1', name: 'Amazon', industry: 'Technologie', coverageRate: 100, openAlerts: 0, status: 'STABLE' },
  { id: '2', name: 'Deloitte', industry: 'Conseil', coverageRate: 100, openAlerts: 0, status: 'STABLE' },
  { id: '3', name: 'BGL BNP Paribas', industry: 'Banque', coverageRate: 96, openAlerts: 1, status: 'WARNING' },
  { id: '4', name: 'PwC Luxembourg', industry: 'Conseil', coverageRate: 100, openAlerts: 0, status: 'STABLE' },
  { id: '5', name: 'RTL Group', industry: 'Média', coverageRate: 96, openAlerts: 1, status: 'WARNING' },
  { id: '6', name: 'Bank of China', industry: 'Banque', coverageRate: 90, openAlerts: 2, status: 'CRITICAL' },
  { id: '7', name: 'ArcelorMittal', industry: 'Industrie', coverageRate: 100, openAlerts: 0, status: 'STABLE' },
  { id: '8', name: 'Cargolux', industry: 'Logistique', coverageRate: 85, openAlerts: 4, status: 'CRITICAL' },
  { id: '9', name: 'KPMG', industry: 'Conseil', coverageRate: 100, openAlerts: 0, status: 'STABLE' },
  { id: '10', name: 'Ferrero', industry: 'Agroalimentaire', coverageRate: 98, openAlerts: 0, status: 'STABLE' },
  { id: '11', name: 'SES', industry: 'Technologie', coverageRate: 94, openAlerts: 1, status: 'WARNING' },
  { id: '12', name: 'Post Luxembourg', industry: 'Telecoms', coverageRate: 100, openAlerts: 0, status: 'STABLE' },
  { id: '13', name: 'Encevo', industry: 'Energie', coverageRate: 92, openAlerts: 2, status: 'CRITICAL' },
  { id: '14', name: 'Luxair', industry: 'Transport', coverageRate: 100, openAlerts: 0, status: 'STABLE' },
  { id: '15', name: 'European Investment Bank', industry: 'Institution', coverageRate: 99, openAlerts: 0, status: 'STABLE' },
];

export function ClientRankingTable() {
  const [sortCol, setSortCol] = useState<keyof ClientRank>('coverageRate');
  const [sortAsc, setSortAsc] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAtRiskOnly, setShowAtRiskOnly] = useState(false);

  // Appliquer les filtres et le tri
  const processedClients = useMemo(() => {
    let result = [...MOCK_CLIENTS];
    if (showAtRiskOnly) {
      result = result.filter(c => c.status === 'WARNING' || c.status === 'CRITICAL');
    }
    
    return result.sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [sortCol, sortAsc, showAtRiskOnly]);

  const handleSort = (col: keyof ClientRank) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(col === 'name' || col === 'industry'); // Default asc for text, desc for numbers
    }
  };

  const getStatusColor = (status: ClientRank['status']) => {
    switch(status) {
      case 'STABLE': return { bg: 'bg-[#2E7D32]', border: 'border-l-[#2E7D32]' };
      case 'WARNING': return { bg: 'bg-[#E87A1E]', border: 'border-l-[#E87A1E]' };
      case 'CRITICAL': return { bg: 'bg-[#C62828]', border: 'border-l-[#C62828]', rowBg: 'bg-[#FFEBEE]' };
    }
  };

  const TableContent = ({ limit }: { limit?: number }) => {
    const displayClients = limit ? processedClients.slice(0, limit) : processedClients;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-samsic-marine text-white font-body font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">Statut</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1 hover:text-samsic-sable transition-colors">Client {sortCol === 'name' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}</div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('industry')}>
                <div className="flex items-center gap-1 hover:text-samsic-sable transition-colors">Secteur {sortCol === 'industry' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}</div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('coverageRate')}>
                <div className="flex items-center justify-end gap-1 hover:text-samsic-sable transition-colors">Couverture {sortCol === 'coverageRate' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}</div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('openAlerts')}>
                <div className="flex items-center justify-end gap-1 hover:text-samsic-sable transition-colors">Alertes {sortCol === 'openAlerts' ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}</div>
              </th>
            </tr>
          </thead>
          <tbody className="font-body text-[13px]">
            {displayClients.map((client, idx) => {
              const colors = getStatusColor(client.status);
              const isEven = idx % 2 === 0;
              const bgColor = colors.rowBg ? colors.rowBg : isEven ? 'bg-white' : 'bg-samsic-sable-30';
              
              return (
                <tr 
                  key={client.id} 
                  className={`border-b border-samsic-sable-50 hover:bg-samsic-sable-50 transition-colors border-l-4 ${colors.border} ${bgColor}`}
                >
                  <td className="py-2.5 px-4 text-center">
                    <div className={`w-2 h-2 mx-auto ${colors.bg}`} />
                  </td>
                  <td className="py-2.5 px-4 font-bold text-samsic-marine">{client.name}</td>
                  <td className="py-2.5 px-4 text-samsic-marine-50">{client.industry}</td>
                  <td className="py-2.5 px-4 font-bold text-right text-samsic-marine">{client.coverageRate}%</td>
                  <td className="py-2.5 px-4 font-bold text-right text-samsic-marine">{client.openAlerts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white border text-samsic-marine shadow-sm group">
        <div className="px-5 py-4 border-b border-samsic-sable-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-body font-bold text-samsic-marine uppercase tracking-wider">Top Clients — Risque & Couverture</h2>
            <p className="text-xs text-samsic-marine-50 font-body">Vue matricielle par Taux et Alertes ouvertes</p>
          </div>
          <button 
            onClick={() => { setIsMaximized(true); setShowAtRiskOnly(false); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-samsic-marine-50 hover:bg-samsic-sable-30 hover:text-samsic-marine transition-all focus:opacity-100"
            title="Afficher tous les clients"
          >
            <Maximize size={16} strokeWidth={2.5}/>
          </button>
        </div>
        
        <TableContent limit={6} />
      </div>

      <DashboardModal 
        isOpen={isMaximized} 
        onClose={() => setIsMaximized(false)} 
        title="Base Clients Globale : Risque et Couverture"
      >
        <div className="flex gap-4 mb-4">
          <button 
            className={`px-4 py-2 text-sm font-bold font-body transition-colors ${!showAtRiskOnly ? 'bg-samsic-marine text-white' : 'bg-white border border-[#ded4c9] text-samsic-marine hover:bg-samsic-sable-30'}`}
            onClick={() => setShowAtRiskOnly(false)}
          >
            Tous les clients ({MOCK_CLIENTS.length})
          </button>
          <button 
            className={`px-4 py-2 text-sm font-bold font-body transition-colors flex items-center gap-2 ${showAtRiskOnly ? 'bg-[#C62828] text-white' : 'bg-white border border-[#ded4c9] text-[#C62828] hover:bg-[#FFEBEE]'}`}
            onClick={() => setShowAtRiskOnly(true)}
          >
            Clients à risque ({MOCK_CLIENTS.filter(c => c.status !== 'STABLE').length})
          </button>
        </div>

        <div className="bg-white border border-[#ded4c9] shadow-sm">
           <TableContent />
        </div>
      </DashboardModal>
    </>
  );
      

}
