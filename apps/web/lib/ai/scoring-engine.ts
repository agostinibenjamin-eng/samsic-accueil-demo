/**
 * scoring-engine.ts — Moteur IA v2
 * 16 critères (11 éliminatoires + 5 pondérés + 1 bonus)
 * Cascade Solver récursif (profondeur max 2)
 * Gestion turnover : CDD expiré, employé inactif/démissionnaire
 */

import type {
  ScoreBreakdown,
  ScoringContext,
  EmployeeProfile,
  PostRequirements,
  SuggestionResult,
  CascadeResult,
  CascadeMove,
  Shift,
  LanguageLevel,
  LanguageRequirement,
} from '../../../../packages/shared/src/types/ai-engine';

// ─── Constantes ──────────────────────────────────────────────────────────────

const LANGUAGE_LEVEL_ORDER: Record<LanguageLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  FLUENT: 3,
  NATIVE: 4,
};

const CASCADE_DEPTH_PENALTY = 5; // -5 pts par niveau de profondeur
const MAX_DAILY_HOURS = 10;
const MAX_WEEKLY_HOURS = 48;
const LEGAL_REST_HOURS = 11;
const MAX_CONSECUTIVE_DAYS = 6;
const COMPETENCE_EXPIRY_MONTHS = 6;

// ─── Helpers temporels ───────────────────────────────────────────────────────

/** Convertit "HH:MM" en minutes depuis minuit */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Durée d'un shift en heures */
function shiftDurationHours(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return Math.max(0, (end - start) / 60);
}

/** Vérifie si deux créneaux horaires se chevauchent */
export function hasTimeConflict(
  s1Start: string, s1End: string,
  s2Start: string, s2End: string
): boolean {
  const a1 = timeToMinutes(s1Start);
  const a2 = timeToMinutes(s1End);
  const b1 = timeToMinutes(s2Start);
  const b2 = timeToMinutes(s2End);
  // Chevauchement : A commence avant la fin de B ET B commence avant la fin de A
  return a1 < b2 && b1 < a2;
}

/** Vérifie le repos légal de 11h entre le dernier shift (veille) et le nouveau */
export function checkLegalRest11h(
  previousDayShifts: Shift[],
  requestedStartTime: string,
): boolean {
  if (previousDayShifts.length === 0) return true;
  // Trouver le shift qui finit le plus tard la veille
  const latestEnd = Math.max(
    ...previousDayShifts.map(s => timeToMinutes(s.endTime))
  );
  // Repos = (24h - latestEnd) + requestedStart en minutes  
  const restMinutes = (24 * 60 - latestEnd) + timeToMinutes(requestedStartTime);
  return restMinutes >= LEGAL_REST_HOURS * 60;
}

