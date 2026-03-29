import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const res1 = await prisma.assignment.deleteMany({
    where: { date: new Date('2026-03-29') }
  });
  console.log('Deleted 29th:', res1.count);
  const res2 = await prisma.assignment.deleteMany({
    where: { date: new Date('2026-04-05') }
  });
  console.log('Deleted 5th:', res2.count);
}
run().finally(() => prisma.$disconnect());
