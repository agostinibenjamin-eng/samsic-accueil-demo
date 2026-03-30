/**
 * POST /api/ai/suggest — Moteur IA v2 DYNAMIQUE
 * 
 * Charge les données RÉELLES depuis Supabase (employés, postes, absences,
 * affectations de la semaine, historique client/poste).
 * 
 * Body: { postId: string, date: string, clientId?: string, clientName?: string, postName?: string }
 * Returns: { suggestions, eliminated, cascade?, processingMs, engineVersion }
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreEmployee, rankSuggestions, solveCascade } from '@/lib/ai/scoring-engine';
import type { EmployeeProfile, PostRequirements, ScoringContext } from '@/types/ai-engine';

// ─── Config métier par client (exigences langues/compétences/priorité) ────────
// Ces règles sont définies par le gestionnaire et appliquées au score.

const CLIENT_POST_CONFIG: Record<string, Partial<PostRequirements>> = {
  // Banques & Finance
  'bank-of-china': {
    clientPriority: 'VIP', zone: 'kirchberg', continuitySensitivity: 'HIGH',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'FLUENT', priority: 'CRITICAL' },
    ],
    requiredSkills: ['accueil_vip', 'standard_tel'],
  },
  'ing': {
    clientPriority: 'VIP', zone: 'kirchberg', continuitySensitivity: 'HIGH',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'INTERMEDIATE', priority: 'IMPORTANT' },
    ],
  },
  'bgl-bnp-paribas': {
    clientPriority: 'VIP', zone: 'kirchberg', continuitySensitivity: 'HIGH',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'de', minLevel: 'INTERMEDIATE', priority: 'IMPORTANT' },
    ],
  },
  // Assurances
  'generali': {
    clientPriority: 'VIP', zone: 'kirchberg', continuitySensitivity: 'HIGH',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'FLUENT', priority: 'IMPORTANT' },
    ],
    requiredSkills: ['accueil_vip'],
  },
  // Logistique
  'cargolux': {
    clientPriority: 'PREMIUM', zone: 'centre', continuitySensitivity: 'MEDIUM',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'INTERMEDIATE', priority: 'IMPORTANT' },
    ],
  },
  // Juridique
  'arendt': {
    clientPriority: 'PREMIUM', zone: 'kirchberg', continuitySensitivity: 'MEDIUM',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'FLUENT', priority: 'CRITICAL' },
    ],
  },
  // Audit
  'pwc': {
    clientPriority: 'VIP', zone: 'kirchberg', continuitySensitivity: 'HIGH',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'FLUENT', priority: 'CRITICAL' },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Slugifie un nom client en clientId pour matcher CLIENT_POST_CONFIG */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Calcule la date de début de semaine (lundi) pour une date donnée */
function getWeekStart(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diff);
  return monday;
}

