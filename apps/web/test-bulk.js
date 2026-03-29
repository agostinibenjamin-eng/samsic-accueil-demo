const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const post = await prisma.post.findFirst({ where: { name: 'Mailroom' }});
    const employee = await prisma.employee.findFirst({ where: { firstName: 'Emilie' }});
    
    console.log("Simulating bulk insert...");
    const assignments = [{
      postId: post.id,
      employeeId: employee.id,
      date: '2026-03-30T00:00:00.000Z',
      status: 'CONFIRMED',
      aiSuggested: true,
      aiScore: 95
    }];

    const results = await prisma.$transaction(
      assignments.map((assignment) =>
        prisma.assignment.upsert({
          where: {
            postId_date: {
              postId: assignment.postId,
              date: new Date(assignment.date),
            },
          },
          update: {
            employeeId: assignment.employeeId,
            status: assignment.status,
            aiSuggested: assignment.aiSuggested,
            aiScore: assignment.aiScore,
          },
          create: {
            employeeId: assignment.employeeId,
            postId: assignment.postId,
            date: new Date(assignment.date),
            status: assignment.status,
            aiSuggested: assignment.aiSuggested,
            aiScore: assignment.aiScore,
          },
        })
      )
    );
    console.log("Upsert Success!", results.length);
  } catch (err) {
    console.error("FAIL:", err.message);
  }
}
run().finally(() => prisma.$disconnect());
