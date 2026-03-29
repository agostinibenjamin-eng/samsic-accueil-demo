/**
 * GET /api/planning?weekStart=2026-03-28 — Grille semaine complète
 * POST /api/planning — Créer / Mettre à jour une affectation
 * DELETE /api/planning — Supprimer une affectation
 * 
 * @nextjs-best-practices + @samsic-data-model + @samsic-planning-grid
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const startDateParam = req.nextUrl.searchParams.get('startDate');
    const endDateParam = req.nextUrl.searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ error: 'startDate et endDate requis (YYYY-MM-DD)' }, { status: 400 });
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    // Récupérer toutes les affectations de la période avec relations
    const assignments = await prisma.assignment.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            employeeType: true,
          },
        },
        post: {
          include: {
            client: { select: { id: true, name: true, industry: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Récupérer résumé KPI
    const [totalPosts, coveredPosts, absences] = await Promise.all([
      prisma.post.count({ where: { isActive: true } }),
      prisma.assignment.count({
        where: {
          date: startDate,
          status: { in: ['CONFIRMED', 'TRAINED_BACKUP', 'UNTRAINED_BACKUP'] },
        },
      }),
      prisma.absence.findMany({
        where: {
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate }
            }
          ]
        },
        select: {
          id: true,
          employeeId: true,
          startDate: true,
          endDate: true,
          reason: true,
        }
      })
    ]);

    return NextResponse.json({
      assignments,
      absences,
      startDate: startDateParam,
      endDate: endDateParam,
      kpi: {
        totalPosts,
        coveredPosts,
        uncoveredPosts: totalPosts - coveredPosts,
      },
    });
  } catch (error) {
    console.error('[API /planning GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, postId, date, status, aiSuggested, aiScore } = body;

    if (!employeeId || !postId || !date || !status) {
      return NextResponse.json(
        { error: 'Champs requis : employeeId, postId, date, status' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.upsert({
      where: { postId_date: { postId, date: new Date(date) } },
      create: {
        employeeId,
        postId,
        date: new Date(date),
        status,
        aiSuggested: aiSuggested ?? false,
        aiScore: aiScore ?? null,
      },
      update: {
        employeeId,
        status,
        aiSuggested: aiSuggested ?? false,
        aiScore: aiScore ?? null,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        post: { include: { client: { select: { id: true, name: true } } } },
      },
    });

    // Si un poste est maintenant couvert, résoudre l'alerte correspondante
    if (status !== 'UNCOVERED') {
      await prisma.alert.updateMany({
        where: {
          postId,
          date: new Date(date),
          isResolved: false,
        },
        data: { isResolved: true },
      });
    }

    return NextResponse.json(assignment, { status: 200 });
  } catch (error) {
    console.error('[API /planning POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { postId, date } = await req.json();
    if (!postId || !date) {
      return NextResponse.json({ error: 'postId et date requis' }, { status: 400 });
    }

    await prisma.assignment.delete({
      where: { postId_date: { postId, date: new Date(date) } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /planning DELETE] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