/** Nombre de jours consécutifs travaillés (jusqu'à la date demandée exclue) */
function consecutiveWorkDays(recentShifts: Shift[], targetDate: string): number {
  const target = new Date(targetDate);
  let count = 0;
  for (let i = 1; i <= MAX_CONSECUTIVE_DAYS + 1; i++) {
    const checkDate = new Date(target);
    checkDate.setDate(target.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasWork = recentShifts.some(s => s.date === dateStr);
    if (hasWork) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/** Calcul de l'ancienneté en années */
function yearsOfService(contractStartDate?: string): number {
  if (!contractStartDate) return 0;
  const start = new Date(contractStartDate);
  const now = new Date();
  return Math.max(0, (now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

// ─── SCORING ENGINE v2 ──────────────────────────────────────────────────────

export function scoreEmployee(ctx: ScoringContext): ScoreBreakdown {
  const { employee, post, date } = ctx;

  const eliminationReasons: string[] = [];
  const reasoning: string[] = [];
  const warnings: string[] = [];
  const criteria = makeDefaultCriteria();

  // ═══════════════════════════════════════════════════════════════════════════
  // CRITÈRES ÉLIMINATOIRES (si un seul échoue → exclu)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- E12 : Validité du contrat / Employé actif ---
  if (!employee.isActive) {
    eliminationReasons.push(`Employé inactif (${employee.departureReason || 'désactivé'})`);
    criteria.e12_contractValidity = false;
  }
  if (employee.contractEndDate && employee.contractEndDate < date) {
    eliminationReasons.push(`Contrat ${employee.contractType} expiré le ${employee.contractEndDate}`);
    criteria.e12_contractValidity = false;
  } else if (employee.contractEndDate && post.continuitySensitivity === 'HIGH') {
    // Avertissement si le contrat se termine dans moins de 30 jours
    const endDate = new Date(employee.contractEndDate);
    const shiftDate = new Date(date);
    const daysUntilEnd = (endDate.getTime() - shiftDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilEnd >= 0 && daysUntilEnd <= 30) {
      warnings.push(`⚠️ Fin de CDD sous ${Math.ceil(daysUntilEnd)}j (Poste à haute continuité)`);
    }
  }
  if (employee.departureDate && employee.departureDate <= date) {
    eliminationReasons.push(`Départ effectif le ${employee.departureDate} (${employee.departureReason || 'départ'})`);
    criteria.e12_contractValidity = false;
  }

  // --- E1 : Langues (avec niveaux) ---
  if (post.requiredLanguages && post.requiredLanguages.length > 0) {
    for (const req of post.requiredLanguages) {
      const empLang = employee.languages.find(l => l.code === req.code);
      if (!empLang) {
        if (req.priority === 'CRITICAL' || req.priority === 'IMPORTANT') {
          eliminationReasons.push(`Langue ${req.code.toUpperCase()} manquante (exigée: ${req.minLevel})`);
          criteria.e1_languages = false;
        }
      } else if (LANGUAGE_LEVEL_ORDER[empLang.level] < LANGUAGE_LEVEL_ORDER[req.minLevel]) {
        if (req.priority === 'CRITICAL') {
          eliminationReasons.push(`${req.code.toUpperCase()} niveau ${empLang.level} insuffisant (minimum: ${req.minLevel})`);
          criteria.e1_languages = false;
        }
      }
    }
  }

  // --- E2 : Compétences obligatoires ---
  if (post.requiredSkills && post.requiredSkills.length > 0) {
    const missing = post.requiredSkills.filter(s => !employee.skills.includes(s));
    if (missing.length > 0) {
      eliminationReasons.push(`Compétences manquantes: ${missing.join(', ')}`);
      criteria.e2_skills = false;
    }
  }

  // --- E3 : Disponibilité horaire (conflit de shift) ---
  const sameDayShifts = (employee.assignedShifts || []).filter(s => s.date === date);
  for (const existing of sameDayShifts) {
    if (hasTimeConflict(existing.startTime, existing.endTime, post.startTime, post.endTime)) {
      eliminationReasons.push(
        `Conflit horaire: déjà affecté ${existing.startTime}→${existing.endTime} ` +
        `(${existing.postName || existing.postId}), créneau demandé ${post.startTime}→${post.endTime}`
      );
      criteria.e3_availability = false;
      break;
    }
  }

  // Vérifier aussi les absences classiques
  // (les absenceDates sont gérées via assignedShifts avec un flag ou via un champ séparé)

  // --- E4 : Repos légal 11h ---
  if (employee.recentShifts) {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    const prevDayShifts = employee.recentShifts.filter(s => s.date === prevDateStr);
    if (!checkLegalRest11h(prevDayShifts, post.startTime)) {
      eliminationReasons.push(
        `Repos légal 11h non respecté (dernier shift veille finit trop tard pour débuter à ${post.startTime})`
      );
      criteria.e4_legalRest11h = false;
    }
  }

  // --- E5 : Maximum 10h/jour ---
  const dailyHoursAlready = sameDayShifts.reduce(
    (sum, s) => sum + shiftDurationHours(s.startTime, s.endTime), 0
  );
  const newShiftDuration = shiftDurationHours(post.startTime, post.endTime);
  if (dailyHoursAlready + newShiftDuration > MAX_DAILY_HOURS) {
    eliminationReasons.push(
      `Dépassement 10h/jour: déjà ${dailyHoursAlready.toFixed(1)}h + ${newShiftDuration.toFixed(1)}h demandées = ${(dailyHoursAlready + newShiftDuration).toFixed(1)}h`
    );
    criteria.e5_maxDailyHours = false;
  }

  // --- E6 : Maximum 48h/semaine ---
  if (employee.weeklyAssignedHours + newShiftDuration > MAX_WEEKLY_HOURS) {
    eliminationReasons.push(
      `Dépassement 48h/semaine: ${employee.weeklyAssignedHours}h assignées + ${newShiftDuration.toFixed(1)}h = ${(employee.weeklyAssignedHours + newShiftDuration).toFixed(1)}h`
    );
    criteria.e6_maxWeeklyHours = false;
  }

  // --- E7 : Blacklist client-employé ---
  if (employee.clientBlacklist && employee.clientBlacklist.includes(post.clientId)) {
    eliminationReasons.push(`Blacklisté par le client ${post.clientName || post.clientId}`);
    criteria.e7_clientBlacklist = false;
  }

  // --- E8 : Certifications valides ---
  if (post.requiredCertifications && post.requiredCertifications.length > 0) {
    for (const certName of post.requiredCertifications) {
      const cert = employee.certifications.find(c => c.name === certName);
      if (!cert) {
        eliminationReasons.push(`Certification ${certName} manquante`);
        criteria.e8_certifications = false;
      } else if (!cert.isValid) {
        eliminationReasons.push(`Certification ${certName} expirée`);
        criteria.e8_certifications = false;
      } else if (cert.expiresAt && cert.expiresAt < date) {
        eliminationReasons.push(`Certification ${certName} expire le ${cert.expiresAt}`);
        criteria.e8_certifications = false;
      }
    }
  }

  // --- E9 : Habilitation sécurité ---
  if (post.requiredClearanceLevel && post.requiredClearanceLevel > 0) {
    const empClearance = employee.securityClearanceLevel || 0;
    if (empClearance < post.requiredClearanceLevel) {
      eliminationReasons.push(
        `Habilitation sécurité insuffisante: niveau ${empClearance}, requis ${post.requiredClearanceLevel}`
      );
      criteria.e9_securityClearance = false;
    }
  }

  // --- E10 : Zone géographique ---
  if (post.zone && employee.acceptedZones.length > 0) {
    if (!employee.acceptedZones.includes(post.zone)) {
      eliminationReasons.push(
        `Zone géographique "${post.zone}" hors périmètre accepté (${employee.acceptedZones.join(', ')})`
      );
      criteria.e10_geographicZone = false;
    }
  }

  // --- E11 : 6 jours consécutifs max ---
  if (employee.recentShifts) {
    const consecutive = consecutiveWorkDays(employee.recentShifts, date);
    if (consecutive >= MAX_CONSECUTIVE_DAYS) {
      eliminationReasons.push(
        `${consecutive} jours consécutifs travaillés, repos hebdomadaire obligatoire`
      );
      criteria.e11_consecutiveDays = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Si au moins un critère éliminatoire échoue → exclu
  // ═══════════════════════════════════════════════════════════════════════════

  if (eliminationReasons.length > 0) {
    return {
      employeeId: employee.id,
      employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || undefined,
      totalScore: 0,
      isEligible: false,
      eliminationReasons,
      reasoning: eliminationReasons,
      warnings,
      criteria,
      confidence: 1,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRITÈRES PONDÉRÉS (contribuent au score final)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- P1 : Formation au poste (0-30 pts) ---
  const postTraining = employee.trainedPosts.find(t => t.postId === post.id);
  let p1 = 0;
  if (postTraining) {
    if (postTraining.status === 'TRAINED') {
      // Vérifier si la compétence est "fraîche" (< 6 mois)
      if (postTraining.lastAssignedAt) {
        const lastDate = new Date(postTraining.lastAssignedAt);
        const now = new Date();
        const monthsAgo = (now.getTime() - lastDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
        p1 = monthsAgo <= COMPETENCE_EXPIRY_MONTHS ? 30 : 20; // Pénalité si pas de refresh récent
        reasoning.push(
          monthsAgo <= COMPETENCE_EXPIRY_MONTHS
            ? `Formé au poste (dernière affectation: il y a ${Math.round(monthsAgo)} mois) → 30 pts`
            : `Formé au poste mais compétence à rafraîchir (${Math.round(monthsAgo)} mois) → 20 pts`
        );
      } else {
        p1 = 30;
        reasoning.push('Formé au poste → 30 pts');
      }
    } else if (postTraining.status === 'IN_PROGRESS') {
      p1 = 10;
      reasoning.push('Formation en cours sur ce poste → 10 pts');
    } else if (postTraining.status === 'NEEDS_REFRESH') {
      p1 = 15;
      reasoning.push('Formé mais nécessite un refresh → 15 pts');
    }
  } else {
    reasoning.push('Non formé au poste → 0 pts');
    warnings.push(`⚠️ Risque Client : Agent nécessite une formation d'intégration`);
  }
  criteria.p1_training = p1;

  // --- P2 : Affinité client (0-20 pts) ---
  let p2 = 0;
  if (ctx.clientAffinityScore !== undefined) {
    // Mapper [-10, +10] vers [0, 20]
    p2 = Math.round(Math.max(0, Math.min(20, (ctx.clientAffinityScore + 10))));
    reasoning.push(`Affinité client: ${ctx.clientAffinityScore > 0 ? '+' : ''}${ctx.clientAffinityScore} → ${p2} pts`);
  } else {
    // Fallback sur l'historique
    const clientAffectations = ctx.clientHistory[post.clientId] || 0;
    p2 = Math.min(20, Math.floor(clientAffectations / 4) * 4);
    reasoning.push(
      clientAffectations > 0
        ? `${clientAffectations} affectations passées chez ce client → ${p2} pts`
        : 'Aucun historique chez ce client → 0 pts'
    );
  }
  criteria.p2_clientAffinity = p2;

  // --- P3 : Continuité de service (0-15 pts) ---
  let p3 = 0;
  if (ctx.lastAssignedEmployeeId === employee.id) {
    p3 = post.continuitySensitivity === 'HIGH' ? 15 
       : post.continuitySensitivity === 'MEDIUM' ? 10 
       : 5;
    reasoning.push(`Continuité de service (même agent que précédemment) → ${p3} pts`);
  } else {
    // Vérifier si l'employé a été récemment sur ce poste via postHistory
    const postAffectations = ctx.postHistory[post.id] || 0;
    if (postAffectations > 0) {
      p3 = Math.min(8, postAffectations * 2);
      reasoning.push(`${postAffectations} affectations passées sur ce poste → ${p3} pts`);
    } else {
      reasoning.push('Jamais affecté à ce poste → 0 pts');
    }
  }
  criteria.p3_serviceContinuity = p3;

  // --- P4 : Équilibre de charge (0-30 pts) ---
  // Objectif 100% Utilisation (Idle Time Optimizer très agressif)
  const gap = Math.max(0, employee.weeklyContractHours - employee.weeklyAssignedHours);
  const gapRatio = employee.weeklyContractHours > 0
    ? gap / employee.weeklyContractHours
    : 0;
  // Amplifier massivement pour forcer le remplissage
  let p4 = Math.round(Math.min(30, gapRatio * 30 * 1.5)); 
  criteria.p4_workloadBalance = p4;
  reasoning.push(
    gap > 0
      ? `⭐ ${gap}h libres sur ${employee.weeklyContractHours}h contractuelles → +${p4} pts (Priorité Utilisation 100%)`
      : `Charge complète (${employee.weeklyAssignedHours}/${employee.weeklyContractHours}h) → ${p4} pts`
  );

  // --- P5 : Fiabilité (0-10 pts) ---
  let p5 = Math.round((employee.reliabilityScore / 100) * 10);
  criteria.p5_reliability = p5;
  reasoning.push(`Fiabilité ${employee.reliabilityScore}% → ${p5} pts`);

  // --- P6 : Ancienneté (0-10 pts) ---
  const years = yearsOfService(employee.contractStartDate);
  const p6 = Math.min(10, Math.round(years));
  criteria.p6_seniority = p6;
  reasoning.push(
    years > 0
      ? `${years.toFixed(1)} ans d'ancienneté → ${p6} pts`
      : 'Nouvel employé → 0 pts'
  );

  // --- P7 : Préférence nominative client (BONUS +20) ---
  let p7 = 0;
  if (ctx.clientPreferredEmployeeIds && ctx.clientPreferredEmployeeIds.includes(employee.id)) {
    p7 = 20;
    reasoning.push('⭐ Préférence nominative du client → +20 pts BONUS');
  }
  criteria.p7_clientPreference = p7;

  // ═══════════════════════════════════════════════════════════════════════════
  // PONDÉRATIONS STRATÉGIQUES (Multiplicateurs)
  // ═══════════════════════════════════════════════════════════════════════════

  if (ctx.strategy === 'OPTIMIZE_COSTS') {
    p4 = p4 * 2.0;    // Sur-priorité à l'utilisation du temps libre (idle time)
    p1 = p1 * 1.5;    // Priorité à la formation
    p2 = p2 * 0.5;    // Baisse de l'affinité
    p3 = p3 * 0.5;    // Baisse de la continuité
  } else if (ctx.strategy === 'MAXIMIZE_SATISFACTION') {
    p2 = p2 * 2.0;    // Affinité x2
    p3 = p3 * 2.0;    // Continuité x2
    p4 = p4 * 0.5;    // Baisse de la priorité sur le coût/idle time
    p5 = p5 * 1.5;    // Fiabilité de l'agent valorisée
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCORE TOTAL & NORMALISATION BUSINESS
  // ═══════════════════════════════════════════════════════════════════════════

  const rawScore = p1 + p2 + p3 + p4 + p5 + p6 + p7;
  
  // Normalisation : L'échelle réelle (brute) se situe souvent entre 10 et 50.
  // Pour la compréhension métier, un candidat qui passe tous les filtres éliminatoires
  // est forcément un "bon choix" (score > 80%). On normalise donc sur 100%.
  let normalizedScore = 0;
  if (rawScore <= 0) {
    normalizedScore = 80;
  } else if (rawScore < 10) {
    normalizedScore = 80 + rawScore; // 80 à 89%
  } else {
    // 10 à 60 pts bruts deviennent 90 à 99% (croissance linéaire plafonnée)
    normalizedScore = 90 + ((Math.min(rawScore, 60) - 10) / 50) * 9;
  }
  
  const totalScore = Math.round(normalizedScore);
  const confidence = calculateConfidence(
    ctx.clientHistory[post.clientId] || 0,
    ctx.postHistory[post.id] || 0,
    ctx.clientAffinityScore
  );

  return {
    employeeId: employee.id,
    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || undefined,
    totalScore,
    isEligible: true,
    eliminationReasons: [],
    reasoning,
    warnings,
    criteria,
    confidence,
  };
}

// ─── Helpers internes ────────────────────────────────────────────────────────

function makeDefaultCriteria(): ScoreBreakdown['criteria'] {
  return {
    e1_languages: true,
    e2_skills: true,
    e3_availability: true,
    e4_legalRest11h: true,
    e5_maxDailyHours: true,
    e6_maxWeeklyHours: true,
    e7_clientBlacklist: true,
    e8_certifications: true,
    e9_securityClearance: true,
    e10_geographicZone: true,
    e11_consecutiveDays: true,
    e12_contractValidity: true,
    p1_training: 0,
    p2_clientAffinity: 0,
    p3_serviceContinuity: 0,
    p4_workloadBalance: 0,
    p5_reliability: 0,
    p6_seniority: 0,
    p7_clientPreference: 0,
  };
}

function calculateConfidence(
  clientAffectations: number,
  postAffectations: number,
  affinityScore?: number
): number {
  let base = Math.min(1, (clientAffectations + postAffectations) / 20);
  if (affinityScore !== undefined) {
    base = Math.min(1, base + 0.2); // Plus de confiance si on a des données d'affinité
  }
  return Math.round(base * 100) / 100;
}

// ─── RANK SUGGESTIONS ────────────────────────────────────────────────────────

export function rankSuggestions(
  employees: EmployeeProfile[],
  ctx: Omit<ScoringContext, 'employee'>
): SuggestionResult {
  const startMs = Date.now();

  // Filtrer les employés inactifs et contrats expirés en amont
  const activeEmployees = employees.filter(emp => {
    if (!emp.isActive) return false;
    if (emp.contractEndDate && emp.contractEndDate < ctx.date) return false;
    if (emp.departureDate && emp.departureDate <= ctx.date) return false;
    return true;
  });

  const results = activeEmployees.map(emp => scoreEmployee({ ...ctx, employee: emp }));

  const eligible = results
    .filter(s => s.isEligible)
    .sort((a, b) => b.totalScore - a.totalScore);

  const eliminated = results.filter(s => !s.isEligible);

  return {
    post: ctx.post,
    date: ctx.date,
    suggestions: eligible,
    eliminated,
    hasCascade: false,
    cascadeDepth: 0,
    processingTimeMs: Date.now() - startMs,
  };
}

// ─── CASCADE SOLVER ──────────────────────────────────────────────────────────

/**
 * Résout une cascade de réaffectation.
 * 
 * Exemple :
 * Poste VIP vacant → Meilleur candidat: Employé X (titulaire Poste Standard)
 *   ↳ Poste Standard vacant → Meilleur candidat: Employé Y (backup formé)
 *     ↳ Résultat : 2 mouvements, 0 poste non couvert
 * 
 * Règles :
 * - Jamais déplacer d'un poste VIP vers un poste STANDARD (uniquement upgrade)
 * - Pénalité -5pts par niveau de profondeur
 * - Transaction atomique : tout ou rien
 * - Profondeur max : 2 (V1)
 */
export function solveCascade(
  vacantPost: PostRequirements,
  date: string,
  allEmployees: EmployeeProfile[],
  ctx: Omit<ScoringContext, 'employee' | 'post'>,
  maxDepth: number = 2,
  excludeEmployeeIds: string[] = [],
  currentDepth: number = 0,
): CascadeResult {

  // Filtrer les employés déjà dans la chaîne + inactifs
  const available = allEmployees.filter(e => 
    !excludeEmployeeIds.includes(e.id) && 
    e.isActive &&
    !(e.contractEndDate && e.contractEndDate < date) &&
    !(e.departureDate && e.departureDate <= date)
  );

  // Score all candidates IGNORING E3 (availability/shift conflict)
  // so that occupied-but-qualified employees can be considered for cascade
  const scored = available.map(emp => {
    // Temporarily remove assigned shifts for scoring (we check conflicts manually below)
    const virtualEmp: EmployeeProfile = { ...emp, assignedShifts: [] };
    const score = scoreEmployee({ ...ctx, post: vacantPost, date, employee: virtualEmp });
    return { emp, score };
  });

  // Sort eligible candidates by score (descending)
  const eligibleScored = scored
    .filter(s => s.score.isEligible)
    .sort((a, b) => b.score.totalScore - a.score.totalScore);

  for (const { emp, score } of eligibleScored) {
    const hasConflict = (emp.assignedShifts || []).some(
      s => s.date === date && hasTimeConflict(s.startTime, s.endTime, vacantPost.startTime, vacantPost.endTime)
    );

    if (!hasConflict) {
      // Solution directe — pas de cascade
      return {
        moves: [{
          employeeId: emp.id,
          employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          fromPostId: null,
          toPostId: vacantPost.id,
          toPostName: vacantPost.name,
          date,
          score: score.totalScore,
        }],
        depth: 0,
        totalScore: score.totalScore,
        uncoveredPosts: [],
        isComplete: true,
      };
    }

    // The employee IS qualified but occupied — attempt cascade
    if (currentDepth < maxDepth) {
      const conflictingShift = (emp.assignedShifts || []).find(
        s => s.date === date && hasTimeConflict(s.startTime, s.endTime, vacantPost.startTime, vacantPost.endTime)
      );

      if (conflictingShift) {
        // Rule: never pull from a VIP post to fill a STANDARD post
        const vacantPostPriority = getPriorityValue(vacantPost.clientPriority);
        // The conflicting post is assumed STANDARD unless we know better
        const conflictPostPriority = 1; // STANDARD by default in proto

        if (vacantPostPriority <= conflictPostPriority) {
          continue; // Don't downgrade service
        }

        // Build a PostRequirements for the liberated post
        const liberatedPost: PostRequirements = {
          id: conflictingShift.postId,
          name: conflictingShift.postName || conflictingShift.postId,
          clientId: conflictingShift.clientId || '',
          startTime: conflictingShift.startTime,
          endTime: conflictingShift.endTime,
          requiredLanguages: [],
          requiredSkills: [],
          clientPriority: 'STANDARD',
          zone: '',
          continuitySensitivity: 'LOW',
        };

        // Recursively solve
        const subResult = solveCascade(
          liberatedPost,
          date,
          allEmployees,
          ctx,
          maxDepth,
          [...excludeEmployeeIds, emp.id],
          currentDepth + 1,
        );

        if (subResult.isComplete) {
          const adjustedScore = score.totalScore - (CASCADE_DEPTH_PENALTY * (currentDepth + 1));
          return {
            moves: [
              {
                employeeId: emp.id,
                employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                fromPostId: conflictingShift.postId,
                fromPostName: conflictingShift.postName,
                toPostId: vacantPost.id,
                toPostName: vacantPost.name,
                date,
                score: adjustedScore,
              },
              ...subResult.moves,
            ],
            depth: subResult.depth + 1,
            totalScore: adjustedScore + subResult.totalScore,
            uncoveredPosts: [],
            isComplete: true,
          };
        }
      }
    }
  }

  // No solution found
  return {
    moves: [],
    depth: currentDepth,
    totalScore: 0,
    uncoveredPosts: [vacantPost.id],
    isComplete: false,
  };
}

function getPriorityValue(priority: string): number {
  switch (priority) {
    case 'VIP': return 3;
    case 'PREMIUM': return 2;
    default: return 1;
  }
}

function getPriorityLevel(_clientId: string, _employees: EmployeeProfile[]): number {
  // Dans le proto, on retourne STANDARD par défaut
  // En V1, on ira chercher la priorité du client en BDD
  return 1;
}
