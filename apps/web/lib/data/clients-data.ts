/**
 * lib/data/clients-data.ts
 * Source de vérité pour les 17 clients SAMSIC Luxembourg
 * Partagée entre /clients (liste) et /clients/[id] (détail)
 * @samsic-data-model — Données réelles : 15-REAL-DATA-ANALYSIS.md + 12-PROTOTYPE-PLAN.md
 */

export interface ClientPost {
  name: string;
  contractCode?: string;
  startTime: string;
  endTime: string;
  titular: string;
  backups: string[];
  status: 'COVERED' | 'AT_RISK' | 'UNCOVERED';
  languages: string[];
}

export interface ClientContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

export interface ClientAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  date: string;
}

export interface ClientData {
  id: string;
  name: string;
  code: string;
  industry: string;
  coverageRate: number;
  coverageTrend: number;
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
  address: string;
  siteCount: number;
  posts: ClientPost[];
  contacts: ClientContact[];
  alerts: ClientAlert[];
  aiRiskScore: number;
  aiRiskFactors: string[];
  contractSince: string;
  coverageHistory: number[];
  // ── Champs enrichis (édition) ──
  slaMinCoverage?: number;          // SLA minimum contractuel (%)
  clientPriority?: 'STRATEGIC' | 'STANDARD' | 'BASIC';
  dresscode?: string;               // 'Tenue SAMSIC' | 'Tenue client' | 'Smart casual'
  notes?: string;                   // Notes opérationnelles
  penaltyPerMissedHour?: number;    // Pénalité €/heure non couverte

}

