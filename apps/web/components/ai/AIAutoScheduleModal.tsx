'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, X, CheckCircle2, AlertTriangle, Zap, RotateCw, ChevronRight, Euro, HeartHandshake, Scale } from 'lucide-react';
import type { ScenarioResult } from '@/types/ai-engine';

interface AIAutoScheduleModalProps {
  isOpen: boolean;
  currentDate: Date;
  onClose: () => void;
  onComplete: () => void;
}

const toLocalISOString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function AIAutoScheduleModal({ isOpen, currentDate, onClose, onComplete }: AIAutoScheduleModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setStartDate(toLocalISOString(currentDate));
      const end = new Date(currentDate);
      end.setDate(end.getDate() + 6);
      setEndDate(toLocalISOString(end));
      setMode('FILL_GAPS');
      setStep('SETUP');
    }
  }, [isOpen, currentDate]);
  
  const [mode, setMode] = useState<'FILL_GAPS' | 'OVERRIDE_ALL'>('FILL_GAPS');
  const [step, setStep] = useState<'SETUP' | 'SIMULATING' | 'SCENARIOS' | 'REPORT' | 'APPLYING'>('SETUP');
  
  const [scenarios, setScenarios] = useState<ScenarioResult[] | null>(null);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [loadingText, setLoadingText] = useState('Analyse des variables...');

  useEffect(() => {
    let interval: any;
    if (step === 'SIMULATING') {
      const msgs = [
        'Analyse des données et des contrats...',
        'Génération scénario financier (Zéro Heures Vides)...',
        'Génération scénario satisfaction (Continuité)...',
        'Génération scénario équilibré...',
        'Compilation des résultats...'
      ];
      let i = 0;
      interval = setInterval(() => {
        setLoadingText(msgs[i % msgs.length]);
        i++;
      }, 700);
    }
    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setStep('SIMULATING');
    
    // Validate dates
    if (!startDate || !endDate) return;

    try {
      const res = await fetch('/api/ai/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          mode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
        setStep('SCENARIOS');
      } else {
        setStep('SETUP');
      }
    } catch (e) {
      console.error(e);
      setStep('SETUP');
    }
  };

  const selectedScenario = scenarios?.[selectedScenarioIndex];
  const report = selectedScenario?.report;
  const proposals = selectedScenario?.proposals;

  const handleApply = async () => {
    if (!proposals) return;
    setStep('APPLYING');
    try {
      await fetch('/api/planning/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: proposals }),
      });
      onComplete(); // Refreshes the grid
      onClose();
    } catch (e) {
      console.error(e);
      setStep('REPORT');
    }
  };

  const handleClose = () => {
    setStep('SETUP');
    setScenarios(null);
    setSelectedScenarioIndex(0);
    onClose();
  };

  const getStrategyIcon = (strategy: string) => {
    if (strategy === 'OPTIMIZE_COSTS') return <Euro size={20} className="text-amber-500" />;
    if (strategy === 'MAXIMIZE_SATISFACTION') return <HeartHandshake size={20} className="text-pink-500" />;
    return <Scale size={20} className="text-samsic-marine" />;
  };

  return (
    <div className="fixed inset-0 bg-samsic-marine/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white w-full mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[95vh] rounded-2xl border border-white/20 ${step === 'SCENARIOS' ? 'max-w-5xl' : 'max-w-xl'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-samsic-marine/5 flex items-center justify-center">
              <Sparkles size={16} className="text-samsic-marine" />
            </div>
            <h2 className="text-lg font-display font-bold text-samsic-marine">
              {step === 'SCENARIOS' ? 'Arbitrage Stratégique IA' : 'Génération Planning IA'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* SETUP STEP */}
        {step === 'SETUP' && (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div>
              <label className="text-xs font-bold font-body text-gray-400 uppercase tracking-wider block mb-3">
                Période de projection
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-gray-500 font-medium">Date de début</span>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm text-samsic-marine font-medium outline-none focus:border-samsic-marine focus:ring-2 focus:ring-samsic-marine/10 transition-all bg-gray-50/50 hover:bg-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-gray-500 font-medium">Date de fin</span>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm text-samsic-marine font-medium outline-none focus:border-samsic-marine focus:ring-2 focus:ring-samsic-marine/10 transition-all bg-gray-50/50 hover:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold font-body text-gray-400 uppercase tracking-wider block mb-3">
                Périmètre IA
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('FILL_GAPS')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    mode === 'FILL_GAPS' ? 'border-samsic-marine bg-samsic-marine/5 ring-1 ring-samsic-marine shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 size={16} className={mode === 'FILL_GAPS' ? 'text-samsic-marine' : 'text-gray-400'} />
                    <span className={`font-bold font-body text-sm ${mode === 'FILL_GAPS' ? 'text-samsic-marine' : 'text-gray-700'}`}>Combler les trous</span>
                  </div>
                  <p className="text-xs text-gray-500 break-words leading-relaxed pl-6">Ne planifie que sur les créneaux vacants ("Non couvert").</p>
                </button>
                <button
                  onClick={() => setMode('OVERRIDE_ALL')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    mode === 'OVERRIDE_ALL' ? 'border-samsic-marine bg-samsic-marine/5 ring-1 ring-samsic-marine shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <RotateCw size={16} className={mode === 'OVERRIDE_ALL' ? 'text-samsic-marine' : 'text-gray-400'} />
                    <span className={`font-bold font-body text-sm ${mode === 'OVERRIDE_ALL' ? 'text-samsic-marine' : 'text-gray-700'}`}>Optimisation Totale</span>
                  </div>
                  <p className="text-xs text-gray-500 break-words leading-relaxed pl-6">Remplace le planning existant pour une optimisation globale.</p>
                </button>
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
              <Zap size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                Le moteur IA préparera <b className="font-bold">3 scénarios</b> différents basés sur vos priorités d'arbitrage. (Mode simulation avant validation finale).
              </p>
            </div>
            
            <button
              onClick={handleSimulate}
              className="w-full bg-samsic-marine text-white font-bold font-body py-3.5 rounded-xl hover:bg-samsic-marine-80 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles size={16} />
              Lancer l'Algorithme Multi-Passes
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {(step === 'SIMULATING' || step === 'APPLYING') && (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-samsic-sable border-t-samsic-marine animate-spin rounded-full" />
            <p className="text-samsic-marine font-bold font-body text-center animate-pulse">
              {step === 'SIMULATING' ? loadingText : 'Sauvegarde des affectations en cours...'}
            </p>
          </div>
        )}

        {/* SCENARIOS STEP */}
        {step === 'SCENARIOS' && scenarios && (
          <div className="flex flex-col flex-1 overflow-hidden">
             <div className="p-6 bg-samsic-sable-30 flex-shrink-0">
               <h3 className="text-sm font-bold font-body text-samsic-marine mb-2">3 Scénarios d'Arbitrage Générés</h3>
               <p className="text-xs text-samsic-marine-80">Sélectionnez le scénario le plus adapté pour cette période avant validation détaillée.</p>
             </div>
             
             <div className="p-6 overflow-y-auto w-full">
               <div className="grid md:grid-cols-3 gap-6">
                 {scenarios.map((sc, index) => {
                   const isSelected = selectedScenarioIndex === index;
                   const isRecommended = sc.strategy === 'BALANCED';
                   
                   return (
                     <div 
                       key={sc.strategy}
                       onClick={() => setSelectedScenarioIndex(index)}
                       className={`relative flex flex-col border transition-all cursor-pointer bg-white group hover:shadow-lg ${
                         isSelected 
                          ? 'border-samsic-marine ring-2 ring-samsic-marine/20 shadow-md transform scale-[1.02]' 
                          : 'border-gray-200'
                       }`}
                     >
                       {isRecommended && (
                         <div className="absolute -top-3 inset-x-0 mx-auto w-max px-3 py-1 bg-samsic-marine text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 z-10 shadow-sm">
                           <Sparkles size={12} />
                           Recommandation IA
                         </div>
                       )}
                       
                       <div className={`p-5 flex-1 ${isSelected ? 'bg-samsic-marine/5' : ''}`}>
                         <div className="flex items-center gap-3 mb-3">
                           {getStrategyIcon(sc.strategy)}
                           <h4 className="font-bold font-body text-samsic-marine text-base leading-tight">{sc.title}</h4>
                         </div>
                         <p className="text-xs text-samsic-marine-80 mb-6 min-h-[48px] leading-relaxed">
                           {sc.description}
                         </p>
                         
                         <div className="space-y-4">
                           <div className="flex items-center justify-between border-b pb-2">
                             <span className="text-xs text-gray-500 font-body">Score Global</span>
                             <span className="text-sm font-bold font-display text-samsic-marine">{sc.report.averageScore}/100</span>
                           </div>
                           <div className="flex items-center justify-between border-b pb-2">
                             <span className="text-xs text-gray-500 font-body">Impact Financier</span>
                             <span className={`text-sm font-bold font-display ${sc.report.estimatedSavings > 10 ? 'text-green-500' : 'text-amber-500'}`}>
                               +{sc.report.estimatedSavings} €
                             </span>
                           </div>
                           <div className="flex items-center justify-between border-b pb-2">
                             <span className="text-xs text-gray-500 font-body">Alertes (Warnings)</span>
                             <span className={`text-sm font-bold font-display ${sc.report.warningsCount > 0 ? 'text-amber-500' : 'text-gray-500'}`}>
                               {sc.report.warningsCount}
                             </span>
                           </div>
                           <div className="flex items-center justify-between border-b pb-2">
                             <span className="text-xs text-gray-500 font-body">Affectations</span>
                             <span className="text-sm font-bold font-display text-gray-600">{sc.report.totalProposals}</span>
                           </div>
                         </div>
                       </div>
                       
                       <div className={`p-4 text-center border-t transition-colors ${isSelected ? 'bg-samsic-marine text-white' : 'bg-gray-50 text-samsic-marine group-hover:bg-gray-100'}`}>
                         <span className="text-xs font-bold font-body uppercase tracking-wider">
                           {isSelected ? 'Scénario Sélectionné' : 'Voir ce scénario'}
                         </span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
             
             <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  onClick={handleClose}
                  className="py-2.5 px-6 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold font-body text-sm hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setStep('REPORT')}
                  className="py-2.5 px-6 bg-samsic-marine rounded-xl shadow-sm text-white font-bold font-body text-sm hover:bg-samsic-marine-80 hover:shadow transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Valider l'Approche
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>
        )}

        {/* REPORT STEP */}
        {step === 'REPORT' && report && proposals && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto">
              <div className="bg-samsic-marine/5 rounded-2xl p-5 border border-samsic-marine/10 flex items-start gap-4 mb-8">
                <div className="bg-white p-3 rounded-xl shadow-sm flex-shrink-0 flex items-center justify-center">
                   {getStrategyIcon(selectedScenario!.strategy)}
                </div>
                <div className="pt-1">
                  <h3 className="text-samsic-marine font-bold font-display text-lg mb-1">{selectedScenario!.title}</h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Vous allez appliquer <span className="font-bold text-samsic-marine">{report.totalProposals} affectations</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-4 bg-samsic-marine rounded-full"></div>
                <h4 className="text-sm font-bold font-display text-samsic-marine uppercase tracking-wider">Compte Rendu Final</h4>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="border border-gray-100 bg-white shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center">
                  <div className="text-3xl font-black text-samsic-marine font-display mb-2">{report.totalProposals}</div>
                  <div className="text-[11px] text-gray-500 font-medium text-center leading-tight">Propositions<br/>d'affectation</div>
                </div>
                <div className="border border-gray-100 bg-white shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center">
                  <div className="text-3xl font-black text-samsic-marine font-display mb-2">{report.averageScore}<span className="text-lg text-gray-300">/100</span></div>
                  <div className="text-[11px] text-gray-500 font-medium text-center leading-tight">Score Moyen<br/>de matching</div>
                </div>
                <div className="border border-gray-100 bg-white shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center">
                  <div className="text-3xl font-black text-emerald-500 font-display mb-2">+{report.estimatedSavings} €</div>
                  <div className="text-[11px] text-gray-500 font-medium text-center leading-tight">Impact Financier<br/>estimé</div>
                </div>
                <div className="border border-gray-100 bg-white shadow-sm rounded-2xl p-5 flex flex-col items-center justify-center">
                  <div className="text-3xl font-black text-amber-500 font-display mb-2">{report.conflictsResolved}</div>
                  <div className="text-[11px] text-gray-500 font-medium text-center leading-tight">Réaffectations<br/>optimisées</div>
                </div>
              </div>

              {/* SECTION UNFILLED GAPS */}
              {report.unfilledGaps && report.unfilledGaps.length > 0 && (
                <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-lg shrink-0 mt-0.5">
                      <AlertTriangle size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-red-800 font-bold font-display text-sm mb-1.5">Postes non pourvus ({report.unfilledGaps.length})</h4>
                      <p className="text-xs text-red-700/80 mb-4 font-medium leading-relaxed">L'IA n'a pas pu couvrir ces créneaux en respectant les filtres exigeants :</p>
                      <ul className="space-y-2">
                        {report.unfilledGaps.slice(0, 5).map((gap: any, i) => (
                          <li key={i} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm text-xs">
                            <span className="font-bold text-samsic-marine">{gap.clientName} - {gap.postName}</span> <span className="opacity-70 text-gray-500 ml-1">({gap.date})</span>
                            <br/><span className="text-red-600/80 italic font-medium block mt-1.5">{gap.reason}</span>
                          </li>
                        ))}
                        {report.unfilledGaps.length > 5 && (
                          <li className="text-red-800/60 font-medium text-xs mt-3 ml-1">+ {report.unfilledGaps.length - 5} autres créneaux non couverts...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION WARNINGS */}
              {proposals.some(p => p.warnings && p.warnings.length > 0) && (
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0 mt-0.5">
                      <AlertTriangle size={18} className="text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-amber-800 font-bold font-display text-sm mb-2">Points d'attention identifiés ({report.warningsCount})</h4>
                      <ul className="text-xs text-amber-900/80 font-medium space-y-2 list-disc pl-4">
                        {Array.from(new Set(proposals.flatMap(p => p.warnings || []))).map((w: any, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setStep('SCENARIOS')}
                className="py-2.5 px-6 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold font-body text-sm hover:bg-gray-50 transition-colors"
               >
                Retour aux Scénarios
              </button>
              <button
                onClick={handleApply}
                className="py-2.5 px-6 bg-emerald-600 shadow-sm rounded-xl text-white font-bold font-body text-sm hover:bg-emerald-700 hover:shadow transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
              >
                Appliquer au Planning
                <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
