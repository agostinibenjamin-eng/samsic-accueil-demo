/**
 * AISuggestionPanel — Panneau latéral de suggestions IA v2
 * 16 critères (12 éliminatoires + 7 pondérés) + Mode Débrayage Manuel
 * Affiche le reasoning détaillé et les motifs d'élimination
 * @samsic-design-system — Modern Fluid SaaS (rounded, soft shadows)
 */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { X, Check, XCircle, Cpu, ChevronDown, ChevronUp, AlertTriangle, Zap, Shield, Clock, Sparkles, Search, Users, ShieldAlert } from 'lucide-react';

// ==================== TYPES v2 ====================

export interface ScoringCriteria {
  // Éliminatoires
  e1_languages: boolean;
  e2_skills: boolean;
  e3_availability: boolean;
  e4_legalRest11h: boolean;
  e5_maxDailyHours: boolean;
  e6_maxWeeklyHours: boolean;
  e7_clientBlacklist: boolean;
  e8_certifications: boolean;
  e9_securityClearance: boolean;
  e10_geographicZone: boolean;
  e11_consecutiveDays: boolean;
  e12_contractValidity: boolean;
  // Pondérés
  p1_training: number;
  p2_clientAffinity: number;
  p3_serviceContinuity: number;
  p4_workloadBalance: number;
  p5_reliability: number;
  p6_seniority: number;
  p7_clientPreference: number;
}

export interface ScoreBreakdown {
  employeeId: string;
  employeeName?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  employeeType: string;
  totalScore: number;
  isEligible: boolean;
  eliminationReasons?: string[];
  reasoning?: string[];
  criteria?: ScoringCriteria;
  confidence?: number;
}

export interface AISuggestionPanelProps {
  isOpen: boolean;
  postId: string | null;
  clientName: string;
  postName: string;
  date: string | null;
  onClose: () => void;
  onAccept: (employeeId: string, employeeCode: string, score: number) => void;
}

// ==================== CRITERIA CONFIG v2 ====================

const WEIGHTED_CRITERIA: Array<{
  key: keyof Pick<ScoringCriteria, 'p1_training' | 'p2_clientAffinity' | 'p3_serviceContinuity' | 'p4_workloadBalance' | 'p5_reliability' | 'p6_seniority' | 'p7_clientPreference'>;
  label: string;
  max: number;
  icon: string;
}> = [
  { key: 'p1_training', label: 'Formation au poste', max: 30, icon: '🎓' },
  { key: 'p2_clientAffinity', label: 'Affinité client', max: 20, icon: '🤝' },
  { key: 'p3_serviceContinuity', label: 'Continuité service', max: 15, icon: '🔄' },
  { key: 'p4_workloadBalance', label: 'Équilibre charge', max: 15, icon: '⚖️' },
  { key: 'p5_reliability', label: 'Fiabilité', max: 10, icon: '✅' },
  { key: 'p6_seniority', label: 'Ancienneté', max: 10, icon: '📅' },
  { key: 'p7_clientPreference', label: 'Préférence client', max: 20, icon: '⭐' },
];

const EMPLOYEE_TYPE_LABEL: Record<string, string> = {
  TEAM_LEADER: 'Team Leader',
  TITULAR: 'Titulaire',
  BACKUP: 'Backup',
};

const EMPLOYEE_TYPE_COLOR: Record<string, string> = {
  TEAM_LEADER: '#ef4444',
  TITULAR: '#3b82f6',
  BACKUP: '#f59e0b',
};

// ==================== SUB-COMPONENTS ====================

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : value > 0 ? '#3b82f6' : '#cbd5e1';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold w-10 text-right tabular-nums" style={{ color }}>
        {value}/{max}
      </span>
    </div>
  );
}

