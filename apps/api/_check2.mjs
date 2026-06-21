import { PrismaClient } from './src/generated/prisma/client/index.js';
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgres://3265f4abb6ed42e07d79aaee41fe49871e9d5e5a1dc3b4560797634820881636:sk_q53L-Bor1fx6l33Sohhd9@db.prisma.io:5432/postgres?sslmode=require' } }
});
try {
  const roles = await prisma.$queryRaw`
    SELECT ur.user_id, r.code AS role_code 
    FROM user_roles ur 
    JOIN roles r ON r.id = ur.role_id 
    WHERE ur.user_id = 'acf81e92-6853-45af-a95e-f532c4aad5e2'::uuid
  `;
  console.log('User roles:', JSON.stringify(roles));
  const perms = await prisma.$queryRaw`
    SELECT p.code FROM permissions p LIMIT 3
  `;
  console.log('Sample perms:', JSON.stringify(perms));
} catch(e) { console.error(e); }
finally { await prisma.$disconnect(); }
