/**
 * /settings — Paramètres & Configuration Moteur IA v2
 * Sections : Moteur IA, Poids des critères, Seuils, Notifications, Intégrations
 */
'use client';

import { useState, useCallback } from 'react';
import { SettingsSidebar } from '@/components/layout/SettingsSidebar';
import {
  Cpu, Sliders, Bell, Shield, BarChart3, Users, Save,
  CheckCircle, AlertTriangle, ChevronDown, ChevronRight,
  Scale, Zap, Globe, BookOpen, Clock, RotateCcw
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface CriterionConfig {
  id: string;
  label: string;
  type: 'ELIMINATORY' | 'WEIGHTED';
  weight?: number;
  enabled: boolean;
  description: string;
}

interface ThresholdConfig {
  id: string;
  label: string;
  value: number;
  unit: string;
  description: string;
  min: number;
  max: number;
}

// ── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_CRITERIA: CriterionConfig[] = [
  // Éliminatoires
  { id: 'E1', label: 'Formation site', type: 'ELIMINATORY', enabled: true, description: 'L\'agent doit être formé sur le poste client' },
  { id: 'E2', label: 'Compétences requises', type: 'ELIMINATORY', enabled: true, description: 'Skills obligatoires (VIP, standard, badges...)' },
  { id: 'E3', label: 'Langues minimales', type: 'ELIMINATORY', enabled: true, description: 'Langues exigées par le client' },
  { id: 'E4', label: 'Plafond heures hebdo', type: 'ELIMINATORY', enabled: true, description: 'Max 48h/semaine (Code du Travail)' },
  { id: 'E5', label: 'Repos obligatoire', type: 'ELIMINATORY', enabled: true, description: 'Min 11h entre deux shifts' },
  { id: 'E6', label: 'Anti double-affectation', type: 'ELIMINATORY', enabled: true, description: 'Pas de chevauchement de shifts' },
  { id: 'E7', label: 'Employé actif', type: 'ELIMINATORY', enabled: true, description: 'Contrat actif (pas en fin de CDD, pas en congé longue durée)' },
  { id: 'E8', label: 'Zone géographique', type: 'ELIMINATORY', enabled: true, description: 'L\'agent accepte de travailler dans la zone du client' },
  { id: 'E9', label: 'Disponibilité créneau', type: 'ELIMINATORY', enabled: true, description: 'L\'agent n\'a pas ce shift bloqué' },
  { id: 'E10', label: 'Exigence véhicule', type: 'ELIMINATORY', enabled: true, description: 'Si le site client requiert un véhicule personnel' },
  { id: 'E11', label: 'Certifications valides', type: 'ELIMINATORY', enabled: true, description: 'SST, sécurité incendie, etc.' },
  { id: 'E12', label: 'Client blacklist', type: 'ELIMINATORY', enabled: true, description: 'Feedback négatif client → exclusion' },
  // Pondérés
  { id: 'P1', label: 'Niveau formation', type: 'WEIGHTED', weight: 30, enabled: true, description: 'Profondeur de formation sur le poste (apprenti → expert)' },
  { id: 'P2', label: 'Score fiabilité', type: 'WEIGHTED', weight: 20, enabled: true, description: 'Historique ponctualité, taux d\'absence' },
  { id: 'P3', label: 'Niveau langues', type: 'WEIGHTED', weight: 15, enabled: true, description: 'Couverture linguistique au-delà du minimum' },
  { id: 'P4', label: 'Proximité géo', type: 'WEIGHTED', weight: 10, enabled: true, description: 'Préférence zone proche du domicile' },
  { id: 'P5', label: 'Continuité affectation', type: 'WEIGHTED', weight: 10, enabled: true, description: 'Bonus si l\'agent était déjà affecté la semaine précédente' },
  { id: 'P6', label: 'Équilibrage charge', type: 'WEIGHTED', weight: 10, enabled: true, description: 'Favorise les agents sous-utilisés' },
  { id: 'P7', label: 'Feedback client', type: 'WEIGHTED', weight: 5, enabled: true, description: 'Avis historiques du client sur cet agent' },
];

