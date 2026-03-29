/**
 * AISuggestionPanel — Panneau latéral de suggestions IA v2
 * 16 critères (12 éliminatoires + 7 pondérés)
 * Affiche le reasoning détaillé et les motifs d'élimination
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Check, XCircle, Cpu, ChevronDown, ChevronUp, AlertTriangle, Zap, Shield, Clock } from 'lucide-react';

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
  criteria: ScoringCriteria;
  confidence: number;
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
  TEAM_LEADER: '#D42E12',
  TITULAR: '#0A4DA6',
  BACKUP: '#E87A1E',
};

// ==================== SUB-COMPONENTS ====================

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = pct >= 80 ? '#2E7D32' : pct >= 50 ? '#E87A1E' : value > 0 ? '#0078b0' : '#c2c4c7';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-samsic-sable-30 overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold font-body w-10 text-right tabular-nums" style={{ color }}>
        {value}/{max}
      </span>
    </div>
  );
}

function EliminatoryBadges({ criteria }: { criteria: ScoringCriteria }) {
  const checks = [
    { key: 'e1_languages', label: 'Langues', pass: criteria.e1_languages },
    { key: 'e2_skills', label: 'Compétences', pass: criteria.e2_skills },
    { key: 'e3_availability', label: 'Disponibilité', pass: criteria.e3_availability },
    { key: 'e4_legalRest11h', label: 'Repos 11h', pass: criteria.e4_legalRest11h },
    { key: 'e5_maxDailyHours', label: 'Max 10h/j', pass: criteria.e5_maxDailyHours },
    { key: 'e6_maxWeeklyHours', label: 'Max 48h/sem', pass: criteria.e6_maxWeeklyHours },
    { key: 'e7_clientBlacklist', label: 'Blacklist', pass: criteria.e7_clientBlacklist },
    { key: 'e8_certifications', label: 'Certif.', pass: criteria.e8_certifications },
    { key: 'e9_securityClearance', label: 'Habilitation', pass: criteria.e9_securityClearance },
    { key: 'e10_geographicZone', label: 'Zone', pass: criteria.e10_geographicZone },
    { key: 'e11_consecutiveDays', label: '6j consec.', pass: criteria.e11_consecutiveDays },
    { key: 'e12_contractValidity', label: 'Contrat', pass: criteria.e12_contractValidity },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {checks.map(c => (
        <span
          key={c.key}
          className={`inline-flex items-center gap-0.5 text-[9px] font-bold font-body px-1.5 py-0.5 ${
            c.pass
              ? 'bg-[#e8f5e9] text-[#2E7D32]'
              : 'bg-[#fce4ec] text-[#c62828]'
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
  rank: number;
  onAccept: () => void;
  onRefuse: () => void;
  isAccepting: boolean;
}) {
  const [expanded, setExpanded] = useState(rank === 0);
  const initials = `${suggestion.firstName?.[0] || '?'}${suggestion.lastName?.[0] || '?'}`.toUpperCase();
  const scoreColor =
    suggestion.totalScore >= 70
      ? 'text-[#2E7D32]'
      : suggestion.totalScore >= 40
      ? 'text-[#E87A1E]'
      : 'text-[#D42E12]';

  const typeColor = EMPLOYEE_TYPE_COLOR[suggestion.employeeType] || '#0A0A0A';
  const hasBonus = suggestion.criteria?.p7_clientPreference > 0;

  return (
    <div
      className={`border border-[#d5d0c8] ${rank === 0 ? 'border-l-4 border-l-[#2E7D32]' : ''} bg-white`}
    >
      {/* Card header */}
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Rang */}
        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-[#F5F3EF] text-xs font-bold text-[#0A0A0A] font-body">
          {rank + 1}
        </div>

        {/* Initiales + type indicator */}
        <div className="relative">
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#0A0A0A] text-white font-bold text-sm font-body">
            {initials}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3"
            style={{ backgroundColor: typeColor }}
            title={EMPLOYEE_TYPE_LABEL[suggestion.employeeType] || suggestion.employeeType}
          />
        </div>

        {/* Nom + type + bonus */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#0A0A0A] font-body truncate">
            {suggestion.firstName} {suggestion.lastName}
            {hasBonus && <span className="ml-1 text-[#E87A1E]">⭐</span>}
          </p>
          <p className="text-xs text-[#6b6860] font-body">
            {EMPLOYEE_TYPE_LABEL[suggestion.employeeType] ?? suggestion.employeeType}
            {' · '}
            <span className="text-[#0A0A0A]">{suggestion.employeeCode}</span>
          </p>
        </div>

        {/* Score */}
        <div className={`text-2xl font-bold ${scoreColor}`} style={{ fontFamily: 'var(--font-display, system-ui)' }}>
          {suggestion.totalScore}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-7 h-7 flex items-center justify-center text-[#a09e97] hover:text-[#0A0A0A] transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded: critère breakdown v2 */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-[#d5d0c8] pt-3 space-y-3">
          {/* Éliminatoires — badge row */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield size={10} className="text-[#6b6860]" />
              <span className="text-[10px] font-bold text-[#6b6860] font-body uppercase tracking-wider">
                Contrôles éliminatoires
              </span>
            </div>
            {suggestion.criteria && <EliminatoryBadges criteria={suggestion.criteria} />}
          </div>

          {/* Pondérés — barres */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap size={10} className="text-[#6b6860]" />
              <span className="text-[10px] font-bold text-[#6b6860] font-body uppercase tracking-wider">
                Score détaillé
              </span>
            </div>
            <div className="space-y-1.5">
              {WEIGHTED_CRITERIA.map(({ key, label, max, icon }) => {
                const value = suggestion.criteria?.[key] ?? 0;
                if (key === 'p7_clientPreference' && value === 0) return null;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-[#6b6860] font-body">
                        {icon} {label}
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
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Cpu size={10} className="text-[#6b6860]" />
                <span className="text-[10px] font-bold text-[#6b6860] font-body uppercase tracking-wider">
                  Analyse IA
                </span>
              </div>
              <div className="space-y-0.5">
                {suggestion.reasoning.slice(0, 5).map((r, i) => (
                  <p key={i} className="text-[10px] text-[#6b6860] font-body pl-2 border-l-2 border-[#d5d0c8]">
                    {r}
                  </p>
                ))}
                {suggestion.reasoning.length > 5 && (
                  <p className="text-[10px] text-[#a09e97] font-body pl-2">
                    +{suggestion.reasoning.length - 5} critères évalués...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Confiance IA */}
          <div className="flex items-center justify-between pt-2 border-t border-[#d5d0c8]">
            <span className="text-[10px] text-[#a09e97] font-body">
              Confiance IA : {Math.round((suggestion.confidence || 0) * 100)}%
            </span>
            <span className="text-[10px] text-[#a09e97] font-body">
              Score max: 100 + bonus
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={onAccept}
          disabled={isAccepting}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#0A0A0A] text-white text-xs font-bold font-body hover:bg-[#333] transition-colors disabled:opacity-60"
        >
          <Check size={13} />
          {isAccepting ? 'Affectation...' : 'Accepter'}
        </button>
        <button
          onClick={onRefuse}
          className="flex items-center justify-center gap-1 px-3 py-2 border border-[#d5d0c8] text-xs font-bold text-[#0A0A0A] font-body hover:bg-[#F5F3EF] transition-colors"
        >
          <XCircle size={13} />
          Refuser
        </button>
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
  const [suggestions, setSuggestions] = useState<ScoreBreakdown[]>([]);
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

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, date, clientId: postId?.split('--')?.[0], clientName, postName }),
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setTotalScored(data.totalEmployeesScored ?? 0);
      setTotalEligible(data.totalEligible ?? 0);
      setTotalEliminated(data.totalEliminated ?? 0);
      setProcessingMs(data.processingMs ?? 0);
      setEngineVersion(data.engineVersion ?? '');
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel from right */}
      <aside
        className="fixed top-0 right-0 h-full w-[420px] max-w-full bg-[#F5F3EF] z-50 flex flex-col shadow-2xl"
        role="dialog"
        aria-label="Suggestions IA v2"
      >
        {/* Panel header */}
        <div className="bg-[#0A0A0A] text-white px-5 py-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Cpu size={14} className="text-[#D42E12] flex-shrink-0" />
                <span className="text-xs font-bold font-body text-[#D42E12] uppercase tracking-wider">
                  Moteur IA {engineVersion}
                </span>
              </div>
              <h2 className="text-base font-body font-extrabold text-white leading-tight">
                {clientName}
              </h2>
              <p className="text-sm text-[#a09e97] font-body mt-0.5">
                {postName} · <span className="capitalize">{formattedDate}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#6b6860] hover:text-white hover:bg-[#333] transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* IA processing info bar */}
        {!isLoading && suggestions.length > 0 && (
          <div className="bg-[#e3f2fd] border-b border-[#90caf9] px-5 py-2 flex-shrink-0">
            <p className="text-xs text-[#1565c0] font-body">
              <span className="font-bold">{totalEligible} éligible{totalEligible > 1 ? 's' : ''}</span>
              {' / '}
              <span className="font-bold">{totalScored} scorés</span>
              {' · '}
              <span className="font-bold">{totalEliminated} éliminés</span>
              {' · '}
              <Clock size={10} className="inline" /> {processingMs}ms
              {' · '}
              16 critères
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#6b6860]">
              <div className="w-8 h-8 border-2 border-[#d5d0c8] border-t-[#D42E12] animate-spin" />
              <p className="text-sm font-body">Analyse en cours…</p>
              <p className="text-xs font-body text-[#a09e97]">
                Scoring 44 agents sur 16 critères
              </p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-[#fce4ec] border border-[#D42E12] px-4 py-3">
              <p className="text-sm text-[#D42E12] font-body font-bold">{error}</p>
              <button
                onClick={fetchSuggestions}
                className="mt-2 text-xs text-[#D42E12] font-body underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* No suggestions */}
          {!isLoading && !error && suggestions.length === 0 && (
            <div className="bg-white border border-[#d5d0c8] px-5 py-8 text-center">
              <AlertTriangle size={24} className="mx-auto mb-2 text-[#E87A1E]" />
              <p className="text-[#0A0A0A] font-bold font-body text-sm mb-1">
                Aucun candidat éligible
              </p>
              <p className="text-xs text-[#6b6860] font-body">
                Les {totalEliminated || 44} agents ont été éliminés par les critères :
                langues, compétences, disponibilité, repos légal, blacklist, certifications ou contrat.
              </p>
            </div>
          )}

          {/* Candidates */}
          {!isLoading &&
            suggestions.map((s, i) => (
              <CandidateCard
                key={s.employeeId}
                suggestion={s}
                rank={i}
                onAccept={() => handleAccept(s)}
                onRefuse={() => handleRefuse(s)}
                isAccepting={acceptingId === s.employeeId}
              />
            ))}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-[#d5d0c8] px-5 py-3 flex-shrink-0">
          <p className="text-[10px] text-[#a09e97] font-body text-center">
            12 critères éliminatoires · 7 pondérés · Cascade Solver · Moteur {engineVersion}
          </p>
        </div>
      </aside>
    </>
  );
}