/** Calcule le nombre d'heures assignées à un employé pour une semaine */
function calcWeeklyHours(
  assignments: Array<{ date: Date; post: { startTime: string; endTime: string } }>,
  weekStart: Date,
  weekEnd: Date
): number {
  return assignments
    .filter(a => a.date >= weekStart && a.date <= weekEnd)
    .reduce((sum, a) => {
      const [sh, sm] = a.post.startTime.split(':').map(Number);
      const [eh, em] = a.post.endTime.split(':').map(Number);
      return sum + Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
    }, 0);
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  try {
    const body = await req.json();
    const { postId, date: dateStr, clientId, clientName, postName } = body;

    if (!dateStr) {
      return NextResponse.json({ error: 'date requis (YYYY-MM-DD)' }, { status: 400 });
    }

    const targetDate = new Date(dateStr + 'T00:00:00Z');
    const weekStart = getWeekStart(dateStr);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

    // ── 1. Charger le poste réel depuis la DB ─────────────────────────────────
    let dbPost: {
      id: string; name: string; startTime: string; endTime: string;
      requiredLanguages: string[]; requiredSkills: string[];
      client: { id: string; name: string };
      criticalLanguage?: string | null;
    } | null = null;

    if (postId && !postId.includes('--')) {
      // postId est un vrai CUID Prisma
      dbPost = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true, name: true, startTime: true, endTime: true,
          requiredLanguages: true, requiredSkills: true, criticalLanguage: true,
          client: { select: { id: true, name: true } }
        }
      });
    }

    // Résoudre le clientId slug pour la config
    const resolvedClientName = dbPost?.client.name || clientName || 'Client';
    const clientSlug = slugify(resolvedClientName);
    const clientConfig = CLIENT_POST_CONFIG[clientSlug] || CLIENT_POST_CONFIG[clientId || ''] || {};

    // Construire les PostRequirements (DB + config métier)
    const post: PostRequirements = {
      id: dbPost?.id || postId || 'unknown',
      name: dbPost?.name || postName || 'Poste',
      clientId: dbPost?.client.id || clientId || clientSlug,
      clientName: resolvedClientName,
      startTime: dbPost?.startTime || '08:00',
      endTime: dbPost?.endTime || '17:00',
      requiredLanguages: [],
      requiredSkills: dbPost?.requiredSkills || [],
      clientPriority: 'STANDARD',
      zone: 'kirchberg',
      continuitySensitivity: 'MEDIUM',
      ...clientConfig,
      // Les langues DB écrasent la config uniquement si définies
      ...(dbPost?.requiredLanguages?.length 
        ? { requiredLanguages: dbPost.requiredLanguages.map(lang => ({
            code: lang as any,
            minLevel: (lang === dbPost?.criticalLanguage ? 'FLUENT' : 'INTERMEDIATE') as any,
            priority: (lang === dbPost?.criticalLanguage ? 'CRITICAL' : 'IMPORTANT') as any,
          }))}
        : {}
      ),
    };

    // ── 2. Charger tous les employés actifs avec leurs affectations ─────────
    const [dbEmployees, weekAssignments, absencesInPeriod, recentAssignments, postHistory] = await Promise.all([
      // Tous les employés actifs
      prisma.employee.findMany({
        where: { isActive: true },
        select: {
          id: true, employeeCode: true, firstName: true, lastName: true,
          employeeType: true, languages: true, skills: true,
          trainedPostIds: true, preferredClientIds: true,
          weeklyHours: true, isActive: true,
        }
      }),
      // Affectations de la semaine (pour calculer heures + shifts du jour)
      prisma.assignment.findMany({
        where: { date: { gte: weekStart, lte: weekEnd } },
        select: {
          id: true, employeeId: true, date: true, status: true,
          post: { select: { id: true, name: true, startTime: true, endTime: true, clientId: true } }
        }
      }),
      // Absences couvrant la date cible
      prisma.absence.findMany({
        where: {
          startDate: { lte: targetDate },
          endDate: { gte: targetDate },
        },
        select: { employeeId: true }
      }),
      // Historique récent (30 jours) pour contexte de continuité
      prisma.assignment.findMany({
        where: {
          date: {
            gte: new Date(targetDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            lte: targetDate,
          },
          post: { clientId: post.clientId }
        },
        select: { employeeId: true, postId: true, date: true }
      }),
      // Historique du poste spécifique (dernier agent affecté)
      post.id !== 'unknown' ? prisma.assignment.findMany({
        where: {
          postId: post.id,
          date: { lt: targetDate },
        },
        orderBy: { date: 'desc' },
        take: 10,
        select: { employeeId: true, date: true }
      }) : Promise.resolve([]),
    ]);

    // Index des absents
    const absentIds = new Set(absencesInPeriod.map(a => a.employeeId));

    // Index des shifts du jour par employé
    const dayShiftsByEmp = new Map<string, Array<{ postId: string; postName: string; startTime: string; endTime: string; date: string; clientId: string }>>();
    for (const asgn of weekAssignments) {
      const asgnDate = new Date(asgn.date).toISOString().split('T')[0];
      if (asgnDate === dateStr) {
        if (!dayShiftsByEmp.has(asgn.employeeId)) dayShiftsByEmp.set(asgn.employeeId, []);
        dayShiftsByEmp.get(asgn.employeeId)!.push({
          postId: asgn.post.id,
          postName: asgn.post.name,
          startTime: asgn.post.startTime,
          endTime: asgn.post.endTime,
          date: asgnDate,
          clientId: asgn.post.clientId,
        });
      }
    }

    // Historique client par employé
    const clientHistoryByEmp: Record<string, number> = {};
    for (const h of recentAssignments) {
      clientHistoryByEmp[h.employeeId] = (clientHistoryByEmp[h.employeeId] || 0) + 1;
    }

    // Historique poste par employé
    const postHistoryByEmp: Record<string, number> = {};
    for (const h of postHistory) {
      postHistoryByEmp[h.employeeId] = (postHistoryByEmp[h.employeeId] || 0) + 1;
    }

    // Dernier agent affecté sur ce poste (pour continuité de service)
    const lastAssignedEmployeeId = postHistory.length > 0 ? postHistory[0].employeeId : undefined;

    // Clients préférés depuis l'historique
    const clientPreferredEmployeeIds = recentAssignments
      .filter(h => postHistoryByEmp[h.employeeId] >= 3)
      .map(h => h.employeeId);

    // ── 3. Convertir les employés DB → EmployeeProfile pour le moteur ─────────
    const employees: EmployeeProfile[] = dbEmployees
      .filter(emp => !absentIds.has(emp.id))
      .map(emp => {
        const empWeeklyHours = calcWeeklyHours(
          weekAssignments.filter(a => a.employeeId === emp.id).map(a => ({
            date: a.date,
            post: { startTime: a.post.startTime, endTime: a.post.endTime }
          })),
          weekStart,
          weekEnd
        );

        const dayShifts = (dayShiftsByEmp.get(emp.id) || []).map(s => ({
          postId: s.postId,
          postName: s.postName,
          startTime: s.startTime,
          endTime: s.endTime,
          date: s.date,
          clientId: s.clientId,
        }));

        // Construire trainedPosts depuis trainedPostIds DB
        // Le format est: postId correspond à l'ID Prisma du post
        const trainedPosts = (emp.trainedPostIds || []).map(tPostId => ({
          postId: tPostId,
          clientId: post.clientId, // approximation — le moteur compare par postId
          status: 'TRAINED' as const,
          trainedAt: undefined,
          lastAssignedAt: undefined,
        }));

        return {
          id: emp.id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          employeeType: emp.employeeType as any,
          contractType: 'CDI' as const, // Pas stocké dans le schema actuel
          contractStartDate: undefined,
          contractEndDate: undefined,
          isActive: emp.isActive,

          // Langues : DB stocke ['fr', 'en', 'de']  → profil v2
          languages: (emp.languages || []).map(lang => ({
            code: lang as any,
            level: 'FLUENT' as any, // Niveau non stocké en DB → supposé FLUENT
          })),

          // Skills : DB stocke ['standard_tel', 'accueil_vip']
          skills: emp.skills || [],

          // Certifications : non stockées en DB phase proto
          certifications: [],

          trainedPosts,
          preferredClientIds: emp.preferredClientIds || [],
          acceptedZones: ['kirchberg', 'centre', 'belval'], // tous acceptables par défaut

          weeklyContractHours: emp.weeklyHours || 40,
          weeklyAssignedHours: Math.round(empWeeklyHours * 10) / 10,

          reliabilityScore: 85, // Valeur par défaut — pas en DB phase proto
          absenceRate: 0.05,

          assignedShifts: dayShifts,
          recentShifts: [], // Pas chargé ici pour perf — E4/E11 non applicables
        };
      });

    // ── 4. Contexte de scoring avec historique réel ───────────────────────────
    const clientHistory: Record<string, number> = {};
    for (const [empId, count] of Object.entries(clientHistoryByEmp)) {
      clientHistory[empId] = count;
    }

    const postHistoryCtx: Record<string, number> = {};
    for (const [empId, count] of Object.entries(postHistoryByEmp)) {
      postHistoryCtx[empId] = count;
    }

    const ctx: Omit<ScoringContext, 'employee'> = {
      post,
      date: dateStr,
      clientHistory,
      postHistory: postHistoryCtx,
      lastAssignedEmployeeId,
      clientPreferredEmployeeIds,
    };

    // ── 5. Scorer via le moteur v2 ────────────────────────────────────────────
    const result = rankSuggestions(employees, ctx);

    // Cascade si aucun candidat direct
    let cascade = undefined;
    if (result.suggestions.length === 0) {
      const cascadeResult = solveCascade(post, dateStr, employees, ctx);
      if (cascadeResult.isComplete) cascade = cascadeResult;
    }

    const processingMs = Date.now() - startMs;

    return NextResponse.json({
      postId: post.id,
      date: dateStr,
      engineVersion: 'v2.1-dynamic',
      suggestions: result.suggestions.slice(0, 5).map(s => ({
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        employeeCode: employees.find(e => e.id === s.employeeId)?.employeeCode || '',
        firstName: employees.find(e => e.id === s.employeeId)?.firstName || '',
        lastName: employees.find(e => e.id === s.employeeId)?.lastName || '',
        employeeType: employees.find(e => e.id === s.employeeId)?.employeeType || '',
        totalScore: s.totalScore,
        isEligible: s.isEligible,
        confidence: s.confidence,
        reasoning: s.reasoning,
        criteria: s.criteria,
      })),
      eliminated: result.eliminated.slice(0, 10).map(s => ({
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        totalScore: 0,
        isEligible: false,
        eliminationReasons: s.eliminationReasons,
      })),
      cascade: cascade ? {
        moves: cascade.moves,
        depth: cascade.depth,
        totalScore: cascade.totalScore,
        isComplete: cascade.isComplete,
      } : null,
      totalEmployeesScored: employees.length,
      totalEligible: result.suggestions.length,
      totalEliminated: result.eliminated.length,
      processingMs,
    });

  } catch (error) {
    console.error('[API /ai/suggest] Error:', error);
    return NextResponse.json({ error: 'Erreur moteur IA', detail: String(error) }, { status: 500 });
  }
}
