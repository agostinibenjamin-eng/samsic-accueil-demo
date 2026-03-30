import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } }
});
async function run() {
  const c = await prisma.employee.count();
  console.log('DB SUCCESS:', c);
}
run().catch(console.error).finally(() => prisma.$disconnect());
