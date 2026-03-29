const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const posts = await prisma.post.count({ where: { isActive: true } });
  const assignments = await prisma.assignment.findMany({ where: { date: new Date('2026-03-31') } });
  console.log('Posts:', posts, 'Assignments:', assignments.length);
}
run().finally(() => prisma.$disconnect());