const DEFAULT_THRESHOLDS: ThresholdConfig[] = [
  { id: 'maxWeeklyHours', label: 'Heures max/semaine', value: 48, unit: 'h', description: 'Plafond légal hebdomadaire (Code du Travail)', min: 35, max: 60 },
  { id: 'minRestBetweenShifts', label: 'Repos min entre shifts', value: 11, unit: 'h', description: 'Repos obligatoire entre deux shifts', min: 8, max: 16 },
  { id: 'cascadeMaxDepth', label: 'Profondeur cascade', value: 2, unit: 'niveaux', description: 'Profondeur de recherche du Cascade Solver', min: 1, max: 5 },
  { id: 'cddAlertDays', label: 'Alerte CDD avant fin', value: 60, unit: 'jours', description: 'Jours avant expiration CDD pour déclencher l\'alerte', min: 15, max: 120 },
  { id: 'fragilityThreshold', label: 'Seuil fragilité poste', value: 70, unit: '%', description: 'Au-dessus de ce score, le poste est signalé comme fragile', min: 40, max: 95 },
  { id: 'minOccupancyTarget', label: 'Objectif occupation', value: 85, unit: '%', description: 'Taux d\'occupation cible pour les agents', min: 60, max: 100 },
  { id: 'certExpiryAlert', label: 'Alerte certif expirante', value: 30, unit: 'jours', description: 'Jours avant expiration d\'une certification', min: 7, max: 90 },
];

