/**
 * GET /api/employees
 * @nextjs-best-practices — Route Handler serverless
 * Retourne la liste complète des employés actifs avec leurs posts de formation
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: [{ employeeType: 'asc' }, { lastName: 'asc' }],
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('[API /employees] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
