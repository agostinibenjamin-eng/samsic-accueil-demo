import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EmployeeFullProfile } from '@/lib/data/employees-data';
import type { ClientData, ClientPost } from '@/lib/data/clients-data';

export const dynamic = 'force-dynamic';

function getNext7DaysBounds() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start, end };
}

function calculatePostStatus(postId: string, assignments: any[]): 'COVERED' | 'AT_RISK' | 'UNCOVERED' {
  const postAssignments = assignments.filter(a => a.postId === postId);
  if (postAssignments.length === 0) return 'UNCOVERED';
  const hasUncovered = postAssignments.some(a => a.status === 'UNCOVERED');
  if (hasUncovered) return 'UNCOVERED';
  const hasUntrained = postAssignments.some(a => a.status === 'UNTRAINED_BACKUP');
  if (hasUntrained) return 'AT_RISK';
  return 'COVERED';
}

export async function GET() {
  try {
    const { start, end } = getNext7DaysBounds();

    const [dbEmployees, dbClients, assignments, absences] = await Promise.all([
      prisma.employee.findMany({ where: { isActive: true } }),
      prisma.client.findMany({
        where: { isActive: true },
        include: {
          posts: { where: { isActive: true } }
        }
      }),
      prisma.assignment.findMany({
        where: { date: { gte: start, lte: end } },
        include: { employee: true, post: true }
      }),
      prisma.absence.findMany({
        where: { endDate: { gte: start } }
      })
    ]);

    // ─── 1. Mapping Employés ──────────────────────────────────────────
    const mappedEmployees: EmployeeFullProfile[] = dbEmployees.map(emp => {
      const empAssignments = assignments.filter(a => a.employeeId === emp.id);
      let weeklyAssignedHours = 0;
      empAssignments.forEach(a => {
        const [sh, sm] = a.post.startTime.split(':').map(Number);
        const [eh, em] = a.post.endTime.split(':').map(Number);
        weeklyAssignedHours += Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
      });

      const gap = Math.max(0, emp.weeklyHours - weeklyAssignedHours);
      const occ = emp.weeklyHours > 0 ? Math.round((weeklyAssignedHours / emp.weeklyHours) * 100) : 0;
      
      const vs = Math.min(100,
        Math.min((emp.languages || []).length * 15, 35) +
        Math.min((emp.skills || []).length * 10, 30) +
        Math.min((emp.trainedPostIds || []).length * 8, 25) +
        (emp.employeeType === 'TEAM_LEADER' ? 10 : emp.employeeType === 'BACKUP' ? 5 : 0)
      );

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeType: emp.employeeType as any,
        contractType: 'CDI', // DB par defaut
        contractStartDate: emp.createdAt.toISOString(),
        weeklyContractHours: emp.weeklyHours,
        hourlyRate: 15.5,
        billedRate: 28.0,
        isActive: emp.isActive,
        phone: String(Math.floor(Math.random() * 900000) + 100000), // fallback fake contact
        email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@samsic.lu`,
        address: 'Luxembourg',
        hasVehicle: true,
        drivingLicense: true,
        acceptedZones: ['kirchberg', 'centre', 'cloche_dor', 'belval'],
        languages: (emp.languages || []).map(l => ({ code: l as any, level: 'FLUENT' })),
        skills: (emp.skills || []).map(s => ({ id: s, label: s, level: 'COMPETENT' })),
        certifications: [],
        trainedPosts: (emp.trainedPostIds || []).map(pid => {
          return {
            clientId: 'unknown',
            clientName: 'DB Client',
            postName: pid,
            status: 'TRAINED',
          };
        }),
        weeklyAssignedHours,
        utilizationGap: gap,
        occupancyRate: Math.min(100, occ),
        absenceRate: 0,
        reliabilityScore: 85,
        versatilityScore: vs,
        notes: '',
      };
    });

    // ─── 2. Mapping Clients ──────────────────────────────────────────
    const mappedClients: ClientData[] = dbClients.map(c => {
      const posts: ClientPost[] = c.posts.map(p => {
        const pAssignments = assignments.filter(a => a.postId === p.id);
        const titulaires = pAssignments.filter(a => a.status === 'CONFIRMED').map(a => `${a.employee.firstName} ${a.employee.lastName}`);
        const backups = pAssignments.filter(a => a.status === 'TRAINED_BACKUP' || a.status === 'UNTRAINED_BACKUP').map(a => `${a.employee.firstName} ${a.employee.lastName}`);
        
        return {
          name: p.name,
          startTime: p.startTime,
          endTime: p.endTime,
          titular: titulaires.length > 0 ? titulaires[0] : 'Aucun',
          backups: backups,
          status: calculatePostStatus(p.id, pAssignments),
          languages: p.requiredLanguages
        };
      });

      const coverageRate = posts.filter(p => p.status === 'COVERED').length / (posts.length || 1) * 100;

      return {
        id: c.id,
        name: c.name,
        code: `CL-${c.id.slice(0, 5).toUpperCase()}`,
        industry: c.industry || 'Entreprise',
        coverageRate: Math.round(coverageRate),
        coverageTrend: 0,
        status: coverageRate >= 95 ? 'STABLE' : coverageRate >= 80 ? 'WARNING' : 'CRITICAL',
        address: 'Luxembourg',
        siteCount: 1,
        posts,
        contacts: [{ name: 'Contact Client', role: 'Facility Manager', email: `contact@${c.name.toLowerCase().replace(/\\s+/g, '')}.lu`, isPrimary: true }],
        alerts: [],
        aiRiskScore: 100 - Math.round(coverageRate),
        aiRiskFactors: [],
        contractSince: '2020-01',
        coverageHistory: [100, 100, 100, 100, 100, Math.round(coverageRate)],
      };
    });

    return NextResponse.json({ employees: mappedEmployees, clients: mappedClients });
  } catch (error) {
    console.error('[API /store/init] Error:', error);
    return NextResponse.json({ error: 'DB Fetch Error', detail: String(error) }, { status: 500 });
  }
}
