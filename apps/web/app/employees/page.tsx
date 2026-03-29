/**
 * /employees — Page Effectifs SAMSIC
 * @samsic-design-system — Cards employés cliquables, modal détail, badges types
 * @samsic-demo-scenario — Scénario 3 : fiche détail employé + polyvalence
 * @nextjs-best-practices — Client Component avec fetch API
 */
'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { EmployeesSidebar } from '@/components/layout/EmployeesSidebar';
import { useSamsicStore } from '@/lib/store/use-samsic-store';
import {
  Search, Users, X, Globe, Briefcase, Star,
  Award, ChevronRight, Phone, Mail, Shield, ExternalLink
} from 'lucide-react';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  employeeType: 'TITULAR' | 'BACKUP' | 'TEAM_LEADER';
  contractType: 'CDI' | 'CDD' | 'INTERIM';
  contractEndDate?: string;
  languages: string[];
  skills: string[];
  weeklyHours: number;
  weeklyAssignedHours: number;
  isActive: boolean;
  reliabilityScore: number;
  occupancyRate: number;
  absenceRate: number;
  trainedPostIds?: string[];
  preferredClientIds?: string[];
  certifications?: { name: string; isValid: boolean; expiresAt?: string }[];
  notes?: string;
}

const CONTRACT_CONFIG: Record<string, { label: string; color: string }> = {
  CDI: { label: 'CDI', color: 'bg-success/15 text-[#2E7D32]' },
  CDD: { label: 'CDD', color: 'bg-[#E87A1E]/15 text-[#E87A1E]' },
  INTERIM: { label: 'Intérim', color: 'bg-[#7B1FA2]/15 text-[#7B1FA2]' },
};

const TYPE_CONFIG = {
  TEAM_LEADER: { label: 'Team Leader', bg: 'bg-slate-100 text-samsic-marine font-semibold', border: 'border-l-slate-300' },
  TITULAR:     { label: 'Titulaire',   bg: 'bg-samsic-sable-30 text-samsic-marine font-medium', border: 'border-l-samsic-sable-50' },
  BACKUP:      { label: 'Backup',      bg: 'bg-samsic-bleu-30 text-samsic-bleu font-medium', border: 'border-l-samsic-bleu' },
};

const LANG_CONFIG: Record<string, { flag: string; name: string }> = {
  fr: { flag: '🇫🇷', name: 'Français' },
  en: { flag: '🇬🇧', name: 'English' },
  de: { flag: '🇩🇪', name: 'Deutsch' },
  lu: { flag: '🇱🇺', name: 'Lëtzebuergesch' },
  pt: { flag: '🇵🇹', name: 'Português' },
  es: { flag: '🇪🇸', name: 'Español' },
  ar: { flag: '🇸🇦', name: 'العربية' },
  zh: { flag: '🇨🇳', name: '中文' },
  ja: { flag: '🇯🇵', name: '日本語' },
};

const SKILL_LABELS: Record<string, string> = {
  accueil_standard: 'Accueil standard',
  accueil_vip: 'Accueil VIP',
  standard_telephonique: 'Standard téléphonique',
  badges: 'Gestion badges',
  gestion_courrier: 'Gestion courrier',
};

// Calcule un numéro de téléphone déterministe (pas de Math.random = pas de crash hydratation)
function deterministicPhone(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash) % 900000 + 100000;
  return num.toString();
}

// Calcule un score de polyvalence pour la démo (0-100)
function getPolyvalenceScore(emp: Employee): number {
  const langScore = Math.min(emp.languages.length * 18, 45);
  const skillScore = Math.min(emp.skills.length * 14, 35);
  const typeBonus = emp.employeeType === 'TEAM_LEADER' ? 20 : emp.employeeType === 'BACKUP' ? 10 : 0;
  const trainedBonus = Math.min((emp.trainedPostIds?.length ?? 0) * 5, 20);
  return Math.min(langScore + skillScore + typeBonus + trainedBonus, 100);
}

// ──────────────────────────────── MODAL DÉTAIL ────────────────────────────────

