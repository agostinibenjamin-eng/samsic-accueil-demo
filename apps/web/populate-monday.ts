import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const c30 = await prisma.assignment.count({ where: { date: new Date('2026-03-30') } });
  const c31 = await prisma.assignment.count({ where: { date: new Date('2026-03-31') } });
  
  console.log('Monday 30:', c30);
  console.log('Tuesday 31:', c31);
  
  if (c30 === 0 && c31 > 0) {
     const tuesdays = await prisma.assignment.findMany({ where: { date: new Date('2026-03-31') } });
     const newAssignments = tuesdays.map(t => ({
        employeeId: t.employeeId,
        postId: t.postId,
        date: new Date('2026-03-30'),
        status: t.status,
        aiSuggested: t.aiSuggested,
        aiScore: t.aiScore,
     }));
     const res = await prisma.assignment.createMany({ data: newAssignments });
     console.log('Copied to Monday 30:', res.count);
  }
}
run().finally(() => prisma.$disconnect());
