import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assignments } = body;

    if (!Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Le champ assignments est requis et doit être un tableau' }, { status: 400 });
    }

    // Insert or update all assignments in the database using a transaction
    const results = await prisma.$transaction(
      assignments.map((assignment: any) =>
        prisma.assignment.upsert({
          where: {
            postId_date: {
              postId: assignment.postId,
              date: new Date(assignment.date),
            },
          },
          update: {
            employeeId: assignment.employeeId,
            status: 'CONFIRMED',
            aiSuggested: true,
            aiScore: assignment.aiScore,
          },
          create: {
            employeeId: assignment.employeeId,
            postId: assignment.postId,
            date: new Date(assignment.date),
            status: 'CONFIRMED',
            aiSuggested: true,
            aiScore: assignment.aiScore,
          },
        })
      )
    );

    // Resolve alerts related to these posts and dates
    const resolvedCount = await Promise.all(
      assignments.map(async (assignment: any) => {
        return prisma.alert.updateMany({
          where: {
            postId: assignment.postId,
            date: new Date(assignment.date),
            isResolved: false,
          },
          data: { isResolved: true },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `${results.length} affectations enregistrées`,
    });
  } catch (error) {
    console.error('[API /planning/bulk POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la sauvegarde du planning', details: (error as any).message }, { status: 500 });
  }
}
