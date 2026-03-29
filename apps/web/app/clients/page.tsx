/**
 * /clients — Gestion des contrats clients SAMSIC Luxembourg
 * @samsic-design-system — Cards clients, statut couleur, codes contrat
 * @samsic-demo-scenario — 17 vrais clients avec titulaires nominatifs
 * @react-patterns — Filtres, recherche, modal détail
 * @frontend-design — Bold Geometric, 0-radius, charte SAMSIC
 */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ClientsSidebar } from '@/components/layout/ClientsSidebar';
import {
  Search, Building2, Users, ChevronRight, X, ExternalLink,
  MapPin, Phone, Mail, AlertTriangle, CheckCircle, Shield
} from 'lucide-react';

interface ClientPost {
  name: string;
  hours: string;
  titular: string;
  status: 'COVERED' | 'AT_RISK' | 'UNCOVERED';
}

interface Client {
  id: string;
  name: string;
  code: string;
  industry: string;
  coverageRate: number;
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
  posts: ClientPost[];
  contact?: string;
  address?: string;
}

// ══════════════════════════════════════════════════════════
//  17 VRAIS CLIENTS SAMSIC LUXEMBOURG — données réelles
//  Source : 12-PROTOTYPE-PLAN.md + 15-REAL-DATA-ANALYSIS.md
// ══════════════════════════════════════════════════════════
const CLIENTS: Client[] = [
  {
    id: 'axxeron', name: 'Axxeron Hydrolux', code: '110054',
    industry: 'Industrie', coverageRate: 100, status: 'STABLE',
    contact: 'Direction', address: 'Luxembourg-Kirchberg',
    posts: [{ name: 'Réception Principale', hours: '8h-17h', titular: 'Christelle Santner', status: 'COVERED' }],
  },
  {
    id: 'bank-of-china', name: 'Bank of China', code: '110045 / 110076',
    industry: 'Banque', coverageRate: 90, status: 'CRITICAL',
    contact: 'Opérations', address: 'Luxembourg-Clausen',
    posts: [
      { name: 'Réception A', hours: '8h30-17h30', titular: 'Maria Dobrinescu', status: 'AT_RISK' },
      { name: 'Réception B', hours: '9h-18h', titular: 'Catarina Mateus', status: 'COVERED' },
      { name: 'Standard Téléphonique', hours: '8h-17h', titular: 'Noémie Dodrill', status: 'COVERED' },
    ],
  },
  {
    id: 'amazon', name: 'Amazon JLL', code: '110264',
    industry: 'Technologie', coverageRate: 100, status: 'STABLE',
    contact: 'Facility Management', address: 'Leudelange',
    posts: [
      { name: 'Réception Principale', hours: '7h-15h', titular: 'Lucas Donis', status: 'COVERED' },
      { name: 'Réception Secondaire', hours: '9h-17h', titular: 'Serap Ayhan', status: 'COVERED' },
      { name: 'Mailroom', hours: '8h-16h', titular: 'Mauro Tavares', status: 'COVERED' },
    ],
  },
  {
    id: 'chambre-commerce', name: 'Chambre de Commerce', code: '110113',
    industry: 'Institution', coverageRate: 100, status: 'STABLE',
    contact: 'Secrétariat Général', address: 'Luxembourg-Kirchberg',
    posts: [
      { name: 'Accueil Conférences', hours: '8h-17h', titular: 'Kiu Man', status: 'COVERED' },
      { name: 'Réception A', hours: '9h-17h', titular: 'Paulo Pereira', status: 'COVERED' },
      { name: 'Standard', hours: '8h-17h', titular: 'Luélly Alves', status: 'COVERED' },
    ],
  },
  {
    id: 'generali', name: 'Generali', code: '110099 / 110167',
    industry: 'Assurance', coverageRate: 100, status: 'STABLE',
    contact: 'Direction Facility', address: 'Strassen',
    posts: [
      { name: 'Réception VIP', hours: '8h-17h', titular: 'Jessica Cabral', status: 'COVERED' },
      { name: 'Standard Trilingue', hours: '9h-17h', titular: 'Adriano Miceli', status: 'COVERED' },
      { name: 'Accueil Secondaire', hours: '8h-16h', titular: 'Angela Ferreira', status: 'COVERED' },
    ],
  },
  {
    id: 'house-startups', name: 'House of Startups', code: '110137',
    industry: 'Technologie', coverageRate: 100, status: 'STABLE',
    contact: 'Office Manager', address: 'Luxembourg-Clausen',
    posts: [{ name: 'Réception Tech', hours: '9h-18h', titular: 'Pascale Mayne', status: 'COVERED' }],
  },
  {
    id: 'china-everbright', name: 'China Everbright', code: '110140',
    industry: 'Finance', coverageRate: 100, status: 'STABLE',
    contact: 'Administration', address: 'Luxembourg-Kirchberg',
    posts: [{ name: 'Réception Diplomatique', hours: '8h30-17h30', titular: 'Agathe Wyppych', status: 'COVERED' }],
  },
  {
    id: 'ing', name: 'ING Bank Luxembourg', code: '110174',
    industry: 'Banque', coverageRate: 96, status: 'WARNING',
    contact: 'Procurement', address: 'Luxembourg-Centre',
    posts: [
      { name: 'Réception Principale', hours: '7h30-17h', titular: 'Karim Ghazi', status: 'COVERED' },
      { name: 'Standard Téléphonique', hours: '8h-17h', titular: 'Nadia Tahri', status: 'AT_RISK' },
      { name: 'Accueil VIP', hours: '9h-17h', titular: 'Célia Leo', status: 'COVERED' },
    ],
  },
  {
    id: 'jao', name: 'JAO', code: '110208',
    industry: 'Énergie', coverageRate: 100, status: 'STABLE',
    contact: 'Office Services', address: 'Luxembourg-Hollerich',
    posts: [{ name: 'Accueil Spécialisé', hours: '9h-17h', titular: 'Nubya Rita', status: 'COVERED' }],
  },
  {
    id: 'mitsubishi', name: 'Mitsubishi Corporation', code: '110216',
    industry: 'Commerce international', coverageRate: 100, status: 'STABLE',
    contact: 'Administration', address: 'Luxembourg-Kirchberg',
    posts: [{ name: 'Réception Bilingue', hours: '8h-17h', titular: 'Ophélie Collin', status: 'COVERED' }],
  },
  {
    id: '3d-immo', name: '3D Immo', code: '110219',
    industry: 'Immobilier', coverageRate: 100, status: 'STABLE',
    contact: 'Gestion', address: 'Luxembourg',
    posts: [{ name: 'Accueil Clients', hours: '9h-17h', titular: 'Cintia Bettencourt', status: 'COVERED' }],
  },
  {
    id: 'aon', name: 'AON Luxembourg', code: '110220',
    industry: 'Assurance', coverageRate: 100, status: 'STABLE',
    contact: 'Facility', address: 'Luxembourg-Kirchberg',
    posts: [{ name: 'Réception', hours: '8h-17h', titular: 'Arnaud Mansion', status: 'COVERED' }],
  },
  {
    id: 'lih', name: 'Luxembourg Institute of Health', code: '110235',
    industry: 'Recherche', coverageRate: 100, status: 'STABLE',
    contact: 'Direction Administrative', address: 'Strassen',
    posts: [
      { name: 'Accueil Visiteurs', hours: '8h-17h', titular: 'Jenelyn Freddi', status: 'COVERED' },
      { name: 'Standard', hours: '8h-17h', titular: 'Aida Sabanovic', status: 'COVERED' },
      { name: 'Réception Chercheurs', hours: '9h-17h', titular: 'Backup Miangaly', status: 'COVERED' },
    ],
  },
  {
    id: 'leasys', name: 'Leasys', code: '110266',
    industry: 'Automobile', coverageRate: 100, status: 'STABLE',
    contact: 'Office Management', address: 'Munsbach',
    posts: [
      { name: 'Accueil Showroom', hours: '8h-17h', titular: 'Valérie Teitgen-Bigot', status: 'COVERED' },
      { name: 'Réception Admin', hours: '9h-17h', titular: 'Aziza Andy', status: 'COVERED' },
    ],
  },
  {
    id: 'soc-generale', name: 'Société Générale', code: '141062',
    industry: 'Banque', coverageRate: 98, status: 'STABLE',
    contact: 'Services Généraux', address: 'Luxembourg-Kirchberg',
    posts: [
      { name: 'Réception Corporate', hours: '7h30-17h', titular: 'Soubida Baitiche', status: 'COVERED' },
      { name: 'Standard Multilingue', hours: '8h-17h', titular: 'Rachid Fahfouhi', status: 'COVERED' },
      { name: 'Accueil VIP', hours: '9h-17h', titular: 'Kaisy Montroze', status: 'COVERED' },
    ],
  },
  {
    id: 'esm', name: 'European Stability Mechanism', code: '110277',
    industry: 'Institution Européenne', coverageRate: 100, status: 'STABLE',
    contact: 'Facilities', address: 'Luxembourg-Kirchberg',
    posts: [
      { name: 'Accueil Institutionnel', hours: '8h-17h', titular: 'Luana Santos', status: 'COVERED' },
      { name: 'Réception Secondaire', hours: '9h-17h', titular: 'Rebecca Basse', status: 'COVERED' },
    ],
  },
  {
    id: 'cargolux', name: 'Cargolux Airlines', code: '—',
    industry: 'Logistique & Aviation', coverageRate: 85, status: 'CRITICAL',
    contact: 'Ground Operations', address: 'Findel Aéroport',
    posts: [
      { name: 'Réception Principale', hours: '6h-14h', titular: 'À pourvoir', status: 'UNCOVERED' },
      { name: 'Réception B', hours: '14h-22h', titular: 'À pourvoir', status: 'UNCOVERED' },
      { name: 'Standard Ops', hours: '8h-17h', titular: 'Backup Miangaly', status: 'AT_RISK' },
      { name: 'Accueil VIP', hours: '9h-17h', titular: 'Backup Maya', status: 'COVERED' },
    ],
  },
];