function EliminatoryBadges({ criteria }: { criteria: ScoringCriteria }) {
  const checks = [
    { key: 'e1_languages', label: 'Langues', pass: criteria.e1_languages },
    { key: 'e2_skills', label: 'Compét.', pass: criteria.e2_skills },
    { key: 'e3_availability', label: 'Disponibilité', pass: criteria.e3_availability },
    { key: 'e4_legalRest11h', label: 'Repos 11h', pass: criteria.e4_legalRest11h },
    { key: 'e5_maxDailyHours', label: 'Max 10h/j', pass: criteria.e5_maxDailyHours },
    { key: 'e6_maxWeeklyHours', label: 'Max 48h/s', pass: criteria.e6_maxWeeklyHours },
    { key: 'e7_clientBlacklist', label: 'Blacklist', pass: criteria.e7_clientBlacklist },
    { key: 'e8_certifications', label: 'Certif.', pass: criteria.e8_certifications },
    { key: 'e9_securityClearance', label: 'Habilitation', pass: criteria.e9_securityClearance },
    { key: 'e10_geographicZone', label: 'Zone', pass: criteria.e10_geographicZone },
    { key: 'e11_consecutiveDays', label: '6j conséc.', pass: criteria.e11_consecutiveDays },
    { key: 'e12_contractValidity', label: 'Contrat', pass: criteria.e12_contractValidity },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {checks.map(c => (
        <span
          key={c.key}
          className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
            c.pass
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
              : 'bg-red-50 text-red-700 ring-1 ring-red-100'
          }`}
        >
          {c.pass ? '✓' : '✕'} {c.label}
        </span>
      ))}
    </div>
  );
}

function CandidateCard({
  suggestion,
  rank,
  onAccept,
  onRefuse,
  isAccepting,
}: {
  suggestion: ScoreBreakdown;
  rank?: number;
  onAccept: () => void;
  onRefuse: () => void;
  isAccepting: boolean;
}) {
  const [expanded, setExpanded] = useState(rank === 0);
  const initials = `${suggestion.firstName?.[0] || '?'}${suggestion.lastName?.[0] || '?'}`.toUpperCase();
  const scoreColor = !suggestion.isEligible
    ? 'text-red-500'
    : suggestion.totalScore >= 70
    ? 'text-emerald-600'
    : suggestion.totalScore >= 40
    ? 'text-amber-500'
    : 'text-red-500';

  const typeColor = EMPLOYEE_TYPE_COLOR[suggestion.employeeType] || '#0f172a';
  const hasBonus = suggestion.criteria?.p7_clientPreference ? suggestion.criteria.p7_clientPreference > 0 : false;

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-all overflow-hidden ${rank === 0 && suggestion.isEligible ? 'ring-2 ring-emerald-500/20 border-emerald-200' : suggestion.isEligible ? 'border-slate-200' : 'border-red-200'}`}
    >
      {/* Card header */}
      <div className={`px-5 py-4 flex items-center gap-3 ${!suggestion.isEligible ? 'opacity-80 grayscale-[20%]' : ''}`}>
        {/* Rang ou Alerte */}
        {suggestion.isEligible ? (
          <>
            {rank === 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow text-xs font-bold border-2 border-white z-10">
                ★
              </div>
            )}
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-slate-100 text-slate-700 text-xs font-bold ring-1 ring-slate-200">
              #{rank !== undefined ? rank + 1 : '-'}
            </div>
          </>
        ) : (
          <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-red-100 text-red-700 ring-1 ring-red-200">
            <X size={16} strokeWidth={3} />
          </div>
        )}

        {/* Initiales + type indicator */}
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm ${!suggestion.isEligible ? 'bg-slate-400' : 'bg-slate-800'}`}>
            {initials}
          </div>
          <div
            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ backgroundColor: typeColor }}
            title={EMPLOYEE_TYPE_LABEL[suggestion.employeeType] || suggestion.employeeType}
          />
        </div>

        {/* Nom + type + bonus */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-slate-800 truncate flex items-center gap-1.5">
            {suggestion.firstName} {suggestion.lastName}
            {hasBonus && <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">Favori</span>}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {EMPLOYEE_TYPE_LABEL[suggestion.employeeType] ?? suggestion.employeeType}
            {' · '}
            <span className="font-medium text-slate-600">{suggestion.employeeCode}</span>
          </p>
        </div>

        {/* Score ou Warning */}
        {suggestion.isEligible ? (
          <div className={`text-2xl font-black ${scoreColor} tabular-nums tracking-tight`}>
            {suggestion.totalScore}
          </div>
        ) : (
          <ShieldAlert size={20} className="text-red-400" />
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className={`px-5 pb-4 border-t border-slate-100 pt-4 bg-slate-50/50`}>
          
          {/* ELIMINATED: Show explicit risks */}
          {!suggestion.isEligible && suggestion.eliminationReasons && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2 border-b border-red-100 pb-2">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
                  Impacts & Risques (Assignation non-conforme)
                </span>
              </div>
              <ul className="space-y-1">
                {suggestion.eliminationReasons.map((reason, idx) => (
                  <li key={idx} className="text-[11px] text-red-700 flex items-start gap-1.5">
                    <span className="mt-0.5">•</span> <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ELIGIBLE: Show criteria breakdown */}
          {suggestion.isEligible && (
            <>
              {/* Éliminatoires — badge row */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Filtres Bloquants (12)
                  </span>
                </div>
                {suggestion.criteria && <EliminatoryBadges criteria={suggestion.criteria} />}
              </div>

              {/* Pondérés — barres */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Score Analytique
                  </span>
                </div>
                <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  {WEIGHTED_CRITERIA.map(({ key, label, max, icon }) => {
                    const value = Math.round(suggestion.criteria?.[key] ?? 0);
                    if (key === 'p7_clientPreference' && value === 0) return null;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-slate-600">
                            {icon} <span className="ml-1">{label}</span>
                          </span>
                        </div>
                        <ScoreBar value={value} max={max} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reasoning — explications IA */}
              {suggestion.reasoning && suggestion.reasoning.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Rapport IA
                    </span>
                  </div>
                  <div className="space-y-1 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    {suggestion.reasoning.slice(0, 5).map((r, i) => (
                      <p key={i} className="text-[11px] text-slate-700 pl-2 border-l-2 border-blue-300">
                        {r}
                      </p>
                    ))}
                    {suggestion.reasoning.length > 5 && (
                      <p className="text-[10px] text-blue-400 font-medium pl-2 mt-1">
                        +{suggestion.reasoning.length - 5} critères évalués...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Confiance IA */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-medium">
                  Confiance IA : <span className={(suggestion.confidence ?? 0) > 0.8 ? 'text-emerald-500 font-bold' : 'text-slate-500'}>{Math.round((suggestion.confidence || 0) * 100)}%</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Score max: 100 + bonus
                </span>
              </div>
            </>
          )}

        </div>
      )}

      {/* Actions */}
      <div className={`px-4 py-3 flex gap-3 border-t bg-white ${!suggestion.isEligible ? 'border-red-100' : 'border-slate-100'}`}>
        <button
          onClick={onAccept}
          disabled={isAccepting}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
            !suggestion.isEligible 
              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isAccepting ? (
            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : !suggestion.isEligible ? (
            <AlertTriangle size={16} />
          ) : (
            <Check size={16} />
          )}
          {isAccepting ? 'Affectation...' : !suggestion.isEligible ? 'Forcer (Passe outre RH)' : 'Valider'}
        </button>
        {suggestion.isEligible && (
          <button
            onClick={onRefuse}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <XCircle size={16} />
            Refuser
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN PANEL ====================

export function AISuggestionPanel({
  isOpen,
  postId,
  clientName,
  postName,
  date,
  onClose,
  onAccept,
}: AISuggestionPanelProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [suggestions, setSuggestions] = useState<ScoreBreakdown[]>([]);
  const [eliminated, setEliminated] = useState<ScoreBreakdown[]>([]);
  const [totalScored, setTotalScored] = useState(0);
  const [totalEligible, setTotalEligible] = useState(0);
  const [totalEliminated, setTotalEliminated] = useState(0);
  const [processingMs, setProcessingMs] = useState(0);
  const [engineVersion, setEngineVersion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Fetch suggestions IA quand le panneau s'ouvre
  const fetchSuggestions = useCallback(async () => {
    if (!postId && !clientName) return;
    if (!date) return;
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setEliminated([]);
    setActiveTab('ai'); // Revenir à IA sur un nouveau calcul

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, date, clientId: postId?.split('--')?.[0], clientName, postName }),
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setEliminated(data.eliminated ?? []);
      setTotalScored(data.totalEmployeesScored ?? 0);
      setTotalEligible(data.totalEligible ?? 0);
      setTotalEliminated(data.totalEliminated ?? 0);
      setProcessingMs(data.processingMs ?? 0);
      setEngineVersion(data.engineVersion ?? '');
      
      // Si 0 suggestion, basculer naturellement sur le tab Manuel (après 1 seconde pour voir la page vide)
      if (data.suggestions?.length === 0) {
        setTimeout(() => setActiveTab('manual'), 1500);
      }
    } catch (err) {
      setError('Impossible de charger les suggestions IA.');
    } finally {
      setIsLoading(false);
    }
  }, [postId, date, clientName, postName]);

  useEffect(() => {
    if (isOpen && date) {
      fetchSuggestions();
    }
  }, [isOpen, date, fetchSuggestions]);

  const handleAccept = useCallback(
    async (suggestion: ScoreBreakdown) => {
      setAcceptingId(suggestion.employeeId);
      try {
        // En mode proto, on fait un accept local
        onAccept(suggestion.employeeId, suggestion.employeeCode, suggestion.totalScore);
        onClose();
      } catch {
        setError("Impossible d'enregistrer l'affectation.");
      } finally {
        setAcceptingId(null);
      }
    },
    [onAccept, onClose]
  );

  const handleRefuse = (suggestion: ScoreBreakdown) => {
    setSuggestions(prev => prev.filter(s => s.employeeId !== suggestion.employeeId));
  };

  const filteredManualList = useMemo(() => {
    const all = [...suggestions, ...eliminated];
    if (!searchQuery) return all;
    return all.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suggestions, eliminated, searchQuery]);

  if (!isOpen) return null;

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} aria-hidden="true" />

      <aside className="fixed top-2 right-2 bottom-2 w-[480px] max-w-[calc(100vw-1rem)] bg-slate-50 rounded-2xl z-50 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-300">
        
        {/* Panel header (Bright/Modern) */}
        <div className="bg-white px-6 py-5 flex flex-col flex-shrink-0 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex flex-col items-center justify-center text-blue-600 ring-4 ring-white shadow-sm flex-shrink-0">
                <Cpu size={20} />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-[15px] font-bold text-slate-800 leading-tight truncate">
                  {clientName}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {postName} <span className="mx-1 text-slate-300">|</span> <span className="capitalize">{formattedDate}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          {!isLoading && !error && (
            <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-bold transition-all rounded-lg ${
                  activeTab === 'ai' 
                    ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Sparkles size={14} className={activeTab === 'ai' ? 'text-blue-500' : ''} />
                Moteur IA
                {suggestions.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === 'ai' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                    {suggestions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-bold transition-all rounded-lg ${
                  activeTab === 'manual' 
                    ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Users size={14} className={activeTab === 'manual' ? 'text-slate-700' : ''} />
                Assigner manuellement
              </button>
            </div>
          )}
        </div>

        {/* IA processing info bar */}
        {!isLoading && activeTab === 'ai' && (
          <div className="bg-blue-50/50 border-b border-blue-100 px-6 py-2.5 flex-shrink-0">
            <p className="text-[11px] text-blue-700 font-medium flex items-center justify-center gap-1.5">
              <span className="font-bold flex items-center gap-1"><Check size={12} className="text-emerald-500" /> {totalEligible} éligible{totalEligible > 1 ? 's' : ''}</span>
              <span className="text-blue-300">·</span>
              <span className="text-slate-500">{totalEliminated} non-éligibles</span>
              <span className="text-blue-300">·</span>
              <Clock size={10} className="text-blue-400" /> {processingMs}ms
            </p>
          </div>
        )}

        {/* Search Bar for Manual Tab */}
        {!isLoading && activeTab === 'manual' && (
          <div className="px-5 py-3 border-b border-slate-100 bg-white flex-shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou matricule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/50">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200" />
                <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={20} className="text-blue-500 animate-pulse" />
                </div>
              </div>
              <p className="text-[15px] font-bold text-slate-800 mb-1">Passage au crible...</p>
              <p className="text-[12px] text-slate-500">Scoring de 44 agents et vérification des conflits</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col items-center text-center">
              <AlertTriangle size={24} className="text-red-500 mb-2" />
              <p className="text-sm text-red-700 font-bold mb-2">{error}</p>
              <button
                onClick={fetchSuggestions}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Tenter à nouveau
              </button>
            </div>
          )}

          {/* Tab: IA */}
          {!isLoading && !error && activeTab === 'ai' && (
            <>
              {suggestions.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center shadow-sm mt-4">
                  <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                    <AlertTriangle size={28} />
                  </div>
                  <p className="text-slate-800 font-bold text-[15px] mb-2">
                    Aucun candidat éligible trouvé
                  </p>
                  <p className="text-[12px] text-slate-500 leading-relaxed max-w-[300px] mx-auto text-balance">
                    Les {totalEliminated || 44} agents de votre base ont tous été écartés (conflits d'horaires, compétences requises, ou limite de repos). Moteur IA a basculé au mode Manuel.
                  </p>
                  <button 
                    onClick={() => setActiveTab('manual')}
                    className="mt-6 text-[13px] font-bold text-white bg-slate-900 px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Voir l'inventaire complet
                  </button>
                </div>
              )}
              {suggestions.map((s, i) => (
                <CandidateCard
                  key={s.employeeId}
                  suggestion={s}
                  rank={i}
                  onAccept={() => handleAccept(s)}
                  onRefuse={() => handleRefuse(s)}
                  isAccepting={acceptingId === s.employeeId}
                />
              ))}
            </>
          )}

          {/* Tab: Manual */}
          {!isLoading && !error && activeTab === 'manual' && (
            <>
               <div className="mb-2">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                   Inventaire — {filteredManualList.length} résultats
                 </p>
               </div>
               
               {filteredManualList.map((s, i) => (
                <CandidateCard
                  key={s.employeeId}
                  suggestion={s}
                  onAccept={() => handleAccept(s)}
                  onRefuse={() => handleRefuse(s)}
                  isAccepting={acceptingId === s.employeeId}
                />
              ))}

              {filteredManualList.length === 0 && (
                <div className="text-center py-10 px-4">
                   <p className="text-slate-500 font-medium text-[13px]">Aucun agent correspondant à "{searchQuery}"</p>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100/50 border-t border-slate-200 px-6 py-3 flex-shrink-0">
          <p className="text-[10px] text-slate-400 font-medium text-center flex justify-center items-center gap-1.5">
            <Zap size={10} className="text-blue-400" /> Cascade Solver · Moteur {engineVersion || 'v2.1'}
          </p>
        </div>
      </aside>
    </>
  );
}
