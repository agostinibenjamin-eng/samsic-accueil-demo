'use client';

/**
 * /absences — Gestion des absences SAMSIC
 * CEO priority: déclencheur #1 de l'IA — déclarer = l'IA remplace instantanément
 * @samsic-design-system — Marine/Sable, 0-radius
 * @samsic-demo-scenario — Scénario bonus : déclaration absence → IA réagit
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AbsencesSidebar } from '@/components/layout/AbsencesSidebar';
import { CalendarOff, Plus, X, Check, AlertTriangle, Zap, Clock, User, Calendar, Network, Info, ArrowRight } from 'lucide-react';

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

const toLocalISOString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function DeclareModal({ onClose, onDeclare }: {
  onClose: () => void;
  onDeclare: () => void;
}) {
  const [step, setStep] = useState<'form' | 'saving' | 'done'>('form');
  const [type, setType] = useState<AbsenceType>('SICK_LEAVE');
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState(toLocalISOString(new Date()));
  const [endDate, setEndDate] = useState(toLocalISOString(new Date()));
  
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
        className="bg-white w-full max-w-md shadow-2xl rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideInUp 0.25s ease forwards' }}
      >
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <CalendarOff size={16} className="text-red-500" />
            </div>
            <h3 className="text-samsic-marine font-display font-bold text-lg">Déclarer une absence</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="text-xs font-bold font-body text-gray-400 uppercase tracking-wider block mb-2">
                Employé absent
              </label>
              <select
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white text-samsic-marine font-medium focus:outline-none focus:border-samsic-marine focus:ring-2 focus:ring-samsic-marine/10 transition-all"
              >
                <option value="">Sélectionner un employé…</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold font-body text-gray-400 uppercase tracking-wider block mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white text-samsic-marine font-medium focus:outline-none focus:border-samsic-marine focus:ring-2 focus:ring-samsic-marine/10 transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold font-body text-gray-400 uppercase tracking-wider block mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white text-samsic-marine font-medium focus:outline-none focus:border-samsic-marine focus:ring-2 focus:ring-samsic-marine/10 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold font-body text-gray-400 uppercase tracking-wider block mb-2">
                Type d&apos;absence
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TYPE_CONFIG) as AbsenceType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-4 py-3 rounded-lg text-sm font-bold font-body border transition-all text-left ${
                      type === t
                        ? 'bg-samsic-marine/5 text-samsic-marine border-samsic-marine ring-1 ring-samsic-marine shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {TYPE_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                Le profil sera marqué absent dans la grille. Vous pourrez ensuite utiliser l'IA de planification pour combler les créneaux libérés.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 rounded-xl text-white py-3.5 text-sm font-bold font-body tracking-wide hover:bg-red-600 shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Enregistrer l'absence
            </button>
          </form>
        )}

        {step === 'saving' && (
          <div className="p-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-samsic-marine/5 flex items-center justify-center rounded-full">
              <div className="w-8 h-8 border-4 border-samsic-marine/20 border-t-samsic-marine animate-spin rounded-full" />
            </div>
            <p className="text-samsic-marine font-bold font-display text-lg animate-pulse">Enregistrement...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <Check size={32} className="text-emerald-500" />
            </div>
            <div>
              <h4 className="text-emerald-600 font-bold font-display text-lg mb-2">Absence enregistrée</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Le planning a été mis à jour de façon globale. L'agent est marqué en rouge sur la grille.
              </p>
            </div>
            <button
              onClick={() => { onDeclare(); onClose(); }}
              className="w-full bg-samsic-marine rounded-xl text-white py-3.5 text-sm font-bold font-body hover:bg-samsic-marine-80 shadow transition-all"
            >
              Fermer et actualiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────── PAGE ────────────────────────────────

export default function AbsencesPage() {
  const router = useRouter();
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
        <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-samsic-marine">Gestion des Absences</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Centralisation des déclarations d'absence et remplacements.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-red-500 rounded-xl shadow-sm text-white px-5 py-2.5 text-sm font-bold font-body hover:bg-red-600 hover:shadow transform hover:-translate-y-0.5 transition-all"
            >
              <Plus size={16} />
              Déclarer une absence
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-samsic-marine/5 flex items-center justify-center">
                  <span className="text-3xl font-black font-display text-samsic-marine">{absences.length}</span>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 font-bold font-body uppercase tracking-wider mb-1">Absences actives</h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <CalendarOff size={14} className="text-samsic-marine" />
                    <span className="text-sm font-medium font-body text-samsic-marine">
                      Affichage de tout l'historique
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-sm font-bold font-body text-samsic-marine uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle size={15} className="text-samsic-marine" />
              Répertoire des alertes ({absences.length})
            </h2>
            <div className="space-y-4">
              {absences.map(abs => {
                const typeConf = TYPE_CONFIG[abs.type] || TYPE_CONFIG.OTHER;
                return (
                  <div key={abs.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-samsic-marine/10 flex items-center justify-center font-bold text-samsic-marine font-display shrink-0">
                        {abs.employeeInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1.5">
                          <span className="font-bold text-samsic-marine font-display text-base">{abs.employeeName}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${typeConf.bg} ${typeConf.color}`}>
                            {typeConf.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> {abs.dateLabel}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                       <button
                         onClick={() => router.push(`/planning?startDate=${abs.startDate.split('T')[0]}`)}
                         className="px-4 py-2 bg-samsic-marine/5 text-samsic-marine rounded-xl font-bold font-body text-sm hover:bg-samsic-marine hover:text-white transition-all flex items-center gap-2"
                       >
                         Traiter sur le Planning
                         <ArrowRight size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                       </button>
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