export const CLIENTS_DATA: ClientData[] = [
  {
    id: 'axxeron',
    name: 'Axxeron Hydrolux',
    code: '110054',
    industry: 'Industrie',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: 'Zone industrielle, Luxembourg-Kirchberg',
    siteCount: 1,
    contractSince: '2019-01',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 5,
    aiRiskFactors: [],
    contacts: [
      { name: 'Laurent Berger', role: 'Responsable Facility', email: 'l.berger@axxeron.lu', phone: '+352 27 40 10', isPrimary: true },
    ],
    posts: [
      { name: 'Réception Principale', contractCode: '110054', startTime: '08:00', endTime: '17:00', titular: 'Christelle Santner', backups: ['Priya Nair'], status: 'COVERED', languages: ['FR', 'DE'] },
    ],
    alerts: [],
  },
  {
    id: 'bank-of-china',
    name: 'Bank of China',
    code: '110045 / 110076',
    industry: 'Banque',
    coverageRate: 90,
    coverageTrend: -5,
    status: 'CRITICAL',
    address: '37-39 Allée Scheffer, Luxembourg-Clausen',
    siteCount: 1,
    contractSince: '2020-06',
    coverageHistory: [98, 96, 95, 92, 95, 90],
    aiRiskScore: 72,
    aiRiskFactors: ['Absence titulaire non résolue', 'Backup VIP non formé Rép. A', 'Exigences trilingues FR/EN/ZH difficiles à couvrir'],
    contacts: [
      { name: 'Wei Zhang', role: 'Head of Operations', email: 'w.zhang@boc.lu', phone: '+352 27 80 20', isPrimary: true },
      { name: 'Sophie Chen', role: 'Office Coordinator', email: 's.chen@boc.lu', isPrimary: false },
    ],
    posts: [
      { name: 'Réception A', contractCode: '110045', startTime: '08:30', endTime: '17:30', titular: 'Maria Dobrinescu', backups: ['Catarina Mateus'], status: 'AT_RISK', languages: ['FR', 'EN', 'DE'] },
      { name: 'Réception B', contractCode: '110076', startTime: '09:00', endTime: '18:00', titular: 'Catarina Mateus', backups: ['Priya Nair'], status: 'COVERED', languages: ['FR', 'EN'] },
      { name: 'Standard Téléphonique', contractCode: '110076', startTime: '08:00', endTime: '17:00', titular: 'Noémie Dodrill', backups: [], status: 'COVERED', languages: ['FR', 'EN', 'LU'] },
    ],
    alerts: [
      { id: 'boc-1', severity: 'CRITICAL', title: 'Absence Maria Dobrinescu non remplacée', date: '2026-03-29' },
      { id: 'boc-2', severity: 'WARNING', title: 'Backup Rép. A non formé', date: '2026-03-28' },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon JLL',
    code: '110264',
    industry: 'Technologie',
    coverageRate: 100,
    coverageTrend: 2,
    status: 'STABLE',
    address: '61 rue de Hollerich, Leudelange',
    siteCount: 1,
    contractSince: '2022-03',
    coverageHistory: [98, 99, 100, 100, 98, 100],
    aiRiskScore: 12,
    aiRiskFactors: ['1 backup à former sur Réception secondaire'],
    contacts: [
      { name: 'Claire Martin', role: 'Facility Manager', email: 'c.martin@amazon.lu', phone: '+352 28 10 30', isPrimary: true },
    ],
    posts: [
      { name: 'Réception Principale', contractCode: '110264', startTime: '07:00', endTime: '15:00', titular: 'Lucas Donis', backups: ['Serap Ayhan'], status: 'COVERED', languages: ['FR', 'EN'] },
      { name: 'Réception Secondaire', contractCode: '110264', startTime: '09:00', endTime: '17:00', titular: 'Serap Ayhan', backups: [], status: 'COVERED', languages: ['FR', 'EN'] },
      { name: 'Mailroom', contractCode: '110264', startTime: '08:00', endTime: '16:00', titular: 'Mauro Tavares', backups: ['Backup Miangaly'], status: 'COVERED', languages: ['FR'] },
    ],
    alerts: [],
  },
  {
    id: 'chambre-commerce',
    name: 'Chambre de Commerce',
    code: '110113',
    industry: 'Institution',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: '7 rue Alcide de Gasperi, Luxembourg-Kirchberg',
    siteCount: 1,
    contractSince: '2018-09',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 8,
    aiRiskFactors: [],
    contacts: [
      { name: 'Marc Kieffer', role: 'Secrétaire Général', email: 'm.kieffer@cc.lu', phone: '+352 42 39 39', isPrimary: true },
    ],
    posts: [
      { name: 'Accueil Conférences', contractCode: '110113', startTime: '08:00', endTime: '17:00', titular: 'Kiu Man', backups: ['Paulo Pereira'], status: 'COVERED', languages: ['FR', 'EN', 'DE'] },
      { name: 'Réception A', contractCode: '110113', startTime: '09:00', endTime: '17:00', titular: 'Paulo Pereira', backups: ['Luélly Alves'], status: 'COVERED', languages: ['FR', 'EN', 'PT'] },
      { name: 'Standard', contractCode: '110113', startTime: '08:00', endTime: '17:00', titular: 'Luélly Alves', backups: [], status: 'COVERED', languages: ['FR', 'EN'] },
    ],
    alerts: [],
  },
  {
    id: 'generali',
    name: 'Generali',
    code: '110099 / 110167',
    industry: 'Assurance',
    coverageRate: 100,
    coverageTrend: 1,
    status: 'STABLE',
    address: '5 rue Jean Monnet, Strassen',
    siteCount: 2,
    contractSince: '2019-05',
    coverageHistory: [100, 100, 99, 100, 100, 100],
    aiRiskScore: 10,
    aiRiskFactors: ['Profil trilingue FR/EN/IT rare'],
    contacts: [
      { name: 'Sofia Russo', role: 'Director Facility', email: 's.russo@generali.lu', phone: '+352 44 83 11', isPrimary: true },
    ],
    posts: [
      { name: 'Réception VIP', contractCode: '110099', startTime: '08:00', endTime: '17:00', titular: 'Jessica Cabral', backups: ['Angela Ferreira'], status: 'COVERED', languages: ['FR', 'EN', 'IT'] },
      { name: 'Standard Trilingue', contractCode: '110167', startTime: '09:00', endTime: '17:00', titular: 'Adriano Miceli', backups: ['Jessica Cabral'], status: 'COVERED', languages: ['FR', 'EN', 'IT'] },
      { name: 'Accueil Secondaire', contractCode: '110167', startTime: '08:00', endTime: '16:00', titular: 'Angela Ferreira', backups: [], status: 'COVERED', languages: ['FR', 'EN'] },
    ],
    alerts: [],
  },
  {
    id: 'house-startups',
    name: 'House of Startups',
    code: '110137',
    industry: 'Technologie',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: '9 rue du Laboratoire, Luxembourg-Clausen',
    siteCount: 1,
    contractSince: '2021-01',
    coverageHistory: [100, 100, 100, 98, 100, 100],
    aiRiskScore: 15,
    aiRiskFactors: ['Poste unique — aucun backup direct'],
    contacts: [
      { name: 'Alex Müller', role: 'Office Manager', email: 'a.muller@housestartups.lu', isPrimary: true },
    ],
    posts: [
      { name: 'Réception Tech', contractCode: '110137', startTime: '09:00', endTime: '18:00', titular: 'Pascale Mayne', backups: ['Priya Nair'], status: 'COVERED', languages: ['FR', 'EN', 'DE'] },
    ],
    alerts: [],
  },
  {
    id: 'china-everbright',
    name: 'China Everbright',
    code: '110140',
    industry: 'Finance',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: '25 Avenue J.F. Kennedy, Luxembourg-Kirchberg',
    siteCount: 1,
    contractSince: '2020-11',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 18,
    aiRiskFactors: ['Exigences diplomatiques — profil très spécifique'],
    contacts: [
      { name: 'Mei Lin', role: 'Administration', email: 'm.lin@everbright.lu', isPrimary: true },
    ],
    posts: [
      { name: 'Réception Diplomatique', contractCode: '110140', startTime: '08:30', endTime: '17:30', titular: 'Agathe Wyppych', backups: ['Pascale Mayne'], status: 'COVERED', languages: ['FR', 'EN', 'ZH'] },
    ],
    alerts: [],
  },
  {
    id: 'ing',
    name: 'ING Bank Luxembourg',
    code: '110174',
    industry: 'Banque',
    coverageRate: 96,
    coverageTrend: -2,
    status: 'WARNING',
    address: '26 Place de la Gare, Luxembourg-Centre',
    siteCount: 1,
    contractSince: '2021-04',
    coverageHistory: [98, 98, 97, 96, 98, 96],
    aiRiskScore: 45,
    aiRiskFactors: ['Backup Standard non formé', 'Certification Karim expire dans 12 jours'],
    contacts: [
      { name: 'Anne Becker', role: 'Procurement', email: 'a.becker@ing.lu', phone: '+352 44 99 1', isPrimary: true },
    ],
    posts: [
      { name: 'Réception Principale', contractCode: '110174', startTime: '07:30', endTime: '17:00', titular: 'Karim Ghazi', backups: ['Nadia Tahri'], status: 'COVERED', languages: ['FR', 'EN', 'DE'] },
      { name: 'Standard Téléphonique', contractCode: '110174', startTime: '08:00', endTime: '17:00', titular: 'Nadia Tahri', backups: [], status: 'AT_RISK', languages: ['FR', 'EN'] },
      { name: 'Accueil VIP', contractCode: '110174', startTime: '09:00', endTime: '17:00', titular: 'Célia Leo', backups: ['Karim Ghazi'], status: 'COVERED', languages: ['FR', 'EN', 'LU'] },
    ],
    alerts: [
      { id: 'ing-1', severity: 'WARNING', title: 'Backup Standard Téléphonique non formé', date: '2026-03-31' },
      { id: 'ing-2', severity: 'INFO', title: 'Certification Karim Ghazi expire 09/04', date: '2026-04-09' },
    ],
  },
  {
    id: 'jao',
    name: 'JAO',
    code: '110208',
    industry: 'Énergie',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: '2 Heienhaff, Howald',
    siteCount: 1,
    contractSince: '2022-09',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 12,
    aiRiskFactors: [],
    contacts: [
      { name: 'Frank Weber', role: 'Office Services', email: 'f.weber@jao.eu', isPrimary: true },
    ],
    posts: [
      { name: 'Accueil Spécialisé', contractCode: '110208', startTime: '09:00', endTime: '17:00', titular: 'Nubya Rita', backups: ['Backup Miangaly'], status: 'COVERED', languages: ['FR', 'EN'] },
    ],
    alerts: [],
  },
  {
    id: 'mitsubishi',
    name: 'Mitsubishi Corporation',
    code: '110216',
    industry: 'Commerce international',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: '46 Avenue J.F. Kennedy, Luxembourg-Kirchberg',
    siteCount: 1,
    contractSince: '2021-06',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 20,
    aiRiskFactors: ['Profil JP/EN rare'],
    contacts: [
      { name: 'Yuki Tanaka', role: 'Administration', email: 'y.tanaka@mc.lu', isPrimary: true },
    ],
    posts: [
      { name: 'Réception Bilingue', contractCode: '110216', startTime: '08:00', endTime: '17:00', titular: 'Ophélie Collin', backups: ['Agathe Wyppych'], status: 'COVERED', languages: ['FR', 'EN', 'JP'] },
    ],
    alerts: [],
  },
  {
    id: '3d-immo',
    name: '3D Immo',
    code: '110219',
    industry: 'Immobilier',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: 'Route d\'Arlon, Luxembourg',
    siteCount: 1,
    contractSince: '2023-02',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 8,
    aiRiskFactors: [],
    contacts: [
      { name: 'Pierre Reding', role: 'Gestion', email: 'p.reding@3dimmo.lu', isPrimary: true },
    ],
    posts: [
      { name: 'Accueil Clients', contractCode: '110219', startTime: '09:00', endTime: '17:00', titular: 'Cintia Bettencourt', backups: [], status: 'COVERED', languages: ['FR', 'LU'] },
    ],
    alerts: [],
  },
  {
    id: 'aon',
    name: 'AON Luxembourg',
    code: '110220',
    industry: 'Assurance',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: '2 rue Léon Hengen, Luxembourg-Kirchberg',
    siteCount: 1,
    contractSince: '2022-01',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 10,
    aiRiskFactors: [],
    contacts: [
      { name: 'Isabelle Petit', role: 'Facility', email: 'i.petit@aon.lu', isPrimary: true },
    ],
    posts: [
      { name: 'Réception', contractCode: '110220', startTime: '08:00', endTime: '17:00', titular: 'Arnaud Mansion', backups: ['Cintia Bettencourt'], status: 'COVERED', languages: ['FR', 'EN'] },
    ],
    alerts: [],
  },
  {
    id: 'lih',
    name: 'Luxembourg Institute of Health',
    code: '110235',
    industry: 'Recherche médicale',
    coverageRate: 100,
    coverageTrend: 1,
    status: 'STABLE',
    address: '1A-B rue Thomas Edison, Strassen',
    siteCount: 1,
    contractSince: '2021-10',
    coverageHistory: [100, 100, 100, 99, 100, 100],
    aiRiskScore: 15,
    aiRiskFactors: [],
    contacts: [
      { name: 'Dr. Marie Kreins', role: 'Direction Administrative', email: 'm.kreins@lih.lu', isPrimary: true },
    ],
    posts: [
      { name: 'Accueil Visiteurs', contractCode: '110235', startTime: '08:00', endTime: '17:00', titular: 'Jenelyn Freddi', backups: ['Aida Sabanovic'], status: 'COVERED', languages: ['FR', 'EN'] },
      { name: 'Standard', contractCode: '110235', startTime: '08:00', endTime: '17:00', titular: 'Aida Sabanovic', backups: ['Backup Miangaly'], status: 'COVERED', languages: ['FR', 'EN'] },
      { name: 'Réception Chercheurs', contractCode: '110235', startTime: '09:00', endTime: '17:00', titular: 'Backup Miangaly', backups: [], status: 'COVERED', languages: ['FR', 'EN', 'DE'] },
    ],
    alerts: [],
  },
  {
    id: 'leasys',
    name: 'Leasys',
    code: '110266',
    industry: 'Automobile',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: '20 rue de Bitbourg, Munsbach',
    siteCount: 1,
    contractSince: '2023-05',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 18,
    aiRiskFactors: [],
    contacts: [
      { name: 'Thomas Klein', role: 'Office Management', email: 't.klein@leasys.lu', isPrimary: true },
    ],
    posts: [
      { name: 'Accueil Showroom', contractCode: '110266', startTime: '08:00', endTime: '17:00', titular: 'Valérie Teitgen-Bigot', backups: ['Aziza Andy'], status: 'COVERED', languages: ['FR', 'EN', 'DE'] },
      { name: 'Réception Admin', contractCode: '110266', startTime: '09:00', endTime: '17:00', titular: 'Aziza Andy', backups: [], status: 'COVERED', languages: ['FR', 'EN'] },
    ],
    alerts: [],
  },
  {
    id: 'soc-generale',
    name: 'Société Générale',
    code: '141062',
    industry: 'Banque',
    coverageRate: 98,
    coverageTrend: 0,
    status: 'STABLE',
    address: '11 avenue Emile Reuter, Luxembourg-Kirchberg',
    siteCount: 1,
    contractSince: '2018-03',
    coverageHistory: [99, 99, 98, 99, 98, 98],
    aiRiskScore: 22,
    aiRiskFactors: ['Profil FR/EN/DE exigé — 3 postes simultanés'],
    contacts: [
      { name: 'Nathalie Dupont', role: 'Services Généraux', email: 'n.dupont@socgen.lu', phone: '+352 47 93 11', isPrimary: true },
    ],
    posts: [
      { name: 'Réception Corporate', contractCode: '141062', startTime: '07:30', endTime: '17:00', titular: 'Soubida Baitiche', backups: ['Rachid Fahfouhi'], status: 'COVERED', languages: ['FR', 'EN', 'AR'] },
      { name: 'Standard Multilingue', contractCode: '141062', startTime: '08:00', endTime: '17:00', titular: 'Rachid Fahfouhi', backups: ['Kaisy Montroze'], status: 'COVERED', languages: ['FR', 'EN', 'AR'] },
      { name: 'Accueil VIP', contractCode: '141062', startTime: '09:00', endTime: '17:00', titular: 'Kaisy Montroze', backups: [], status: 'COVERED', languages: ['FR', 'EN'] },
    ],
    alerts: [],
  },
  {
    id: 'esm',
    name: 'European Stability Mechanism',
    code: '110277',
    industry: 'Institution Européenne',
    coverageRate: 100,
    coverageTrend: 0,
    status: 'STABLE',
    address: '6A Circuit de la Foire, Luxembourg-Kirchberg',
    siteCount: 1,
    contractSince: '2020-01',
    coverageHistory: [100, 100, 100, 100, 100, 100],
    aiRiskScore: 25,
    aiRiskFactors: ['Protocole institutionnel strict — backup doit être validé ESM'],
    contacts: [
      { name: 'Klaus Regling', role: 'Facilities Director', email: 'k.regling@esm.europa.eu', isPrimary: true },
    ],
    posts: [
      { name: 'Accueil Institutionnel', contractCode: '110277', startTime: '08:00', endTime: '17:00', titular: 'Luana Santos', backups: ['Rebecca Basse'], status: 'COVERED', languages: ['FR', 'EN', 'DE'] },
      { name: 'Réception Secondaire', contractCode: '110277', startTime: '09:00', endTime: '17:00', titular: 'Rebecca Basse', backups: [], status: 'COVERED', languages: ['FR', 'EN'] },
    ],
    alerts: [],
  },
  {
    id: 'cargolux',
    name: 'Cargolux Airlines',
    code: 'En cours',
    industry: 'Logistique & Aviation',
    coverageRate: 60,
    coverageTrend: -15,
    status: 'CRITICAL',
    address: 'Aéroport de Luxembourg-Findel, L-2990',
    siteCount: 1,
    contractSince: '2024-11',
    coverageHistory: [80, 75, 70, 65, 75, 60],
    aiRiskScore: 88,
    aiRiskFactors: ['2 postes non couverts semaine entière', 'Titulaires non trouvés (contrat récent)', 'Horaires atypiques 6h-22h difficiles à couvrir', 'Aucun backup formé sur le site'],
    contacts: [
      { name: 'André Wagner', role: 'Ground Operations Manager', email: 'a.wagner@cargolux.com', phone: '+352 42 11 1', isPrimary: true },
      { name: 'Sandra Koch', role: 'HR Coordinator', email: 's.koch@cargolux.com', isPrimary: false },
    ],
    posts: [
      { name: 'Réception Matin', contractCode: '—', startTime: '06:00', endTime: '14:00', titular: 'À pourvoir', backups: [], status: 'UNCOVERED', languages: ['FR', 'EN', 'DE'] },
      { name: 'Réception B', contractCode: '—', startTime: '14:00', endTime: '22:00', titular: 'À pourvoir', backups: [], status: 'UNCOVERED', languages: ['FR', 'EN'] },
      { name: 'Standard Ops', contractCode: '—', startTime: '08:00', endTime: '17:00', titular: 'Backup Miangaly', backups: [], status: 'AT_RISK', languages: ['FR', 'EN'] },
      { name: 'Accueil VIP', contractCode: '—', startTime: '09:00', endTime: '17:00', titular: 'Backup Maya', backups: [], status: 'COVERED', languages: ['FR', 'EN', 'DE'] },
    ],
    alerts: [
      { id: 'cgx-1', severity: 'CRITICAL', title: 'Réception Matin non couverte — semaine entière', date: '2026-03-28' },
      { id: 'cgx-2', severity: 'CRITICAL', title: 'Réception B (14h-22h) sans titulaire', date: '2026-03-28' },
      { id: 'cgx-3', severity: 'WARNING', title: 'Standard Ops : backup sans formation', date: '2026-03-30' },
      { id: 'cgx-4', severity: 'INFO', title: 'Onboarding 2 titulaires prévu avril', date: '2026-04-15' },
    ],
  },
];

// Helper to find client by ID
export function getClientById(id: string): ClientData | undefined {
  return CLIENTS_DATA.find(c => c.id === id);
}