// ── Components ───────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: typeof Cpu;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-[#d5d0c8] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-[#F5F3EF] transition-colors"
      >
        <Icon size={18} className="text-[#0A0A0A] flex-shrink-0" />
        <span className="text-sm font-bold font-body text-[#0A0A0A] flex-1">{title}</span>
        {isOpen ? <ChevronDown size={16} className="text-[#a09e97]" /> : <ChevronRight size={16} className="text-[#a09e97]" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-5 border-t border-[#d5d0c8]">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [criteria, setCriteria] = useState<CriterionConfig[]>(DEFAULT_CRITERIA);
  const [thresholds, setThresholds] = useState<ThresholdConfig[]>(DEFAULT_THRESHOLDS);
  const [saved, setSaved] = useState(false);
  const [learningEnabled, setLearningEnabled] = useState(true);
  const [autoResolve, setAutoResolve] = useState(false);
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifWarning, setNotifWarning] = useState(true);
  const [notifInfo, setNotifInfo] = useState(false);

  const totalWeight = criteria
    .filter(c => c.type === 'WEIGHTED' && c.enabled)
    .reduce((sum, c) => sum + (c.weight ?? 0), 0);

  const handleWeightChange = useCallback((id: string, newWeight: number) => {
    setCriteria(prev => prev.map(c =>
      c.id === id ? { ...c, weight: Math.max(0, Math.min(100, newWeight)) } : c
    ));
    setSaved(false);
  }, []);

  const handleToggle = useCallback((id: string) => {
    setCriteria(prev => prev.map(c =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ));
    setSaved(false);
  }, []);

  const handleThresholdChange = useCallback((id: string, newValue: number) => {
    setThresholds(prev => prev.map(t =>
      t.id === id ? { ...t, value: Math.max(t.min, Math.min(t.max, newValue)) } : t
    ));
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, []);

  const handleReset = useCallback(() => {
    setCriteria(DEFAULT_CRITERIA);
    setThresholds(DEFAULT_THRESHOLDS);
    setSaved(false);
  }, []);

  const eliminatory = criteria.filter(c => c.type === 'ELIMINATORY');
  const weighted = criteria.filter(c => c.type === 'WEIGHTED');

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SettingsSidebar />

      <main className="flex-1 overflow-y-auto print:overflow-visible bg-[var(--bg-page)] print:bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-body font-extrabold text-samsic-marine">
                Paramètres — Moteur IA
              </h1>
              <p className="text-sm text-samsic-marine-50 font-body mt-1">
                Configuration du moteur de scoring v2.0 · 16 critères · Cascade Solver
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-[#d5d0c8] text-xs font-bold font-body text-[#6b6860] hover:bg-[#F5F3EF] transition-colors"
              >
                <RotateCcw size={13} />
                Réinitialiser
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-[#0A0A0A] text-white text-xs font-bold font-body hover:bg-[#333] transition-colors"
              >
                <Save size={13} />
                {saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-4 max-w-5xl">

          {/* ── Engine Status ── */}
          <Section title="Moteur IA v2.0 — Statut" icon={Cpu}>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-[#e8f5e9] px-4 py-3 text-center">
                <div className="text-lg font-black font-display text-[#2E7D32]">ACTIF</div>
                <div className="text-[10px] text-[#2E7D32] font-body">Statut moteur</div>
              </div>
              <div className="bg-[#F5F3EF] px-4 py-3 text-center">
                <div className="text-lg font-black font-display text-[#0A0A0A]">v2.0</div>
                <div className="text-[10px] text-[#6b6860] font-body">Version</div>
              </div>
              <div className="bg-[#F5F3EF] px-4 py-3 text-center">
                <div className="text-lg font-black font-display text-[#0A0A0A]">16</div>
                <div className="text-[10px] text-[#6b6860] font-body">Critères actifs</div>
              </div>
              <div className="bg-[#F5F3EF] px-4 py-3 text-center">
                <div className="text-lg font-black font-display text-[#0A0A0A]">&lt; 3ms</div>
                <div className="text-[10px] text-[#6b6860] font-body">Latence scoring</div>
              </div>
            </div>

            {/* Learning Engine Toggle */}
            <div className="mt-4 p-4 bg-[#F5F3EF] border border-[#d5d0c8]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-[#0A0A0A]" />
                    <span className="text-sm font-bold font-body text-[#0A0A0A]">Learning Engine</span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#e3f2fd] text-[#0078b0] font-bold">BETA</span>
                  </div>
                  <p className="text-xs text-[#6b6860] font-body mt-1">
                    Ajuste automatiquement les poids des critères en fonction des feedbacks clients (ACCEPTED/REFUSED)
                  </p>
                </div>
                <button
                  onClick={() => { setLearningEnabled(!learningEnabled); setSaved(false); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${learningEnabled ? 'bg-[#2E7D32]' : 'bg-[#d5d0c8]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${learningEnabled ? 'left-[26px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </Section>

          {/* ── Eliminatory Criteria ── */}
          <Section title={`Critères Éliminatoires (${eliminatory.filter(c => c.enabled).length}/${eliminatory.length} actifs)`} icon={Shield}>
            <p className="text-xs text-[#6b6860] font-body mt-3 mb-4">
              Un candidat qui échoue à un critère éliminatoire est <strong className="text-[#C62828]">exclu immédiatement</strong>.
              Désactiver un critère augmente le pool de candidats mais réduit la sécurité.
            </p>
            <div className="space-y-2">
              {eliminatory.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 bg-[#F5F3EF] border border-[#d5d0c8]">
                  <button
                    onClick={() => handleToggle(c.id)}
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                      c.enabled ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' : 'bg-white border-[#d5d0c8]'
                    }`}
                  >
                    {c.enabled && <CheckCircle size={12} />}
                  </button>
                  <span className="text-[10px] font-bold font-body text-[#a09e97] w-8 flex-shrink-0">{c.id}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold font-body text-[#0A0A0A]">{c.label}</span>
                    <p className="text-xs text-[#6b6860] font-body">{c.description}</p>
                  </div>
                  {!c.enabled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fce4ec] text-[#C62828]">DÉSACTIVÉ</span>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ── Weighted Criteria ── */}
          <Section title={`Critères Pondérés (${totalWeight}/100 points distribués)`} icon={Sliders}>
            <p className="text-xs text-[#6b6860] font-body mt-3 mb-2">
              Ajustez les poids pour personnaliser le scoring. Le total doit être proche de 100.
            </p>
            {totalWeight !== 100 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#fff3e0] border-l-2 border-l-[#E87A1E] mb-4">
                <AlertTriangle size={14} className="text-[#E87A1E]" />
                <span className="text-xs font-bold font-body text-[#E87A1E]">
                  Total {totalWeight}/100 — {totalWeight < 100 ? `${100 - totalWeight} points non attribués` : `${totalWeight - 100} points en excès`}
                </span>
              </div>
            )}
            <div className="space-y-3 mt-3">
              {weighted.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 bg-[#F5F3EF] border border-[#d5d0c8]">
                  <button
                    onClick={() => handleToggle(c.id)}
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                      c.enabled ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' : 'bg-white border-[#d5d0c8]'
                    }`}
                  >
                    {c.enabled && <CheckCircle size={12} />}
                  </button>
                  <span className="text-[10px] font-bold font-body text-[#a09e97] w-8 flex-shrink-0">{c.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold font-body text-[#0A0A0A]">{c.label}</span>
                    </div>
                    <p className="text-xs text-[#6b6860] font-body">{c.description}</p>
                    {c.enabled && (
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="range"
                          min={0}
                          max={50}
                          value={c.weight ?? 0}
                          onChange={e => handleWeightChange(c.id, parseInt(e.target.value))}
                          className="flex-1 h-1.5 bg-[#d5d0c8] appearance-none cursor-pointer accent-[#0A0A0A]"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={c.weight ?? 0}
                            onChange={e => handleWeightChange(c.id, parseInt(e.target.value) || 0)}
                            className="w-12 px-2 py-1 text-xs text-center font-bold font-body border border-[#d5d0c8] bg-white text-[#0A0A0A]"
                          />
                          <span className="text-[10px] text-[#6b6860] font-body">pts</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {!c.enabled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fce4ec] text-[#C62828]">DÉSACTIVÉ</span>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ── Thresholds ── */}
          <Section title="Seuils & Limites opérationnelles" icon={Scale} defaultOpen={false}>
            <div className="space-y-3 mt-4">
              {thresholds.map(t => (
                <div key={t.id} className="flex items-center gap-4 px-4 py-3 bg-[#F5F3EF] border border-[#d5d0c8]">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold font-body text-[#0A0A0A]">{t.label}</span>
                    <p className="text-xs text-[#6b6860] font-body">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="range"
                      min={t.min}
                      max={t.max}
                      value={t.value}
                      onChange={e => handleThresholdChange(t.id, parseInt(e.target.value))}
                      className="w-28 h-1.5 bg-[#d5d0c8] appearance-none cursor-pointer accent-[#0A0A0A]"
                    />
                    <input
                      type="number"
                      min={t.min}
                      max={t.max}
                      value={t.value}
                      onChange={e => handleThresholdChange(t.id, parseInt(e.target.value) || t.min)}
                      className="w-14 px-2 py-1 text-xs text-center font-bold font-body border border-[#d5d0c8] bg-white text-[#0A0A0A]"
                    />
                    <span className="text-[10px] text-[#6b6860] font-body w-12">{t.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Notifications ── */}
          <Section title="Notifications & Alertes" icon={Bell} defaultOpen={false}>
            <div className="space-y-3 mt-4">
              {[
                { label: 'Alertes CRITIQUES', desc: 'Postes non couverts, absences non remplacées', state: notifCritical, set: setNotifCritical, color: '#C62828' },
                { label: 'Alertes ATTENTION', desc: 'CDD expirant, couverture dégradée, dépassement heures', state: notifWarning, set: setNotifWarning, color: '#E87A1E' },
                { label: 'Alertes INFO', desc: 'Fragilité postes, optimisation charge, certifications', state: notifInfo, set: setNotifInfo, color: '#0078b0' },
              ].map(({ label, desc, state, set, color }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 bg-[#F5F3EF] border border-[#d5d0c8]">
                  <div>
                    <span className="text-sm font-bold font-body text-[#0A0A0A]">{label}</span>
                    <p className="text-xs text-[#6b6860] font-body">{desc}</p>
                  </div>
                  <button
                    onClick={() => { set(!state); setSaved(false); }}
                    className={`relative w-12 h-6 rounded-full transition-colors`}
                    style={{ backgroundColor: state ? color : '#d5d0c8' }}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${state ? 'left-[26px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}

              {/* Auto-resolve */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#F5F3EF] border border-[#d5d0c8]">
                <div>
                  <span className="text-sm font-bold font-body text-[#0A0A0A]">Auto-résolution IA</span>
                  <p className="text-xs text-[#6b6860] font-body">Accepter automatiquement les suggestions avec un score ≥ 90/100</p>
                </div>
                <button
                  onClick={() => { setAutoResolve(!autoResolve); setSaved(false); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${autoResolve ? 'bg-[#2E7D32]' : 'bg-[#d5d0c8]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoResolve ? 'left-[26px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </Section>

          {/* ── Integrations ── */}
          <Section title="Intégrations & Modules" icon={BarChart3} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { name: 'Cascade Solver', desc: 'Réaffectation en cascade (profondeur configurée)', status: 'ACTIF', icon: Zap, color: '#2E7D32' },
                { name: 'Idle Time Optimizer', desc: 'Détection sous-utilisation, suggestions formations', status: 'ACTIF', icon: Clock, color: '#2E7D32' },
                { name: 'Learning Engine', desc: 'Ajustement des poids par feedback client', status: 'BETA', icon: BookOpen, color: '#0078b0' },
                { name: 'Multi-lingue Matcher', desc: 'Matching linguistique avancé (9 langues)', status: 'ACTIF', icon: Globe, color: '#2E7D32' },
                { name: 'Turnover Predictor', desc: 'Alertes proactives CDD, départs, certifications', status: 'ACTIF', icon: Users, color: '#2E7D32' },
                { name: 'Legal Compliance', desc: 'Contrôle Code du Travail (48h, 11h repos)', status: 'ACTIF', icon: Scale, color: '#2E7D32' },
              ].map(({ name, desc, status, icon: ModIcon, color }) => (
                <div key={name} className="px-4 py-3 bg-[#F5F3EF] border border-[#d5d0c8] flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white border border-[#d5d0c8] flex-shrink-0">
                    <ModIcon size={14} className="text-[#0A0A0A]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-body text-[#0A0A0A]">{name}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5"
                        style={{ backgroundColor: color + '15', color }}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6b6860] font-body mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </main>
    </div>
  );
}
