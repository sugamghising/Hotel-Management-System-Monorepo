import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminUserId = "acf81e92-6853-45af-a95e-f532c4aad5e2";
  
  const user = await prisma.user.findUnique({ where: { id: adminUserId } });
  if (!user) { console.log("User not found"); return; }
  console.log("User:", user.email);
  
  const org = await prisma.organization.findUnique({ where: { code: "DEMO" } });
  if (!org) { console.log("Org not found"); return; }
  console.log("Org:", org.code, org.id);
  
  const role = await prisma.role.findFirst({
    where: { organizationId: org.id, code: "ORG_ADMIN" },
  });
  if (!role) { console.log("ORG_ADMIN role not found"); return; }
  console.log("Role:", role.code, role.id);
  
  const existing = await prisma.userRole.findFirst({
    where: { userId: adminUserId, roleId: role.id, hotelId: null },
  });
  if (existing) {
    console.log("User role already exists!");
  } else {
    await prisma.userRole.create({
      data: { userId: adminUserId, roleId: role.id, organizationId: org.id, hotelId: null },
    });
    console.log("✓ Created user role");
  }
  
  const perms = await prisma.$queryRaw<{ cnt: bigint }[]>`
    SELECT COUNT(*)::int as cnt
    FROM user_roles ur
    INNER JOIN roles r ON r.id = ur.role_id
    INNER JOIN role_permissions rp ON rp.role_id = r.id
    INNER JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = ${adminUserId}::uuid
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND r.deleted_at IS NULL
  `;
  console.log("User permissions count:", perms[0]?.cnt ?? 0);
}

main().catch(console.error).finally(() => prisma.$disconnect());
