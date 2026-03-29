const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const ass = await prisma.assignment.findMany({ where: { date: new Date('2026-03-28') }, include: { post: { include: { client: true } } } });
  console.log('Total on 28th:', ass.length);
  ass.forEach(a => console.log(a.post.client.name, a.post.name, a.status));
}
run().finally(() => prisma.$disconnect());
