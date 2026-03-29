'use client';
/**
 * /clients/[id] — Fiche Client Complète et Éditable
 * @samsic-design-system — Marine/Sable, 0-radius, Open Sans
 * @samsic-domain — Postes avec plages horaires imposées par le client
 */
import { useState } from 'react';
import Link from 'next/link';
import { useParams, redirect } from 'next/navigation';
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, Users, AlertTriangle,
  CheckCircle2, Clock, TrendingDown, TrendingUp, Minus, Shield,
  Edit, Save, X, Check, Plus, Trash2
} from 'lucide-react';
import { ClientsSidebar } from '@/components/layout/ClientsSidebar';
import { useSamsicStore } from '@/lib/store/use-samsic-store';
import type { ClientData, ClientPost, ClientContact } from '@/lib/data/clients-data';

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClientData['status'] }) {
  const STATUS_CONFIG = {
    STABLE:   { label: 'Stable',    bg: 'bg-green-50', text: 'text-green-700', border: 'border-l-green-400' },
    WARNING:  { label: 'Vigilance', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-400' },
    CRITICAL: { label: 'Critique',  bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-l-red-400' },
  };
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.STABLE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-body border-l-2 ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

function PostStatusIcon({ status }: { status: 'COVERED' | 'AT_RISK' | 'UNCOVERED' }) {
  if (status === 'COVERED') return <CheckCircle2 size={14} className="text-[#2E7D32]" />;
  if (status === 'AT_RISK') return <AlertTriangle size={14} className="text-[#F57F17]" />;
  return <AlertTriangle size={14} className="text-[#C62828]" />;
}

function RiskBar({ score }: { score: number }) {
  const color = score < 30 ? '#2E7D32' : score < 60 ? '#F57F17' : '#C62828';
  const label = score < 30 ? 'Faible' : score < 60 ? 'Modéré' : 'Élevé';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-body text-samsic-marine-50">Score de risque IA</span>
        <span className="text-xs font-bold" style={{ color }}>{score}/100 — {label}</span>
      </div>
      <div className="h-2 bg-samsic-sable-50 w-full">
        <div className="h-2 transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { clients, updateClient, updateClientPost, addClientPost, removeClientPost, updateClientContact, addClientContact, removeClientContact } = useSamsicStore();
  const client = clients.find(c => c.id === id);

  const [editMode, setEditMode] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  // Editable draft fields (for header-level fields)
  const [draftName, setDraftName] = useState('');
  const [draftAddress, setDraftAddress] = useState('');
  const [draftSlaMin, setDraftSlaMin] = useState(0);
  const [draftPriority, setDraftPriority] = useState('');
  const [draftDresscode, setDraftDresscode] = useState('');
  const [draftNotes, setDraftNotes] = useState('');

  // Post inline editing
  const [editingPostIndex, setEditingPostIndex] = useState<number | null>(null);

  if (!client) {
    return (
      <div className="flex h-screen bg-[var(--bg-page)]">
        <ClientsSidebar isDetailView />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-samsic-marine-50 font-body">Client introuvable</p>
            <Link href="/clients" className="text-samsic-bleu text-sm underline">← Retour</Link>
          </div>
        </main>
      </div>
    );
  }

  // All derived values after the guard
  const coveredPosts   = client.posts.filter((p: ClientPost) => p.status === 'COVERED').length;
  const atRiskPosts    = client.posts.filter((p: ClientPost) => p.status === 'AT_RISK').length;
  const uncoveredPosts = client.posts.filter((p: ClientPost) => p.status === 'UNCOVERED').length;

  const clientPriority = client.clientPriority ?? 'STANDARD';
  const dresscode      = client.dresscode ?? 'Tenue SAMSIC';
  const slaMin         = client.slaMinCoverage ?? 95;
  const clientNotes    = client.notes ?? '';
  // Non-nullable alias for use in callbacks (TS narrowing)
  const c = client;

  function startEdit() {
    setDraftName(c.name);
    setDraftAddress(c.address);
    setDraftSlaMin(slaMin);
    setDraftPriority(clientPriority);
    setDraftDresscode(dresscode);
    setDraftNotes(clientNotes);
    setEditMode(true);
    setEditingPostIndex(null);
  }

  function saveChanges() {
    updateClient(c.id, {
      name: draftName || c.name,
      address: draftAddress || c.address,
      slaMinCoverage: draftSlaMin || slaMin,
      clientPriority: draftPriority || clientPriority,
      dresscode: draftDresscode || dresscode,
      notes: draftNotes,
    } as Partial<ClientData>);
    setEditMode(false);
    setEditingPostIndex(null);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  }

  function cancelEdit() {
    setEditMode(false);
    setEditingPostIndex(null);
  }

  function addNewPost() {
    const newPost: ClientPost = {
      name: 'Nouveau poste',
      contractCode: '—',
      startTime: '08:30',
      endTime: '17:30',
      titular: 'À pourvoir',
      backups: [],
      languages: ['FR'],
      status: 'UNCOVERED',
    };
    addClientPost(c.id, newPost);
    setEditingPostIndex(c.posts.length); // edit the newly added
  }

  function addNewContact() {
    const newContact: ClientContact = {
      name: 'Nouveau contact',
      role: 'Contact',
      email: 'contact@client.lu',
      phone: '',
      isPrimary: false,
    };
    addClientContact(c.id, newContact);
  }

  return (
    <div className="flex h-screen bg-[var(--bg-page)] overflow-hidden">
      <ClientsSidebar isDetailView />
      <main className="flex-1 overflow-y-auto print:overflow-visible bg-[var(--bg-page)] print:bg-white">

        {/* Breadcrumb + Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center gap-2 text-xs text-samsic-marine-50 font-body mb-3">
            <Link href="/clients" className="hover:text-samsic-marine flex items-center gap-1 transition-colors">
              <ArrowLeft size={12} /> Clients
            </Link>
            <span>/</span>
            <span className="text-samsic-marine font-semibold">{client.name}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={`https://ui-avatars.com/api/?name=${client.name.replace(/ /g, '+')}&background=f1f5f9&color=475569&rounded=true&size=150&font-weight=600`}
                alt={client.name}
                className="w-14 h-14 rounded-full border border-slate-200 object-cover flex-shrink-0 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  {editMode ? (
                    <input className="text-xl font-body font-extrabold text-samsic-marine border-b-2 border-samsic-marine bg-transparent outline-none"
                      value={draftName} onChange={e => setDraftName(e.target.value)} />
                  ) : (
                    <h1 className="text-2xl font-body font-extrabold text-samsic-marine">{client.name}</h1>
                  )}
                  <StatusBadge status={client.status} />
                  <span className={`text-xs font-bold px-2 py-0.5 ${
                    clientPriority === 'STRATEGIC' ? 'bg-samsic-marine text-white' :
                    clientPriority === 'STANDARD'  ? 'bg-samsic-sable text-samsic-marine' :
                    'bg-gray-100 text-gray-600'
                  }`}>{clientPriority}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-samsic-marine-50 font-body">{client.industry}</span>
                  <span className="text-xs font-mono bg-samsic-sable-30 px-2 py-0.5 text-samsic-marine-80">{client.code}</span>
                  <span className="text-xs text-samsic-marine-50 font-body">Client depuis {client.contractSince}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-samsic-marine-50 font-body">
                  <MapPin size={11} />
                  {editMode ? (
                    <input className="border-b border-samsic-sable bg-transparent outline-none text-xs font-body w-64"
                      value={draftAddress} onChange={e => setDraftAddress(e.target.value)} />
                  ) : client.address}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {editMode ? (
                <>
                  <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-samsic-sable text-samsic-marine hover:bg-samsic-sable-30 transition-colors">
                    <X size={12} /> Annuler
                  </button>
                  <button onClick={saveChanges} className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold bg-samsic-marine text-white hover:bg-samsic-marine-80 transition-colors">
                    <Save size={12} /> Enregistrer
                  </button>
                </>
              ) : (
                <button onClick={startEdit} className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold border border-samsic-marine text-samsic-marine hover:bg-samsic-marine hover:text-white transition-colors">
                  <Edit size={12} /> Modifier
                </button>
              )}
              <Link href="/clients" className="flex items-center gap-2 px-4 py-2 text-sm font-body font-semibold text-samsic-marine border border-samsic-sable-50 hover:bg-samsic-sable-30 transition-colors">
                <ArrowLeft size={14} /> Retour
              </Link>
            </div>
          </div>
        </div>

        {/* Save banner */}
        {savedBanner && (
          <div className="bg-green-600 text-white text-center py-2 text-xs font-bold flex items-center justify-center gap-2">
            <Check size={14} /> Modifications enregistrées
          </div>
        )}

        {/* Edit mode info + contrat fields */}
        {editMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-center gap-6">
            <Edit size={12} className="text-amber-700" />
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-amber-700 font-bold">SLA min (%)</label>
                <input type="number" min="0" max="100" className="w-16 border border-amber-300 px-2 py-1 text-xs font-body outline-none"
                  value={draftSlaMin} onChange={e => setDraftSlaMin(Number(e.target.value))} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-amber-700 font-bold">Priorité</label>
                <select className="border border-amber-300 px-2 py-1 text-xs font-body outline-none"
                  value={draftPriority} onChange={e => setDraftPriority(e.target.value)}>
                  <option value="STRATEGIC">Stratégique</option>
                  <option value="STANDARD">Standard</option>
                  <option value="BASIC">Basique</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-amber-700 font-bold">Dresscode</label>
                <input className="border border-amber-300 px-2 py-1 text-xs font-body outline-none w-40"
                  value={draftDresscode} onChange={e => setDraftDresscode(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="px-8 py-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs font-body uppercase tracking-wider text-samsic-marine-50 mb-2">Tx. Couverture</p>
              <span className={`text-3xl font-body font-black ${client.coverageRate < 80 ? 'text-[#C62828]' : client.coverageRate < 95 ? 'text-[#F57F17]' : 'text-[#2E7D32]'}`}>
                {client.coverageRate}%
              </span>
              <p className="text-xs text-samsic-marine-50 font-body mt-1">SLA min : {slaMin}%</p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs font-body uppercase tracking-wider text-samsic-marine-50 mb-2">Postes</p>
              <span className="text-3xl font-body font-black text-samsic-marine">{client.posts.length}</span>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-[#2E7D32] font-body">✓ {coveredPosts}</span>
                {atRiskPosts > 0 && <span className="text-xs text-[#F57F17] font-body">⚠ {atRiskPosts}</span>}
                {uncoveredPosts > 0 && <span className="text-xs text-[#C62828] font-body font-bold">✗ {uncoveredPosts}</span>}
              </div>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs font-body uppercase tracking-wider text-samsic-marine-50 mb-2">Sites</p>
              <span className="text-3xl font-body font-black text-samsic-marine">{client.siteCount}</span>
              <p className="text-xs text-samsic-marine-50 font-body mt-2">{dresscode}</p>
            </div>
            <div className={`px-5 py-4 border ${client.alerts.length > 0 ? 'bg-[#FFEBEE] border-[#C62828] shadow-sm' : 'bg-white border-gray-100 shadow-sm'}`}>
              <p className="text-xs font-body uppercase tracking-wider text-samsic-marine-50 mb-2">Alertes actives</p>
              <span className={`text-3xl font-body font-black ${client.alerts.length > 0 ? 'text-[#C62828]' : 'text-[#2E7D32]'}`}>
                {client.alerts.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT — Postes + Contacts */}
            <div className="xl:col-span-2 space-y-6">

              {/* Postes contractuels */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-base font-body font-bold text-samsic-marine">Postes Contractuels</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-samsic-marine-50 font-body">{client.posts.length} poste{client.posts.length > 1 ? 's' : ''}</span>
                    {editMode && (
                      <button onClick={addNewPost} className="flex items-center gap-1 text-xs font-bold text-samsic-bleu border border-samsic-bleu px-2 py-1 hover:bg-samsic-bleu hover:text-white transition-colors">
                        <Plus size={11} /> Ajouter
                      </button>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {client.posts.map((post: ClientPost, i: number) => (
                    <div key={i} className={`px-6 py-4 ${post.status === 'UNCOVERED' ? 'bg-[#FFEBEE]' : post.status === 'AT_RISK' ? 'bg-[#FFF8E1]' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <PostStatusIcon status={post.status} />
                          {editMode && editingPostIndex === i ? (
                            <input className="text-sm font-body font-bold text-samsic-marine border-b border-samsic-marine bg-transparent outline-none"
                              defaultValue={post.name}
                              onBlur={e => updateClientPost(client.id, i, { name: e.target.value })} />
                          ) : (
                            <div>
                              <p className="text-sm font-body font-bold text-samsic-marine">{post.name}</p>
                              {post.contractCode && post.contractCode !== '—' && (
                                <span className="text-xs font-mono text-samsic-marine-50">{post.contractCode}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {editMode && editingPostIndex === i ? (
                            <>
                              <input type="time" className="text-xs border border-samsic-sable px-1 py-0.5 font-mono outline-none"
                                defaultValue={post.startTime}
                                onBlur={e => updateClientPost(client.id, i, { startTime: e.target.value })} />
                              <span className="text-xs text-samsic-marine-50">–</span>
                              <input type="time" className="text-xs border border-samsic-sable px-1 py-0.5 font-mono outline-none"
                                defaultValue={post.endTime}
                                onBlur={e => updateClientPost(client.id, i, { endTime: e.target.value })} />
                            </>
                          ) : (
                            <>
                              <Clock size={12} className="text-samsic-marine-50" />
                              <span className="text-xs font-body text-samsic-marine font-semibold">{post.startTime} – {post.endTime}</span>
                            </>
                          )}
                          {editMode && (
                            <div className="flex items-center gap-1">
                              {editingPostIndex !== i ? (
                                <button onClick={() => setEditingPostIndex(i)} className="p-1 text-samsic-bleu hover:bg-samsic-sable-30">
                                  <Edit size={12} />
                                </button>
                              ) : (
                                <button onClick={() => setEditingPostIndex(null)} className="p-1 text-green-600 hover:bg-green-50">
                                  <Check size={12} />
                                </button>
                              )}
                              <button onClick={() => removeClientPost(client.id, i)} className="p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-samsic-marine-50 font-body mb-1">Titulaire</p>
                          {editMode && editingPostIndex === i ? (
                            <input className="w-full text-xs font-body border-b border-samsic-sable bg-transparent outline-none"
                              defaultValue={post.titular}
                              onBlur={e => updateClientPost(client.id, i, { titular: e.target.value })} />
                          ) : (
                            <p className={`text-xs font-body font-semibold ${post.titular === 'À pourvoir' ? 'text-[#C62828]' : 'text-samsic-marine'}`}>
                              {post.titular}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-samsic-marine-50 font-body mb-1">Backup{post.backups.length > 1 ? 's' : ''}</p>
                          <p className="text-xs font-body text-samsic-marine">
                            {post.backups.length > 0 ? post.backups.join(', ') : <span className="text-[#F57F17]">Aucun</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-samsic-marine-50 font-body mb-1">Langues requises</p>
                          <div className="flex flex-wrap gap-1">
                            {post.languages.map((lang: string) => (
                              <span key={lang} className="text-xs px-1.5 py-0.5 bg-gray-50 text-samsic-marine font-mono font-bold">{lang}</span>
                            ))}
                            {editMode && editingPostIndex === i && (
                              <button className="text-xs px-1.5 py-0.5 border border-dashed border-samsic-bleu text-samsic-bleu">+</button>
                            )}
                          </div>
                        </div>
                      </div>
                      {editMode && editingPostIndex === i && (
                        <div className="mt-3 flex items-center gap-2">
                          <label className="text-xs text-samsic-marine-50">Statut :</label>
                          <select className="text-xs border border-samsic-sable px-2 py-1 font-body outline-none"
                            defaultValue={post.status}
                            onChange={e => updateClientPost(client.id, i, { status: e.target.value as 'COVERED' | 'AT_RISK' | 'UNCOVERED' })}>
                            <option value="COVERED">Couvert</option>
                            <option value="AT_RISK">À risque</option>
                            <option value="UNCOVERED">Non couvert</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contacts client */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-base font-body font-bold text-samsic-marine">Contacts Client</h2>
                  {editMode && (
                    <button onClick={addNewContact} className="flex items-center gap-1 text-xs font-bold text-samsic-bleu border border-samsic-bleu px-2 py-1 hover:bg-samsic-bleu hover:text-white transition-colors">
                      <Plus size={11} /> Ajouter
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {client.contacts.map((contact: ClientContact, i: number) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-samsic-sable-30 flex items-center justify-center text-sm font-bold text-samsic-marine font-body">
                          {contact.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          {editMode ? (
                            <div className="space-y-1">
                              <input className="text-sm font-body font-bold text-samsic-marine border-b border-samsic-sable bg-transparent outline-none w-40"
                                defaultValue={contact.name}
                                onBlur={e => updateClientContact(client.id, i, { name: e.target.value })} />
                              <input className="text-xs text-samsic-marine-50 font-body border-b border-samsic-sable bg-transparent outline-none w-40"
                                defaultValue={contact.role}
                                onBlur={e => updateClientContact(client.id, i, { role: e.target.value })} />
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-body font-bold text-samsic-marine">
                                {contact.name}
                                {contact.isPrimary && <span className="ml-2 text-xs font-normal bg-samsic-marine text-white px-1.5 py-0.5">Principal</span>}
                              </p>
                              <p className="text-xs text-samsic-marine-50 font-body">{contact.role}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {editMode ? (
                          <div className="flex items-center gap-2">
                            <input className="text-xs border border-samsic-sable px-2 py-1 font-body outline-none w-44"
                              defaultValue={contact.email}
                              onBlur={e => updateClientContact(client.id, i, { email: e.target.value })} />
                            <button onClick={() => removeClientContact(client.id, i)} className="p-1 text-red-400 hover:text-red-600">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-samsic-bleu hover:underline font-body">
                              <Mail size={12} />{contact.email}
                            </a>
                            {contact.phone && (
                              <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-xs text-samsic-marine-50 font-body hover:text-samsic-marine">
                                <Phone size={12} />{contact.phone}
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes opérationnelles (éditable) */}
              {(editMode || clientNotes) && (
                <div className="bg-white border border-gray-100 shadow-sm p-6">
                  <h2 className="text-sm font-body font-bold text-samsic-marine mb-2">Notes opérationnelles</h2>
                  {editMode ? (
                    <textarea rows={3} className="w-full border border-samsic-sable px-3 py-2 text-xs font-body resize-none outline-none focus:border-samsic-marine"
                      value={draftNotes} onChange={e => setDraftNotes(e.target.value)}
                      placeholder="Contraintes, protocoles, historique client..." />
                  ) : (
                    <p className="text-xs text-samsic-marine font-body">{clientNotes}</p>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — IA + Alertes + Actions */}
            <div className="space-y-4">
              {/* Score de risque IA */}
              <div className="bg-white border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-samsic-bleu" />
                  <h2 className="text-base font-body font-bold text-samsic-marine">Analyse de Risque IA</h2>
                </div>
                <RiskBar score={client.aiRiskScore} />
                {client.aiRiskFactors.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-body uppercase tracking-wider text-samsic-marine-50">Facteurs identifiés</p>
                    {client.aiRiskFactors.map((factor: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle size={12} className="text-[#F57F17] flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-body text-samsic-marine-80">{factor}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 text-[#2E7D32]">
                    <CheckCircle2 size={14} />
                    <p className="text-xs font-body">Aucun facteur de risque détecté</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-samsic-marine-50 font-body">Moteur IA · 10 critères · Mis à jour quotidiennement</p>
                </div>
              </div>

              {/* Contraintes opérationnelles */}
              <div className="bg-white border border-gray-100 shadow-sm p-4">
                <h2 className="text-sm font-body font-bold text-samsic-marine mb-3">Contraintes &amp; Conditions</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-samsic-marine-50">SLA contractuel</span>
                    <span className="font-bold text-samsic-marine">{slaMin}% min</span>
                  </div>
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-samsic-marine-50">Priorité client</span>
                    <span className={`font-bold px-1.5 py-0.5 text-xs ${
                      clientPriority === 'STRATEGIC' ? 'bg-samsic-marine text-white' : 'bg-samsic-sable text-samsic-marine'
                    }`}>{clientPriority}</span>
                  </div>
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-samsic-marine-50">Tenue</span>
                    <span className="font-bold text-samsic-marine">{dresscode}</span>
                  </div>
                </div>
              </div>

              {/* Alertes */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-base font-body font-bold text-samsic-marine">Alertes Récentes</h2>
                </div>
                {client.alerts.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <CheckCircle2 size={24} className="text-[#2E7D32] mx-auto mb-2" />
                    <p className="text-xs font-body text-samsic-marine-50">Aucune alerte active</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {client.alerts.map((alert: ClientData['alerts'][0]) => {
                      const severityMap: Record<string, { bg: string; text: string; icon: string }> = {
                        CRITICAL: { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]', icon: '🔴' },
                        WARNING:  { bg: 'bg-[#FFF8E1]', text: 'text-[#F57F17]', icon: '🟠' },
                        INFO:     { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', icon: '🔵' },
                      };
                      const s = severityMap[alert.severity] ?? severityMap.INFO;
                      return (
                        <div key={alert.id} className={`px-5 py-4 ${s.bg}`}>
                          <div className="flex items-start gap-2">
                            <span className="text-sm">{s.icon}</span>
                            <div>
                              <p className={`text-xs font-body font-bold ${s.text}`}>{alert.title}</p>
                              <p className="text-xs font-body text-samsic-marine-50 mt-0.5">
                                {new Date(alert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions rapides */}
              <div className="bg-white border border-samsic-sable-50 p-4">
                <h2 className="text-sm font-body font-bold text-samsic-marine mb-3">Actions rapides</h2>
                <div className="space-y-2">
                  <Link href="/planning" className="flex items-center gap-2 w-full px-3 py-2 border border-samsic-sable-50 hover:bg-samsic-sable-30 text-xs font-body font-semibold text-samsic-marine transition-colors">
                    <Building2 size={13} /> Voir dans le planning
                  </Link>
                  <Link href="/alerts" className="flex items-center gap-2 w-full px-3 py-2 border border-samsic-sable-50 hover:bg-samsic-sable-30 text-xs font-body font-semibold text-samsic-marine transition-colors">
                    <AlertTriangle size={13} /> Gérer les alertes
                  </Link>
                  <Link href="/employees" className="flex items-center gap-2 w-full px-3 py-2 border border-samsic-sable-50 hover:bg-samsic-sable-30 text-xs font-body font-semibold text-samsic-marine transition-colors">
                    <Users size={13} /> Consultants disponibles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