function EmployeeDetailModal({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const polyvalence = getPolyvalenceScore(emp);
  const typeConfig = TYPE_CONFIG[emp.employeeType];
  const initials = `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();

  // Éviter fermeture sur clic intérieur
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-samsic-marine/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg shadow-2xl border-l-4 border-l-samsic-marine flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={stopProp}
        style={{ animation: 'slideInUp 0.2s ease forwards' }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <img 
              src={`https://i.pravatar.cc/150?u=${emp.id}`} 
              alt={initials} 
              className="w-14 h-14 rounded-full border border-slate-200 object-cover flex-shrink-0 shadow-sm"
            />
            <div>
              <div className="text-samsic-marine font-display font-black text-xl leading-none">
                {emp.firstName} {emp.lastName}
              </div>
              <div className="text-samsic-marine-50 text-xs font-body mt-1">#{emp.employeeCode}</div>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 mt-2 ${typeConfig.bg}`}>
                {typeConfig.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-samsic-marine-50 hover:text-samsic-marine hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact simulé */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-samsic-marine-50 font-body">
              <Phone size={12} />
              <span>+352 {deterministicPhone(emp.id)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-samsic-marine-50 font-body">
              <Mail size={12} />
              <span>{emp.firstName.toLowerCase()[0]}.{emp.lastName.toLowerCase().replace(/\s/g, '')}@samsic.lu</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-samsic-marine-50 font-body">
              <Briefcase size={12} />
              <span>{emp.weeklyHours}h/semaine</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-samsic-marine-50 font-body">
              <Shield size={12} />
              <span className={emp.contractType === 'CDD' ? 'text-[#E87A1E] font-bold' : 'text-success font-bold'}>
                {emp.isActive ? 'Actif' : 'Inactif'} · {emp.contractType}
                {emp.contractEndDate && (
                  <> — Fin : {new Date(emp.contractEndDate + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                )}
              </span>
            </div>

            {/* Turnover warning for CDD */}
            {emp.contractType === 'CDD' && emp.contractEndDate && (() => {
              const daysLeft = Math.ceil((new Date(emp.contractEndDate).getTime() - Date.now()) / 86400000);
              if (daysLeft < 90) return (
                <div className="col-span-2 mt-1 px-3 py-2 bg-[#fff3e0] border-l-2 border-l-[#E87A1E] text-xs font-body">
                  <span className="font-bold text-[#E87A1E]">CDD J-{daysLeft}</span>
                  <span className="text-samsic-marine-80"> — Décision renouvellement requise.</span>
                </div>
              );
              return null;
            })()}

            {/* Reliability & Occupancy */}
            <div className="col-span-2 grid grid-cols-3 gap-2 mt-1">
              <div className="bg-gray-50 border border-gray-100 px-3 py-2 text-center">
                <div className={`text-lg font-black font-display ${emp.reliabilityScore >= 90 ? 'text-success' : emp.reliabilityScore >= 70 ? 'text-[#E87A1E]' : 'text-[#C62828]'}`}>
                  {emp.reliabilityScore}%
                </div>
                <div className="text-[10px] text-samsic-marine-50 font-body">Fiabilité</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 px-3 py-2 text-center">
                <div className={`text-lg font-black font-display ${emp.occupancyRate >= 80 ? 'text-success' : emp.occupancyRate >= 50 ? 'text-[#E87A1E]' : 'text-[#C62828]'}`}>
                  {emp.occupancyRate}%
                </div>
                <div className="text-[10px] text-samsic-marine-50 font-body">Occupation</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 px-3 py-2 text-center">
                <div className={`text-lg font-black font-display ${emp.absenceRate <= 2 ? 'text-success' : emp.absenceRate <= 5 ? 'text-[#E87A1E]' : 'text-[#C62828]'}`}>
                  {emp.absenceRate}%
                </div>
                <div className="text-[10px] text-samsic-marine-50 font-body">Absentéisme</div>
              </div>
            </div>
          </div>

          {/* Indice de polyvalence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-samsic-marine" />
                <span className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider">
                  Indice de polyvalence
                </span>
              </div>
              <span className={`text-2xl font-black font-display ${
                polyvalence >= 70 ? 'text-success' : polyvalence >= 45 ? 'text-warning' : 'text-samsic-marine-50'
              }`}>
                {polyvalence}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-3">
              <div
                className={`h-3 transition-all duration-700 ${
                  polyvalence >= 70 ? 'bg-success' : polyvalence >= 45 ? 'bg-warning' : 'bg-samsic-marine-50'
                }`}
                style={{ width: `${polyvalence}%` }}
              />
            </div>
            <p className="text-xs text-samsic-marine-50 font-body mt-1">
              {polyvalence >= 70 ? 'Agent très polyvalent — peut couvrir plusieurs sites' :
               polyvalence >= 45 ? 'Agent polyvalent — quelques formations complémentaires recommandées' :
               'Agent spécialisé — optimal sur son poste habituel'}
            </p>
          </div>

          {/* Langues */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={14} className="text-samsic-marine" />
              <span className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider">
                Langues maîtrisées ({emp.languages.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {emp.languages.map(lang => (
                <div
                  key={lang}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-l-2 border-gray-200"
                >
                  <span className="text-base">{LANG_CONFIG[lang]?.flag ?? lang}</span>
                  <span className="text-xs font-bold font-body text-samsic-marine">
                    {LANG_CONFIG[lang]?.name ?? lang.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compétences */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award size={14} className="text-samsic-marine" />
              <span className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider">
                Compétences certifiées ({emp.skills.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {emp.skills.map(skill => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-100 bg-gray-50"
                >
                  <div className="w-1.5 h-1.5 bg-success flex-shrink-0" />
                  <span className="text-sm font-body text-samsic-marine">
                    {SKILL_LABELS[skill] ?? skill}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Planning 4 semaines — simulé pour la démo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight size={14} className="text-samsic-marine" />
              <span className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider">
                Planning — Prochaines semaines
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center">
              {['S28', 'S29', 'S30', 'S31'].map((week, i) => (
                <div key={week} className="bg-gray-50 border border-gray-100 py-2">
                  <div className="text-xs text-samsic-marine-50 font-body">{week}</div>
                  <div className={`text-xs font-bold font-body mt-0.5 ${i === 0 ? 'text-success' : i === 2 ? 'text-warning' : 'text-success'}`}>
                    {i === 2 ? 'Formation' : 'Affecté'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Affecter */}
          <button className="w-full bg-samsic-marine text-white py-3 text-sm font-bold font-body tracking-wide hover:bg-samsic-marine-80 transition-colors flex items-center justify-center gap-2">
            <ChevronRight size={16} />
            Affecter à un poste
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────── PAGE PRINCIPALE ────────────────────────────

export default function EmployeesPage() {
  // ── Source de données : store Zustand (IDs cohérents avec /employees/[id]) ──
  const { employees: storeEmployees } = useSamsicStore();

  // Map EmployeeFullProfile → Employee (interface locale)
  const employees: Employee[] = useMemo(() => storeEmployees.map(e => ({
    id: e.id,
    employeeCode: e.employeeCode,
    firstName: e.firstName,
    lastName: e.lastName,
    employeeType: e.employeeType as 'TITULAR' | 'BACKUP' | 'TEAM_LEADER',
    contractType: (e.contractType || 'CDI') as 'CDI' | 'CDD' | 'INTERIM',
    contractEndDate: e.contractEndDate,
    languages: e.languages.map((l: { code: string }) => l.code),
    skills: e.skills.map((s: { id: string }) => s.id),
    weeklyHours: e.weeklyContractHours,
    weeklyAssignedHours: e.weeklyAssignedHours,
    isActive: e.isActive,
    reliabilityScore: e.reliabilityScore,
    occupancyRate: e.occupancyRate,
    absenceRate: e.absenceRate,
    trainedPostIds: e.trainedPosts.map((t: { postName: string }) => t.postName),
    preferredClientIds: [],
    certifications: e.certifications?.map(c => ({ name: c.name, isValid: c.isValid, expiresAt: c.expiresAt })),
    notes: e.notes,
  })), [storeEmployees]);

  const isLoading = false;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterLang, setFilterLang] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const allLangs = useMemo(() => {
    const langs = new Set<string>();
    employees.forEach(e => e.languages.forEach(l => langs.add(l)));
    return Array.from(langs).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch =
        search === '' ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeCode.includes(search) ||
        e.skills.some(s => s.includes(search.toLowerCase()));
      const matchType = filterType === 'ALL' || e.employeeType === filterType;
      const matchLang = filterLang === 'ALL' || e.languages.includes(filterLang);
      return matchSearch && matchType && matchLang;
    });
  }, [employees, search, filterType, filterLang]);

  const counts = useMemo(() => ({
    total: employees.length,
    tl: employees.filter(e => e.employeeType === 'TEAM_LEADER').length,
    titular: employees.filter(e => e.employeeType === 'TITULAR').length,
    backup: employees.filter(e => e.employeeType === 'BACKUP').length,
  }), [employees]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <EmployeesSidebar 
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterLang={filterLang}
        onFilterLangChange={setFilterLang}
      />

      <main className="flex-1 overflow-y-auto print:overflow-visible bg-[var(--bg-page)] print:bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-body font-extrabold text-samsic-marine">Effectifs</h1>
              <p className="text-sm text-samsic-marine-50 font-body mt-1">
                {counts.total} agents actifs ·{' '}
                <span className="font-semibold">{counts.tl} Team Leaders</span> ·{' '}
                {counts.titular} titulaires ·{' '}
                <span className="text-samsic-bleu font-semibold">{counts.backup} backups disponibles</span>
              </p>
            </div>
            {/* Stats rapides */}
            <div className="flex items-center gap-6 text-center">
              {[
                { label: 'Agents actifs', value: counts.total, color: 'text-samsic-marine' },
                { label: 'Backups dispo', value: counts.backup, color: 'text-samsic-bleu' },
                { label: 'Langues', value: allLangs.length, color: 'text-success' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className={`text-2xl font-black font-display ${color}`}>{value}</div>
                  <div className="text-xs text-samsic-marine-50 font-body">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Header Grille */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-body font-bold text-samsic-marine">Liste des Employés</h2>
            {filtered.length !== employees.length && (
              <span className="text-xs font-bold text-samsic-marine-50 bg-gray-50 px-2 py-1 rounded">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Grille employés */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-samsic-sable border-t-samsic-marine animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(emp => {
                const typeConfig = TYPE_CONFIG[emp.employeeType];
                const initials = `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();
                const polyvalence = getPolyvalenceScore(emp);

                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`bg-white border border-gray-100 shadow-sm border-l-4 ${typeConfig.border} p-4 hover:shadow-md hover:border-l-samsic-marine transition-all text-left group w-full`}
                  >
                    <div className="flex items-start gap-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=F4F5F7&color=13294B&rounded=true&bold=true`} 
                        alt={initials} 
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-bold text-samsic-marine font-body">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <span className={`text-xs font-bold px-1.5 py-0.5 ${typeConfig.bg}`}>
                            {typeConfig.label}
                          </span>
                        </div>
                        <p className="text-xs text-samsic-marine-50 font-body mb-2">#{emp.employeeCode}</p>

                        {/* Barre polyvalence */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 bg-gray-100 h-1">
                            <div
                              className={`h-1 ${polyvalence >= 70 ? 'bg-success' : polyvalence >= 45 ? 'bg-warning' : 'bg-samsic-marine-50'}`}
                              style={{ width: `${polyvalence}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-samsic-marine-50 font-body w-6 text-right">{polyvalence}</span>
                        </div>

                        {/* Langues */}
                        <div className="flex flex-wrap gap-1">
                          {emp.languages.map(lang => (
                            <span key={lang} className="text-sm" title={LANG_CONFIG[lang]?.name ?? lang}>
                              {LANG_CONFIG[lang]?.flag ?? lang.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <ChevronRight size={14} className="text-samsic-marine-50 group-hover:text-samsic-marine transition-colors mt-1" />
                        <Link
                          href={`/employees/${emp.id}`}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs font-bold text-samsic-bleu border border-samsic-bleu px-2 py-0.5 hover:bg-samsic-bleu hover:text-white transition-colors"
                        >
                          <ExternalLink size={10} /> Fiche
                        </Link>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filtered.length === 0 && !isLoading && (
                <div className="col-span-full bg-white border border-gray-100 shadow-sm p-8 text-center">
                  <Users size={24} className="text-samsic-marine-50 mx-auto mb-2" />
                  <p className="text-samsic-marine-50 font-body text-sm">Aucun agent trouvé</p>
                  <button
                    onClick={() => { setSearch(''); setFilterType('ALL'); setFilterLang('ALL'); }}
                    className="mt-3 text-xs text-samsic-marine underline font-body"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal détail employé */}
      {selectedEmployee && (
        <EmployeeDetailModal
          emp={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}
