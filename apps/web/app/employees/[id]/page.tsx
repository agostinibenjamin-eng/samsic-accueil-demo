'use client';
/**
 * /employees/[id] — Fiche employé complète et éditable
 * @samsic-design-system — Marine/Sable, 0-radius, Open Sans
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EmployeesSidebar } from '@/components/layout/EmployeesSidebar';
import { useSamsicStore } from '@/lib/store/use-samsic-store';
import {
  ArrowLeft, Edit, Save, X, Check, AlertTriangle, TrendingUp,
  Phone, Mail, MapPin, Briefcase, Globe, Award, Star,
  Clock, ShieldCheck, ShieldAlert, Zap, User, ChevronRight
} from 'lucide-react';
import type { EmployeeFullProfile, EmployeeLanguage, EmployeeSkill } from '@/lib/data/employees-data';

// ─── Constants ────────────────────────────────────────────────────────────────

const LANG_CONFIG: Record<string, { flag: string; name: string }> = {
  fr: { flag: '🇫🇷', name: 'Français' }, en: { flag: '🇬🇧', name: 'English' },
  de: { flag: '🇩🇪', name: 'Deutsch' }, lu: { flag: '🇱🇺', name: 'Lëtzebuergesch' },
  pt: { flag: '🇵🇹', name: 'Português' }, zh: { flag: '🇨🇳', name: '中文' },
  ar: { flag: '🇸🇦', name: 'العربية' }, jp: { flag: '🇯🇵', name: '日本語' },
  it: { flag: '🇮🇹', name: 'Italiano' }, es: { flag: '🇪🇸', name: 'Español' },
};

const LEVEL_COLORS = {
  NATIVE:       'bg-samsic-marine text-white',
  FLUENT:       'bg-samsic-bleu text-white',
  INTERMEDIATE: 'bg-samsic-sable text-samsic-marine',
  BEGINNER:     'bg-gray-100 text-gray-600',
};

const LEVEL_LABELS: Record<string, string> = {
  NATIVE: 'Natif', FLUENT: 'Courant', INTERMEDIATE: 'Intermédiaire', BEGINNER: 'Débutant',
  EXPERT: 'Expert', COMPETENT: 'Compétent', LEARNING: 'En formation',
};

const SKILL_LEVEL_COLORS: Record<string, string> = {
  EXPERT: 'bg-samsic-marine text-white',
  COMPETENT: 'bg-samsic-bleu-30 text-samsic-bleu',
  LEARNING: 'bg-amber-50 text-amber-700',
};

const TYPE_LABELS = { TITULAR: 'Titulaire', BACKUP: 'Backup', TEAM_LEADER: 'Team Leader' };
const CONTRACT_LABELS = { CDI: 'CDI', CDD: 'CDD', INTERIM: 'Intérim' };

const ALL_SKILLS = [
  { id: 'accueil_vip', label: 'Accueil VIP' },
  { id: 'accueil_standard', label: 'Accueil standard' },
  { id: 'standard_tel', label: 'Standard téléphonique' },
  { id: 'badges', label: 'Gestion badges' },
  { id: 'courrier', label: 'Gestion courrier' },
  { id: 'management', label: 'Management équipe' },
  { id: 'planning', label: 'Gestion planning' },
];

// ─── Derived AI opportunities ─────────────────────────────────────────────────

function getAiOpportunities(emp: EmployeeFullProfile) {
  const gap = emp.utilizationGap;
  if (gap <= 0) return [];
  const opp = [];
  if (gap >= 8) opp.push({ id: 'o1', client: 'Cargolux Airlines', post: 'Standard Ops', days: 'Mer + Jeu', score: 74, revenue: Math.round(gap * 0.5 * emp.billedRate) });
  if (gap >= 4) opp.push({ id: 'o2', client: 'ING Bank Luxembourg', post: 'Standard Téléphonique backup', days: 'Vendredi', score: 88, revenue: Math.round(Math.min(gap, 8) * emp.billedRate) });
  if (gap >= 4 && emp.languages.some(l => l.code === 'de')) opp.push({ id: 'o3', client: 'Société Générale', post: 'Renfort Standard Multilingue', days: 'Jeudi PM', score: 81, revenue: Math.round(4 * emp.billedRate) });
  return opp.slice(0, 3);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OccupancyBar({ rate, gap, billedRate }: { rate: number; gap: number; billedRate: number }) {
  const color = rate >= 90 ? '#2E7D32' : rate >= 70 ? '#E87A1E' : '#C62828';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider">Taux d'occupation</span>
        <span className="text-2xl font-black font-display" style={{ color }}>{rate}%</span>
      </div>
      <div className="h-2 bg-gray-100 w-full">
        <div className="h-2 transition-all duration-700" style={{ width: `${rate}%`, backgroundColor: color }} />
      </div>
      {gap > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2">
          <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
          <span className="text-xs text-red-700 font-body">
            <strong>{gap}h non placées</strong> · Manque à gagner : <strong>{Math.round(gap * billedRate)}€</strong>
          </span>
        </div>
      )}
    </div>
  );
}

function TrainingBadge({ status }: { status: string }) {
  const cfg = {
    TRAINED:     { icon: <ShieldCheck size={11} />, cls: 'bg-green-50 text-green-700 border-green-200', label: 'Formé' },
    IN_PROGRESS: { icon: <Clock size={11} />,       cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'En cours' },
    TO_TRAIN:    { icon: <ShieldAlert size={11} />, cls: 'bg-red-50 text-red-600 border-red-200',   label: 'À former' },
  }[status] ?? { icon: null, cls: '', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { employees, updateEmployee, updateEmployeeLanguages, updateEmployeeSkills, updateEmployeeTraining, acceptSuggestion } = useSamsicStore();
  const emp = employees.find(e => e.id === id);

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Partial<EmployeeFullProfile>>({});
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [savedBanner, setSavedBanner] = useState(false);

  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  if (!emp) {
    return (
      <div className="flex h-screen bg-[var(--bg-page)]">
        <EmployeesSidebar isDetailView />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-samsic-marine-50 font-body">Employé introuvable</p>
            <Link href="/employees" className="text-samsic-bleu text-sm underline">← Retour à la liste</Link>
          </div>
        </main>
      </div>
    );
  }

  const opportunities = getAiOpportunities(emp);
  const field = (key: keyof EmployeeFullProfile) => editMode
    ? (draft as Record<string, unknown>)[key] ?? emp[key]
    : emp[key];

  function startEdit() { setDraft({}); setEditMode(true); }
  function cancelEdit() { setDraft({}); setEditMode(false); }
  function setDraftField(key: keyof EmployeeFullProfile, val: unknown) {
    setDraft(d => ({ ...d, [key]: val }));
  }

  function saveChanges() {
    if (!emp) return;
    if (Object.keys(draft).length > 0) {
      updateEmployee(emp.id, draft);
    }
    setEditMode(false);
    setDraft({});
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  }

  function handleAcceptOpp(opp: { id: string; client: string; post: string; days: string; score: number; revenue: number }) {
    if (!emp) return;
    acceptSuggestion({
      id: opp.id, type: 'FILL_SLOT',
      employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`,
      clientId: opp.client.toLowerCase().replace(/\s/g, '-'),
      clientName: opp.client, postName: opp.post,
      date: new Date().toISOString().split('T')[0],
      acceptedAt: new Date().toISOString(),
      revenueImpact: opp.revenue,
    });
    setAcceptedIds(s => [...s, opp.id]);
  }

  const initials = `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();
  const typeColor = (TYPE_LABELS as Record<string, string>)[emp.employeeType]
    ? emp.employeeType === 'TEAM_LEADER' ? 'bg-slate-100 text-samsic-marine font-semibold'
    : emp.employeeType === 'BACKUP' ? 'bg-samsic-bleu-30 text-samsic-bleu font-medium'
    : 'bg-samsic-sable-30 text-samsic-marine font-medium'
    : 'bg-gray-100 text-gray-600';

  return (
    <div className="flex h-screen bg-[var(--bg-page)] overflow-hidden">
      <EmployeesSidebar isDetailView />
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/employees" className="text-samsic-marine-50 hover:text-samsic-marine flex items-center gap-1 text-sm font-body transition-colors">
              <ArrowLeft size={14} /> Employés
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-samsic-marine font-display font-black text-xl">{emp.firstName} {emp.lastName}</span>
          </div>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button onClick={cancelEdit} className="px-3 py-1.5 text-xs font-bold border border-gray-200 text-samsic-marine hover:bg-gray-50 transition-colors flex items-center gap-1">
                  <X size={12} /> Annuler
                </button>
                <button onClick={saveChanges} className="px-4 py-1.5 text-xs font-bold bg-samsic-marine text-white hover:bg-samsic-marine-80 transition-colors flex items-center gap-1">
                  <Save size={12} /> Enregistrer
                </button>
              </>
            ) : (
              <button onClick={startEdit} className="px-4 py-1.5 text-xs font-bold bg-samsic-marine text-white hover:bg-samsic-marine-80 transition-colors flex items-center gap-1">
                <Edit size={12} /> Modifier
              </button>
            )}
          </div>
        </div>

        {/* Save banner */}
        {savedBanner && (
          <div className="bg-green-600 text-white text-center py-2 text-xs font-bold flex items-center justify-center gap-2">
            <Check size={14} /> Modifications enregistrées
          </div>
        )}

        {/* Edit mode banner */}
        {editMode && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center py-2 text-xs font-body flex items-center justify-center gap-2">
            <Edit size={12} /> Mode édition actif — Modifiez les champs puis cliquez Enregistrer
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 grid grid-cols-3 gap-6">

            {/* ── LEFT COLUMN (2/3) ── */}
            <div className="col-span-2 space-y-4">

              {/* Identity card */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                  <img 
                    src={`https://i.pravatar.cc/150?u=${emp.id}`} 
                    alt={initials} 
                    className="w-14 h-14 rounded-full border border-slate-200 object-cover flex-shrink-0 shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display font-black text-xl text-samsic-marine">{emp.firstName} {emp.lastName}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 ${typeColor}`}>{(TYPE_LABELS as Record<string, string>)[emp.employeeType] ?? emp.employeeType}</span>
                      {emp.isActive ? (
                        <span className="text-xs font-bold px-2 py-0.5 bg-green-50 text-green-700">Actif</span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-600">Inactif</span>
                      )}
                    </div>
                    <div className="text-xs text-samsic-marine-50 font-body mt-1">#{emp.employeeCode} · {(CONTRACT_LABELS as Record<string, string>)[emp.contractType] ?? emp.contractType} · depuis {emp.contractStartDate.slice(0, 7)}</div>
                  </div>
                </div>

                <div className="px-6 py-4 grid grid-cols-2 gap-4">
                  {/* Contact */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-samsic-marine uppercase tracking-wider mb-2">Contact</div>
                    {editMode ? (
                      <div className="space-y-2">
                        <input className="w-full border border-gray-200 px-2 py-1.5 text-xs font-body focus:border-samsic-marine outline-none"
                          defaultValue={emp.phone} onChange={e => setDraftField('phone', e.target.value)} />
                        <input className="w-full border border-gray-200 px-2 py-1.5 text-xs font-body focus:border-samsic-marine outline-none"
                          defaultValue={emp.email} onChange={e => setDraftField('email', e.target.value)} />
                        <input className="w-full border border-gray-200 px-2 py-1.5 text-xs font-body focus:border-samsic-marine outline-none"
                          defaultValue={emp.address} onChange={e => setDraftField('address', e.target.value)} />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-samsic-marine font-body"><Phone size={12} className="text-samsic-marine-50" />{emp.phone}</div>
                        <div className="flex items-center gap-2 text-xs text-samsic-marine font-body"><Mail size={12} className="text-samsic-marine-50" />{emp.email}</div>
                        <div className="flex items-center gap-2 text-xs text-samsic-marine font-body"><MapPin size={12} className="text-samsic-marine-50" />{emp.address}</div>
                      </div>
                    )}
                  </div>

                  {/* Contrat & finances */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-samsic-marine uppercase tracking-wider mb-2">Contrat & Tarification</div>
                    {editMode ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-samsic-marine-50 w-28">Heures/sem</label>
                          <input type="number" className="flex-1 border border-gray-200 px-2 py-1.5 text-xs font-body focus:border-samsic-marine outline-none"
                            defaultValue={emp.weeklyContractHours} onChange={e => setDraftField('weeklyContractHours', Number(e.target.value))} />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-samsic-marine-50 w-28">Taux brut (€/h)</label>
                          <input type="number" step="0.5" className="flex-1 border border-gray-200 px-2 py-1.5 text-xs font-body focus:border-samsic-marine outline-none"
                            defaultValue={emp.hourlyRate} onChange={e => setDraftField('hourlyRate', Number(e.target.value))} />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-samsic-marine-50 w-28">Taux facturé (€/h)</label>
                          <input type="number" step="0.5" className="flex-1 border border-gray-200 px-2 py-1.5 text-xs font-body focus:border-samsic-marine outline-none"
                            defaultValue={emp.billedRate} onChange={e => setDraftField('billedRate', Number(e.target.value))} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-body"><Briefcase size={12} className="text-samsic-marine-50" /><span>{emp.weeklyContractHours}h/semaine</span></div>
                        <div className="flex items-center gap-2 text-xs font-body"><span className="text-samsic-marine-50">Taux brut :</span><span className="font-bold text-samsic-marine">{emp.hourlyRate.toFixed(2)} €/h</span></div>
                        <div className="flex items-center gap-2 text-xs font-body"><span className="text-samsic-marine-50">Facturé client :</span><span className="font-bold text-green-700">{emp.billedRate.toFixed(2)} €/h</span></div>
                        <div className="flex items-center gap-2 text-xs font-body"><span className="text-samsic-marine-50">Marge/h :</span><span className="font-bold">{(emp.billedRate - emp.hourlyRate).toFixed(2)} €</span></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobilité */}
                <div className="px-6 py-3 border-t border-gray-100">
                  <div className="text-xs font-bold text-samsic-marine uppercase tracking-wider mb-2">Mobilité & Zones</div>
                  {editMode ? (
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 text-xs font-body cursor-pointer">
                        <input type="checkbox" defaultChecked={emp.hasVehicle} onChange={e => setDraftField('hasVehicle', e.target.checked)} />
                        Véhicule personnel
                      </label>
                      <label className="flex items-center gap-2 text-xs font-body cursor-pointer">
                        <input type="checkbox" defaultChecked={emp.drivingLicense} onChange={e => setDraftField('drivingLicense', e.target.checked)} />
                        Permis B
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-2 py-0.5 ${emp.hasVehicle ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {emp.hasVehicle ? '🚗 Véhicule' : '⛔ Sans véhicule'}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {emp.acceptedZones.map((z: string) => (
                          <span key={z} className="text-xs px-2 py-0.5 bg-samsic-sable-30 text-samsic-marine font-body capitalize">{z}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="px-6 py-3 border-t border-gray-100">
                  <div className="text-xs font-bold text-samsic-marine uppercase tracking-wider mb-2">Notes opérationnelles</div>
                  {editMode ? (
                    <textarea rows={2} className="w-full border border-gray-200 px-2 py-1.5 text-xs font-body focus:border-samsic-marine outline-none resize-none"
                      defaultValue={emp.notes} onChange={e => setDraftField('notes', e.target.value)} />
                  ) : (
                    <p className="text-xs text-samsic-marine font-body">{emp.notes || '—'}</p>
                  )}
                </div>
              </div>

              {/* Langues */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Globe size={14} className="text-samsic-marine" />
                  <span className="text-xs font-bold text-samsic-marine uppercase tracking-wider">Langues</span>
                </div>
                <div className="px-6 py-4 flex flex-wrap gap-2">
                  {emp.languages.map((l: EmployeeLanguage, i: number) => {
                    const cfg = LANG_CONFIG[l.code];
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-base">{cfg?.flag}</span>
                        <span className="text-xs font-body text-samsic-marine">{cfg?.name}</span>
                        {editMode ? (
                          <select defaultValue={l.level} onChange={e => {
                            const langs = emp.languages.map((ll: EmployeeLanguage, ii: number) => ii === i ? { ...ll, level: e.target.value as EmployeeLanguage['level'] } : ll);
                            updateEmployeeLanguages(emp.id, langs);
                          }} className="text-xs border border-gray-200 px-1 py-0.5 font-body focus:border-samsic-marine outline-none">
                            {['NATIVE', 'FLUENT', 'INTERMEDIATE', 'BEGINNER'].map(lv => (
                              <option key={lv} value={lv}>{LEVEL_LABELS[lv]}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-xs px-1.5 py-0.5 font-bold ${(LEVEL_COLORS as Record<string, string>)[l.level] ?? ''}`}>{(LEVEL_LABELS as Record<string, string>)[l.level] ?? l.level}</span>
                        )}
                      </div>
                    );
                  })}
                  {editMode && (
                    <button className="text-xs text-samsic-bleu border border-dashed border-samsic-bleu px-2 py-1 hover:bg-samsic-bleu-30 transition-colors">
                      + Ajouter
                    </button>
                  )}
                </div>
              </div>

              {/* Compétences */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Star size={14} className="text-samsic-marine" />
                  <span className="text-xs font-bold text-samsic-marine uppercase tracking-wider">Compétences métier</span>
                </div>
                <div className="px-6 py-4 flex flex-wrap gap-2">
                  {emp.skills.map((s: EmployeeSkill, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-1 font-bold ${(SKILL_LEVEL_COLORS as Record<string, string>)[s.level] ?? 'bg-gray-100 text-gray-600'}`}>{s.label}</span>
                      {editMode ? (
                        <select defaultValue={s.level} onChange={e => {
                          const skills = emp.skills.map((sk: EmployeeSkill, ii: number) => ii === i ? { ...sk, level: e.target.value as EmployeeSkill['level'] } : sk);
                          updateEmployeeSkills(emp.id, skills);
                        }} className="text-xs border border-gray-200 px-1 py-0.5 font-body focus:border-samsic-marine outline-none">
                          {['EXPERT', 'COMPETENT', 'LEARNING'].map(lv => (
                            <option key={lv} value={lv}>{LEVEL_LABELS[lv]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-samsic-marine-50 font-body">{LEVEL_LABELS[s.level]}</span>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button className="text-xs text-samsic-bleu border border-dashed border-samsic-bleu px-2 py-1 hover:bg-samsic-bleu-30 transition-colors">
                      + Compétence
                    </button>
                  )}
                </div>
              </div>

              {/* Formations postes */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Award size={14} className="text-samsic-marine" />
                  <span className="text-xs font-bold text-samsic-marine uppercase tracking-wider">Postes maîtrisés (Backup Training)</span>
                  <span className="ml-auto text-xs text-samsic-marine-50">{emp.trainedPosts.filter((t: import('@/lib/data/employees-data').TrainedPost) => t.status === 'TRAINED').length} formé(s)</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {emp.trainedPosts.map((t: import('@/lib/data/employees-data').TrainedPost, i: number) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-samsic-marine">{t.postName}</div>
                        <div className="text-xs text-samsic-marine-50 font-body">{t.clientName} {t.trainedAt ? `· Formé le ${t.trainedAt}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrainingBadge status={t.status} />
                        {editMode && (
                          <select defaultValue={t.status} onChange={e => {
                            const tp = emp.trainedPosts.map((tp2: import('@/lib/data/employees-data').TrainedPost, ii: number) => ii === i ? { ...tp2, status: e.target.value as 'TRAINED' | 'IN_PROGRESS' | 'TO_TRAIN' } : tp2);
                            updateEmployeeTraining(emp.id, tp);
                          }} className="text-xs border border-samsic-sable px-1 py-0.5 font-body focus:border-samsic-marine outline-none">
                            <option value="TRAINED">Formé</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="TO_TRAIN">À former</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN (1/3) ── */}
            <div className="space-y-4">

              {/* Occupation KPI */}
              <div className="bg-white border border-gray-100 shadow-sm p-4">
                <OccupancyBar rate={emp.occupancyRate} gap={emp.utilizationGap} billedRate={emp.billedRate} />
                <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xs text-samsic-marine-50 font-body">Affectées</div>
                    <div className="text-lg font-black font-display text-samsic-marine">{emp.weeklyAssignedHours}h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-samsic-marine-50 font-body">Contrat</div>
                    <div className="text-lg font-black font-display text-samsic-marine">{emp.weeklyContractHours}h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-samsic-marine-50 font-body">Fiabilité</div>
                    <div className="text-lg font-black font-display text-samsic-bleu">{emp.reliabilityScore}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-samsic-marine-50 font-body">Absentéisme</div>
                    <div className="text-lg font-black font-display text-amber-600">{emp.absenceRate}%</div>
                  </div>
                </div>
              </div>

              {/* Polyvalence */}
              <div className="bg-white border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-samsic-marine uppercase tracking-wider">Score polyvalence</span>
                  <span className="text-2xl font-black font-display text-samsic-marine">{emp.versatilityScore}</span>
                </div>
                <div className="h-1.5 bg-gray-100">
                  <div className="h-1.5 bg-samsic-marine transition-all" style={{ width: `${emp.versatilityScore}%` }} />
                </div>
                <p className="text-xs text-samsic-marine-50 font-body mt-2">
                  Sur 100 · Basé sur langues, compétences et formations
                </p>
              </div>

              {/* AI Opportunities */}
              {opportunities.length > 0 && (
                <div className="bg-white border-2 border-samsic-bleu">
                  <div className="bg-samsic-bleu px-4 py-2.5 flex items-center gap-2">
                    <Zap size={13} className="text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Optimisation IA</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-samsic-marine font-body mb-3">
                      <strong>{emp.utilizationGap}h disponibles</strong> non placées — Opportunités détectées :
                    </p>
                    {opportunities.map(opp => {
                      const accepted = acceptedIds.includes(opp.id);
                      return (
                        <div key={opp.id} className={`border p-3 ${accepted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-samsic-marine">{opp.client}</span>
                            <span className="text-xs font-bold text-samsic-bleu">{opp.score}/100</span>
                          </div>
                          <div className="text-xs text-samsic-marine-50 font-body mb-1">{opp.post} · {opp.days}</div>
                          <div className="text-xs font-bold text-green-700 mb-2">+{opp.revenue}€ récupérables</div>
                          {accepted ? (
                            <div className="flex items-center gap-1 text-xs text-green-700 font-bold">
                              <Check size={12} /> Affectation acceptée
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => handleAcceptOpp(opp)}
                                className="flex-1 py-1 text-xs font-bold bg-samsic-bleu text-white hover:bg-samsic-marine transition-colors">
                                Affecter
                              </button>
                              <button className="px-3 py-1 text-xs font-bold border border-gray-200 text-samsic-marine-50 hover:border-samsic-marine transition-colors">
                                Ignorer
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {emp.certifications.length > 0 && (
                <div className="bg-white border border-gray-100 shadow-sm p-4">
                  <div className="text-xs font-bold text-samsic-marine uppercase tracking-wider mb-3">Certifications</div>
                  {emp.certifications.map((c: import('@/lib/data/employees-data').Certification, i: number) => (
                    <div key={i} className={`flex items-center justify-between p-2 mb-1 ${c.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div>
                        <div className="text-xs font-bold text-samsic-marine">{c.name}</div>
                        {c.expiresAt && <div className="text-xs text-samsic-marine-50 font-body">Expire : {c.expiresAt}</div>}
                      </div>
                      <span className={`text-xs font-bold ${c.isValid ? 'text-green-700' : 'text-red-600'}`}>
                        {c.isValid ? 'Valide' : 'Expirée'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Planning link */}
              <Link href="/planning" className="block bg-samsic-marine text-white px-4 py-3 text-xs font-bold hover:bg-samsic-marine/90 transition-colors flex items-center justify-between group">
                <span>Voir dans le planning</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
