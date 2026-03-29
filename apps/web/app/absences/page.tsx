'use client';

/**
 * /absences — Gestion des absences SAMSIC
 * CEO priority: déclencheur #1 de l'IA — déclarer = l'IA remplace instantanément
 * @samsic-design-system — Marine/Sable, 0-radius
 * @samsic-demo-scenario — Scénario bonus : déclaration absence → IA réagit
 */

import { useState, useEffect } from 'react';
import { AbsencesSidebar } from '@/components/layout/AbsencesSidebar';
import { CalendarOff, Plus, X, Check, AlertTriangle, Zap, Clock, User, Calendar, Network, Info } from 'lucide-react';

type AbsenceType = 'SICK_LEAVE' | 'PAID_LEAVE' | 'TRAINING' | 'OTHER';

interface Absence {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeInitials: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  reason: string;
  // champs d'UI
  dateLabel: string;
  status: 'PENDING_AI' | 'RESOLVED' | 'UNRESOLVED';
  declaredAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SICK_LEAVE:  { label: 'Maladie',     color: 'text-danger',  bg: 'bg-danger-bg border-danger' },
  PAID_LEAVE:  { label: 'Congé payé',  color: 'text-samsic-bleu', bg: 'bg-samsic-bleu-30 border-samsic-bleu' },
  TRAINING:    { label: 'Formation',   color: 'text-samsic-marine', bg: 'bg-samsic-sable-30 border-samsic-sable' },
  OTHER:       { label: 'Autre',       color: 'text-samsic-marine-50', bg: 'bg-white border-samsic-sable-50' },
};

