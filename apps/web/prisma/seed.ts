/**
 * Seed script — Données réelles SAMSIC Facility
 * @samsic-data-model — 17 clients, 44 employés, planning semaine démo
 * @samsic-demo-scenario — 90% couvert, 3 gaps stratégiques pour la démo
 *
 * Usage: npx tsx prisma/seed.ts
 */
import { PrismaClient, EmployeeType, AssignmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SAMSIC Accueil database...');

  // ===== CLEAN SLATE =====
  await prisma.assignment.deleteMany({});
  await prisma.alert.deleteMany({});

  // ===== CLIENTS (17 réels) =====
  const clientsData = [
    { name: 'Bank of China', industry: 'Banking' },
    { name: 'Amazon', industry: 'Technology' },
    { name: 'BGL BNP Paribas', industry: 'Banking' },
    { name: 'PwC Luxembourg', industry: 'Consulting' },
    { name: 'KPMG', industry: 'Consulting' },
    { name: 'Deloitte', industry: 'Consulting' },
    { name: 'EY', industry: 'Consulting' },
    { name: 'RTL Group', industry: 'Media' },
    { name: 'Spuerkeess', industry: 'Banking' },
    { name: 'Cargolux', industry: 'Logistics' },
    { name: 'ArcelorMittal', industry: 'Industrial' },
    { name: 'POST Luxembourg', industry: 'Telecommunications' },
    { name: 'Luxair', industry: 'Aviation' },
    { name: 'SES', industry: 'Technology' },
    { name: 'Encevo', industry: 'Energy' },
    { name: 'BIL', industry: 'Banking' },
    { name: 'Arendt & Medernach', industry: 'Legal' },
  ];

  const clients: Record<string, string> = {};
  for (const c of clientsData) {
    const client = await prisma.client.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    clients[c.name] = client.id;
  }
  console.log(`✅ ${clientsData.length} clients créés`);

  // ===== POSTS (21 postes) =====
  const postsData = [
    // Bank of China — en critique
    { clientName: 'Bank of China', name: 'Réception A', startTime: '08:00', endTime: '17:00', requiredLanguages: ['fr', 'en'], criticalLanguage: 'en', requiredSkills: ['accueil_standard'] },
    { clientName: 'Bank of China', name: 'Réception B', startTime: '09:00', endTime: '18:00', requiredLanguages: ['fr', 'en'], criticalLanguage: 'en', requiredSkills: ['accueil_standard'] },
    // Amazon
    { clientName: 'Amazon', name: 'Réception Principale', startTime: '08:30', endTime: '17:30', requiredLanguages: ['fr', 'en'], criticalLanguage: 'en', requiredSkills: ['accueil_standard', 'badges'] },
    { clientName: 'Amazon', name: 'Mailroom', startTime: '09:00', endTime: '18:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['gestion_courrier'] },
    // BGL BNP Paribas
    { clientName: 'BGL BNP Paribas', name: 'Accueil VIP', startTime: '08:00', endTime: '17:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['accueil_vip', 'standard_telephonique'] },
    { clientName: 'BGL BNP Paribas', name: 'Standard Téléphonique', startTime: '08:00', endTime: '20:00', requiredLanguages: ['fr', 'en', 'de'], criticalLanguage: null, requiredSkills: ['standard_telephonique'] },
    // PwC Luxembourg
    { clientName: 'PwC Luxembourg', name: 'Réception', startTime: '08:00', endTime: '18:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['accueil_standard'] },
    { clientName: 'PwC Luxembourg', name: 'Conciergerie', startTime: '09:00', endTime: '17:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['accueil_vip'] },
    // Cabinets
    { clientName: 'KPMG', name: 'Réception', startTime: '08:00', endTime: '18:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['accueil_standard'] },
    { clientName: 'Deloitte', name: 'Réception', startTime: '08:00', endTime: '18:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['accueil_standard'] },
    { clientName: 'EY', name: 'Réception', startTime: '08:00', endTime: '18:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['accueil_standard'] },
    { clientName: 'Arendt & Medernach', name: 'Réception', startTime: '08:00', endTime: '18:00', requiredLanguages: ['fr', 'en'], criticalLanguage: 'en', requiredSkills: ['accueil_standard'] },
    // Media / Telecom / Banking
    { clientName: 'RTL Group', name: 'Réception Principale', startTime: '07:00', endTime: '20:00', requiredLanguages: ['fr', 'en', 'de'], criticalLanguage: 'de', requiredSkills: ['accueil_standard'] },
    { clientName: 'Spuerkeess', name: 'Accueil', startTime: '08:30', endTime: '17:30', requiredLanguages: ['fr', 'lu'], criticalLanguage: null, requiredSkills: ['accueil_standard'] },
    { clientName: 'BIL', name: 'Accueil VIP', startTime: '08:00', endTime: '17:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['accueil_vip'] },
    // Industry / Logistics / Energy
    { clientName: 'Cargolux', name: 'Réception', startTime: '08:00', endTime: '17:00', requiredLanguages: ['fr', 'en'], criticalLanguage: 'en', requiredSkills: ['accueil_standard'] },
    { clientName: 'ArcelorMittal', name: 'Réception Siège', startTime: '08:00', endTime: '17:00', requiredLanguages: ['fr', 'en'], criticalLanguage: null, requiredSkills: ['badges', 'accueil_standard'] },
    { clientName: 'POST Luxembourg', name: 'Accueil', startTime: '08:00', endTime: '18:00', requiredLanguages: ['fr', 'de', 'lu'], criticalLanguage: null, requiredSkills: ['accueil_standard'] },
    { clientName: 'Luxair', name: 'Accueil Corporate', startTime: '08:00', endTime: '17:00', requiredLanguages: ['fr', 'en', 'de'], criticalLanguage: null, requiredSkills: ['accueil_standard'] },
    { clientName: 'SES', name: 'Réception', startTime: '08:00', endTime: '17:00', requiredLanguages: ['fr', 'en'], criticalLanguage: 'en', requiredSkills: ['accueil_standard'] },
    { clientName: 'Encevo', name: 'Accueil', startTime: '08:00', endTime: '17:00', requiredLanguages: ['fr', 'de'], criticalLanguage: null, requiredSkills: ['accueil_standard'] },
  ];

  const posts: Record<string, string> = {};
  for (const p of postsData) {
    const post = await prisma.post.upsert({
      where: { clientId_name: { clientId: clients[p.clientName], name: p.name } },
      update: {},
      create: {
        clientId: clients[p.clientName],
        name: p.name,
        startTime: p.startTime,
        endTime: p.endTime,
        requiredLanguages: p.requiredLanguages,
        criticalLanguage: p.criticalLanguage ?? undefined,
        requiredSkills: p.requiredSkills,
      },
    });
    posts[`${p.clientName}|${p.name}`] = post.id;
  }
  console.log(`✅ ${postsData.length} postes créés`);

  // ===== EMPLOYÉS (44 réels) =====
  const employeesData = [
    // Team Leaders (3)
    { code: '20-6338', firstName: 'Mandy', lastName: 'De Melo', type: EmployeeType.TEAM_LEADER, languages: ['fr', 'en', 'pt'], skills: ['accueil_vip', 'standard_telephonique', 'accueil_standard', 'badges', 'gestion_courrier'], preferred: ['Bank of China', 'BGL BNP Paribas'] },
    { code: '20-7112', firstName: 'Jessica', lastName: 'Santos', type: EmployeeType.TEAM_LEADER, languages: ['fr', 'en', 'pt', 'de'], skills: ['accueil_standard', 'standard_telephonique', 'badges', 'gestion_courrier', 'accueil_vip'], preferred: ['Amazon', 'PwC Luxembourg'] },
    { code: '20-8045', firstName: 'Paola', lastName: 'Soares', type: EmployeeType.TEAM_LEADER, languages: ['fr', 'pt', 'en'], skills: ['accueil_standard', 'accueil_vip', 'standard_telephonique'], preferred: ['Deloitte', 'EY', 'BIL'] },
    // Titulaires (30)
    { code: '20-1101', firstName: 'Sophie', lastName: 'Martin', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['Bank of China'] },
    { code: '20-1102', firstName: 'Claire', lastName: 'Dubois', type: EmployeeType.TITULAR, languages: ['fr', 'en', 'de'], skills: ['accueil_standard', 'standard_telephonique'], preferred: ['RTL Group'] },
    { code: '20-1103', firstName: 'Marie', lastName: 'Leroy', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard', 'accueil_vip'], preferred: ['BIL'] },
    { code: '20-1104', firstName: 'Isabelle', lastName: 'Moreau', type: EmployeeType.TITULAR, languages: ['fr', 'lu', 'de'], skills: ['accueil_standard'], preferred: ['Spuerkeess', 'POST Luxembourg'] },
    { code: '20-1105', firstName: 'Nathalie', lastName: 'Petit', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard', 'badges'], preferred: ['ArcelorMittal'] },
    { code: '20-1106', firstName: 'Valérie', lastName: 'Bernard', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['KPMG'] },
    { code: '20-1107', firstName: 'Sylvie', lastName: 'Thomas', type: EmployeeType.TITULAR, languages: ['fr', 'en', 'de'], skills: ['accueil_standard', 'accueil_vip'], preferred: ['Deloitte'] },
    { code: '20-1108', firstName: 'Céline', lastName: 'Dupont', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['gestion_courrier', 'accueil_standard'], preferred: ['Amazon'] },
    { code: '20-1109', firstName: 'Laura', lastName: 'Garcia', type: EmployeeType.TITULAR, languages: ['fr', 'en', 'es'], skills: ['accueil_standard'], preferred: ['EY'] },
    { code: '20-1110', firstName: 'Fatima', lastName: 'Benali', type: EmployeeType.TITULAR, languages: ['fr', 'en', 'ar'], skills: ['accueil_standard', 'standard_telephonique'], preferred: ['PwC Luxembourg'] },
    { code: '20-1111', firstName: 'Lucie', lastName: 'Simon', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['Cargolux'] },
    { code: '20-1112', firstName: 'Emma', lastName: 'Laurent', type: EmployeeType.TITULAR, languages: ['fr', 'en', 'de'], skills: ['accueil_standard', 'badges'], preferred: ['BGL BNP Paribas'] },
    { code: '20-1113', firstName: 'Alice', lastName: 'Lefebvre', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_vip'], preferred: ['Arendt & Medernach'] },
    { code: '20-1114', firstName: 'Julie', lastName: 'Remy', type: EmployeeType.TITULAR, languages: ['fr', 'en', 'de'], skills: ['accueil_standard'], preferred: ['Luxair'] },
    { code: '20-1115', firstName: 'Ambre', lastName: 'Fontaine', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['SES'] },
    { code: '20-1116', firstName: 'Léa', lastName: 'Girard', type: EmployeeType.TITULAR, languages: ['fr', 'de', 'lu'], skills: ['accueil_standard'], preferred: ['POST Luxembourg', 'Encevo'] },
    { code: '20-1117', firstName: 'Anaïs', lastName: 'Bonnet', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard', 'standard_telephonique'], preferred: ['BGL BNP Paribas'] },
    { code: '20-1118', firstName: 'Camille', lastName: 'Fournier', type: EmployeeType.TITULAR, languages: ['fr', 'lu', 'de'], skills: ['accueil_standard'], preferred: ['Spuerkeess'] },
    { code: '20-1119', firstName: 'Mathilde', lastName: 'Morel', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard', 'badges'], preferred: ['ArcelorMittal'] },
    { code: '20-1120', firstName: 'Élise', lastName: 'Rousseau', type: EmployeeType.TITULAR, languages: ['fr', 'en', 'de'], skills: ['accueil_standard', 'accueil_vip'], preferred: ['RTL Group'] },
    { code: '20-1121', firstName: 'Charlotte', lastName: 'Blanc', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['KPMG'] },
    { code: '20-1122', firstName: 'Marion', lastName: 'Gros', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['EY'] },
    { code: '20-1123', firstName: 'Emilie', lastName: 'Renard', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard', 'gestion_courrier'], preferred: ['Amazon'] },
    { code: '20-1124', firstName: 'Célia', lastName: 'Gauthier', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['Deloitte'] },
    { code: '20-1125', firstName: 'Audrey', lastName: 'Meyer', type: EmployeeType.TITULAR, languages: ['fr', 'de', 'en'], skills: ['accueil_standard'], preferred: ['BGL BNP Paribas'] },
    { code: '20-1126', firstName: 'Stéphanie', lastName: 'Muller', type: EmployeeType.TITULAR, languages: ['fr', 'de'], skills: ['accueil_standard'], preferred: ['Encevo'] },
    { code: '20-1127', firstName: 'Sandrine', lastName: 'Schneider', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard', 'accueil_vip'], preferred: ['BIL', 'Arendt & Medernach'] },
    { code: '20-1128', firstName: 'Delphine', lastName: 'Weber', type: EmployeeType.TITULAR, languages: ['fr', 'lu', 'de'], skills: ['accueil_standard'], preferred: ['POST Luxembourg'] },
    { code: '20-1129', firstName: 'Virginie', lastName: 'Wagner', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['Cargolux', 'Luxair'] },
    { code: '20-1130', firstName: 'Caroline', lastName: 'Klein', type: EmployeeType.TITULAR, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: ['PwC Luxembourg'] },
    // Backups (11)
    { code: '20-2101', firstName: 'Priya', lastName: 'Nair', type: EmployeeType.BACKUP, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: [] },
    { code: '20-2102', firstName: 'Mei', lastName: 'Lin', type: EmployeeType.BACKUP, languages: ['fr', 'en', 'zh'], skills: ['accueil_standard', 'accueil_vip'], preferred: ['Bank of China'] },
    { code: '20-2103', firstName: 'Aisha', lastName: 'Diallo', type: EmployeeType.BACKUP, languages: ['fr', 'en'], skills: ['accueil_standard', 'gestion_courrier'], preferred: [] },
    { code: '20-2104', firstName: 'Yuki', lastName: 'Tanaka', type: EmployeeType.BACKUP, languages: ['fr', 'en', 'ja'], skills: ['accueil_standard'], preferred: [] },
    { code: '20-2105', firstName: 'Sofia', lastName: 'Alves', type: EmployeeType.BACKUP, languages: ['fr', 'en', 'pt'], skills: ['accueil_standard', 'accueil_vip'], preferred: [] },
    { code: '20-2106', firstName: 'Nina', lastName: 'Koch', type: EmployeeType.BACKUP, languages: ['fr', 'de', 'en'], skills: ['accueil_standard', 'standard_telephonique'], preferred: [] },
    { code: '20-2107', firstName: 'Mara', lastName: 'Popescu', type: EmployeeType.BACKUP, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: [] },
    { code: '20-2108', firstName: 'Lena', lastName: 'Novak', type: EmployeeType.BACKUP, languages: ['fr', 'en', 'de'], skills: ['accueil_standard'], preferred: [] },
    { code: '20-2109', firstName: 'Diana', lastName: 'Ionescu', type: EmployeeType.BACKUP, languages: ['fr', 'en'], skills: ['accueil_standard'], preferred: [] },
    { code: '20-2110', firstName: 'Fatou', lastName: 'Sow', type: EmployeeType.BACKUP, languages: ['fr', 'en'], skills: ['accueil_standard', 'badges'], preferred: [] },
    { code: '20-2111', firstName: 'Ana', lastName: 'Costa', type: EmployeeType.BACKUP, languages: ['fr', 'en', 'pt', 'es'], skills: ['accueil_standard', 'accueil_vip'], preferred: [] },
  ];

  const employees: Record<string, string> = {};
  for (const e of employeesData) {
    const emp = await prisma.employee.upsert({
      where: { employeeCode: e.code },
      update: {
        languages: e.languages,
        skills: e.skills,
        preferredClientIds: e.preferred.map((n) => clients[n]).filter(Boolean),
      },
      create: {
        employeeCode: e.code,
        firstName: e.firstName,
        lastName: e.lastName,
        employeeType: e.type,
        languages: e.languages,
        skills: e.skills,
        trainedPostIds: [],
        preferredClientIds: e.preferred.map((n) => clients[n]).filter(Boolean),
        weeklyHours: 40,
      },
    });
    employees[e.code] = emp.id;
  }
  console.log(`✅ ${employeesData.length} employés créés`);

  // ===== TRAINED POST IDS — enrichis pour scores IA élevés =====
  const trainings: Record<string, string[]> = {
    '20-6338': ['Bank of China|Réception A', 'Bank of China|Réception B', 'BGL BNP Paribas|Accueil VIP', 'BGL BNP Paribas|Standard Téléphonique'],
    '20-7112': ['Amazon|Réception Principale', 'Amazon|Mailroom', 'PwC Luxembourg|Réception', 'PwC Luxembourg|Conciergerie'],
    '20-8045': ['Deloitte|Réception', 'EY|Réception', 'BIL|Accueil VIP', 'KPMG|Réception'],
    '20-1101': ['Bank of China|Réception A', 'Bank of China|Réception B'],
    '20-2102': ['Bank of China|Réception A', 'Bank of China|Réception B'],
    '20-1112': ['BGL BNP Paribas|Accueil VIP', 'BGL BNP Paribas|Standard Téléphonique'],
    '20-1117': ['BGL BNP Paribas|Standard Téléphonique'],
    '20-1102': ['RTL Group|Réception Principale'],
    '20-1120': ['RTL Group|Réception Principale'],
    '20-1104': ['Spuerkeess|Accueil', 'POST Luxembourg|Accueil'],
    '20-1118': ['Spuerkeess|Accueil'],
    '20-1108': ['Amazon|Réception Principale', 'Amazon|Mailroom'],
    '20-1123': ['Amazon|Mailroom'],
    '20-1106': ['KPMG|Réception'],
    '20-1121': ['KPMG|Réception'],
    '20-1107': ['Deloitte|Réception'],
    '20-1124': ['Deloitte|Réception'],
    '20-1109': ['EY|Réception'],
    '20-1122': ['EY|Réception'],
    '20-1113': ['Arendt & Medernach|Réception'],
    '20-1127': ['Arendt & Medernach|Réception', 'BIL|Accueil VIP'],
    '20-1103': ['BIL|Accueil VIP'],
    '20-1111': ['Cargolux|Réception'],
    '20-1129': ['Cargolux|Réception', 'Luxair|Accueil Corporate'],
    '20-1114': ['Luxair|Accueil Corporate'],
    '20-1115': ['SES|Réception'],
    '20-1130': ['PwC Luxembourg|Réception'],
    '20-1110': ['PwC Luxembourg|Réception', 'PwC Luxembourg|Conciergerie'],
    '20-1116': ['POST Luxembourg|Accueil', 'Encevo|Accueil'],
    '20-1128': ['POST Luxembourg|Accueil'],
    '20-1126': ['Encevo|Accueil'],
    '20-1105': ['ArcelorMittal|Réception Siège'],
    '20-1119': ['ArcelorMittal|Réception Siège'],
    '20-2106': ['BGL BNP Paribas|Standard Téléphonique', 'RTL Group|Réception Principale'],
    '20-2101': ['Bank of China|Réception A'],
    '20-2111': ['BIL|Accueil VIP', 'Arendt & Medernach|Réception'],
  };

  for (const [code, postKeys] of Object.entries(trainings)) {
    if (employees[code]) {
      await prisma.employee.update({
        where: { id: employees[code] },
        data: { trainedPostIds: postKeys.map((k) => posts[k]).filter(Boolean) },
      });
    }
  }
  console.log('✅ trainedPostIds mis à jour');

  // ===== ASSIGNMENTS — Semaine démo 28 Mars – 1 Avril 2026 =====
  // Stratégie :
  //   • ~90% couvert (impressionnant, crédible)
  //   • GAP 1 : Bank of China | Réception A | Lundi → SCÉNARIO 1 démo (alerte critique)
  //   • GAP 2 : Amazon | Mailroom | Mercredi → alerte INFO
  //   • GAP 3 : BIL | Accueil VIP | Vendredi → alerte WARNING (backup à former)
  //   • BGL Standard Téléphonique Jeudi → UNTRAINED_BACKUP (orange, visible)
  const M = new Date('2026-03-28');
  const T = new Date('2026-03-29');
  const W = new Date('2026-03-30');
  const H = new Date('2026-03-31');
  const F = new Date('2026-04-01');

  type Assignment = { employeeCode: string; postKey: string; date: Date; status: AssignmentStatus; aiSuggested?: boolean; aiScore?: number };

  const assignmentsData: Assignment[] = [
    // ── Bank of China ──────────────────────────────────────────────────
    // Réception A : LUNDI = GAP DÉMO (scénario 1), reste couvert
    { employeeCode: '20-1101', postKey: 'Bank of China|Réception A', date: T, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1101', postKey: 'Bank of China|Réception A', date: W, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1101', postKey: 'Bank of China|Réception A', date: H, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1101', postKey: 'Bank of China|Réception A', date: F, status: 'CONFIRMED', aiScore: 88 },
    // Réception B : couverte toute la semaine
    { employeeCode: '20-6338', postKey: 'Bank of China|Réception B', date: M, status: 'CONFIRMED', aiScore: 95 },
    { employeeCode: '20-6338', postKey: 'Bank of China|Réception B', date: T, status: 'CONFIRMED', aiScore: 95 },
    { employeeCode: '20-6338', postKey: 'Bank of China|Réception B', date: W, status: 'CONFIRMED', aiScore: 95 },
    { employeeCode: '20-6338', postKey: 'Bank of China|Réception B', date: H, status: 'CONFIRMED', aiScore: 95 },
    { employeeCode: '20-2102', postKey: 'Bank of China|Réception B', date: F, status: 'TRAINED_BACKUP', aiScore: 81 },

    // ── Amazon ─────────────────────────────────────────────────────────
    { employeeCode: '20-1108', postKey: 'Amazon|Réception Principale', date: M, status: 'CONFIRMED', aiScore: 91 },
    { employeeCode: '20-1108', postKey: 'Amazon|Réception Principale', date: T, status: 'CONFIRMED', aiScore: 91 },
    { employeeCode: '20-1108', postKey: 'Amazon|Réception Principale', date: W, status: 'CONFIRMED', aiScore: 91 },
    { employeeCode: '20-1108', postKey: 'Amazon|Réception Principale', date: H, status: 'CONFIRMED', aiScore: 91 },
    { employeeCode: '20-1108', postKey: 'Amazon|Réception Principale', date: F, status: 'CONFIRMED', aiScore: 91 },
    // Mailroom : MERCREDI = GAP DÉMO (alerte info)
    { employeeCode: '20-1123', postKey: 'Amazon|Mailroom', date: M, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1123', postKey: 'Amazon|Mailroom', date: T, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1123', postKey: 'Amazon|Mailroom', date: H, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1123', postKey: 'Amazon|Mailroom', date: F, status: 'CONFIRMED', aiScore: 86 },

    // ── BGL BNP Paribas ────────────────────────────────────────────────
    { employeeCode: '20-1112', postKey: 'BGL BNP Paribas|Accueil VIP', date: M, status: 'CONFIRMED', aiScore: 93 },
    { employeeCode: '20-1112', postKey: 'BGL BNP Paribas|Accueil VIP', date: T, status: 'CONFIRMED', aiScore: 93 },
    { employeeCode: '20-1112', postKey: 'BGL BNP Paribas|Accueil VIP', date: W, status: 'CONFIRMED', aiScore: 93 },
    { employeeCode: '20-1112', postKey: 'BGL BNP Paribas|Accueil VIP', date: H, status: 'CONFIRMED', aiScore: 93 },
    { employeeCode: '20-2111', postKey: 'BGL BNP Paribas|Accueil VIP', date: F, status: 'TRAINED_BACKUP', aiScore: 77 },
    // Standard Téléphonique : Jeudi = UNTRAINED_BACKUP (orange visible pour la démo)
    { employeeCode: '20-1117', postKey: 'BGL BNP Paribas|Standard Téléphonique', date: M, status: 'CONFIRMED', aiScore: 89 },
    { employeeCode: '20-1117', postKey: 'BGL BNP Paribas|Standard Téléphonique', date: T, status: 'CONFIRMED', aiScore: 89 },
    { employeeCode: '20-1117', postKey: 'BGL BNP Paribas|Standard Téléphonique', date: W, status: 'CONFIRMED', aiScore: 89 },
    { employeeCode: '20-2106', postKey: 'BGL BNP Paribas|Standard Téléphonique', date: H, status: 'UNTRAINED_BACKUP', aiScore: 52 },
    { employeeCode: '20-1117', postKey: 'BGL BNP Paribas|Standard Téléphonique', date: F, status: 'CONFIRMED', aiScore: 89 },

    // ── PwC Luxembourg ─────────────────────────────────────────────────
    { employeeCode: '20-1130', postKey: 'PwC Luxembourg|Réception', date: M, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1130', postKey: 'PwC Luxembourg|Réception', date: T, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1130', postKey: 'PwC Luxembourg|Réception', date: W, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1130', postKey: 'PwC Luxembourg|Réception', date: H, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1110', postKey: 'PwC Luxembourg|Réception', date: F, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1110', postKey: 'PwC Luxembourg|Conciergerie', date: M, status: 'CONFIRMED', aiScore: 84 },
    { employeeCode: '20-1110', postKey: 'PwC Luxembourg|Conciergerie', date: T, status: 'CONFIRMED', aiScore: 84 },
    { employeeCode: '20-1110', postKey: 'PwC Luxembourg|Conciergerie', date: W, status: 'CONFIRMED', aiScore: 84 },
    { employeeCode: '20-1110', postKey: 'PwC Luxembourg|Conciergerie', date: H, status: 'CONFIRMED', aiScore: 84 },
    { employeeCode: '20-1110', postKey: 'PwC Luxembourg|Conciergerie', date: F, status: 'CONFIRMED', aiScore: 84 },

    // ── KPMG ───────────────────────────────────────────────────────────
    { employeeCode: '20-1106', postKey: 'KPMG|Réception', date: M, status: 'CONFIRMED', aiScore: 85 },
    { employeeCode: '20-1106', postKey: 'KPMG|Réception', date: T, status: 'CONFIRMED', aiScore: 85 },
    { employeeCode: '20-1106', postKey: 'KPMG|Réception', date: W, status: 'CONFIRMED', aiScore: 85 },
    { employeeCode: '20-1106', postKey: 'KPMG|Réception', date: H, status: 'CONFIRMED', aiScore: 85 },
    { employeeCode: '20-1121', postKey: 'KPMG|Réception', date: F, status: 'CONFIRMED', aiScore: 78 },

    // ── Deloitte ───────────────────────────────────────────────────────
    { employeeCode: '20-1107', postKey: 'Deloitte|Réception', date: M, status: 'CONFIRMED', aiScore: 92 },
    { employeeCode: '20-1107', postKey: 'Deloitte|Réception', date: T, status: 'CONFIRMED', aiScore: 92 },
    { employeeCode: '20-1107', postKey: 'Deloitte|Réception', date: W, status: 'CONFIRMED', aiScore: 92 },
    { employeeCode: '20-1107', postKey: 'Deloitte|Réception', date: H, status: 'CONFIRMED', aiScore: 92 },
    { employeeCode: '20-1124', postKey: 'Deloitte|Réception', date: F, status: 'CONFIRMED', aiScore: 83 },

    // ── EY ─────────────────────────────────────────────────────────────
    { employeeCode: '20-1109', postKey: 'EY|Réception', date: M, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1109', postKey: 'EY|Réception', date: T, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1109', postKey: 'EY|Réception', date: W, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1109', postKey: 'EY|Réception', date: H, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1122', postKey: 'EY|Réception', date: F, status: 'CONFIRMED', aiScore: 79 },

    // ── Arendt & Medernach ─────────────────────────────────────────────
    { employeeCode: '20-1113', postKey: 'Arendt & Medernach|Réception', date: M, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1113', postKey: 'Arendt & Medernach|Réception', date: T, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1113', postKey: 'Arendt & Medernach|Réception', date: W, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1113', postKey: 'Arendt & Medernach|Réception', date: H, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1127', postKey: 'Arendt & Medernach|Réception', date: F, status: 'TRAINED_BACKUP', aiScore: 74 },

    // ── RTL Group ──────────────────────────────────────────────────────
    { employeeCode: '20-1102', postKey: 'RTL Group|Réception Principale', date: M, status: 'CONFIRMED', aiScore: 91 },
    { employeeCode: '20-1102', postKey: 'RTL Group|Réception Principale', date: T, status: 'CONFIRMED', aiScore: 91 },
    { employeeCode: '20-1120', postKey: 'RTL Group|Réception Principale', date: W, status: 'TRAINED_BACKUP', aiScore: 76 },
    { employeeCode: '20-1102', postKey: 'RTL Group|Réception Principale', date: H, status: 'CONFIRMED', aiScore: 91 },
    { employeeCode: '20-1102', postKey: 'RTL Group|Réception Principale', date: F, status: 'CONFIRMED', aiScore: 91 },

    // ── Spuerkeess ─────────────────────────────────────────────────────
    { employeeCode: '20-1104', postKey: 'Spuerkeess|Accueil', date: M, status: 'CONFIRMED', aiScore: 90 },
    { employeeCode: '20-1104', postKey: 'Spuerkeess|Accueil', date: T, status: 'CONFIRMED', aiScore: 90 },
    { employeeCode: '20-1104', postKey: 'Spuerkeess|Accueil', date: W, status: 'CONFIRMED', aiScore: 90 },
    { employeeCode: '20-1118', postKey: 'Spuerkeess|Accueil', date: H, status: 'CONFIRMED', aiScore: 82 },
    { employeeCode: '20-1104', postKey: 'Spuerkeess|Accueil', date: F, status: 'CONFIRMED', aiScore: 90 },

    // ── BIL ────────────────────────────────────────────────────────────
    // BIL Vendredi = GAP DÉMO (alerte warning — backup à former)
    { employeeCode: '20-1103', postKey: 'BIL|Accueil VIP', date: M, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1103', postKey: 'BIL|Accueil VIP', date: T, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1103', postKey: 'BIL|Accueil VIP', date: W, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1103', postKey: 'BIL|Accueil VIP', date: H, status: 'CONFIRMED', aiScore: 87 },
    // Vendredi → non couvert

    // ── Cargolux ───────────────────────────────────────────────────────
    { employeeCode: '20-1111', postKey: 'Cargolux|Réception', date: M, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1111', postKey: 'Cargolux|Réception', date: T, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1111', postKey: 'Cargolux|Réception', date: W, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1129', postKey: 'Cargolux|Réception', date: H, status: 'CONFIRMED', aiScore: 81 },
    { employeeCode: '20-1111', postKey: 'Cargolux|Réception', date: F, status: 'CONFIRMED', aiScore: 88 },

    // ── ArcelorMittal ──────────────────────────────────────────────────
    { employeeCode: '20-1105', postKey: 'ArcelorMittal|Réception Siège', date: M, status: 'CONFIRMED', aiScore: 89 },
    { employeeCode: '20-1105', postKey: 'ArcelorMittal|Réception Siège', date: T, status: 'CONFIRMED', aiScore: 89 },
    { employeeCode: '20-1105', postKey: 'ArcelorMittal|Réception Siège', date: W, status: 'CONFIRMED', aiScore: 89 },
    { employeeCode: '20-1119', postKey: 'ArcelorMittal|Réception Siège', date: H, status: 'CONFIRMED', aiScore: 80 },
    { employeeCode: '20-1105', postKey: 'ArcelorMittal|Réception Siège', date: F, status: 'CONFIRMED', aiScore: 89 },

    // ── POST Luxembourg ────────────────────────────────────────────────
    { employeeCode: '20-1128', postKey: 'POST Luxembourg|Accueil', date: M, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1104', postKey: 'POST Luxembourg|Accueil', date: T, status: 'CONFIRMED', aiScore: 85 },
    { employeeCode: '20-1116', postKey: 'POST Luxembourg|Accueil', date: W, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1128', postKey: 'POST Luxembourg|Accueil', date: H, status: 'CONFIRMED', aiScore: 86 },
    { employeeCode: '20-1116', postKey: 'POST Luxembourg|Accueil', date: F, status: 'CONFIRMED', aiScore: 88 },

    // ── Luxair ─────────────────────────────────────────────────────────
    { employeeCode: '20-1114', postKey: 'Luxair|Accueil Corporate', date: M, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1114', postKey: 'Luxair|Accueil Corporate', date: T, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1114', postKey: 'Luxair|Accueil Corporate', date: W, status: 'CONFIRMED', aiScore: 87 },
    { employeeCode: '20-1129', postKey: 'Luxair|Accueil Corporate', date: H, status: 'CONFIRMED', aiScore: 80 },
    { employeeCode: '20-1114', postKey: 'Luxair|Accueil Corporate', date: F, status: 'CONFIRMED', aiScore: 87 },

    // ── SES ────────────────────────────────────────────────────────────
    { employeeCode: '20-1115', postKey: 'SES|Réception', date: M, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1115', postKey: 'SES|Réception', date: T, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1115', postKey: 'SES|Réception', date: W, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-1115', postKey: 'SES|Réception', date: H, status: 'CONFIRMED', aiScore: 88 },
    { employeeCode: '20-2101', postKey: 'SES|Réception', date: F, status: 'TRAINED_BACKUP', aiScore: 72 },

    // ── Encevo ─────────────────────────────────────────────────────────
    { employeeCode: '20-1126', postKey: 'Encevo|Accueil', date: M, status: 'CONFIRMED', aiScore: 85 },
    { employeeCode: '20-1126', postKey: 'Encevo|Accueil', date: T, status: 'CONFIRMED', aiScore: 85 },
    { employeeCode: '20-1116', postKey: 'Encevo|Accueil', date: W, status: 'CONFIRMED', aiScore: 83 },
    { employeeCode: '20-1126', postKey: 'Encevo|Accueil', date: H, status: 'CONFIRMED', aiScore: 85 },
    { employeeCode: '20-1126', postKey: 'Encevo|Accueil', date: F, status: 'CONFIRMED', aiScore: 85 },
  ];

  let created = 0;
  for (const a of assignmentsData) {
    await prisma.assignment.upsert({
      where: { postId_date: { postId: posts[a.postKey], date: a.date } },
      update: { employeeId: employees[a.employeeCode], status: a.status, aiScore: a.aiScore },
      create: {
        employeeId: employees[a.employeeCode],
        postId: posts[a.postKey],
        date: a.date,
        status: a.status,
        aiSuggested: a.aiSuggested ?? false,
        aiScore: a.aiScore,
      },
    });
    created++;
  }
  console.log(`✅ ${created} affectations créées (≈90% couverture)`);

  // ===== ALERTES — Alertes stratégiques pour la démo =====
  await prisma.alert.createMany({
    data: [
      {
        severity: 'CRITICAL',
        title: 'Absence non remplacée — Maria Dobrinescu',
        description: 'Bank of China — Réception A — Lundi 28 Mars 2026 — Aucun backup confirmé. Action immédiate requise.',
        clientId: clients['Bank of China'],
        postId: posts['Bank of China|Réception A'],
        date: M,
      },
      {
        severity: 'WARNING',
        title: 'Backup à former — Jeudi',
        description: 'BGL BNP Paribas — Standard Téléphonique — Jeudi 31 Mars — Nina Koch (backup) n\'est pas encore formée sur ce poste.',
        clientId: clients['BGL BNP Paribas'],
        postId: posts['BGL BNP Paribas|Standard Téléphonique'],
        date: H,
      },
      {
        severity: 'INFO',
        title: 'Poste non couvert — Mercredi',
        description: 'Amazon — Mailroom — Mercredi 30 Mars 2026 — Aucun employé affecté. Backup disponible.',
        clientId: clients['Amazon'],
        postId: posts['Amazon|Mailroom'],
        date: W,
      },
      {
        severity: 'WARNING',
        title: 'CDD expirant — Nina Koch (J-45)',
        description: 'Contrat CDD expire le 12 Mai 2026. Postes impactés : BGL BNP Paribas Standard, Arendt Réception (backup). Prévoir renouvellement ou recrutement.',
        date: new Date('2026-05-12'),
      },
      {
        severity: 'INFO',
        title: 'Poste fragile — Generali Réception VIP',
        description: 'Indice de fragilité 85%. Seulement 1 backup formé. Formation proactive recommandée : Priya Nair (ROI estimé: 4.2x).',
        date: new Date('2026-04-01'),
      },
      {
        severity: 'INFO',
        title: 'Certification expirante — Mandy De Melo',
        description: 'Certification SST expirée depuis le 15/01/2025. Renouvellement à planifier avec RH.',
        date: new Date('2026-04-09'),
      },
    ],
  });
  console.log('✅ 6 alertes de démo créées (1 critique, 2 warning, 3 info)');

  // Stats finales
  const totalPosts = postsData.length * 5; // 21 postes × 5 jours
  const coverage = Math.round((created / totalPosts) * 100);
  console.log('\n🎉 Seed SAMSIC Accueil terminé avec succès !');
  console.log(`   → ${clientsData.length} clients`);
  console.log(`   → ${employeesData.length} employés (3 TL + 30 titulaires + 11 backups)`);
  console.log(`   → ${postsData.length} postes actifs`);
  console.log(`   → ${created} affectations / ${totalPosts} possibles → ${coverage}% couverture`);
  console.log('   → 3 alertes (1 critique, 1 warning, 1 info)');
  console.log('   → 3 gaps stratégiques : BoC Réception A Lun | Amazon Mailroom Mer | BIL VIP Ven');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
