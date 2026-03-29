'use client';

import { TrendingUp, Star, Clock, Users, Maximize } from 'lucide-react';
import { InfoTooltip } from '@/components/dashboard/InfoTooltip';
import { useState } from 'react';
import { DashboardModal } from '@/components/ui/DashboardModal';

export function PerformanceIA() {
  const [isMaximized, setIsMaximized] = useState(false);

  const KpiContent = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-samsic-sable-50">
      <div className="p-5 hover:bg-samsic-sable-30 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} className="text-[#2E7D32]" />
          <span className="text-xs font-bold font-body text-samsic-marine-50 uppercase tracking-wider">Tx couverture moyen</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#2E7D32]">96%</span>
        </div>
        <p className="text-xs text-samsic-marine-50 mt-1 font-body">+4pts vs sem. précédente</p>
      </div>

      <div className="p-5 hover:bg-samsic-sable-30 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-[#0078b0]" />
          <span className="text-xs font-bold font-body text-samsic-marine-50 uppercase tracking-wider">Suggestions IA émises</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#0078b0]">12</span>
        </div>
        <p className="text-xs text-samsic-marine-50 mt-1 font-body">9 acceptées · 3 refusées</p>
      </div>

      <div className="p-5 hover:bg-samsic-sable-30 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-[#E87A1E]" />
          <span className="text-xs font-bold font-body text-samsic-marine-50 uppercase tracking-wider">Délai moyen remplacement</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#E87A1E]">3 ms</span>
        </div>
        <p className="text-xs text-samsic-marine-50 mt-1 font-body">16 critères · Contre ~45 min manuellement</p>
      </div>

      <div className="p-5 hover:bg-samsic-sable-30 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} className="text-samsic-marine" />
          <span className="text-xs font-bold font-body text-samsic-marine-50 uppercase tracking-wider">Backups actifs semaine</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-samsic-marine">7</span>
        </div>
        <p className="text-xs text-samsic-marine-50 mt-1 font-body">Sur 11 backups disponibles</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white border border-samsic-sable-50 shadow-sm flex flex-col h-full group">
        <div className="px-6 py-5 border-b border-samsic-sable-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-samsic-marine" />
            <h2 className="text-base font-body font-bold text-samsic-marine">Performance Moteur IA v2.0 — Semaine en cours</h2>
            <InfoTooltip content="Statistiques des remplacements gérés automatiquement par le moteur de matching de profils." />
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs text-samsic-marine-50 font-body hidden sm:inline-block">28 Mar → 3 Avr 2026</span>
             <button 
               onClick={() => setIsMaximized(true)}
               className="opacity-0 group-hover:opacity-100 p-1.5 text-samsic-marine-50 hover:bg-samsic-sable-30 hover:text-samsic-marine transition-all focus:opacity-100"
               title="Détails du moteur IA"
             >
               <Maximize size={16} strokeWidth={2.5}/>
             </button>
          </div>
        </div>
        <KpiContent />
      </div>

      <DashboardModal 
        isOpen={isMaximized} 
        onClose={() => setIsMaximized(false)} 
        title="Diagnostic Complet : Moteur IA v2.0 — 16 Critères"
      >
         <div className="bg-white border border-[#ded4c9] mb-6">
            <KpiContent />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 shadow-sm border-l-4 border-gray-100 shadow-sm">
               <h3 className="font-bold text-lg mb-4 text-samsic-marine">Critères d'Affectation Autorisés</h3>
               <ul className="space-y-3 font-body text-sm text-samsic-marine-80">
                 <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#C62828]"></div> <b>E1-E12</b> — 12 critères éliminatoires (langues, compétences, repos 11h, 48h/sem, certif., blacklist...)</li>
                 <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-success"></div> <b>P1</b> — Formation au poste (0-30 pts)</li>
                 <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-success"></div> <b>P2</b> — Affinité client via feedbaxk (0-20 pts)</li>
                 <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-success"></div> <b>P3</b> — Continuité de service (0-15 pts)</li>
                 <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-success"></div> <b>P4</b> — Équilibre de charge (0-15 pts)</li>
                 <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-warning"></div> <b>P5-P6</b> — Fiabilité + Ancienneté (0-20 pts)</li>
                 <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#E87A1E]"></div> <b>P7</b> — Préférence nominative client (+20 bonus)</li>
                 <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#0078b0]"></div> <b>Cascade Solver</b> — Réaffectation récursive (profondeur max 2)</li>
               </ul>
            </div>
            
            <div className="bg-white p-6 shadow-sm border-l-4 border-[#E87A1E]">
               <h3 className="font-bold text-lg mb-4 text-samsic-marine">Historique Automatique des Actions </h3>
               <div className="space-y-4">
                  <div className="border-b border-[#ded4c9] pb-3 text-sm">
                     <p className="text-xs text-samsic-marine-50 uppercase tracking-wide">Aujourd'hui, 06:45</p>
                     <p className="font-bold mt-1">✓ Remplacement immédiat validé</p>
                     <p>Maladie M. Dubois → Affecté L. Girard (Client: Deloitte)</p>
                     <p className="text-xs text-success mt-1">Validation automatique (Score 98%)</p>
                  </div>
                  <div className="border-b border-[#ded4c9] pb-3 text-sm">
                     <p className="text-xs text-samsic-marine-50 uppercase tracking-wide">Hier, 19:20</p>
                     <p className="font-bold mt-1">✗ Proposition ignorée par l'humain</p>
                     <p>Absence P. Sanchez → IA propose A. Moreau.</p>
                     <p className="text-xs text-[#E87A1E] mt-1">Coordinateur a forcé: J. Bernard (Exception client)</p>
                  </div>
               </div>
            </div>
         </div>
      </DashboardModal>
    </>
  );
}

