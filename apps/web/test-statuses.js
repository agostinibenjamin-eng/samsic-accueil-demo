const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const assignments = await prisma.assignment.findMany({ where: { date: new Date('2026-03-31') }, include: { post: true } });
  assignments.forEach(a => console.log(a.post.name, a.status, a.employeeId));
}
run().finally(() => prisma.$disconnect());