function DeclareModal({ onClose, onDeclare }: {
  onClose: () => void;
  onDeclare: () => void;
}) {
  const [step, setStep] = useState<'form' | 'saving' | 'done'>('form');
  const [type, setType] = useState<AbsenceType>('SICK_LEAVE');
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [employees, setEmployees] = useState<{id: string, firstName: string, lastName: string}[]>([]);

  useEffect(() => {
    fetch('/api/employees').then(res => res.json()).then(data => setEmployees(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    setStep('saving');
    try {
      await fetch('/api/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          startDate,
          endDate,
          reason: type,
        })
      });
      setStep('done');
    } catch (e) {
      console.error(e);
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-samsic-marine/50 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md shadow-2xl border-l-4 border-l-danger"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideInUp 0.25s ease forwards' }}
      >
        <div className="bg-danger px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarOff size={18} className="text-white" />
            <h3 className="text-white font-bold font-body">Déclarer une absence</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider block mb-1.5">
                Employé absent
              </label>
              <select
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-samsic-sable-50 bg-white text-samsic-marine font-body focus:outline-none focus:border-samsic-marine"
              >
                <option value="">Sélectionner un employé…</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider block mb-1.5">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-samsic-sable-50 bg-white text-samsic-marine font-body focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider block mb-1.5">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-samsic-sable-50 bg-white text-samsic-marine font-body focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider block mb-1.5">
                Type d&apos;absence
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TYPE_CONFIG) as AbsenceType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-3 py-2 text-xs font-bold font-body border transition-colors text-left ${
                      type === t
                        ? 'bg-samsic-marine text-white border-samsic-marine'
                        : 'bg-white text-samsic-marine border-samsic-sable-50 hover:bg-samsic-sable-30'
                    }`}
                  >
                    {TYPE_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-samsic-sable-30 border-l-4 border-l-samsic-sable px-3 py-2 flex items-start gap-2">
              <Info size={13} className="text-samsic-marine mt-0.5 flex-shrink-0" />
              <p className="text-xs text-samsic-marine font-body">
                Une fois déclaré, le profil apparaitra absent, vous pourrez alors demander à l&apos;IA de le remplacer via le planning.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-danger text-white py-3 text-sm font-bold font-body tracking-wide hover:opacity-90 transition-opacity"
            >
              Sauvegarder l&apos;absence
            </button>
          </form>
        )}

        {step === 'saving' && (
          <div className="p-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-samsic-sable-30 flex items-center justify-center rounded-full">
              <div className="w-8 h-8 border-3 border-samsic-sable border-t-samsic-marine animate-spin rounded-full" style={{ borderWidth: '3px' }} />
            </div>
            <p className="text-samsic-marine font-bold font-body">Enregistrement en cours…</p>
          </div>
        )}

        {step === 'done' && (
          <div className="p-6 space-y-4">
            <div className="bg-success/10 border-l-4 border-l-success px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Check size={16} className="text-success flex-shrink-0" />
                <div>
                  <p className="text-success font-bold font-body text-sm">Absence enregistrée avec succès</p>
                  <p className="text-xs text-samsic-marine-50 font-body">Vos plannings ont été mis à jour.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { onDeclare(); onClose(); }}
              className="w-full bg-samsic-marine text-white py-3 text-sm font-bold font-body hover:bg-samsic-marine-80 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────── PAGE ────────────────────────────────

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAbsences = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/absences?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        const mapped: Absence[] = data.map((a: any) => ({
          id: a.id,
          employeeId: a.employeeId,
          employeeName: `${a.employee.firstName} ${a.employee.lastName}`,
          employeeInitials: `${a.employee.firstName[0]}${a.employee.lastName[0]}`,
          type: a.reason as AbsenceType,
          startDate: a.startDate,
          endDate: a.endDate,
          reason: a.reason,
          dateLabel: `${new Date(a.startDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} - ${new Date(a.endDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}`,
          status: 'UNRESOLVED', // Le statut de résolution se fait dans le workflow du planning
          declaredAt: new Date(a.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        }));
        setAbsences(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const handleDeclare = () => {
    fetchAbsences();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AbsencesSidebar 
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      <main className="flex-1 overflow-y-auto print:overflow-visible bg-[var(--bg-page)] print:bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-samsic-sable border-t-samsic-marine animate-spin" />
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-body font-extrabold text-samsic-marine">Absences</h1>
              <p className="text-sm text-samsic-marine-50 font-body mt-1">
                Liste de toutes les absences déclarées.{' '}
                <span className="text-danger font-semibold">
                  Pour gérer les remplacements, utilisez la section Planning.
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-danger text-white px-4 py-2.5 text-sm font-bold font-body hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Déclarer une absence
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white border border-samsic-sable-50 border-l-4 border-l-samsic-sable p-5 flex items-center gap-4">
              <div className="text-4xl font-black font-display text-samsic-marine">{absences.length}</div>
              <div>
                <div className="text-xs text-samsic-marine-50 font-body uppercase tracking-wider">Total Absences</div>
                <div className="flex items-center gap-1 mt-1">
                  <CalendarOff size={12} className="text-samsic-marine" />
                  <span className="text-xs font-bold font-body text-samsic-marine">
                    Historique complet
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-sm font-bold font-body text-samsic-marine uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-samsic-marine" />
              Toutes les absences ({absences.length})
            </h2>
            <div className="space-y-3">
              {absences.map(abs => {
                const typeConf = TYPE_CONFIG[abs.type] || TYPE_CONFIG.OTHER;
                return (
                  <div key={abs.id} className="bg-white border border-samsic-sable-50 border-l-4 border-l-samsic-sable p-4 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-samsic-sable-30 flex items-center justify-center font-bold text-samsic-marine font-display shrink-0">
                        {abs.employeeInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-samsic-marine font-body text-sm">{abs.employeeName}</span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 border ${typeConf.bg} ${typeConf.color}`}>
                            {typeConf.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-samsic-marine-50 font-body">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {abs.dateLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {absences.length === 0 && !isLoading && (
                <div className="text-center py-10 bg-white border border-dashed border-samsic-sable">
                  <p className="text-sm text-samsic-marine-50 font-body">Aucune absence trouvée.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {showModal && (
        <DeclareModal
          onClose={() => setShowModal(false)}
          onDeclare={handleDeclare}
        />
      )}
    </div>
  );
}
