/**
 * employees-data.ts — 44 agents SAMSIC avec profil complet
 * Inclut : taux horaire, disponibilités, compétences, formations site
 */

export interface EmployeeLanguage {
  code: 'fr' | 'en' | 'de' | 'lu' | 'pt' | 'zh' | 'ar' | 'jp' | 'it' | 'es';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';
}

export interface EmployeeSkill {
  id: string;
  label: string;
  level: 'LEARNING' | 'COMPETENT' | 'EXPERT';
}

export interface TrainedPost {
  clientId: string;
  clientName: string;
  postName: string;
  status: 'TRAINED' | 'IN_PROGRESS' | 'TO_TRAIN';
  trainedAt?: string;
}

export interface Certification {
  name: string;
  issuedAt: string;
  expiresAt?: string;
  isValid: boolean;
}

export interface EmployeeFullProfile {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  employeeType: 'TITULAR' | 'BACKUP' | 'TEAM_LEADER';
  contractType: 'CDI' | 'CDD' | 'INTERIM';
  contractStartDate: string;
  contractEndDate?: string;    // Pour les CDD/INTERIM uniquement
  weeklyContractHours: number;
  hourlyRate: number;         // taux brut employé
  billedRate: number;         // taux facturé client
  isActive: boolean;
  phone: string;
  email: string;
  address: string;
  hasVehicle: boolean;
  drivingLicense: boolean;
  acceptedZones: string[];
  languages: EmployeeLanguage[];
  skills: EmployeeSkill[];
  certifications: Certification[];
  trainedPosts: TrainedPost[];
  weeklyContractHours2?: number; // alias for display
  weeklyAssignedHours: number;
  utilizationGap: number;
  occupancyRate: number;
  absenceRate: number;
  reliabilityScore: number;
  versatilityScore: number;
  notes: string;
}

// Computed on load
function makeEmployee(e: Omit<EmployeeFullProfile, 'utilizationGap' | 'occupancyRate' | 'versatilityScore'>): EmployeeFullProfile {
  const gap = Math.max(0, e.weeklyContractHours - e.weeklyAssignedHours);
  const occ = Math.round((e.weeklyAssignedHours / e.weeklyContractHours) * 100);
  const vs = Math.min(100,
    Math.min(e.languages.length * 15, 35) +
    Math.min(e.skills.length * 10, 30) +
    Math.min(e.trainedPosts.filter(t => t.status === 'TRAINED').length * 8, 25) +
    (e.employeeType === 'TEAM_LEADER' ? 10 : e.employeeType === 'BACKUP' ? 5 : 0)
  );
  return { ...e, utilizationGap: gap, occupancyRate: occ, versatilityScore: vs };
}

