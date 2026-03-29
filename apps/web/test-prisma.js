const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.assignment.findMany({ where: { date: new Date('2026-03-31') } });
  console.log(p.length);
}
run().finally(() => prisma.$disconnect());
