/**
 * POST /api/ai/suggest
 * Moteur IA v2 — 16 critères SAMSIC (12 éliminatoires + 7 pondérés)
 * 
 * Utilise les données statiques du prototype via l'adaptateur.
 * En V1, les données viendront de PostgreSQL via Prisma/Drizzle.
 * 
 * Body: { postId: string, date: string, clientId: string, clientName?: string, postName?: string }
 * Returns: { suggestions, eliminated, cascade?, processingMs, engineVersion }
 */
import { NextRequest, NextResponse } from 'next/server';
import { EMPLOYEES_DATA } from '@/lib/data/employees-data';
import { toEmployeeProfile, normalizePostId, buildPostRequirements } from '@/lib/ai/data-adapter';
import { scoreEmployee, rankSuggestions, solveCascade } from '@/lib/ai/scoring-engine';
import type { EmployeeProfile, PostRequirements, ScoringContext } from '@/types/ai-engine';
import { prisma } from '@/lib/prisma';

// ─── Client post overrides (données métier pour le proto) ────────────────────

const CLIENT_POST_CONFIG: Record<string, Partial<PostRequirements>> = {
  'bank-of-china': {
    clientPriority: 'VIP',
    zone: 'kirchberg',
    continuitySensitivity: 'HIGH',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'FLUENT', priority: 'CRITICAL' },
    ],
    requiredSkills: ['accueil_vip', 'standard_tel'],
  },
  'generali': {
    clientPriority: 'VIP',
    zone: 'kirchberg',
    continuitySensitivity: 'HIGH',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'FLUENT', priority: 'IMPORTANT' },
    ],
    requiredSkills: ['accueil_vip'],
  },
  'chambre-commerce': {
    clientPriority: 'PREMIUM',
    zone: 'kirchberg',
    continuitySensitivity: 'MEDIUM',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'INTERMEDIATE', priority: 'IMPORTANT' },
    ],
  },
  'pwc': {
    clientPriority: 'VIP',
    zone: 'kirchberg',
    continuitySensitivity: 'HIGH',
    requiredLanguages: [
      { code: 'fr', minLevel: 'FLUENT', priority: 'CRITICAL' },
      { code: 'en', minLevel: 'FLUENT', priority: 'CRITICAL' },
    ],
  },
  'cargolux': {
    clientPriority: 'PREMIUM',
    zone: 'centre',
    continuitySensitivity: 'MEDIUM',
  },
  'house-of-startups': {
    clientPriority: 'STANDARD',
    zone: 'centre',
    continuitySensitivity: 'LOW',
  },
};

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const body = await req.json();
    const { postId, date: dateStr, clientId, clientName, postName } = body;

    if (!dateStr) {
      return NextResponse.json({ error: 'date requis (YYYY-MM-DD)' }, { status: 400 });
    }

    // Construire le PostRequirements
    const resolvedClientId = clientId || (postId?.split('--')?.[0]) || 'unknown';
    const resolvedPostName = postName || postId?.split('--')?.[1]?.replace(/-/g, ' ') || 'Poste';
    const clientConfig = CLIENT_POST_CONFIG[resolvedClientId] || {};

    const post = buildPostRequirements(
      resolvedClientId,
      clientName || resolvedClientId,
      resolvedPostName,
      {
        ...clientConfig,
        ...(postId ? { id: postId } : {}),
      }
    );

    // Convertir les employés statiques en EmployeeProfile v2
    const employees: EmployeeProfile[] = EMPLOYEES_DATA.map(emp =>
      toEmployeeProfile(emp)
    );

    // Contexte de scoring (sans employee — il sera ajouté par rankSuggestions)
    const ctx: Omit<ScoringContext, 'employee'> = {
      post,
      date: dateStr,
      clientHistory: buildClientHistory(resolvedClientId),
      postHistory: buildPostHistory(post.id),
    };

    // Fetch real absences from DB
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));
    const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));
    
    const dbAbsences = await prisma.absence.findMany({
      where: {
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      select: { employeeId: true },
    });
    const absentEmployeeIds = new Set(dbAbsences.map((a: { employeeId: string }) => a.employeeId));

    // Scorer via le moteur v2
    const result = rankSuggestions(employees, ctx);

    // Filter out absent employees from the suggestions
    result.suggestions = result.suggestions.filter(s => !absentEmployeeIds.has(s.employeeId));

    // Si aucun candidat éligible, tenter la cascade
    let cascade = undefined;
    if (result.suggestions.length === 0) {
      const cascadeCtx = {
        date: dateStr,
        clientHistory: ctx.clientHistory,
        postHistory: ctx.postHistory,
        strategy: ctx.strategy,
        lastAssignedEmployeeId: ctx.lastAssignedEmployeeId,
        clientPreferredEmployeeIds: ctx.clientPreferredEmployeeIds,
        clientAffinityScore: ctx.clientAffinityScore,
      };
      const cascadeResult = solveCascade(post, dateStr, employees, cascadeCtx);
      if (cascadeResult.isComplete) {
        cascade = cascadeResult;
      }
    }

    const processingMs = Date.now() - start;

    // Formater la réponse pour l'UI
    return NextResponse.json({
      postId: post.id,
      date: dateStr,
      engineVersion: 'v2.0',
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
    return NextResponse.json({ error: 'Erreur serveur moteur IA' }, { status: 500 });
  }
}

// ─── Helpers pour construire l'historique (données simulées pour le proto) ────

function buildClientHistory(clientId: string): Record<string, number> {
  // Simuler des affectations passées basées sur les trainedPosts des employés
  const history: Record<string, number> = {};
  for (const emp of EMPLOYEES_DATA) {
    const trainedForClient = emp.trainedPosts.filter(t => t.clientId === clientId && t.status === 'TRAINED');
    if (trainedForClient.length > 0) {
      // Simuler un historique basé sur l'ancienneté : plus l'agent est ancien, plus il a d'historique
      const startYear = new Date(emp.contractStartDate).getFullYear();
      const yearsActive = new Date().getFullYear() - startYear;
      history[clientId] = (history[clientId] || 0) + Math.max(1, yearsActive * 2);
    }
  }
  return history;
}

function buildPostHistory(postId: string): Record<string, number> {
  const history: Record<string, number> = {};
  for (const emp of EMPLOYEES_DATA) {
    const trained = emp.trainedPosts.find(t => {
      const tPostId = normalizePostId(t.clientId, t.postName);
      return tPostId === postId && t.status === 'TRAINED';
    });
    if (trained) {
      history[postId] = (history[postId] || 0) + 1;
    }
  }
  return history;
}
