import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const startDateParam = req.nextUrl.searchParams.get('startDate');
    const endDateParam = req.nextUrl.searchParams.get('endDate');

    let whereClause = {};
    if (startDateParam && endDateParam) {
      whereClause = {
        OR: [
          {
            startDate: { lte: new Date(endDateParam) },
            endDate: { gte: new Date(startDateParam) }
          }
        ]
      };
    }

    const absences = await prisma.absence.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            trainedPostIds: true,
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json(absences);
  } catch (error) {
    console.error('[API /absences GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, startDate, endDate, reason } = body;

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Champs requis : employeeId, startDate, endDate' },
        { status: 400 }
      );
    }

    const absence = await prisma.absence.create({
      data: {
        employeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || 'OTHER',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json(absence, { status: 201 });
  } catch (error) {
    console.error('[API /absences POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
