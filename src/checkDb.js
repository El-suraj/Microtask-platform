import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

(async () => {
  try {
    const raw = process.env.DATABASE_URL || '';
    const masked = raw.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:*****@');
    console.log('DATABASE_URL=', masked);
    await prisma.$connect();
    console.log('Prisma connected — running test query...');
    const count = await prisma.user.count();
    console.log('user count =', count);
    await prisma.$disconnect();
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
})();