export const EMPLOYEES_DATA: EmployeeFullProfile[] = [
  makeEmployee({
    id: 'mandy-de-melo', employeeCode: '20-0001',
    firstName: 'Mandy', lastName: 'De Melo',
    employeeType: 'TEAM_LEADER', contractType: 'CDI',
    contractStartDate: '2018-03-01',
    weeklyContractHours: 40, weeklyAssignedHours: 40,
    hourlyRate: 22, billedRate: 42, isActive: true,
    phone: '+352 621 100 001', email: 'mandy.demelo@samsic.lu',
    address: '15 rue de Hollerich, Luxembourg', hasVehicle: true, drivingLicense: true,
    acceptedZones: ['kirchberg', 'centre', 'clausen', 'leudelange', 'strassen'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'pt', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'de', level: 'INTERMEDIATE' }],
    skills: [
      { id: 'management', label: 'Management équipe', level: 'EXPERT' },
      { id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'EXPERT' },
      { id: 'planning', label: 'Gestion planning', level: 'EXPERT' },
    ],
    certifications: [{ name: 'SST', issuedAt: '2023-01-15', expiresAt: '2025-01-15', isValid: false }],
    trainedPosts: [
      { clientId: 'bank-of-china', clientName: 'Bank of China', postName: 'Réception A', status: 'TRAINED', trainedAt: '2020-09-01' },
      { clientId: 'generali', clientName: 'Generali', postName: 'Réception VIP', status: 'TRAINED', trainedAt: '2019-06-01' },
    ],
    absenceRate: 1.2, reliabilityScore: 98, notes: 'Responsable planning. Référente qualité.',
  }),

  makeEmployee({
    id: 'jessica-santos', employeeCode: '20-0002',
    firstName: 'Jessica', lastName: 'Santos',
    employeeType: 'TEAM_LEADER', contractType: 'CDI',
    contractStartDate: '2019-01-15',
    weeklyContractHours: 40, weeklyAssignedHours: 38,
    hourlyRate: 20, billedRate: 40, isActive: true,
    phone: '+352 621 100 002', email: 'jessica.santos@samsic.lu',
    address: '8 avenue de la Liberté, Luxembourg', hasVehicle: false, drivingLicense: true,
    acceptedZones: ['kirchberg', 'centre', 'clausen'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'pt', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }],
    skills: [
      { id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'EXPERT' },
      { id: 'badges', label: 'Gestion badges', level: 'COMPETENT' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'chambre-commerce', clientName: 'Chambre de Commerce', postName: 'Accueil Conférences', status: 'TRAINED', trainedAt: '2019-03-01' },
      { clientId: 'generali', clientName: 'Generali', postName: 'Réception VIP', status: 'TRAINED', trainedAt: '2019-08-01' },
    ],
    absenceRate: 2.1, reliabilityScore: 94, notes: 'Opératrice planning principale.',
  }),

  makeEmployee({
    id: 'maria-dobrinescu', employeeCode: '20-0010',
    firstName: 'Maria', lastName: 'Dobrinescu',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2020-07-01',
    weeklyContractHours: 35, weeklyAssignedHours: 0,
    hourlyRate: 16, billedRate: 32, isActive: true,
    phone: '+352 621 100 010', email: 'm.dobrinescu@samsic.lu',
    address: '22 rue de Bonnevoie, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['clausen', 'kirchberg', 'centre'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'en', level: 'FLUENT' }, { code: 'de', level: 'INTERMEDIATE' }],
    skills: [
      { id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'COMPETENT' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'bank-of-china', clientName: 'Bank of China', postName: 'Réception A', status: 'TRAINED', trainedAt: '2020-09-01' },
    ],
    absenceRate: 8.5, reliabilityScore: 72, notes: 'Titulaire BOC Réception A. Absence en cours depuis 29/03.',
  }),

  makeEmployee({
    id: 'catarina-mateus', employeeCode: '20-0011',
    firstName: 'Catarina', lastName: 'Mateus',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2021-02-01',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 16, billedRate: 32, isActive: true,
    phone: '+352 621 100 011', email: 'c.mateus@samsic.lu',
    address: '5 rue du Fort Elisabeth, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['clausen', 'kirchberg'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'en', level: 'FLUENT' }, { code: 'pt', level: 'NATIVE' }],
    skills: [
      { id: 'accueil_vip', label: 'Accueil VIP', level: 'COMPETENT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'COMPETENT' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'bank-of-china', clientName: 'Bank of China', postName: 'Réception A', status: 'TRAINED', trainedAt: '2021-05-01' },
      { clientId: 'bank-of-china', clientName: 'Bank of China', postName: 'Réception B', status: 'TRAINED', trainedAt: '2021-02-15' },
    ],
    absenceRate: 3.2, reliabilityScore: 89, notes: 'Titulaire BOC Réception B. Backup ROC Réception A.',
  }),

  makeEmployee({
    id: 'noémie-dodrill', employeeCode: '20-0012',
    firstName: 'Noémie', lastName: 'Dodrill',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2022-03-15',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 15.5, billedRate: 31, isActive: true,
    phone: '+352 621 100 012', email: 'n.dodrill@samsic.lu',
    address: '12 rue de Beggen, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['clausen', 'centre'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'lu', level: 'FLUENT' }],
    skills: [{ id: 'standard_tel', label: 'Standard téléphonique', level: 'EXPERT' }],
    certifications: [],
    trainedPosts: [{ clientId: 'bank-of-china', clientName: 'Bank of China', postName: 'Standard Téléphonique', status: 'TRAINED', trainedAt: '2022-04-01' }],
    absenceRate: 4.1, reliabilityScore: 85, notes: 'Titulaire BOC Standard. Trilingue FR/EN/LU.',
  }),

  makeEmployee({
    id: 'priya-nair', employeeCode: '20-0020',
    firstName: 'Priya', lastName: 'Nair',
    employeeType: 'BACKUP', contractType: 'CDI',
    contractStartDate: '2021-09-01',
    weeklyContractHours: 35, weeklyAssignedHours: 28,
    hourlyRate: 15, billedRate: 30, isActive: true,
    phone: '+352 621 100 020', email: 'p.nair@samsic.lu',
    address: '3 rue de la Semois, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['kirchberg', 'clausen', 'centre', 'strassen'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'en', level: 'NATIVE' }, { code: 'de', level: 'INTERMEDIATE' }],
    skills: [
      { id: 'accueil_standard', label: 'Accueil standard', level: 'EXPERT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'COMPETENT' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'axxeron', clientName: 'Axxeron Hydrolux', postName: 'Réception Principale', status: 'TRAINED', trainedAt: '2022-01-15' },
      { clientId: 'bank-of-china', clientName: 'Bank of China', postName: 'Réception B', status: 'TRAINED', trainedAt: '2022-03-01' },
      { clientId: 'house-startups', clientName: 'House of Startups', postName: 'Réception Tech', status: 'TRAINED', trainedAt: '2023-02-01' },
    ],
    absenceRate: 2.8, reliabilityScore: 91, notes: 'Backup polyvalent. 7h libres cette semaine.',
  }),

  makeEmployee({
    id: 'lucas-donis', employeeCode: '20-0030',
    firstName: 'Lucas', lastName: 'Donis',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2022-04-01',
    weeklyContractHours: 35, weeklyAssignedHours: 30,
    hourlyRate: 15.5, billedRate: 31, isActive: true,
    phone: '+352 621 100 030', email: 'l.donis@samsic.lu',
    address: '18 rue de Hollerich, Luxembourg', hasVehicle: true, drivingLicense: true,
    acceptedZones: ['leudelange', 'kirchberg', 'centre', 'strassen'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }],
    skills: [
      { id: 'accueil_standard', label: 'Accueil standard', level: 'EXPERT' },
      { id: 'courrier', label: 'Gestion courrier', level: 'COMPETENT' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'amazon', clientName: 'Amazon JLL', postName: 'Réception Principale', status: 'TRAINED', trainedAt: '2022-05-01' },
    ],
    absenceRate: 3.0, reliabilityScore: 88, notes: '5h libres cette semaine. Véhicule — mobile.',
  }),

  makeEmployee({
    id: 'serap-ayhan', employeeCode: '20-0031',
    firstName: 'Serap', lastName: 'Ayhan',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2022-06-15',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 15.5, billedRate: 31, isActive: true,
    phone: '+352 621 100 031', email: 's.ayhan@samsic.lu',
    address: '7 rue de Strasbourg, Leudelange', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['leudelange', 'kirchberg'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'en', level: 'FLUENT' }],
    skills: [{ id: 'accueil_standard', label: 'Accueil standard', level: 'EXPERT' }],
    certifications: [],
    trainedPosts: [
      { clientId: 'amazon', clientName: 'Amazon JLL', postName: 'Réception Principale', status: 'TRAINED', trainedAt: '2022-08-01' },
      { clientId: 'amazon', clientName: 'Amazon JLL', postName: 'Réception Secondaire', status: 'TRAINED', trainedAt: '2022-07-01' },
    ],
    absenceRate: 2.5, reliabilityScore: 92, notes: 'Titulaire Amazon Réception Secondaire.',
  }),

  makeEmployee({
    id: 'karim-ghazi', employeeCode: '20-0040',
    firstName: 'Karim', lastName: 'Ghazi',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2021-05-01',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 16, billedRate: 32, isActive: true,
    phone: '+352 621 100 040', email: 'k.ghazi@samsic.lu',
    address: '30 rue de Cessange, Luxembourg', hasVehicle: true, drivingLicense: true,
    acceptedZones: ['centre', 'kirchberg', 'clausen'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'de', level: 'FLUENT' }, { code: 'ar', level: 'NATIVE' }],
    skills: [
      { id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'EXPERT' },
    ],
    certifications: [{ name: 'SST', issuedAt: '2022-04-09', expiresAt: '2026-04-09', isValid: true }],
    trainedPosts: [
      { clientId: 'ing', clientName: 'ING Bank', postName: 'Réception Principale', status: 'TRAINED', trainedAt: '2021-06-01' },
      { clientId: 'ing', clientName: 'ING Bank', postName: 'Accueil VIP', status: 'TRAINED', trainedAt: '2022-01-01' },
    ],
    absenceRate: 1.8, reliabilityScore: 95, notes: 'Certification SST expire 09/04. Quadrilingue précieux.',
  }),

  makeEmployee({
    id: 'jessica-cabral', employeeCode: '20-0050',
    firstName: 'Jessica', lastName: 'Cabral',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2019-05-15',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 17, billedRate: 34, isActive: true,
    phone: '+352 621 100 050', email: 'j.cabral@samsic.lu',
    address: '9 avenue Emile Reuter, Strassen', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['strassen', 'kirchberg', 'centre'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'pt', level: 'NATIVE' }, { code: 'it', level: 'FLUENT' }],
    skills: [
      { id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'EXPERT' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'generali', clientName: 'Generali', postName: 'Réception VIP', status: 'TRAINED', trainedAt: '2019-07-01' },
      { clientId: 'generali', clientName: 'Generali', postName: 'Standard Trilingue', status: 'TRAINED', trainedAt: '2020-01-01' },
    ],
    absenceRate: 2.0, reliabilityScore: 96, notes: 'Profil 4 langues rare. Idéale pour postes VIP.',
  }),

  makeEmployee({
    id: 'agathe-wyppych', employeeCode: '20-0060',
    firstName: 'Agathe', lastName: 'Wyppych',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2020-11-01',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 17, billedRate: 34, isActive: true,
    phone: '+352 621 100 060', email: 'a.wyppych@samsic.lu',
    address: '4 avenue JF Kennedy, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['kirchberg', 'clausen'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'zh', level: 'INTERMEDIATE' }],
    skills: [{ id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' }],
    certifications: [],
    trainedPosts: [
      { clientId: 'china-everbright', clientName: 'China Everbright', postName: 'Réception Diplomatique', status: 'TRAINED', trainedAt: '2020-12-01' },
      { clientId: 'mitsubishi', clientName: 'Mitsubishi', postName: 'Réception Bilingue', status: 'TRAINED', trainedAt: '2021-07-01' },
    ],
    absenceRate: 1.5, reliabilityScore: 97, notes: 'Spécialiste postes diplomatiques.',
  }),

  makeEmployee({
    id: 'backup-miangaly', employeeCode: '20-0080',
    firstName: 'Miangaly', lastName: 'Rakotomalala',
    employeeType: 'BACKUP', contractType: 'CDI',
    contractStartDate: '2023-01-10',
    weeklyContractHours: 35, weeklyAssignedHours: 22,
    hourlyRate: 14.5, billedRate: 29, isActive: true,
    phone: '+352 621 100 080', email: 'm.rakotomalala@samsic.lu',
    address: '25 rue de Bonnevoie, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['kirchberg', 'strassen', 'leudelange', 'centre'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'INTERMEDIATE' }],
    skills: [
      { id: 'accueil_standard', label: 'Accueil standard', level: 'COMPETENT' },
      { id: 'courrier', label: 'Gestion courrier', level: 'LEARNING' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'amazon', clientName: 'Amazon JLL', postName: 'Mailroom', status: 'TRAINED', trainedAt: '2023-03-01' },
      { clientId: 'jao', clientName: 'JAO', postName: 'Accueil Spécialisé', status: 'TRAINED', trainedAt: '2023-06-01' },
      { clientId: 'lih', clientName: 'LIH', postName: 'Réception Chercheurs', status: 'IN_PROGRESS' },
      { clientId: 'cargolux', clientName: 'Cargolux', postName: 'Standard Ops', status: 'TO_TRAIN' },
    ],
    absenceRate: 5.5, reliabilityScore: 80, notes: '13h libres semaine. Polyvalente mais EN à renforcer.',
  }),

  makeEmployee({
    id: 'nadia-tahri', employeeCode: '20-0090',
    firstName: 'Nadia', lastName: 'Tahri',
    employeeType: 'BACKUP', contractType: 'CDI',
    contractStartDate: '2021-10-01',
    weeklyContractHours: 35, weeklyAssignedHours: 30,
    hourlyRate: 15, billedRate: 30, isActive: true,
    phone: '+352 621 100 090', email: 'n.tahri@samsic.lu',
    address: '11 bd de la Pétrusse, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['centre', 'kirchberg', 'clausen'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'ar', level: 'NATIVE' }],
    skills: [
      { id: 'accueil_standard', label: 'Accueil standard', level: 'EXPERT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'COMPETENT' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'ing', clientName: 'ING Bank', postName: 'Standard Téléphonique', status: 'TO_TRAIN' },
      { clientId: 'ing', clientName: 'ING Bank', postName: 'Réception Principale', status: 'TRAINED', trainedAt: '2022-02-01' },
    ],
    absenceRate: 4.0, reliabilityScore: 86, notes: '5h libres. Non formée ING Standard = risque.',
  }),

  makeEmployee({
    id: 'pascale-mayne', employeeCode: '20-0100',
    firstName: 'Pascale', lastName: 'Mayne',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2021-01-15',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 16, billedRate: 32, isActive: true,
    phone: '+352 621 100 100', email: 'p.mayne@samsic.lu',
    address: '6 rue du Laboratoire, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['clausen', 'kirchberg'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'de', level: 'INTERMEDIATE' }],
    skills: [{ id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' }],
    certifications: [],
    trainedPosts: [
      { clientId: 'house-startups', clientName: 'House of Startups', postName: 'Réception Tech', status: 'TRAINED', trainedAt: '2021-03-01' },
      { clientId: 'china-everbright', clientName: 'China Everbright', postName: 'Réception Diplomatique', status: 'TRAINED', trainedAt: '2021-06-01' },
    ],
    absenceRate: 2.2, reliabilityScore: 93, notes: 'Titulaire House of Startups.',
  }),

  makeEmployee({
    id: 'kiu-man', employeeCode: '20-0110',
    firstName: 'Kiu', lastName: 'Man',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2018-09-01',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 16.5, billedRate: 33, isActive: true,
    phone: '+352 621 100 110', email: 'k.man@samsic.lu',
    address: '7 avenue de la Gare, Kirchberg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['kirchberg', 'centre'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'en', level: 'FLUENT' }, { code: 'de', level: 'FLUENT' }, { code: 'zh', level: 'NATIVE' }],
    skills: [
      { id: 'accueil_standard', label: 'Accueil standard', level: 'EXPERT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'EXPERT' },
    ],
    certifications: [],
    trainedPosts: [{ clientId: 'chambre-commerce', clientName: 'Chambre de Commerce', postName: 'Accueil Conférences', status: 'TRAINED', trainedAt: '2018-10-01' }],
    absenceRate: 1.0, reliabilityScore: 98, notes: 'Quadrilingue FR/EN/DE/ZH. Senior.',
  }),

  makeEmployee({
    id: 'soubida-baitiche', employeeCode: '20-0120',
    firstName: 'Soubida', lastName: 'Baitiche',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2018-03-01',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 16.5, billedRate: 33, isActive: true,
    phone: '+352 621 100 120', email: 's.baitiche@samsic.lu',
    address: '4 rue Emile Reuter, Kirchberg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['kirchberg', 'centre'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'ar', level: 'NATIVE' }],
    skills: [{ id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' }],
    certifications: [],
    trainedPosts: [{ clientId: 'soc-generale', clientName: 'Société Générale', postName: 'Réception Corporate', status: 'TRAINED', trainedAt: '2018-04-01' }],
    absenceRate: 1.5, reliabilityScore: 97, notes: 'Senior Soc Générale depuis 8 ans.',
  }),

  makeEmployee({
    id: 'luana-santos', employeeCode: '20-0130',
    firstName: 'Luana', lastName: 'Santos',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2020-01-15',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 16, billedRate: 32, isActive: true,
    phone: '+352 621 100 130', email: 'lu.santos@samsic.lu',
    address: '3 circuit de la Foire, Kirchberg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['kirchberg'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'en', level: 'FLUENT' }, { code: 'de', level: 'INTERMEDIATE' }, { code: 'pt', level: 'NATIVE' }],
    skills: [{ id: 'accueil_vip', label: 'Accueil VIP', level: 'EXPERT' }],
    certifications: [{ name: 'Protocole_ESM', issuedAt: '2020-03-01', isValid: true }],
    trainedPosts: [{ clientId: 'esm', clientName: 'ESM', postName: 'Accueil Institutionnel', status: 'TRAINED', trainedAt: '2020-03-01' }],
    absenceRate: 0.8, reliabilityScore: 99, notes: 'Certifiée protocole ESM. Poste ultra-sensible.',
  }),

  makeEmployee({
    id: 'cintia-bettencourt', employeeCode: '20-0140',
    firstName: 'Cintia', lastName: 'Bettencourt',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2023-02-01',
    weeklyContractHours: 35, weeklyAssignedHours: 32,
    hourlyRate: 14.5, billedRate: 29, isActive: true,
    phone: '+352 621 100 140', email: 'c.bettencourt@samsic.lu',
    address: '10 route d\'Arlon, Luxembourg', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['centre', 'kirchberg'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'lu', level: 'INTERMEDIATE' }, { code: 'pt', level: 'NATIVE' }],
    skills: [{ id: 'accueil_standard', label: 'Accueil standard', level: 'COMPETENT' }],
    certifications: [],
    trainedPosts: [
      { clientId: '3d-immo', clientName: '3D Immo', postName: 'Accueil Clients', status: 'TRAINED', trainedAt: '2023-03-01' },
      { clientId: 'aon', clientName: 'AON', postName: 'Réception', status: 'TRAINED', trainedAt: '2023-08-01' },
    ],
    absenceRate: 3.8, reliabilityScore: 84, notes: '3h libres. FR/LU atout.',
  }),

  makeEmployee({
    id: 'valérie-teitgen-bigot', employeeCode: '20-0150',
    firstName: 'Valérie', lastName: 'Teitgen-Bigot',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2023-05-15',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 15.5, billedRate: 31, isActive: true,
    phone: '+352 621 100 150', email: 'v.teitgen@samsic.lu',
    address: '8 rue de Bitbourg, Munsbach', hasVehicle: true, drivingLicense: true,
    acceptedZones: ['leudelange', 'kirchberg', 'strassen'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }, { code: 'de', level: 'FLUENT' }],
    skills: [
      { id: 'accueil_vip', label: 'Accueil VIP', level: 'COMPETENT' },
      { id: 'accueil_standard', label: 'Accueil standard', level: 'EXPERT' },
    ],
    certifications: [],
    trainedPosts: [{ clientId: 'leasys', clientName: 'Leasys', postName: 'Accueil Showroom', status: 'TRAINED', trainedAt: '2023-06-01' }],
    absenceRate: 2.0, reliabilityScore: 93, notes: 'Trilingue. Véhicule — mobile Munsbach.',
  }),

  makeEmployee({
    id: 'jenelyn-freddi', employeeCode: '20-0160',
    firstName: 'Jenelyn', lastName: 'Freddi',
    employeeType: 'TITULAR', contractType: 'CDI',
    contractStartDate: '2021-10-01',
    weeklyContractHours: 35, weeklyAssignedHours: 35,
    hourlyRate: 15.5, billedRate: 31, isActive: true,
    phone: '+352 621 100 160', email: 'j.freddi@samsic.lu',
    address: '2 rue Edison, Strassen', hasVehicle: false, drivingLicense: false,
    acceptedZones: ['strassen', 'kirchberg'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'en', level: 'FLUENT' }],
    skills: [{ id: 'accueil_standard', label: 'Accueil standard', level: 'EXPERT' }],
    certifications: [],
    trainedPosts: [{ clientId: 'lih', clientName: 'LIH', postName: 'Accueil Visiteurs', status: 'TRAINED', trainedAt: '2021-11-01' }],
    absenceRate: 3.2, reliabilityScore: 88, notes: 'Titulaire LIH Accueil Visiteurs.',
  }),

  // ── CDD & Turnover démo ────────────────────────────────────────────────────
  makeEmployee({
    id: 'nina-koch', employeeCode: '20-2106',
    firstName: 'Nina', lastName: 'Koch',
    employeeType: 'BACKUP', contractType: 'CDD',
    contractStartDate: '2025-11-12', contractEndDate: '2026-05-12',
    weeklyContractHours: 35, weeklyAssignedHours: 28,
    hourlyRate: 14, billedRate: 32, isActive: true,
    phone: '+352 621 100 170', email: 'n.koch@samsic.lu',
    address: '11 rue des Champs, Bertrange', hasVehicle: true, drivingLicense: true,
    acceptedZones: ['kirchberg', 'centre', 'strassen', 'bertrange'],
    languages: [{ code: 'fr', level: 'FLUENT' }, { code: 'de', level: 'NATIVE' }, { code: 'en', level: 'INTERMEDIATE' }],
    skills: [
      { id: 'accueil_standard', label: 'Accueil standard', level: 'COMPETENT' },
      { id: 'standard_tel', label: 'Standard téléphonique', level: 'COMPETENT' },
    ],
    certifications: [{ name: 'Sécurité incendie', issuedAt: '2025-12-01', expiresAt: '2027-12-01', isValid: true }],
    trainedPosts: [
      { clientId: 'bgl-bnp', clientName: 'BGL BNP Paribas', postName: 'Standard Téléphonique', status: 'TRAINED', trainedAt: '2025-12-15' },
      { clientId: 'arendt', clientName: 'Arendt & Medernach', postName: 'Réception', status: 'IN_PROGRESS' },
    ],
    absenceRate: 1.8, reliabilityScore: 91, notes: 'CDD 6 mois — Fin prévue 12 mai 2026. Bonne intégration. Germanophone native.',
  }),

  makeEmployee({
    id: 'lucas-teixeira', employeeCode: '20-2107',
    firstName: 'Lucas', lastName: 'Teixeira',
    employeeType: 'BACKUP', contractType: 'CDD',
    contractStartDate: '2026-01-06', contractEndDate: '2026-07-05',
    weeklyContractHours: 35, weeklyAssignedHours: 14,
    hourlyRate: 13, billedRate: 30, isActive: true,
    phone: '+352 621 100 171', email: 'l.teixeira@samsic.lu',
    address: '5 route de Thionville, Hesperange', hasVehicle: false, drivingLicense: true,
    acceptedZones: ['centre', 'clausen', 'kirchberg'],
    languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'pt', level: 'NATIVE' }, { code: 'en', level: 'BEGINNER' }],
    skills: [
      { id: 'gestion_courrier', label: 'Gestion courrier', level: 'COMPETENT' },
      { id: 'accueil_standard', label: 'Accueil standard', level: 'LEARNING' },
    ],
    certifications: [],
    trainedPosts: [
      { clientId: 'amazon', clientName: 'Amazon', postName: 'Mailroom', status: 'TRAINED', trainedAt: '2026-01-20' },
    ],
    absenceRate: 0.5, reliabilityScore: 95, notes: 'CDD 6 mois — En phase d\'intégration. Motivé, ponctuel.',
  }),
];

export function getEmployeeById(id: string): EmployeeFullProfile | undefined {
  return EMPLOYEES_DATA.find(e => e.id === id);
}

// Calcul du rapport d'occupation global
export function getOccupancyReport(employees: EmployeeFullProfile[]) {
  const active = employees.filter(e => e.isActive);
  const totalContract = active.reduce((s, e) => s + e.weeklyContractHours, 0);
  const totalAssigned = active.reduce((s, e) => s + e.weeklyAssignedHours, 0);
  const underutilized = active.filter(e => e.utilizationGap > 0).sort((a, b) => b.utilizationGap - a.utilizationGap);
  const avgBilledRate = active.reduce((s, e) => s + e.billedRate, 0) / active.length;
  const lostRevenue = Math.round(
    active.reduce((s, e) => s + e.utilizationGap * e.billedRate, 0)
  );
  return {
    totalContractHours: totalContract,
    assignedHours: totalAssigned,
    occupancyRate: Math.round((totalAssigned / totalContract) * 100),
    lostRevenue,
    underutilizedAgents: underutilized,
    agentCount: active.length,
    avgBilledRate: Math.round(avgBilledRate),
  };
}
