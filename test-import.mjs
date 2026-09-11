try {
  const prisma = await import('@prisma/client');
  console.log('Prisma import OK:', Object.keys(prisma));
} catch (e) {
  console.error('Prisma import error:', e.message);
}
