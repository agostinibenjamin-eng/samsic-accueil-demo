import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rankSuggestions } from '@/lib/ai/scoring-engine';
import type { EmployeeProfile, ScoringContext, LangueCode, PostRequirements } from '../../../../../../packages/shared/src/types/ai-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, endDate, mode } = body;
    // mode could be 'FILL_GAPS' or 'OVERRIDE_ALL'

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate et endDate requis (YYYY-MM-DD)' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 1. Fetch active posts
    const activePosts = await prisma.post.findMany({
      where: { isActive: true },
      include: { client: { select: { id: true, name: true, industry: true } } },
    });

    // 2. Fetch existing assignments
    const existingAssignments = await prisma.assignment.findMany({
      where: { date: { gte: start, lte: end } },
      include: { employee: true },
    });

    // 2b. Fetch REAL employees from DB
    const dbEmployees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        assignments: {
          where: { date: { gte: start, lte: end } }
        },
        absences: {
          where: {
            OR: [
              { startDate: { lte: end }, endDate: { gte: start } }
            ]
          }
        }
      }
    });

    const baseEmployees: EmployeeProfile[] = dbEmployees.map(emp => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      employeeType: emp.employeeType as any,
      contractType: 'CDI',
      isActive: emp.isActive,
      languages: emp.languages.map(l => ({ code: l as LangueCode, level: 'FLUENT' })),
      skills: emp.skills,
      certifications: [],
      trainedPosts: emp.trainedPostIds.map(pid => ({ postId: pid, status: 'TRAINED', clientId: '' })),
      acceptedZones: [],
      preferredClientIds: [],
      absenceRate: 0,
      hasVehicle: true,
      weeklyContractHours: emp.weeklyHours || 40,
      weeklyAssignedHours: 0,
      reliabilityScore: 90,
      assignedShifts: emp.assignments.map(a => ({
        postId: a.postId,
        date: a.date.toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '17:00'
      })),
      recentShifts: [],
      absences: emp.absences.map(abs => ({
        startDate: abs.startDate.toISOString().split('T')[0],
        endDate: abs.endDate.toISOString().split('T')[0]
      }))
    }));

    // Map existing for quick lookup
    const assignmentMap = new Map();
    for (const a of existingAssignments) {
      const key = `${a.postId}|${a.date.toISOString().split('T')[0]}`;
      assignmentMap.set(key, a);
    }

    const strategies: import('../../../../../../packages/shared/src/types/ai-engine').OptimizationStrategy[] = ['OPTIMIZE_COSTS', 'BALANCED', 'MAXIMIZE_SATISFACTION'];
    const scenarios = [];

    for (const strategy of strategies) {
      // Re-clone employees for a clean state each run
      const employees: EmployeeProfile[] = baseEmployees.map(emp => JSON.parse(JSON.stringify(emp)));
      
      const postLastAssigned = new Map<string, string>();
      const proposals = [];
      const unfilledGaps: { date: string; postName: string; clientName: string; reason: string }[] = [];
      let totalScore = 0;
      let gapsFilled = 0;
      let conflictsResolved = 0;
      let warningsCount = 0;

      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];

        for (const post of activePosts) {
          const key = `${post.id}|${dateStr}`;
          const existing = assignmentMap.get(key);

          if (mode === 'FILL_GAPS' && existing && existing.status !== 'UNCOVERED') continue;

          const reqPost: PostRequirements = {
            id: post.id,
            name: post.name,
            clientId: post.client.id,
            clientName: post.client.name,
            startTime: post.startTime,
            endTime: post.endTime,
            requiredLanguages: post.requiredLanguages.map((l: string) => ({ 
              code: l as LangueCode, 
              minLevel: 'INTERMEDIATE', 
              priority: l === post.criticalLanguage ? 'CRITICAL' : 'IMPORTANT' 
            })),
            requiredSkills: post.requiredSkills,
            clientPriority: 'STANDARD',
            zone: 'kirchberg',
            continuitySensitivity: 'MEDIUM',
          };

          const ctx: Omit<ScoringContext, 'employee'> = {
            post: reqPost,
            date: dateStr,
            strategy, // Injection de la stratégie ici
            clientHistory: {},
            postHistory: {},
            lastAssignedEmployeeId: postLastAssigned.get(post.id),
          };

          const result = rankSuggestions(employees, ctx);

          if (result.suggestions.length > 0) {
            const best = result.suggestions[0];
            postLastAssigned.set(post.id, best.employeeId);
            
            if (existing && existing.status !== 'UNCOVERED') {
              conflictsResolved++;
            } else {
              gapsFilled++;
            }
            
            totalScore += best.totalScore;
            warningsCount += best.warnings?.length || 0;
            
            proposals.push({
              postId: post.id,
              postName: post.name,
              clientId: post.client.id,
              clientName: post.client.name,
              date: dateStr,
              employeeId: best.employeeId,
              employeeName: best.employeeName,
              aiScore: best.totalScore,
              status: 'SIMULATION',
              isOverride: !!(existing && existing.status !== 'UNCOVERED'),
              warnings: best.warnings || [],
            });
            
            const emp = employees.find(e => e.id === best.employeeId);
            if (emp) {
              emp.assignedShifts.push({
                postId: post.id,
                date: dateStr,
                startTime: post.startTime,
                endTime: post.endTime,
              });
              const [sh, sm] = post.startTime.split(':').map(Number);
              const [eh, em] = post.endTime.split(':').map(Number);
              emp.weeklyAssignedHours += Math.max(0, (eh + em/60) - (sh + sm/60));
            }
          } else {
             // Aucun candidat qualifié
             unfilledGaps.push({
               date: dateStr,
               postName: post.name,
               clientName: post.client.name,
               reason: `Compétences requises : [${reqPost.requiredSkills.join(', ')}], Langues : [${reqPost.requiredLanguages.map(l => l.code).join(', ')}] ne sont possédées ensemble par aucun candidat disponible.`
             });
          }
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      const averageScore = proposals.length > 0 ? Math.round(totalScore / proposals.length) : 0;
      
      let title = '';
      let desc = '';
      let savings = 0;
      
      if (strategy === 'OPTIMIZE_COSTS') {
         title = 'Optimisation Financière';
         desc = 'Minimise le temps libre (Idle Time) pour remplir les contrats.';
         savings = proposals.length * 22; // Facteur purement démo
      } else if (strategy === 'MAXIMIZE_SATISFACTION') {
         title = 'Satisfaction Client';
         desc = 'Priorise les agents habitués et les clients VIP.';
         savings = proposals.length * 6; // Facteur purement démo
      } else {
         title = 'Scénario Équilibré';
         desc = 'Excellent compromis entre qualité de service et rentabilité.';
         savings = proposals.length * 15;
      }

      scenarios.push({
        strategy,
        title,
        description: desc,
        report: {
          totalProposals: proposals.length,
          gapsFilled,
          conflictsResolved,
          averageScore,
          estimatedSavings: savings,
          warningsCount,
          unfilledGaps,
        },
        proposals
      });
    }

    return NextResponse.json({
      success: true,
      scenarios
    });
  } catch (error) {
    console.error('[API /ai/auto-schedule] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
