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

export function AIAutoScheduleModal({ isOpen, currentDate, onClose, onComplete }: AIAutoScheduleModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setStartDate(currentDate.toISOString().split('T')[0]);
      const end = new Date(currentDate);
      end.setUTCDate(end.getUTCDate() + 6);
      setEndDate(end.toISOString().split('T')[0]);
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
    <div className="fixed inset-0 bg-samsic-marine/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white w-full mx-auto shadow-2xl overflow-hidden flex flex-col max-h-[95vh] rounded-none ${step === 'SCENARIOS' ? 'max-w-5xl' : 'max-w-xl'}`}>
        {/* Header */}
        <div className="bg-samsic-marine px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-samsic-sable" />
            <h2 className="text-lg font-body font-bold text-white">
              {step === 'SCENARIOS' ? 'Arbitrage Stratégique IA' : 'Génération Planning IA'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* SETUP STEP */}
        {step === 'SETUP' && (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div>
              <label className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider block mb-2">
                Période de projection
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-samsic-marine-50 uppercase font-bold">Date de début</span>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-200 p-2.5 text-sm text-samsic-marine font-bold font-body outline-none focus:border-samsic-marine transition-colors bg-white hover:border-gray-300"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-samsic-marine-50 uppercase font-bold">Date de fin</span>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-200 p-2.5 text-sm text-samsic-marine font-bold font-body outline-none focus:border-samsic-marine transition-colors bg-white hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider block mb-2">
                Périmètre IA
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('FILL_GAPS')}
                  className={`p-4 text-left border transition-colors ${
                    mode === 'FILL_GAPS' ? 'border-samsic-marine bg-samsic-sable-30' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className={mode === 'FILL_GAPS' ? 'text-samsic-marine' : 'text-gray-500'} />
                    <span className="font-bold font-body text-sm text-samsic-marine">Combler les trous</span>
                  </div>
                  <p className="text-xs text-samsic-marine-50 break-words">Ne planifie que sur les créneaux vacants ("Non couvert").</p>
                </button>
                <button
                  onClick={() => setMode('OVERRIDE_ALL')}
                  className={`p-4 text-left border transition-colors ${
                    mode === 'OVERRIDE_ALL' ? 'border-samsic-marine bg-samsic-sable-30' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <RotateCw size={16} className={mode === 'OVERRIDE_ALL' ? 'text-samsic-marine' : 'text-gray-500'} />
                    <span className="font-bold font-body text-sm text-samsic-marine">Optimisation Totale</span>
                  </div>
                  <p className="text-xs text-samsic-marine-50 break-words">Remplace le planning existant pour une optimisation globale.</p>
                </button>
              </div>
            </div>

            <div className="bg-samsic-sable-30 p-3 flex items-start gap-3 border-l-4 border-l-samsic-marine">
              <Zap size={16} className="text-samsic-marine flex-shrink-0 mt-0.5" />
              <p className="text-xs text-samsic-marine-80 font-body leading-relaxed">
                Le moteur IA préparera <b>3 scénarios</b> différents basés sur vos priorités d'arbitrage. (Mode simulation avant validation finale).
              </p>
            </div>
            
            <button
              onClick={handleSimulate}
              className="w-full bg-samsic-marine text-white font-bold font-body py-3 hover:bg-samsic-marine-80 transition-colors flex items-center justify-center gap-2"
            >
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
                  className="py-3 px-6 bg-white border border-gray-200 text-gray-600 font-bold font-body text-sm hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setStep('REPORT')}
                  className="py-3 px-6 bg-samsic-marine text-white font-bold font-body text-sm hover:bg-samsic-marine-80 transition-colors flex items-center gap-2"
                >
                  Valider l'Approche et Voir Détails
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>
        )}

        {/* REPORT STEP */}
        {step === 'REPORT' && report && proposals && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto">
              <div className="bg-samsic-marine/5 p-4 border-l-4 border-l-samsic-marine flex items-start gap-4 mb-6">
                <div className="bg-white p-2 border shadow-sm flex-shrink-0">
                   {getStrategyIcon(selectedScenario!.strategy)}
                </div>
                <div>
                  <h3 className="text-samsic-marine font-bold font-body text-base mb-1">Scénario: {selectedScenario!.title}</h3>
                  <p className="text-xs text-samsic-marine-80 font-body leading-relaxed">
                    Vous êtes sur le point d'appliquer : {report.totalProposals} affectations selon la stratégie de {selectedScenario!.title.toLowerCase()}.
                  </p>
                </div>
              </div>

              <h4 className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider mb-3">Compte Rendu Final</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="border border-gray-100 bg-gray-50 p-4 text-center rounded-none">
                  <div className="text-3xl font-black text-samsic-marine font-display mb-1">{report.totalProposals}</div>
                  <div className="text-xs text-gray-500 font-body">Propositions d'affectation</div>
                </div>
                <div className="border border-gray-100 bg-gray-50 p-4 text-center rounded-none">
                  <div className="text-3xl font-black text-samsic-marine font-display mb-1">{report.averageScore}<span className="text-lg text-gray-400">/100</span></div>
                  <div className="text-xs text-gray-500 font-body">Score de matching moyen</div>
                </div>
                <div className="border border-gray-100 bg-gray-50 p-4 text-center rounded-none">
                  <div className="text-3xl font-black text-success font-display mb-1">+{report.estimatedSavings} €</div>
                  <div className="text-xs text-gray-500 font-body">Impact Financier</div>
                </div>
                <div className="border border-gray-100 bg-gray-50 p-4 text-center rounded-none">
                  <div className="text-3xl font-black text-amber-600 font-display mb-1">{report.conflictsResolved}</div>
                  <div className="text-xs text-gray-500 font-body">Réaffectations optimisées</div>
                </div>
              </div>

              {/* SECTION UNFILLED GAPS */}
              {report.unfilledGaps && report.unfilledGaps.length > 0 && (
                <div className="bg-red-50 p-4 border-l-4 border-red-500 mb-6 rounded-none">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-800 font-bold font-body text-sm mb-2">Postes non pourvus ({report.unfilledGaps.length})</h4>
                      <p className="text-xs text-red-900 mb-3">L'IA n'a trouvé aucun agent disponible réunissant toutes les exigences strictes pour les postes suivants :</p>
                      <ul className="text-xs text-red-900 font-body space-y-2 list-none pl-0">
                        {report.unfilledGaps.slice(0, 5).map((gap: any, i) => (
                          <li key={i} className="bg-white/60 p-2 border border-red-200">
                            <span className="font-bold">{gap.clientName} - {gap.postName}</span> <span className="opacity-70">({gap.date})</span>
                            <br/><span className="italic opacity-80 block mt-1 leading-tight">{gap.reason}</span>
                          </li>
                        ))}
                        {report.unfilledGaps.length > 5 && (
                          <li className="text-red-800 font-bold text-[10px] mt-2">+ {report.unfilledGaps.length - 5} autres créneaux non couverts...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION WARNINGS */}
              {proposals.some(p => p.warnings && p.warnings.length > 0) && (
                <div className="bg-amber-50 p-4 border-l-4 border-l-amber-500 mb-6 rounded-none">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-amber-800 font-bold font-body text-sm mb-2">Points d'attention identifiés ({report.warningsCount})</h4>
                      <ul className="text-xs text-amber-900 font-body space-y-2 list-disc pl-4">
                        {Array.from(new Set(proposals.flatMap(p => p.warnings || []))).map((w: any, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setStep('SCENARIOS')}
                className="py-3 px-4 bg-white border border-gray-200 text-gray-600 font-bold font-body text-sm hover:bg-gray-50 transition-colors"
              >
                Retour aux Scénarios
              </button>
              <button
                onClick={handleApply}
                className="py-3 px-6 bg-samsic-marine text-white font-bold font-body text-sm hover:bg-samsic-marine-80 transition-colors flex justify-center items-center gap-2"
              >
                Appliquer Définitivement au Planning
                <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
