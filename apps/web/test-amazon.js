const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const ass = await prisma.assignment.findMany({ 
    include: { post: { include: { client: true } } } 
  });
  const amazonMailroom = ass.filter(a => a.post.name === 'Mailroom' && a.post.client.name.includes('Amazon'));
  console.log('Amazon Mailroom assignments:');
  amazonMailroom.forEach(a => console.log(a.date.toISOString(), a.status));
}
run().finally(() => prisma.$disconnect());
