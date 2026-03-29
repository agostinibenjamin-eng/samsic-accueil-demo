import { expect, test, describe } from 'vitest';
import { scoreEmployee, rankSuggestions, hasTimeConflict, checkLegalRest11h, solveCascade } from '../scoring-engine';
import { calculatePostFragility, getTrainingSuggestions, getTurnoverAlerts, getIdleTimeReport } from '../idle-optimizer';
import type { EmployeeProfile, PostRequirements, ScoringContext, Shift } from '../../../../../packages/shared/src/types/ai-engine';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const basePost: PostRequirements = {
  id: 'p1',
  name: 'Réception A',
  clientId: 'c1',
  clientName: 'Bank of China',
  startTime: '08:00',
  endTime: '17:00',
  requiredLanguages: [],
  requiredSkills: [],
  clientPriority: 'VIP',
  zone: 'kirchberg',
  continuitySensitivity: 'HIGH',
};

const baseEmployee: EmployeeProfile = {
  id: 'e1',
  employeeCode: '20-100',
  firstName: 'Marie',
  lastName: 'Dupont',
  employeeType: 'TITULAR',
  contractType: 'CDI',
  contractStartDate: '2020-01-01',
  isActive: true,
  languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'FLUENT' }],
  skills: ['accueil_standard', 'standard_tel'],
  certifications: [],
  trainedPosts: [],
  preferredClientIds: [],
  acceptedZones: ['kirchberg', 'centre', 'clausen'],
  hasVehicle: false,
  weeklyContractHours: 35,
  weeklyAssignedHours: 28,
  reliabilityScore: 92,
  absenceRate: 2.0,
  assignedShifts: [],
  recentShifts: [],
};

const baseContext: Omit<ScoringContext, 'employee'> = {
  post: basePost,
  date: '2026-03-30',
  clientHistory: {},
  postHistory: {},
};