const STATUS_CONFIG = {
  STABLE:   { label: 'Stable',   bg: 'bg-green-100', text: 'text-green-700', border: 'border-l-green-400', rowBg: '' },
  WARNING:  { label: 'Vigilance', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-l-amber-400', rowBg: '' },
  CRITICAL: { label: 'Critique', bg: 'bg-red-100', text: 'text-red-700', border: 'border-l-red-400', rowBg: 'bg-red-50/50' },
};

const POST_STATUS = {
  COVERED:   { label: 'Couvert',   color: 'text-[#2E7D32]', dot: 'bg-[#2E7D32]' },
  AT_RISK:   { label: 'À risque',  color: 'text-[#E87A1E]', dot: 'bg-[#E87A1E]' },
  UNCOVERED: { label: 'Non couvert', color: 'text-[#C62828]', dot: 'bg-[#C62828]' },
};

function ClientDetailModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const statusCfg = STATUS_CONFIG[client.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-samsic-marine/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl shadow-2xl border-l-4 border-l-samsic-marine flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideInUp 0.2s ease forwards' }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <img 
              src={`https://ui-avatars.com/api/?name=${client.name.replace(/ /g, '+')}&background=f1f5f9&color=475569&rounded=true&size=150&font-weight=600`}
              alt={client.name}
              className="w-12 h-12 rounded-full border border-slate-200 object-cover flex-shrink-0 shadow-sm"
            />
            <div>
              <div className="text-samsic-marine font-display font-black text-lg leading-tight">{client.name}</div>
              <div className="text-samsic-marine-50 text-xs font-body mt-0.5">Code {client.code} · {client.industry}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-samsic-marine-50 hover:text-samsic-marine hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Stats couverture */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-100 p-3 text-center">
              <div className="text-2xl font-black font-display text-samsic-marine">{client.coverageRate}%</div>
              <div className="text-xs text-samsic-marine-50 font-body uppercase tracking-wider mt-0.5">Couverture</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-3 text-center">
              <div className="text-2xl font-black font-display text-samsic-marine">{client.posts.length}</div>
              <div className="text-xs text-samsic-marine-50 font-body uppercase tracking-wider mt-0.5">Postes</div>
            </div>
            <div className={`p-3 text-center border border-gray-100 ${statusCfg.rowBg || 'bg-gray-50'}`}>
              <span className={`text-xs font-bold px-2 py-1 ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
              <div className="text-xs text-samsic-marine-50 font-body mt-2 uppercase tracking-wider">Statut</div>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3 text-xs font-body text-samsic-marine-50">
            <div className="flex items-center gap-2"><MapPin size={12} />{client.address}</div>
            <div className="flex items-center gap-2"><Phone size={12} />+352 27 00 {client.code.substring(0,4) || '00'}</div>
            <div className="flex items-center gap-2"><Mail size={12} />{client.contact?.toLowerCase().replace(' ', '.')}@{client.name.toLowerCase().replace(/[^a-z]/g,'').substring(0,6)}.lu</div>
            <div className="flex items-center gap-2"><Shield size={12} /><span className="text-success font-bold">Contrat actif CDI</span></div>
          </div>

          {/* Postes */}
          <div>
            <h3 className="text-xs font-bold font-body text-samsic-marine uppercase tracking-wider mb-3">
              Postes contractuels ({client.posts.length})
            </h3>
            <div className="space-y-2">
              {client.posts.map((post, i) => {
                const pst = POST_STATUS[post.status];
                return (
                  <div key={i} className="bg-gray-50 border border-gray-100 p-3 flex items-center gap-3">
                    <div className={`w-2 h-2 flex-shrink-0 ${pst.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-samsic-marine font-body">{post.name}</div>
                      <div className="text-xs text-samsic-marine-50 font-body">{post.hours} · {post.titular}</div>
                    </div>
                    <span className={`text-xs font-bold ${pst.color}`}>{pst.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <a href="/planning" className="w-full bg-samsic-marine text-white py-3 text-sm font-bold font-body tracking-wide hover:bg-samsic-marine-80 transition-colors flex items-center justify-center gap-2">
            <ChevronRight size={16} />
            Voir dans le planning
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = useMemo(() =>
    CLIENTS.filter(c => {
      const matchSearch = search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search) ||
        c.industry.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
      return matchSearch && matchStatus;
    }),
    [search, filterStatus]
  );

  const counts = {
    total: CLIENTS.length,
    stable: CLIENTS.filter(c => c.status === 'STABLE').length,
    warning: CLIENTS.filter(c => c.status === 'WARNING').length,
    critical: CLIENTS.filter(c => c.status === 'CRITICAL').length,
    totalPosts: CLIENTS.reduce((s, c) => s + c.posts.length, 0),
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ClientsSidebar 
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      <main className="flex-1 overflow-y-auto print:overflow-visible bg-[var(--bg-page)] print:bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-body font-extrabold text-samsic-marine">Portefeuille Clients</h1>
              <p className="text-sm text-samsic-marine-50 font-body mt-1">
                {counts.total} contrats actifs ·{' '}
                <span className="text-[#2E7D32] font-semibold">{counts.stable} stables</span>
                {counts.warning > 0 && <span className="text-[#E87A1E] font-semibold"> · {counts.warning} vigilance</span>}
                {counts.critical > 0 && <span className="text-[#C62828] font-semibold"> · {counts.critical} critiques</span>}
              </p>
            </div>
            {/* KPIs rapides */}
            <div className="flex items-center gap-6 text-center">
              {[
                { label: 'Contrats', value: counts.total, color: 'text-samsic-marine' },
                { label: 'Postes/j', value: counts.totalPosts, color: 'text-samsic-bleu' },
                { label: 'Critiques', value: counts.critical, color: 'text-[#C62828]' },
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
            <h2 className="text-lg font-body font-bold text-samsic-marine">Liste des Sites</h2>
            {filtered.length !== CLIENTS.length && (
              <span className="text-xs font-bold text-samsic-marine-50 bg-gray-50 px-2 py-1 rounded">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Tableau clients */}
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-samsic-marine text-white font-body text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-8 text-center">Statut</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Secteur</th>
                  <th className="py-3 px-4 text-right">Postes</th>
                  <th className="py-3 px-4 text-right">Couverture</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="font-body text-[13px]">
                {filtered.map((client, idx) => {
                  const cfg = STATUS_CONFIG[client.status];
                  const isEven = idx % 2 === 0;
                  const rowBg = cfg.rowBg || (isEven ? 'bg-white' : 'bg-gray-50');
                  return (
                    <tr
                      key={client.id}
                      className={`border-b border-gray-100 hover:bg-white transition-colors cursor-pointer border-l-4 ${cfg.border} ${rowBg}`}
                      onClick={() => setSelected(client)}
                    >
                      <td className="py-3 px-4 text-center">
                        <div className={`w-2 h-2 mx-auto ${cfg.bg}`} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${client.name.replace(/ /g, '+')}&background=f1f5f9&color=475569&rounded=true&size=150&font-weight=600`}
                            alt={client.name}
                            className="w-8 h-8 rounded-full border border-slate-200 object-cover flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-samsic-marine">{client.name}</div>
                            <div className="text-xs text-samsic-marine-50 mt-0.5">{client.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-samsic-marine-50 text-xs">{client.code}</td>
                      <td className="py-3 px-4 text-samsic-marine-50">{client.industry}</td>
                      <td className="py-3 px-4 text-right font-bold text-samsic-marine">{client.posts.length}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-black text-sm ${
                          client.coverageRate >= 97 ? 'text-[#2E7D32]' :
                          client.coverageRate >= 90 ? 'text-[#E87A1E]' : 'text-[#C62828]'
                        }`}>
                          {client.coverageRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/clients/${client.id}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-body font-bold text-samsic-bleu border border-samsic-bleu hover:bg-samsic-bleu hover:text-white transition-colors"
                            title="Fiche client complète"
                          >
                            <ExternalLink size={11} />
                            Fiche
                          </Link>
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(client); }}
                            className="text-samsic-marine-50 hover:text-samsic-marine transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-12 text-center">
                <Building2 size={24} className="text-samsic-marine-50 mx-auto mb-2" />
                <p className="text-samsic-marine-50 font-body text-sm">Aucun client trouvé</p>
              </div>
            )}
          </div>

          {/* Légende */}
          <div className="flex items-center gap-6 mt-4">
            <span className="text-xs text-samsic-marine-50 font-body font-semibold uppercase tracking-wider">Statut :</span>
            {(['STABLE', 'WARNING', 'CRITICAL'] as const).map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 ${STATUS_CONFIG[s].bg}`} />
                <span className="text-xs text-samsic-marine-80 font-body">{STATUS_CONFIG[s].label}</span>
              </div>
            ))}
            <span className="ml-auto text-xs text-samsic-marine-50 font-body">
              {filtered.length}/{counts.total} clients · {counts.totalPosts} postes/jour
            </span>
          </div>
        </div>
      </main>

      {selected && (
        <ClientDetailModal client={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