function makeCtx(overrides?: Partial<ScoringContext>): ScoringContext {
  return { ...baseContext, employee: baseEmployee, ...overrides } as ScoringContext;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS TEMPORELS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Helpers temporels', () => {
  test('hasTimeConflict — chevauchement partiel', () => {
    expect(hasTimeConflict('08:00', '12:00', '10:00', '17:00')).toBe(true);
  });

  test('hasTimeConflict — pas de chevauchement (séquentiel)', () => {
    expect(hasTimeConflict('08:00', '12:00', '12:00', '17:00')).toBe(false);
  });

  test('hasTimeConflict — contenu dans l\'autre', () => {
    expect(hasTimeConflict('08:00', '18:00', '10:00', '14:00')).toBe(true);
  });

  test('hasTimeConflict — shifts identiques', () => {
    expect(hasTimeConflict('09:00', '17:00', '09:00', '17:00')).toBe(true);
  });

  test('checkLegalRest11h — repos suffisant', () => {
    const shifts: Shift[] = [{ postId: 'p1', date: '2026-03-29', startTime: '08:00', endTime: '16:00' }];
    expect(checkLegalRest11h(shifts, '08:00')).toBe(true); // 16h de repos
  });

  test('checkLegalRest11h — repos insuffisant', () => {
    const shifts: Shift[] = [{ postId: 'p1', date: '2026-03-29', startTime: '14:00', endTime: '22:00' }];
    expect(checkLegalRest11h(shifts, '07:00')).toBe(false); // 9h de repos (< 11h)
  });

  test('checkLegalRest11h — repos exact 11h', () => {
    const shifts: Shift[] = [{ postId: 'p1', date: '2026-03-29', startTime: '08:00', endTime: '20:00' }];
    expect(checkLegalRest11h(shifts, '07:00')).toBe(true); // 11h exactement
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CRITÈRES ÉLIMINATOIRES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Critères Éliminatoires', () => {

  // E1 — Langues
  test('E1 — élimine si langue CRITICAL manquante', () => {
    const post: PostRequirements = {
      ...basePost,
      requiredLanguages: [{ code: 'de', minLevel: 'FLUENT', priority: 'CRITICAL' }],
    };
    const result = scoreEmployee({ ...makeCtx(), post });
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e1_languages).toBe(false);
    expect(result.eliminationReasons[0]).toContain('DE');
  });

  test('E1 — élimine si niveau langue insuffisant', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      languages: [{ code: 'fr', level: 'NATIVE' }, { code: 'en', level: 'BEGINNER' }],
    };
    const post: PostRequirements = {
      ...basePost,
      requiredLanguages: [{ code: 'en', minLevel: 'FLUENT', priority: 'CRITICAL' }],
    };
    const result = scoreEmployee({ ...makeCtx({ employee: emp }), post });
    expect(result.isEligible).toBe(false);
    expect(result.eliminationReasons.some(r => r.includes('BEGINNER'))).toBe(true);
  });

  test('E1 — accepte si niveau OK', () => {
    const post: PostRequirements = {
      ...basePost,
      requiredLanguages: [{ code: 'en', minLevel: 'FLUENT', priority: 'CRITICAL' }],
    };
    const result = scoreEmployee({ ...makeCtx(), post });
    expect(result.isEligible).toBe(true);
    expect(result.criteria.e1_languages).toBe(true);
  });

  // E2 — Compétences
  test('E2 — élimine si compétence manquante', () => {
    const post: PostRequirements = {
      ...basePost,
      requiredSkills: ['accueil_vip', 'protocole_diplomatique'],
    };
    const result = scoreEmployee({ ...makeCtx(), post });
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e2_skills).toBe(false);
  });

  // E3 — Conflit horaire
  test('E3 — élimine si conflit de shift horaire', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      assignedShifts: [{ postId: 'p2', date: '2026-03-30', startTime: '09:00', endTime: '14:00' }],
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e3_availability).toBe(false);
    expect(result.eliminationReasons[0]).toContain('Conflit horaire');
  });

  test('E3 — accepte si shifts séquentiels (matin/après-midi)', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      assignedShifts: [{ postId: 'p2', date: '2026-03-30', startTime: '06:00', endTime: '08:00' }],
    };
    const post: PostRequirements = { ...basePost, startTime: '08:00', endTime: '12:00' };
    const result = scoreEmployee({ ...makeCtx({ employee: emp }), post });
    expect(result.criteria.e3_availability).toBe(true);
  });

  // E5 — Max 10h/jour
  test('E5 — élimine si dépassement 10h/jour', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      assignedShifts: [{ postId: 'p2', date: '2026-03-30', startTime: '06:00', endTime: '08:00' }],
    };
    // Existing 2h + new 9h (08:00→17:00) = 11h > 10h
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e5_maxDailyHours).toBe(false);
  });

  // E6 — Max 48h/semaine
  test('E6 — élimine si dépassement 48h/semaine', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      weeklyAssignedHours: 45, // 45 + 9h (shift) = 54h > 48h
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e6_maxWeeklyHours).toBe(false);
  });

  // E7 — Blacklist client
  test('E7 — élimine si blacklisté par le client', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      clientBlacklist: ['c1'],
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e7_clientBlacklist).toBe(false);
    expect(result.eliminationReasons[0]).toContain('Blacklisté');
  });

  // E8 — Certifications
  test('E8 — élimine si certification expirée', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      certifications: [{ name: 'SST', expiresAt: '2025-12-01', isValid: false }],
    };
    const post: PostRequirements = {
      ...basePost,
      requiredCertifications: ['SST'],
    };
    const result = scoreEmployee({ ...makeCtx({ employee: emp }), post });
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e8_certifications).toBe(false);
  });

  // E9 — Habilitation sécurité
  test('E9 — élimine si habilitation insuffisante', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      securityClearanceLevel: 1,
    };
    const post: PostRequirements = {
      ...basePost,
      requiredClearanceLevel: 3,
    };
    const result = scoreEmployee({ ...makeCtx({ employee: emp }), post });
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e9_securityClearance).toBe(false);
  });

  // E10 — Zone géographique
  test('E10 — élimine si zone non acceptée', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      acceptedZones: ['leudelange', 'strassen'],
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e10_geographicZone).toBe(false);
  });

  // E11 — 6 jours consécutifs
  test('E11 — élimine si 6 jours consécutifs', () => {
    const recentShifts: Shift[] = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date('2026-03-30');
      d.setDate(d.getDate() - i);
      recentShifts.push({
        postId: 'px', date: d.toISOString().split('T')[0],
        startTime: '08:00', endTime: '17:00',
      });
    }
    const emp: EmployeeProfile = { ...baseEmployee, recentShifts };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e11_consecutiveDays).toBe(false);
  });

  // E12 — Validité contrat / Employé actif
  test('E12 — élimine un employé inactif', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      isActive: false,
      departureReason: 'RESIGNATION',
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
    expect(result.criteria.e12_contractValidity).toBe(false);
    expect(result.eliminationReasons[0]).toContain('inactif');
  });

  test('E12 — élimine un CDD expiré', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      contractType: 'CDD',
      contractEndDate: '2026-03-01', // Expiré avant le 30/03
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
    expect(result.eliminationReasons.some(r => r.includes('CDD expiré'))).toBe(true);
  });

  test('E12 — élimine un employé avec départ effectif passé', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      departureDate: '2026-03-28',
      departureReason: 'RESIGNATION',
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(false);
  });

  test('E12 — accepte un CDD encore valide', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      contractType: 'CDD',
      contractEndDate: '2026-12-31', // Valide
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CRITÈRES PONDÉRÉS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Critères Pondérés', () => {

  test('P1 — 30 pts si formé au poste (TRAINED)', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      trainedPosts: [{ postId: 'p1', clientId: 'c1', status: 'TRAINED', trainedAt: '2024-01-01' }],
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.isEligible).toBe(true);
    expect(result.criteria.p1_training).toBe(30);
  });

  test('P1 — 10 pts si formation en cours (IN_PROGRESS)', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      trainedPosts: [{ postId: 'p1', clientId: 'c1', status: 'IN_PROGRESS' }],
    };
    const result = scoreEmployee(makeCtx({ employee: emp }));
    expect(result.criteria.p1_training).toBe(10);
  });

  test('P1 — 0 pts si non formé', () => {
    const result = scoreEmployee(makeCtx());
    expect(result.criteria.p1_training).toBe(0);
  });

  test('P3 — bonus continuité si même agent', () => {
    const result = scoreEmployee(makeCtx({ lastAssignedEmployeeId: 'e1' }));
    expect(result.criteria.p3_serviceContinuity).toBe(15);
  });

  test('P4 — favorise l\'agent sous-utilisé', () => {
    const empFull: EmployeeProfile = { ...baseEmployee, weeklyAssignedHours: 35, weeklyContractHours: 35 };
    const empGap: EmployeeProfile = { ...baseEmployee, id: 'e2', weeklyAssignedHours: 20, weeklyContractHours: 35 };

    const resultFull = scoreEmployee(makeCtx({ employee: empFull }));
    const resultGap = scoreEmployee(makeCtx({ employee: empGap }));

    expect(resultGap.criteria.p4_workloadBalance).toBeGreaterThan(resultFull.criteria.p4_workloadBalance);
  });

  test('P5 — fiabilité proportionnelle', () => {
    const empReliable: EmployeeProfile = { ...baseEmployee, reliabilityScore: 98 };
    const empUnreliable: EmployeeProfile = { ...baseEmployee, id: 'e2', reliabilityScore: 60 };

    const r1 = scoreEmployee(makeCtx({ employee: empReliable }));
    const r2 = scoreEmployee(makeCtx({ employee: empUnreliable }));

    expect(r1.criteria.p5_reliability).toBeGreaterThan(r2.criteria.p5_reliability);
  });

  test('P6 — ancienneté (senior > junior)', () => {
    const empSenior: EmployeeProfile = { ...baseEmployee, contractStartDate: '2018-01-01' };
    const empJunior: EmployeeProfile = { ...baseEmployee, id: 'e2', contractStartDate: '2025-01-01' };

    const r1 = scoreEmployee(makeCtx({ employee: empSenior }));
    const r2 = scoreEmployee(makeCtx({ employee: empJunior }));

    expect(r1.criteria.p6_seniority).toBeGreaterThan(r2.criteria.p6_seniority);
  });

  test('P7 — bonus préférence nominative client', () => {
    const result = scoreEmployee(makeCtx({ clientPreferredEmployeeIds: ['e1'] }));
    expect(result.criteria.p7_clientPreference).toBe(20);
    expect(result.reasoning.some(r => r.includes('Préférence nominative'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RANK SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('rankSuggestions', () => {
  test('filtre les employés inactifs', () => {
    const e1 = { ...baseEmployee, id: 'e1', isActive: true };
    const e2 = { ...baseEmployee, id: 'e2', isActive: false };
    const result = rankSuggestions([e1, e2], baseContext);
    expect(result.suggestions.length).toBe(1);
    expect(result.suggestions[0].employeeId).toBe('e1');
  });

  test('filtre les CDD expirés', () => {
    const e1 = { ...baseEmployee, id: 'e1', contractType: 'CDI' as const };
    const e2 = { ...baseEmployee, id: 'e2', contractType: 'CDD' as const, contractEndDate: '2026-01-01' };
    const result = rankSuggestions([e1, e2], baseContext);
    expect(result.suggestions.length).toBe(1);
  });

  test('trie par score décroissant', () => {
    const e1: EmployeeProfile = {
      ...baseEmployee, id: 'e1',
      trainedPosts: [{ postId: 'p1', clientId: 'c1', status: 'TRAINED', trainedAt: '2024-01-01' }],
    };
    const e2: EmployeeProfile = { ...baseEmployee, id: 'e2' };
    const result = rankSuggestions([e1, e2], baseContext);
    expect(result.suggestions[0].employeeId).toBe('e1');
    expect(result.suggestions[0].totalScore).toBeGreaterThan(result.suggestions[1].totalScore);
  });

  test('sépare éligibles et éliminés', () => {
    const e1 = { ...baseEmployee, id: 'good' };
    const e2: EmployeeProfile = { ...baseEmployee, id: 'bad', clientBlacklist: ['c1'] };
    const result = rankSuggestions([e1, e2], baseContext);
    expect(result.suggestions.length).toBe(1);
    expect(result.eliminated.length).toBe(1);
    expect(result.eliminated[0].employeeId).toBe('bad');
  });

  test('performance < 200ms pour 44 employés', () => {
    const employees = Array.from({ length: 44 }).map((_, i) => ({
      ...baseEmployee,
      id: `emp-${i}`,
      trainedPosts: i % 2 === 0 ? [{ postId: 'p1', clientId: 'c1', status: 'TRAINED' as const }] : [],
    }));
    const result = rankSuggestions(employees, baseContext);
    expect(result.processingTimeMs).toBeLessThan(200);
    expect(result.suggestions.length + result.eliminated.length).toBe(44);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CASCADE SOLVER
// ═══════════════════════════════════════════════════════════════════════════════

describe('Cascade Solver', () => {
  test('solution directe (profondeur 0)', () => {
    const emp: EmployeeProfile = { ...baseEmployee, id: 'free-agent', assignedShifts: [] };
    const result = solveCascade(basePost, '2026-03-30', [emp], baseContext);
    expect(result.isComplete).toBe(true);
    expect(result.depth).toBe(0);
    expect(result.moves.length).toBe(1);
    expect(result.moves[0].employeeId).toBe('free-agent');
    expect(result.moves[0].fromPostId).toBeNull();
  });

  test('cascade profondeur 1', () => {
    // Agent-A est formé au poste VIP mais occupé sur p2 (standard)
    const empA: EmployeeProfile = {
      ...baseEmployee,
      id: 'agent-A',
      trainedPosts: [{ postId: 'p1', clientId: 'c1', status: 'TRAINED' }],
      assignedShifts: [{
        postId: 'p2', clientId: 'c2', date: '2026-03-30',
        startTime: '08:00', endTime: '17:00',
      }],
    };
    // Agent-B est libre MAIS ne parle pas la langue exigée par le poste VIP
    // → inéligible pour le VIP, mais peut prendre le poste standard de A
    const empB: EmployeeProfile = {
      ...baseEmployee,
      id: 'agent-B',
      languages: [{ code: 'fr', level: 'NATIVE' }], // Pas d'anglais
      assignedShifts: [],
    };

    // Le poste VIP exige l'anglais FLUENT → seul agent-A est qualifié
    const vipPost: PostRequirements = {
      ...basePost,
      clientPriority: 'VIP',
      requiredLanguages: [{ code: 'en', minLevel: 'FLUENT', priority: 'CRITICAL' }],
    };
    const result = solveCascade(vipPost, '2026-03-30', [empA, empB], baseContext);

    expect(result.isComplete).toBe(true);
    expect(result.depth).toBeGreaterThanOrEqual(1);
    expect(result.moves.length).toBe(2);
    // Agent-A déplacé vers le VIP, Agent-B prend le poste standard
    expect(result.moves[0].employeeId).toBe('agent-A');
    expect(result.moves[0].toPostId).toBe('p1');
    expect(result.moves[1].employeeId).toBe('agent-B');
  });

  test('échoue si profondeur max atteinte', () => {
    // Tous les agents sont occupied et aucun backup libre
    const empA: EmployeeProfile = {
      ...baseEmployee,
      id: 'busy-A',
      assignedShifts: [{ postId: 'px', date: '2026-03-30', startTime: '08:00', endTime: '17:00' }],
    };
    const result = solveCascade(basePost, '2026-03-30', [empA], baseContext, 0);
    expect(result.isComplete).toBe(false);
    expect(result.uncoveredPosts).toContain('p1');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// IDLE TIME OPTIMIZER
// ═══════════════════════════════════════════════════════════════════════════════

describe('Idle Time Optimizer', () => {

  test('calculatePostFragility — poste sans backup = CRITICAL', () => {
    const posts: PostRequirements[] = [basePost];
    const employees: EmployeeProfile[] = [baseEmployee]; // Non formé sur p1
    const result = calculatePostFragility(posts, employees);
    expect(result[0].fragilityIndex).toBe(1);
    expect(result[0].riskLevel).toBe('CRITICAL');
  });

  test('calculatePostFragility — poste avec 2 backups = MEDIUM', () => {
    const posts: PostRequirements[] = [basePost];
    const employees: EmployeeProfile[] = [
      { ...baseEmployee, id: 'a', trainedPosts: [{ postId: 'p1', clientId: 'c1', status: 'TRAINED' }] },
      { ...baseEmployee, id: 'b', trainedPosts: [{ postId: 'p1', clientId: 'c1', status: 'TRAINED' }] },
    ];
    const result = calculatePostFragility(posts, employees);
    expect(result[0].trainedBackupCount).toBe(2);
    expect(result[0].fragilityIndex).toBeCloseTo(0.333, 2);
    expect(result[0].riskLevel).toBe('MEDIUM');
  });

  test('getTrainingSuggestions — propose formation pour agent sous-utilisé', () => {
    const underutilized: EmployeeProfile = {
      ...baseEmployee,
      id: 'idle',
      weeklyAssignedHours: 20,
      weeklyContractHours: 35,
      trainedPosts: [],
    };
    const posts: PostRequirements[] = [basePost];
    const result = getTrainingSuggestions([underutilized], posts);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].employeeId).toBe('idle');
    expect(result[0].availableHours).toBe(15);
  });

  test('getIdleTimeReport — calcule le coût des heures perdues', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      weeklyAssignedHours: 28,
      weeklyContractHours: 35,
    };
    const report = getIdleTimeReport([emp], [basePost]);
    expect(report.totalIdleHours).toBe(7);
    expect(report.totalIdleCost).toBe(7 * 16); // 112€
    expect(report.underutilizedAgents.length).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TURNOVER ALERTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Turnover Alerts', () => {

  test('détecte un CDD expirant dans 14 jours', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      contractType: 'CDD',
      contractEndDate: '2026-04-13', // 14 jours après notre date
      trainedPosts: [{ postId: 'p1', clientId: 'c1', status: 'TRAINED' }],
    };
    const alerts = getTurnoverAlerts([emp], [basePost], '2026-03-30');
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('CDD_EXPIRING');
    expect(alerts[0].severity).toBe('CRITICAL');
    expect(alerts[0].daysRemaining).toBe(14);
  });

  test('détecte une certification qui expire', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      certifications: [{ name: 'SST', expiresAt: '2026-04-20', isValid: true }],
    };
    const post: PostRequirements = { ...basePost, requiredCertifications: ['SST'] };
    const alerts = getTurnoverAlerts([emp], [post], '2026-03-30');
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('CERT_EXPIRING');
    expect(alerts[0].recommendation).toContain('SST');
  });

  test('détecte un départ planifié', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      departureDate: '2026-04-30',
      departureReason: 'RESIGNATION',
      trainedPosts: [{ postId: 'p1', clientId: 'c1', status: 'TRAINED' }],
    };
    const alerts = getTurnoverAlerts([emp], [basePost], '2026-03-30');
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('RESIGNATION');
    expect(alerts[0].impactedPosts).toContain('p1');
  });

  test('ignore les employés inactifs', () => {
    const emp: EmployeeProfile = {
      ...baseEmployee,
      isActive: false,
      contractType: 'CDD',
      contractEndDate: '2026-04-05',
    };
    const alerts = getTurnoverAlerts([emp], [basePost], '2026-03-30');
    expect(alerts.length).toBe(0);
  });
});
