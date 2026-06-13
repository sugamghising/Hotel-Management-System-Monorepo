/*
 * HMS Database Seed Script
 * ============================================================================
 * Run from apps/api:
 *   pnpm db:setup     ← first-time setup (migrate + views + seed)
 *   pnpm db:fresh     ← reset + re-seed (destroys data)
 *   pnpm db:seed      ← seed only (idempotent)
 *   pnpm db:views     ← recreate SQL views only
 * ============================================================================
 * Uses tsx runner (ESM). All operations use upsert where possible
 * so the script is safe to run multiple times.
 * ============================================================================
 */

import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;
const PASSWORD = "Admin@123456";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function yesterday() {
  const d = today();
  d.setDate(d.getDate() - 1);
  return d;
}

function tomorrow() {
  const d = today();
  d.setDate(d.getDate() + 1);
  return d;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

let confirmSeq = 0;
function genConfirmation() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  confirmSeq++;
  return `DEMO${yy}${mm}${dd}${String(confirmSeq).padStart(3, "0")}`;
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database…\n");

  // ──────────── SECTION 1: PERMISSIONS ────────────

  console.log("🔐 Seeding permissions...");

  interface PermissionDef {
    code: string;
    displayName: string;
    description: string;
    category: string;
  }

  const permissions: PermissionDef[] = [
    // Auth / Users
    { code: "USER.CREATE", displayName: "Create users", description: "Create users", category: "ADMIN" },
    { code: "USER.READ", displayName: "View users", description: "View users", category: "ADMIN" },
    { code: "USER.UPDATE", displayName: "Edit users", description: "Edit users", category: "ADMIN" },
    { code: "USER.DELETE", displayName: "Deactivate users", description: "Deactivate users", category: "ADMIN" },
    { code: "USER.MANAGE_ROLES", displayName: "Assign/remove roles", description: "Assign/remove roles", category: "ADMIN" },
    { code: "USER.RESET_PASSWORD", displayName: "Reset user passwords", description: "Reset user passwords", category: "ADMIN" },
    // Roles
    { code: "ROLE.CREATE", displayName: "Create custom roles", description: "Create custom roles", category: "ADMIN" },
    { code: "ROLE.READ", displayName: "View roles", description: "View roles", category: "ADMIN" },
    { code: "ROLE.UPDATE", displayName: "Edit roles", description: "Edit roles", category: "ADMIN" },
    { code: "ROLE.DELETE", displayName: "Delete custom roles", description: "Delete custom roles", category: "ADMIN" },
    // Organization
    { code: "ORGANIZATION.READ", displayName: "View organization", description: "View organization", category: "ADMIN" },
    { code: "ORGANIZATION.UPDATE", displayName: "Edit organization", description: "Edit organization", category: "ADMIN" },
    { code: "ORGANIZATION.DELETE", displayName: "Delete organization", description: "Delete organization", category: "ADMIN" },
    { code: "ORGANIZATION.MANAGE_SUBSCRIPTION", displayName: "Manage subscription", description: "Manage subscription", category: "ADMIN" },
    // Hotels
    { code: "HOTEL.CREATE", displayName: "Create hotels", description: "Create hotels", category: "ADMIN" },
    { code: "HOTEL.READ", displayName: "View hotel details", description: "View hotel details", category: "ADMIN" },
    { code: "HOTEL.UPDATE", displayName: "Edit hotel details", description: "Edit hotel details", category: "ADMIN" },
    { code: "HOTEL.DELETE", displayName: "Delete hotels", description: "Delete hotels", category: "ADMIN" },
    { code: "HOTEL.SETTINGS.READ", displayName: "View hotel settings", description: "View hotel settings", category: "ADMIN" },
    { code: "HOTEL.SETTINGS.UPDATE", displayName: "Edit hotel settings", description: "Edit hotel settings", category: "ADMIN" },
    { code: "HOTEL.MANAGE_STATUS", displayName: "Change hotel status", description: "Change hotel status", category: "ADMIN" },
    // Room Types
    { code: "ROOM_TYPE.CREATE", displayName: "Create room types", description: "Create room types", category: "OPERATIONS" },
    { code: "ROOM_TYPE.READ", displayName: "View room types", description: "View room types", category: "OPERATIONS" },
    { code: "ROOM_TYPE.UPDATE", displayName: "Edit room types", description: "Edit room types", category: "OPERATIONS" },
    { code: "ROOM_TYPE.DELETE", displayName: "Delete room types", description: "Delete room types", category: "OPERATIONS" },
    // Rooms
    { code: "ROOM.CREATE", displayName: "Create rooms", description: "Create rooms", category: "OPERATIONS" },
    { code: "ROOM.READ", displayName: "View rooms", description: "View rooms", category: "OPERATIONS" },
    { code: "ROOM.UPDATE", displayName: "Edit rooms", description: "Edit rooms", category: "OPERATIONS" },
    { code: "ROOM.DELETE", displayName: "Delete rooms", description: "Delete rooms", category: "OPERATIONS" },
    { code: "ROOM.STATUS_UPDATE", displayName: "Update room status", description: "Update room status", category: "OPERATIONS" },
    { code: "ROOM.OOO_MANAGE", displayName: "Manage out-of-order", description: "Manage out-of-order", category: "OPERATIONS" },
    { code: "ROOM.BULK_UPDATE", displayName: "Bulk update rooms", description: "Bulk update rooms", category: "OPERATIONS" },
    { code: "ROOM.HISTORY_READ", displayName: "View room history", description: "View room history", category: "OPERATIONS" },
    // Reservations
    { code: "RESERVATION.CREATE", displayName: "Create reservations", description: "Create reservations", category: "BOOKING" },
    { code: "RESERVATION.READ", displayName: "View reservations", description: "View reservations", category: "BOOKING" },
    { code: "RESERVATION.UPDATE", displayName: "Modify reservations", description: "Modify reservations", category: "BOOKING" },
    { code: "RESERVATION.CANCEL", displayName: "Cancel reservations", description: "Cancel reservations", category: "BOOKING" },
    { code: "RESERVATION.CHECK_IN", displayName: "Check in guests", description: "Check in guests", category: "BOOKING" },
    { code: "RESERVATION.CHECK_OUT", displayName: "Check out guests", description: "Check out guests", category: "BOOKING" },
    { code: "RESERVATION.ASSIGN_ROOM", displayName: "Assign rooms", description: "Assign rooms", category: "BOOKING" },
    { code: "RESERVATION.NO_SHOW", displayName: "Mark no-show", description: "Mark no-show", category: "BOOKING" },
    { code: "RESERVATION.SPLIT", displayName: "Split reservations", description: "Split reservations", category: "BOOKING" },
    // Guests
    { code: "GUEST.CREATE", displayName: "Create guest profiles", description: "Create guest profiles", category: "BOOKING" },
    { code: "GUEST.READ", displayName: "View guest profiles", description: "View guest profiles", category: "BOOKING" },
    { code: "GUEST.UPDATE", displayName: "Edit guest profiles", description: "Edit guest profiles", category: "BOOKING" },
    { code: "GUEST.VIP_MANAGE", displayName: "Manage VIP status", description: "Manage VIP status", category: "BOOKING" },
    { code: "GUEST.BLACKLIST", displayName: "Manage blacklist", description: "Manage blacklist", category: "BOOKING" },
    // Finance
    { code: "FOLIO.READ", displayName: "View folios", description: "View folios", category: "FINANCE" },
    { code: "FOLIO.POST_CHARGE", displayName: "Post charges", description: "Post charges", category: "FINANCE" },
    { code: "FOLIO.VOID", displayName: "Void folio items", description: "Void folio items", category: "FINANCE" },
    { code: "PAYMENT.CREATE", displayName: "Process payments", description: "Process payments", category: "FINANCE" },
    { code: "PAYMENT.REFUND", displayName: "Process refunds", description: "Process refunds", category: "FINANCE" },
    { code: "PAYMENT.VOID", displayName: "Void payments", description: "Void payments", category: "FINANCE" },
    { code: "INVOICE.CREATE", displayName: "Create invoices", description: "Create invoices", category: "FINANCE" },
    { code: "INVOICE.READ", displayName: "View invoices", description: "View invoices", category: "FINANCE" },
    { code: "INVOICE.VOID", displayName: "Void invoices", description: "Void invoices", category: "FINANCE" },
    // Rate Plans
    { code: "RATE_PLAN.CREATE", displayName: "Create rate plans", description: "Create rate plans", category: "REVENUE" },
    { code: "RATE_PLAN.READ", displayName: "View rate plans", description: "View rate plans", category: "REVENUE" },
    { code: "RATE_PLAN.UPDATE", displayName: "Edit rate plans", description: "Edit rate plans", category: "REVENUE" },
    { code: "RATE_PLAN.DELETE", displayName: "Delete rate plans", description: "Delete rate plans", category: "REVENUE" },
    { code: "RATE_PLAN.OVERRIDE", displayName: "Override rates", description: "Override rates", category: "REVENUE" },
    { code: "RATE_PLAN.PUSH", displayName: "Push rates to channels", description: "Push rates to channels", category: "REVENUE" },
    // Housekeeping
    { code: "HOUSEKEEPING.READ", displayName: "View housekeeping tasks", description: "View housekeeping tasks", category: "OPERATIONS" },
    { code: "HOUSEKEEPING.CREATE", displayName: "Create tasks", description: "Create tasks", category: "OPERATIONS" },
    { code: "HOUSEKEEPING.UPDATE", displayName: "Update tasks", description: "Update tasks", category: "OPERATIONS" },
    { code: "HOUSEKEEPING.ASSIGN", displayName: "Assign tasks", description: "Assign tasks", category: "OPERATIONS" },
    { code: "HOUSEKEEPING.VERIFY", displayName: "Verify/inspect rooms", description: "Verify/inspect rooms", category: "OPERATIONS" },
    // Maintenance
    { code: "MAINTENANCE.CREATE", displayName: "Create maintenance requests", description: "Create maintenance requests", category: "OPERATIONS" },
    { code: "MAINTENANCE.READ", displayName: "View maintenance requests", description: "View maintenance requests", category: "OPERATIONS" },
    { code: "MAINTENANCE.UPDATE", displayName: "Update requests", description: "Update requests", category: "OPERATIONS" },
    { code: "MAINTENANCE.ASSIGN", displayName: "Assign to staff", description: "Assign to staff", category: "OPERATIONS" },
    { code: "MAINTENANCE.APPROVE", displayName: "Approve/verify completion", description: "Approve/verify completion", category: "OPERATIONS" },
    // Inventory
    { code: "INVENTORY.READ", displayName: "View inventory", description: "View inventory", category: "OPERATIONS" },
    { code: "INVENTORY.CREATE", displayName: "Create inventory items", description: "Create inventory items", category: "OPERATIONS" },
    { code: "INVENTORY.UPDATE", displayName: "Edit inventory items", description: "Edit inventory items", category: "OPERATIONS" },
    { code: "INVENTORY.ADJUST", displayName: "Adjust stock levels", description: "Adjust stock levels", category: "OPERATIONS" },
    { code: "INVENTORY.CONSUME", displayName: "Record consumption", description: "Record consumption", category: "OPERATIONS" },
    { code: "INVENTORY.VENDOR.CREATE", displayName: "Create vendors", description: "Create vendors", category: "OPERATIONS" },
    { code: "INVENTORY.VENDOR.APPROVE", displayName: "Approve vendors", description: "Approve vendors", category: "OPERATIONS" },
    { code: "INVENTORY.PO.CREATE", displayName: "Create purchase orders", description: "Create purchase orders", category: "OPERATIONS" },
    { code: "INVENTORY.PO.APPROVE", displayName: "Approve purchase orders", description: "Approve purchase orders", category: "OPERATIONS" },
    { code: "INVENTORY.PO.RECEIVE", displayName: "Receive goods", description: "Receive goods", category: "OPERATIONS" },
    // Communications
    { code: "COMMUNICATION.READ", displayName: "View communications", description: "View communications", category: "OPERATIONS" },
    { code: "COMMUNICATION.SEND", displayName: "Send communications", description: "Send communications", category: "OPERATIONS" },
    { code: "COMMUNICATION.BULK_SEND", displayName: "Bulk send", description: "Bulk send", category: "OPERATIONS" },
    { code: "COMMUNICATION.TEMPLATE.CREATE", displayName: "Create templates", description: "Create templates", category: "OPERATIONS" },
    { code: "COMMUNICATION.TEMPLATE.UPDATE", displayName: "Edit templates", description: "Edit templates", category: "OPERATIONS" },
    { code: "COMMUNICATION.TEMPLATE.DELETE", displayName: "Delete templates", description: "Delete templates", category: "OPERATIONS" },
    // Channels
    { code: "CHANNEL.READ", displayName: "View channel manager", description: "View channel manager", category: "REVENUE" },
    { code: "CHANNEL.CREATE", displayName: "Connect channels", description: "Connect channels", category: "REVENUE" },
    { code: "CHANNEL.UPDATE", displayName: "Edit channels", description: "Edit channels", category: "REVENUE" },
    { code: "CHANNEL.DELETE", displayName: "Disconnect channels", description: "Disconnect channels", category: "REVENUE" },
    { code: "CHANNEL.PUSH", displayName: "Push availability", description: "Push availability", category: "REVENUE" },
    // POS
    { code: "POS.READ", displayName: "View POS orders", description: "View POS orders", category: "OPERATIONS" },
    { code: "POS.CREATE", displayName: "Create orders", description: "Create orders", category: "OPERATIONS" },
    { code: "POS.UPDATE", displayName: "Update orders", description: "Update orders", category: "OPERATIONS" },
    { code: "POS.VOID", displayName: "Void orders", description: "Void orders", category: "OPERATIONS" },
    { code: "POS.PAYMENT", displayName: "Process POS payments", description: "Process POS payments", category: "OPERATIONS" },
    // Reports
    { code: "REPORT.READ", displayName: "View reports", description: "View reports", category: "REPORTING" },
    { code: "REPORT.EXPORT", displayName: "Export reports", description: "Export reports", category: "REPORTING" },
    // Night Audit
    { code: "NIGHT_AUDIT.READ", displayName: "View night audit", description: "View night audit", category: "FINANCE" },
    { code: "NIGHT_AUDIT.RUN", displayName: "Run night audit", description: "Run night audit", category: "FINANCE" },
    { code: "NIGHT_AUDIT.ROLLBACK", displayName: "Rollback night audit", description: "Rollback night audit", category: "FINANCE" },
  ];

  const permissionRecords: Array<{ code: string; id: string }> = [];
  for (const p of permissions) {
    const record = await prisma.permission.upsert({
      where: { code: p.code },
      update: {
        displayName: p.displayName,
        description: p.description,
        category: p.category,
      },
      create: {
        code: p.code,
        displayName: p.displayName,
        description: p.description,
        category: p.category,
        isSystem: true,
      },
    });
    permissionRecords.push({ code: record.code, id: record.id });
    console.log(`  ✓ Permission ${p.code}`);
  }

  const allPermCodes = permissions.map((p) => p.code);
  const permMap = new Map(permissionRecords.map((r) => [r.code, r.id]));

  // ──────────── SECTION 2: SYSTEM ROLES ────────────

  console.log("\n🎭 Creating system roles...");

  interface RoleDef {
    code: string;
    name: string;
    description: string;
    level: number;
    permissions: string[];
  }

  const systemRoles: RoleDef[] = [
    {
      code: "SUPER_ADMIN",
      name: "Super Admin",
      description: "Full system access",
      level: 100,
      permissions: allPermCodes,
    },
    {
      code: "ORG_ADMIN",
      name: "Org Admin",
      description: "Organization administrator",
      level: 90,
      permissions: allPermCodes.filter((c) => c !== "NIGHT_AUDIT.ROLLBACK"),
    },
    {
      code: "HOTEL_ADMIN",
      name: "Hotel Admin",
      description: "Hotel administrator",
      level: 80,
      permissions: allPermCodes.filter(
        (c) =>
          c.startsWith("HOTEL.") ||
          c.startsWith("ROOM_TYPE.") ||
          c.startsWith("ROOM.") ||
          c.startsWith("RESERVATION.") ||
          c.startsWith("GUEST.") ||
          c.startsWith("FOLIO.") ||
          c.startsWith("PAYMENT.") ||
          c.startsWith("INVOICE.") ||
          c.startsWith("RATE_PLAN.") ||
          c.startsWith("HOUSEKEEPING.") ||
          c.startsWith("MAINTENANCE.") ||
          c.startsWith("INVENTORY.") ||
          c.startsWith("COMMUNICATION.") ||
          c.startsWith("CHANNEL.") ||
          c.startsWith("POS.") ||
          c.startsWith("REPORT.") ||
          c === "NIGHT_AUDIT.READ" ||
          c === "NIGHT_AUDIT.RUN",
      ),
    },
    {
      code: "GENERAL_MANAGER",
      name: "General Manager",
      description: "General manager",
      level: 70,
      permissions: allPermCodes.filter(
        (c) =>
          (c.startsWith("HOTEL.") &&
            c !== "HOTEL.DELETE" &&
            c !== "HOTEL.MANAGE_STATUS") ||
          (c.startsWith("ROOM_TYPE.") && c !== "ROOM_TYPE.DELETE") ||
          (c.startsWith("ROOM.") && c !== "ROOM.DELETE") ||
          c.startsWith("RESERVATION.") ||
          c.startsWith("GUEST.") ||
          c.startsWith("FOLIO.") ||
          c.startsWith("PAYMENT.") ||
          c.startsWith("INVOICE.") ||
          (c.startsWith("RATE_PLAN.") && c !== "RATE_PLAN.DELETE") ||
          c.startsWith("HOUSEKEEPING.") ||
          c.startsWith("MAINTENANCE.") ||
          c.startsWith("INVENTORY.") ||
          c.startsWith("COMMUNICATION.") ||
          c.startsWith("CHANNEL.") ||
          c.startsWith("POS.") ||
          c.startsWith("REPORT.") ||
          c === "NIGHT_AUDIT.READ" ||
          c === "NIGHT_AUDIT.RUN",
      ),
    },
    {
      code: "FRONT_DESK_AGENT",
      name: "Front Desk Agent",
      description: "Front desk agent",
      level: 30,
      permissions: [
        "ROOM.READ",
        "ROOM.STATUS_UPDATE",
        "RESERVATION.CREATE",
        "RESERVATION.READ",
        "RESERVATION.UPDATE",
        "RESERVATION.CANCEL",
        "RESERVATION.CHECK_IN",
        "RESERVATION.CHECK_OUT",
        "RESERVATION.ASSIGN_ROOM",
        "RESERVATION.NO_SHOW",
        "GUEST.CREATE",
        "GUEST.READ",
        "GUEST.UPDATE",
        "FOLIO.READ",
        "FOLIO.POST_CHARGE",
        "PAYMENT.CREATE",
        "INVOICE.CREATE",
        "INVOICE.READ",
        "COMMUNICATION.SEND",
        "COMMUNICATION.READ",
        "REPORT.READ",
      ],
    },
    {
      code: "RESERVATION_AGENT",
      name: "Reservation Agent",
      description: "Reservation agent",
      level: 25,
      permissions: [
        "RESERVATION.CREATE",
        "RESERVATION.READ",
        "RESERVATION.UPDATE",
        "RESERVATION.CANCEL",
        "GUEST.CREATE",
        "GUEST.READ",
        "GUEST.UPDATE",
        "RATE_PLAN.READ",
        "ROOM_TYPE.READ",
      ],
    },
    {
      code: "HOUSEKEEPING_MANAGER",
      name: "Housekeeping Manager",
      description: "Housekeeping manager",
      level: 35,
      permissions: [
        "ROOM.READ",
        "ROOM.STATUS_UPDATE",
        "ROOM.OOO_MANAGE",
        "ROOM.BULK_UPDATE",
        "ROOM.HISTORY_READ",
        "HOUSEKEEPING.READ",
        "HOUSEKEEPING.CREATE",
        "HOUSEKEEPING.UPDATE",
        "HOUSEKEEPING.ASSIGN",
        "HOUSEKEEPING.VERIFY",
        "MAINTENANCE.CREATE",
        "MAINTENANCE.READ",
        "REPORT.READ",
      ],
    },
    {
      code: "HOUSEKEEPING_STAFF",
      name: "Housekeeping Staff",
      description: "Housekeeping staff",
      level: 10,
      permissions: ["ROOM.READ", "ROOM.STATUS_UPDATE", "HOUSEKEEPING.READ", "HOUSEKEEPING.UPDATE"],
    },
    {
      code: "MAINTENANCE_MANAGER",
      name: "Maintenance Manager",
      description: "Maintenance manager",
      level: 35,
      permissions: [
        "ROOM.READ",
        "ROOM.OOO_MANAGE",
        "ROOM.HISTORY_READ",
        "MAINTENANCE.CREATE",
        "MAINTENANCE.READ",
        "MAINTENANCE.UPDATE",
        "MAINTENANCE.ASSIGN",
        "MAINTENANCE.APPROVE",
        "REPORT.READ",
      ],
    },
    {
      code: "MAINTENANCE_STAFF",
      name: "Maintenance Staff",
      description: "Maintenance staff",
      level: 10,
      permissions: ["ROOM.READ", "MAINTENANCE.CREATE", "MAINTENANCE.READ", "MAINTENANCE.UPDATE"],
    },
    {
      code: "ACCOUNTANT",
      name: "Accountant",
      description: "Accountant",
      level: 40,
      permissions: [
        "FOLIO.READ",
        "FOLIO.POST_CHARGE",
        "FOLIO.VOID",
        "PAYMENT.CREATE",
        "PAYMENT.REFUND",
        "PAYMENT.VOID",
        "INVOICE.CREATE",
        "INVOICE.READ",
        "INVOICE.VOID",
        "REPORT.READ",
        "REPORT.EXPORT",
        "NIGHT_AUDIT.READ",
        "NIGHT_AUDIT.RUN",
        "RESERVATION.READ",
        "GUEST.READ",
      ],
    },
    {
      code: "REVENUE_MANAGER",
      name: "Revenue Manager",
      description: "Revenue manager",
      level: 45,
      permissions: [
        "RATE_PLAN.CREATE",
        "RATE_PLAN.READ",
        "RATE_PLAN.UPDATE",
        "RATE_PLAN.DELETE",
        "RATE_PLAN.OVERRIDE",
        "RATE_PLAN.PUSH",
        "CHANNEL.READ",
        "CHANNEL.CREATE",
        "CHANNEL.UPDATE",
        "CHANNEL.DELETE",
        "CHANNEL.PUSH",
        "ROOM_TYPE.READ",
        "RESERVATION.READ",
        "REPORT.READ",
        "REPORT.EXPORT",
      ],
    },
    {
      code: "INVENTORY_MANAGER",
      name: "Inventory Manager",
      description: "Inventory manager",
      level: 35,
      permissions: [
        "INVENTORY.READ",
        "INVENTORY.CREATE",
        "INVENTORY.UPDATE",
        "INVENTORY.ADJUST",
        "INVENTORY.CONSUME",
        "INVENTORY.VENDOR.CREATE",
        "INVENTORY.VENDOR.APPROVE",
        "INVENTORY.PO.CREATE",
        "INVENTORY.PO.APPROVE",
        "INVENTORY.PO.RECEIVE",
        "REPORT.READ",
      ],
    },
    {
      code: "RESTAURANT_MANAGER",
      name: "Restaurant Manager",
      description: "Restaurant manager",
      level: 35,
      permissions: [
        "POS.READ",
        "POS.CREATE",
        "POS.UPDATE",
        "POS.VOID",
        "POS.PAYMENT",
        "INVENTORY.READ",
        "INVENTORY.CONSUME",
        "REPORT.READ",
      ],
    },
    {
      code: "POS_STAFF",
      name: "POS Staff",
      description: "POS staff",
      level: 10,
      permissions: ["POS.READ", "POS.CREATE", "POS.UPDATE", "POS.PAYMENT"],
    },
  ];

  const roleDefMap = new Map(systemRoles.map((r) => [r.code, r]));

  // ──────────── SECTION 3: DEMO ORGANIZATION ────────────

  console.log("\n🏢 Creating organization...");

  const org = await prisma.organization.upsert({
    where: { code: "DEMO" },
    update: {},
    create: {
      code: "DEMO",
      name: "Demo Hotel Group",
      legalName: "Demo Hospitality Ltd.",
      taxId: "TAX-DEMO-001",
      email: "info@demohms.com",
      phone: "+1-555-0100",
      website: "https://demohms.com",
      organizationType: "CHAIN",
      subscriptionTier: "ENTERPRISE",
      subscriptionStatus: "ACTIVE",
      subscriptionStartDate: new Date(),
      maxHotels: 999,
      maxRooms: 9999,
      maxUsers: 999,
      enabledFeatures: ["*"],
      settings: {},
    },
  });
  console.log(`  ✓ Organization: ${org.name} (${org.code})`);

  // Clone 15 system roles into this org
  console.log("\n🎭 Cloning roles into organization...");

  const clonedRoleIds = new Map<string, string>();

  for (const roleDef of systemRoles) {
    const role = await prisma.role.upsert({
      where: {
        uq_role_org_code: { organizationId: org.id, code: roleDef.code },
      },
      update: {},
      create: {
        organizationId: org.id,
        code: roleDef.code,
        name: roleDef.name,
        description: roleDef.description,
        level: roleDef.level,
        isSystem: true,
        settings: {},
      },
    });
    clonedRoleIds.set(roleDef.code, role.id);

    // Assign permissions
    const permIds = roleDef.permissions.map((c) => permMap.get(c)!).filter(Boolean);
    for (const permId of permIds) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      });
    }
    console.log(`  ✓ Role ${roleDef.code} (${roleDef.permissions.length} permissions)`);
  }

  // ──────────── SECTION 4: SEED USERS ────────────

  console.log("\n👤 Creating users...");

  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  interface UserDef {
    email: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    roleCode: string;
    isSuperAdmin?: boolean;
  }

  const userDefs: UserDef[] = [
    { email: "superadmin@hms.com", firstName: "System", lastName: "Admin", jobTitle: "System Administrator", roleCode: "SUPER_ADMIN", isSuperAdmin: true },
    { email: "admin@demo.com", firstName: "Alex", lastName: "Chen", jobTitle: "Organization Administrator", roleCode: "ORG_ADMIN" },
    { email: "hoteladmin@demo.com", firstName: "Maria", lastName: "Santos", jobTitle: "Hotel Administrator", roleCode: "HOTEL_ADMIN" },
    { email: "gm@demo.com", firstName: "James", lastName: "Whitfield", jobTitle: "General Manager", roleCode: "GENERAL_MANAGER" },
    { email: "frontdesk@demo.com", firstName: "Priya", lastName: "Sharma", jobTitle: "Front Desk Agent", roleCode: "FRONT_DESK_AGENT" },
    { email: "accounts@demo.com", firstName: "Robert", lastName: "Kim", jobTitle: "Accountant", roleCode: "ACCOUNTANT" },
    { email: "housekeeping@demo.com", firstName: "Fatima", lastName: "Al-Hassan", jobTitle: "Housekeeping Manager", roleCode: "HOUSEKEEPING_MANAGER" },
  ];

  const userIds = new Map<string, string>();

  for (const u of userDefs) {
    const user = await prisma.user.upsert({
      where: { uq_user_email_org: { organizationId: org.id, email: u.email } },
      update: {},
      create: {
        organizationId: org.id,
        email: u.email,
        passwordHash: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        jobTitle: u.jobTitle,
        isSuperAdmin: u.isSuperAdmin ?? false,
        status: "ACTIVE",
        emailVerified: true,
        languageCode: "en",
        timezone: "UTC",
        preferences: {},
      },
    });
    userIds.set(u.email, user.id);
    console.log(`  ✓ User: ${u.firstName} ${u.lastName} (${u.email})`);
  }

  // Assign org-wide roles (no hotelId) for superadmin and org admin
  for (const u of userDefs) {
    const roleId = clonedRoleIds.get(u.roleCode)!;
    const userId = userIds.get(u.email)!;
    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId, hotelId: null },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: { userId, roleId, organizationId: org.id, hotelId: null },
      });
    }
    console.log(`  ✓ Role ${u.roleCode} assigned to ${u.email}`);
  }

  // ──────────── SECTION 5: DEMO HOTEL ────────────

  console.log("\n🏨 Creating hotel...");

  const hotel = await prisma.hotel.upsert({
    where: { uq_hotel_org_code: { organizationId: org.id, code: "DEMO-HTL-01" } },
    update: {},
    create: {
      organizationId: org.id,
      code: "DEMO-HTL-01",
      name: "The Grand Horizon Hotel",
      legalName: "Grand Horizon Hospitality LLC",
      brand: "Grand Horizon",
      propertyType: "HOTEL",
      starRating: 4.0,
      email: "reservations@grandhorizon.com",
      phone: "+1-555-0200",
      website: "https://grandhorizon.com",
      addressLine1: "100 Harbor View Boulevard",
      city: "San Francisco",
      stateProvince: "California",
      postalCode: "94105",
      countryCode: "US",
      latitude: 37.7885,
      longitude: -122.3892,
      timezone: "America/Los_Angeles",
      checkInTime: new Date("1970-01-01T15:00:00"),
      checkOutTime: new Date("1970-01-01T11:00:00"),
      currentBusinessDate: today(),
      currencyCode: "USD",
      defaultLanguage: "en",
      totalFloors: 12,
      status: "ACTIVE",
      operationalSettings: {
        earlyCheckInAllowed: true,
        earlyCheckInFee: 50,
        lateCheckOutAllowed: true,
        lateCheckOutFee: 75,
        expressCheckout: true,
        parkingAvailable: true,
        parkingFee: 45,
        petPolicy: "NOT_ALLOWED",
        smokingPolicy: "NOT_ALLOWED",
        wifiPolicy: "FREE",
      },
      amenities: [
        "WIFI", "POOL", "GYM", "SPA", "RESTAURANT",
        "BAR", "ROOM_SERVICE", "CONCIERGE", "PARKING",
        "BUSINESS_CENTER", "LAUNDRY",
      ],
      policies: {
        cancellationPolicyDefault: "Free cancellation up to 24 hours before check-in.",
        depositPolicy: "Credit card guarantee required for all bookings.",
        childPolicy: "Children under 12 stay free in existing bedding.",
        groupPolicy: "Groups of 10+ rooms require 50% deposit.",
      },
    },
  });
  console.log(`  ✓ Hotel: ${hotel.name}`);

  // Assign hotel-scoped roles to users 3-7
  const hotelScopedUsers = userDefs.slice(2); // skip superadmin + org admin
  for (const u of hotelScopedUsers) {
    const roleId = clonedRoleIds.get(u.roleCode)!;
    const userId = userIds.get(u.email)!;
    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId, hotelId: hotel.id },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: { userId, roleId, organizationId: org.id, hotelId: hotel.id },
      });
    }
    console.log(`  ✓ Role ${u.roleCode} assigned to ${u.email} (scoped to hotel)`);
  }

  // ──────────── SECTION 6: ROOM TYPES ────────────

  console.log("\n🛏️ Creating room types...");

  interface RoomTypeDef {
    code: string;
    name: string;
    baseOccupancy: number;
    maxOccupancy: number;
    maxAdults: number;
    maxChildren: number;
    sizeSqm: number;
    bedTypes: string[];
    amenities: string[];
    viewType: string;
    defaultCleaningTime: number;
    displayOrder: number;
    baseRate: number;
  }

  const roomTypeDefs: RoomTypeDef[] = [
    {
      code: "STD", name: "Standard Room",
      baseOccupancy: 2, maxOccupancy: 2, maxAdults: 2, maxChildren: 1,
      sizeSqm: 28, bedTypes: ["QUEEN"],
      amenities: ["WIFI", "TV", "AC", "SAFE", "HAIR_DRYER", "DESK"],
      viewType: "CITY", defaultCleaningTime: 30, displayOrder: 1,
      baseRate: 189,
    },
    {
      code: "DLX", name: "Deluxe Room",
      baseOccupancy: 2, maxOccupancy: 3, maxAdults: 2, maxChildren: 1,
      sizeSqm: 38, bedTypes: ["KING"],
      amenities: ["WIFI", "TV", "AC", "MINIBAR", "SAFE", "BALCONY", "COFFEE_MACHINE"],
      viewType: "OCEAN", defaultCleaningTime: 35, displayOrder: 2,
      baseRate: 259,
    },
    {
      code: "JST", name: "Junior Suite",
      baseOccupancy: 2, maxOccupancy: 3, maxAdults: 2, maxChildren: 2,
      sizeSqm: 55, bedTypes: ["KING", "SOFA_BED"],
      amenities: ["WIFI", "TV", "AC", "MINIBAR", "SAFE", "BALCONY", "COFFEE_MACHINE", "BATHTUB", "SOFA"],
      viewType: "PANORAMIC", defaultCleaningTime: 45, displayOrder: 3,
      baseRate: 389,
    },
    {
      code: "EXS", name: "Executive Suite",
      baseOccupancy: 2, maxOccupancy: 4, maxAdults: 2, maxChildren: 2,
      sizeSqm: 85, bedTypes: ["KING", "SOFA_BED"],
      amenities: ["WIFI", "TV", "AC", "MINIBAR", "SAFE", "BALCONY", "COFFEE_MACHINE", "BATHTUB", "SOFA", "KITCHENETTE"],
      viewType: "PANORAMIC", defaultCleaningTime: 60, displayOrder: 4,
      baseRate: 549,
    },
    {
      code: "TWN", name: "Twin Room",
      baseOccupancy: 2, maxOccupancy: 2, maxAdults: 2, maxChildren: 0,
      sizeSqm: 30, bedTypes: ["TWIN", "TWIN"],
      amenities: ["WIFI", "TV", "AC", "SAFE", "HAIR_DRYER"],
      viewType: "CITY", defaultCleaningTime: 30, displayOrder: 5,
      baseRate: 189,
    },
  ];

  const roomTypeIds = new Map<string, string>();

  for (const rt of roomTypeDefs) {
    const record = await prisma.roomType.upsert({
      where: { uq_roomtype_hotel_code: { hotelId: hotel.id, code: rt.code } },
      update: {},
      create: {
        organizationId: org.id,
        hotelId: hotel.id,
        code: rt.code,
        name: rt.name,
        baseOccupancy: rt.baseOccupancy,
        maxOccupancy: rt.maxOccupancy,
        maxAdults: rt.maxAdults,
        maxChildren: rt.maxChildren,
        sizeSqm: rt.sizeSqm,
        bedTypes: rt.bedTypes as any,
        amenities: rt.amenities,
        viewType: rt.viewType,
        defaultCleaningTime: rt.defaultCleaningTime,
        displayOrder: rt.displayOrder,
        isActive: true,
        isBookable: true,
      },
    });
    roomTypeIds.set(rt.code, record.id);
    console.log(`  ✓ Room Type: ${rt.name} (${rt.code})`);
  }

  // ──────────── SECTION 7: ROOMS ────────────

  console.log("\n🚪 Creating rooms...");

  interface RoomDef {
    number: string;
    floor: number;
    typeCode: string;
    status: string;
    isOoo?: boolean;
    oooReason?: string;
    oooFrom?: Date;
    oooUntil?: Date;
    maintenanceStatus?: string;
  }

  const roomDefs: RoomDef[] = [
    // Floor 2 — Standard
    { number: "201", floor: 2, typeCode: "STD", status: "VACANT_CLEAN" },
    { number: "202", floor: 2, typeCode: "STD", status: "VACANT_CLEAN" },
    { number: "203", floor: 2, typeCode: "STD", status: "VACANT_CLEAN" },
    { number: "204", floor: 2, typeCode: "STD", status: "VACANT_CLEAN" },
    { number: "205", floor: 2, typeCode: "TWN", status: "VACANT_CLEAN" },
    { number: "206", floor: 2, typeCode: "TWN", status: "VACANT_DIRTY" },
    // Floor 3 — Mix
    { number: "301", floor: 3, typeCode: "STD", status: "VACANT_CLEAN" },
    { number: "302", floor: 3, typeCode: "STD", status: "VACANT_CLEAN" },
    { number: "303", floor: 3, typeCode: "STD", status: "VACANT_CLEAN" },
    { number: "304", floor: 3, typeCode: "DLX", status: "VACANT_CLEAN" },
    { number: "305", floor: 3, typeCode: "DLX", status: "VACANT_CLEAN" },
    { number: "306", floor: 3, typeCode: "DLX", status: "OUT_OF_ORDER", isOoo: true, oooReason: "Bathroom renovation in progress", oooFrom: yesterday(), oooUntil: addDays(tomorrow(), 3), maintenanceStatus: "IN_PROGRESS" },
    // Floor 4 — Deluxe
    { number: "401", floor: 4, typeCode: "DLX", status: "VACANT_CLEAN" },
    { number: "402", floor: 4, typeCode: "DLX", status: "VACANT_CLEAN" },
    { number: "403", floor: 4, typeCode: "DLX", status: "VACANT_CLEAN" },
    { number: "404", floor: 4, typeCode: "DLX", status: "OCCUPIED_CLEAN" },
    { number: "405", floor: 4, typeCode: "JST", status: "VACANT_CLEAN" },
    { number: "406", floor: 4, typeCode: "JST", status: "VACANT_CLEAN" },
    // Floor 5 — Suites
    { number: "501", floor: 5, typeCode: "JST", status: "VACANT_CLEAN" },
    { number: "502", floor: 5, typeCode: "JST", status: "VACANT_CLEAN" },
    { number: "503", floor: 5, typeCode: "EXS", status: "VACANT_CLEAN" },
    { number: "504", floor: 5, typeCode: "EXS", status: "OCCUPIED_DIRTY" },
  ];

  const roomIds = new Map<string, string>();

  for (const rd of roomDefs) {
    const roomTypeId = roomTypeIds.get(rd.typeCode)!;
    const room = await prisma.room.upsert({
      where: { uq_room_hotel_number: { hotelId: hotel.id, roomNumber: rd.number } },
      update: {},
      create: {
        organizationId: org.id,
        hotelId: hotel.id,
        roomTypeId,
        roomNumber: rd.number,
        floor: rd.floor,
        status: rd.status as any,
        isOutOfOrder: rd.isOoo ?? false,
        oooReason: rd.oooReason,
        oooFrom: rd.oooFrom,
        oooUntil: rd.oooUntil,
        maintenanceStatus: (rd.maintenanceStatus ?? "NONE") as any,
        isSmoking: false,
        isAccessible: false,
      },
    });
    roomIds.set(rd.number, room.id);
    console.log(`  ✓ Room ${rd.number} (${rd.typeCode}) - ${rd.status}`);
  }

  // Update hotel totalRooms
  await prisma.hotel.update({
    where: { id: hotel.id },
    data: { totalRooms: 22 },
  });

  // Create RoomInventory for 90 days
  const roomTypeCodes = ["STD", "DLX", "JST", "EXS", "TWN"];
  const counts: Record<string, number> = { STD: 6, DLX: 7, JST: 4, EXS: 2, TWN: 2 };
  for (const code of roomTypeCodes) {
    const roomTypeId = roomTypeIds.get(code)!;
    const total = counts[code]!;
    const ooo = code === "DLX" ? 1 : 0;
    for (let i = 0; i < 90; i++) {
      const date = addDays(today(), i);
      await prisma.roomInventory.upsert({
        where: { roomTypeId_date: { roomTypeId, date } },
        update: {},
        create: {
          roomTypeId,
          date,
          totalRooms: total,
          outOfOrder: ooo,
          blocked: 0,
          sold: 0,
          available: total - ooo,
          overbookingLimit: 0,
          stopSell: false,
        },
      });
    }
    console.log(`  ✓ RoomInventory for ${code} (90 days)`);
  }

  // ──────────── SECTION 8: RATE PLANS ────────────

  console.log("\n💰 Creating rate plans...");

  function roundNearest5(n: number): number {
    return Math.round(n / 5) * 5;
  }

  const ratePlanIds = new Map<string, string>();

  for (const rt of roomTypeDefs) {
    const roomTypeId = roomTypeIds.get(rt.code)!;
    const bar = rt.baseRate;
    const plans = [
      { code: `${rt.code}-BAR`, name: `${rt.name} — Best Available`, pricingType: "DAILY", baseRate: bar, isRefundable: true, cancellationPolicy: "FLEXIBLE", mealPlan: "ROOM_ONLY", channelCodes: ["DIRECT_WEB", "DIRECT_PHONE", "BOOKING_COM", "EXPEDIA"] },
      { code: `${rt.code}-BB`, name: `${rt.name} — Bed & Breakfast`, pricingType: "DAILY", baseRate: bar + 35, isRefundable: true, cancellationPolicy: "FLEXIBLE", mealPlan: "BREAKFAST", channelCodes: ["DIRECT_WEB", "DIRECT_PHONE"] },
      { code: `${rt.code}-NR`, name: `${rt.name} — Non-Refundable`, pricingType: "DAILY", baseRate: roundNearest5(bar * 0.85), isRefundable: false, cancellationPolicy: "NON_REFUNDABLE", mealPlan: "ROOM_ONLY", channelCodes: ["DIRECT_WEB", "BOOKING_COM", "EXPEDIA"] },
    ];

    for (const p of plans) {
      const ratePlan = await prisma.ratePlan.upsert({
        where: { uq_rateplan_hotel_code: { hotelId: hotel.id, code: p.code } },
        update: {},
        create: {
          organizationId: org.id,
          hotelId: hotel.id,
          roomTypeId,
          code: p.code,
          name: p.name,
          pricingType: p.pricingType as any,
          baseRate: p.baseRate,
          isRefundable: p.isRefundable,
          cancellationPolicy: p.cancellationPolicy as any,
          mealPlan: p.mealPlan as any,
          isPublic: true,
          channelCodes: p.channelCodes,
          minStay: 1,
        },
      });
      ratePlanIds.set(p.code, ratePlan.id);
      console.log(`  ✓ Rate Plan: ${p.name} (${p.code}) — $${p.baseRate}`);
    }
  }

  // ──────────── SECTION 9: SAMPLE GUESTS ────────────

  console.log("\n🧑‍🤝‍🧑 Creating guests...");

  interface GuestDef {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    nationality: string | null;
    languageCode: string;
    guestType: string;
    vipStatus: string;
    companyName?: string;
    dietaryRequirements?: string;
    totalStays?: number;
    totalNights?: number;
    totalRevenue?: number;
    marketingConsent?: boolean;
  }

  const guestDefs: GuestDef[] = [
    { firstName: "Emily", lastName: "Carter", email: "emily.carter@email.com", phone: "+1-555-0301", nationality: "US", languageCode: "en", guestType: "TRANSIENT", vipStatus: "GOLD", totalStays: 12, totalNights: 38, totalRevenue: 9800 },
    { firstName: "Mohammed", lastName: "Al-Rashid", email: "m.alrashid@corp.ae", phone: "+971-55-0302", nationality: "AE", languageCode: "ar", guestType: "CORPORATE", vipStatus: "PLATINUM", companyName: "Gulf Ventures LLC", totalStays: 28, totalNights: 95, totalRevenue: 32000 },
    { firstName: "Sophie", lastName: "Dubois", email: "s.dubois@gmail.com", phone: "+33-6-0303", nationality: "FR", languageCode: "fr", guestType: "TRANSIENT", vipStatus: "SILVER", totalStays: 4, totalNights: 12 },
    { firstName: "Kenji", lastName: "Tanaka", email: "k.tanaka@outlook.com", phone: "+81-90-0304", nationality: "JP", languageCode: "ja", guestType: "TRANSIENT", vipStatus: "NONE", dietaryRequirements: "No shellfish" },
    { firstName: "Sarah", lastName: "Johnson", email: "sarah.j@email.com", phone: "+1-555-0305", nationality: "US", languageCode: "en", guestType: "TRANSIENT", vipStatus: "BRONZE", totalStays: 3 },
    { firstName: "Carlos", lastName: "Mendoza", email: "cmendoza@empresa.mx", phone: "+52-55-0306", nationality: "MX", languageCode: "es", guestType: "CORPORATE", companyName: "Mendoza & Partners" },
    { firstName: "Anika", lastName: "Patel", email: "anika.p@email.in", phone: "+91-98-0307", nationality: "IN", languageCode: "en", guestType: "TRANSIENT", vipStatus: "NONE" },
    { firstName: "John", lastName: "Walker", email: null, phone: "+1-555-0308", nationality: "US", languageCode: "en", guestType: "TRANSIENT", vipStatus: "NONE" },
  ];

  const guestIds = new Map<string, string>();

  for (const g of guestDefs) {
    if (g.email) {
      const guest = await prisma.guest.upsert({
        where: { uq_guest_email_org: { organizationId: org.id, email: g.email } },
        update: {},
        create: {
          organizationId: org.id,
          hotelId: hotel.id,
          firstName: g.firstName,
          lastName: g.lastName,
          email: g.email,
          phone: g.phone,
          nationality: g.nationality,
          languageCode: g.languageCode,
          guestType: g.guestType as any,
          vipStatus: g.vipStatus as any,
          companyName: g.companyName,
          dietaryRequirements: g.dietaryRequirements,
          totalStays: g.totalStays ?? 1,
          totalNights: g.totalNights ?? 1,
          totalRevenue: g.totalRevenue ?? 0,
          marketingConsent: g.marketingConsent ?? true,
          emailOptIn: true,
          smsOptIn: true,
        },
      });
      guestIds.set(g.email, guest.id);
      console.log(`  ✓ Guest: ${g.firstName} ${g.lastName} (${g.email})`);
    } else {
      // Walk-in guest — no email, create or find by phone
      const existing = await prisma.guest.findFirst({
        where: { organizationId: org.id, phone: g.phone },
      });
      if (!existing) {
        const guest = await prisma.guest.create({
          data: {
            organizationId: org.id,
            hotelId: hotel.id,
            firstName: g.firstName,
            lastName: g.lastName,
            phone: g.phone,
            nationality: g.nationality,
            languageCode: g.languageCode,
            guestType: g.guestType as any,
            vipStatus: g.vipStatus as any,
          },
        });
        guestIds.set(`walkin-${g.phone}`, guest.id);
        console.log(`  ✓ Guest: ${g.firstName} ${g.lastName} (walk-in)`);
      }
    }
  }

  // ──────────── SECTION 10: SAMPLE RESERVATIONS ────────────

  console.log("\n📋 Creating reservations...");

  const hkManagerId = userIds.get("housekeeping@demo.com")!;
  const frontDeskId = userIds.get("frontdesk@demo.com")!;

  // Reservation 1 — CHECKED_IN (Emily Carter, room 404)
  const dlxBarRatePlanId = ratePlanIds.get("DLX-BAR")!;
  const emilyId = guestIds.get("emily.carter@email.com")!;
  const room404Id = roomIds.get("404")!;
  const dlxRoomTypeId = roomTypeIds.get("DLX")!;
  const dlxBarRate = 259;

  const res1 = await prisma.reservation.upsert({
    where: { confirmationNumber: genConfirmation() },
    update: {},
    create: {
      organizationId: org.id,
      hotelId: hotel.id,
      guestId: emilyId,
      confirmationNumber: `DEMO${formatDate(today()).replace(/-/g, "")}001`,
      source: "DIRECT_WEB",
      checkInDate: today(),
      checkOutDate: addDays(today(), 3),
      nights: 3,
      adultCount: 2,
      status: "CHECKED_IN",
      checkInStatus: "CHECKED_IN",
      currencyCode: "USD",
      totalAmount: dlxBarRate * 3,
      taxAmount: Math.round(dlxBarRate * 3 * 0.12 * 100) / 100,
      balance: dlxBarRate * 2,
      ratePlanId: dlxBarRatePlanId,
      guaranteeType: "CREDIT_CARD",
      cancellationPolicy: "FLEXIBLE",
      averageRate: dlxBarRate,
    },
  });
  console.log(`  ✓ Reservation 1: ${res1.confirmationNumber} (Emily Carter, CHECKED_IN)`);

  // Create ReservationRoom
  await prisma.reservationRoom.create({
    data: {
      reservationId: res1.id,
      roomId: room404Id,
      roomTypeId: dlxRoomTypeId,
      status: "OCCUPIED",
      roomRate: dlxBarRate,
      adultCount: 2,
    },
  });

  // Folio items for res1 — 3 room charges + tax
  for (let i = 0; i < 3; i++) {
    await prisma.folioItem.create({
      data: {
        organizationId: org.id,
        hotelId: hotel.id,
        reservationId: res1.id,
        itemType: "ROOM_CHARGE",
        description: `Room charge - Night ${i + 1}`,
        amount: dlxBarRate,
        taxAmount: 0,
        quantity: 1,
        unitPrice: dlxBarRate,
        revenueCode: "ROOM",
        department: "FRONT_DESK",
        postedBy: frontDeskId,
        businessDate: addDays(today(), i),
      },
    });
  }
  await prisma.folioItem.create({
    data: {
      organizationId: org.id,
      hotelId: hotel.id,
      reservationId: res1.id,
      itemType: "TAX",
      description: "Occupancy tax 12%",
      amount: Math.round(dlxBarRate * 3 * 0.12 * 100) / 100,
      taxAmount: 0,
      quantity: 1,
      unitPrice: Math.round(dlxBarRate * 3 * 0.12 * 100) / 100,
      revenueCode: "TAX",
      department: "FRONT_DESK",
      postedBy: frontDeskId,
      businessDate: today(),
    },
  });

  // Payment — deposit of 1 night
  await prisma.payment.create({
    data: {
      organizationId: org.id,
      hotelId: hotel.id,
      reservationId: res1.id,
      amount: dlxBarRate,
      method: "CREDIT_CARD",
      status: "CAPTURED",
      createdBy: frontDeskId,
    },
  });

  // Reservation 2 — CHECKED_IN (Mohammed, room 504, EXS-BB)
  const exsBbRatePlanId = ratePlanIds.get("EXS-BB")!;
  const mohammedId = guestIds.get("m.alrashid@corp.ae")!;
  const room504Id = roomIds.get("504")!;
  const exsRoomTypeId = roomTypeIds.get("EXS")!;
  const exsBbRate = 549 + 35;

  const res2 = await prisma.reservation.upsert({
    where: { confirmationNumber: `DEMO${formatDate(addDays(today(), -1)).replace(/-/g, "")}002` },
    update: {},
    create: {
      organizationId: org.id,
      hotelId: hotel.id,
      guestId: mohammedId,
      confirmationNumber: `DEMO${formatDate(addDays(today(), -1)).replace(/-/g, "")}002`,
      source: "CORPORATE",
      checkInDate: addDays(today(), -1),
      checkOutDate: addDays(today(), 2),
      nights: 3,
      adultCount: 1,
      status: "CHECKED_IN",
      checkInStatus: "CHECKED_IN",
      currencyCode: "USD",
      totalAmount: exsBbRate * 3,
      taxAmount: Math.round(exsBbRate * 3 * 0.12 * 100) / 100,
      balance: 0,
      ratePlanId: exsBbRatePlanId,
      guaranteeType: "COMPANY_BILL",
      cancellationPolicy: "FLEXIBLE",
      averageRate: exsBbRate,
      guestNotes: "Platinum guest — upgrade if available",
    },
  });
  console.log(`  ✓ Reservation 2: ${res2.confirmationNumber} (Mohammed Al-Rashid, CHECKED_IN)`);

  await prisma.reservationRoom.create({
    data: {
      reservationId: res2.id,
      roomId: room504Id,
      roomTypeId: exsRoomTypeId,
      status: "OCCUPIED",
      roomRate: exsBbRate,
      adultCount: 1,
    },
  });

  // Folio — 2 nights posted
  for (let i = 0; i < 2; i++) {
    await prisma.folioItem.create({
      data: {
        organizationId: org.id,
        hotelId: hotel.id,
        reservationId: res2.id,
        itemType: "ROOM_CHARGE",
        description: `Room charge - Night ${i + 1}`,
        amount: exsBbRate,
        taxAmount: 0,
        quantity: 1,
        unitPrice: exsBbRate,
        revenueCode: "ROOM",
        department: "FRONT_DESK",
        postedBy: frontDeskId,
        businessDate: addDays(today(), -1 + i),
      },
    });
  }

  // Full prepayment
  await prisma.payment.create({
    data: {
      organizationId: org.id,
      hotelId: hotel.id,
      reservationId: res2.id,
      amount: exsBbRate * 3,
      method: "BANK_TRANSFER",
      status: "CAPTURED",
      createdBy: frontDeskId,
    },
  });

  // Reservation 3 — CONFIRMED arriving today (Sophie, DLX-NR)
  const dlxNrRatePlanId = ratePlanIds.get("DLX-NR")!;
  const sophieId = guestIds.get("s.dubois@gmail.com")!;
  const dlxNrRate = roundNearest5(259 * 0.85);

  const res3 = await prisma.reservation.upsert({
    where: { confirmationNumber: `DEMO${formatDate(today()).replace(/-/g, "")}003` },
    update: {},
    create: {
      organizationId: org.id,
      hotelId: hotel.id,
      guestId: sophieId,
      confirmationNumber: `DEMO${formatDate(today()).replace(/-/g, "")}003`,
      source: "BOOKING_COM",
      checkInDate: today(),
      checkOutDate: addDays(today(), 2),
      nights: 2,
      adultCount: 2,
      status: "CONFIRMED",
      checkInStatus: "NOT_CHECKED_IN",
      currencyCode: "USD",
      totalAmount: dlxNrRate * 2,
      taxAmount: Math.round(dlxNrRate * 2 * 0.12 * 100) / 100,
      balance: dlxNrRate * 2,
      ratePlanId: dlxNrRatePlanId,
      guaranteeType: "CREDIT_CARD",
      cancellationPolicy: "NON_REFUNDABLE",
      averageRate: dlxNrRate,
      specialRequests: "High floor preferred, late arrival",
      arrivalTime: new Date("1970-01-01T16:30:00"),
    },
  });
  console.log(`  ✓ Reservation 3: ${res3.confirmationNumber} (Sophie Dubois, CONFIRMED)`);

  await prisma.reservationRoom.create({
    data: {
      reservationId: res3.id,
      roomId: null,
      roomTypeId: dlxRoomTypeId,
      status: "RESERVED",
      roomRate: dlxNrRate,
      adultCount: 2,
    },
  });

  // Reservation 4 — CONFIRMED future arrival (Kenji, JST-BB)
  const jstBbRatePlanId = ratePlanIds.get("JST-BB")!;
  const kenjiId = guestIds.get("k.tanaka@outlook.com")!;
  const jstRoomTypeId = roomTypeIds.get("JST")!;
  const jstBbRate = 389 + 35;

  const res4 = await prisma.reservation.upsert({
    where: { confirmationNumber: `DEMO${formatDate(addDays(today(), 3)).replace(/-/g, "")}004` },
    update: {},
    create: {
      organizationId: org.id,
      hotelId: hotel.id,
      guestId: kenjiId,
      confirmationNumber: `DEMO${formatDate(addDays(today(), 3)).replace(/-/g, "")}004`,
      source: "DIRECT_WEB",
      checkInDate: addDays(today(), 3),
      checkOutDate: addDays(today(), 6),
      nights: 3,
      adultCount: 2,
      status: "CONFIRMED",
      checkInStatus: "NOT_CHECKED_IN",
      currencyCode: "USD",
      totalAmount: jstBbRate * 3,
      taxAmount: Math.round(jstBbRate * 3 * 0.12 * 100) / 100,
      balance: jstBbRate * 3,
      ratePlanId: jstBbRatePlanId,
      guaranteeType: "CREDIT_CARD",
      cancellationPolicy: "FLEXIBLE",
      averageRate: jstBbRate,
    },
  });
  console.log(`  ✓ Reservation 4: ${res4.confirmationNumber} (Kenji Tanaka, CONFIRMED)`);

  await prisma.reservationRoom.create({
    data: {
      reservationId: res4.id,
      roomId: null,
      roomTypeId: jstRoomTypeId,
      status: "RESERVED",
      roomRate: jstBbRate,
      adultCount: 2,
    },
  });

  // Reservation 5 — CHECKED_OUT (Sarah, STD-BAR)
  const stdBarRatePlanId = ratePlanIds.get("STD-BAR")!;
  const sarahId = guestIds.get("sarah.j@email.com")!;
  const room302Id = roomIds.get("302")!;
  const stdRoomTypeId = roomTypeIds.get("STD")!;
  const stdBarRate = 189;

  const res5 = await prisma.reservation.upsert({
    where: { confirmationNumber: `DEMO${formatDate(addDays(today(), -2)).replace(/-/g, "")}005` },
    update: {},
    create: {
      organizationId: org.id,
      hotelId: hotel.id,
      guestId: sarahId,
      confirmationNumber: `DEMO${formatDate(addDays(today(), -2)).replace(/-/g, "")}005`,
      source: "DIRECT_PHONE",
      checkInDate: addDays(today(), -2),
      checkOutDate: today(),
      nights: 2,
      adultCount: 1,
      status: "CHECKED_OUT",
      checkInStatus: "CHECKED_OUT",
      currencyCode: "USD",
      totalAmount: stdBarRate * 2,
      taxAmount: Math.round(stdBarRate * 2 * 0.12 * 100) / 100,
      balance: 0,
      ratePlanId: stdBarRatePlanId,
      guaranteeType: "CREDIT_CARD",
      cancellationPolicy: "FLEXIBLE",
      averageRate: stdBarRate,
    },
  });
  console.log(`  ✓ Reservation 5: ${res5.confirmationNumber} (Sarah Johnson, CHECKED_OUT)`);

  await prisma.reservationRoom.create({
    data: {
      reservationId: res5.id,
      roomId: room302Id,
      roomTypeId: stdRoomTypeId,
      status: "CHECKED_OUT",
      roomRate: stdBarRate,
      adultCount: 1,
    },
  });

  for (let i = 0; i < 2; i++) {
    await prisma.folioItem.create({
      data: {
        organizationId: org.id,
        hotelId: hotel.id,
        reservationId: res5.id,
        itemType: "ROOM_CHARGE",
        description: `Room charge - Night ${i + 1}`,
        amount: stdBarRate,
        taxAmount: 0,
        quantity: 1,
        unitPrice: stdBarRate,
        revenueCode: "ROOM",
        department: "FRONT_DESK",
        postedBy: frontDeskId,
        businessDate: addDays(today(), -2 + i),
      },
    });
  }
  await prisma.payment.create({
    data: {
      organizationId: org.id,
      hotelId: hotel.id,
      reservationId: res5.id,
      amount: stdBarRate * 2,
      method: "CREDIT_CARD",
      status: "CAPTURED",
      createdBy: frontDeskId,
    },
  });

  // Reservation 6 — CANCELLED (Carlos, DLX-BAR)
  const carlosId = guestIds.get("cmendoza@empresa.mx")!;

  const res6 = await prisma.reservation.upsert({
    where: { confirmationNumber: `DEMO${formatDate(addDays(today(), 7)).replace(/-/g, "")}006` },
    update: {},
    create: {
      organizationId: org.id,
      hotelId: hotel.id,
      guestId: carlosId,
      confirmationNumber: `DEMO${formatDate(addDays(today(), 7)).replace(/-/g, "")}006`,
      source: "DIRECT_WEB",
      checkInDate: addDays(today(), 7),
      checkOutDate: addDays(today(), 10),
      nights: 3,
      adultCount: 1,
      status: "CANCELLED",
      checkInStatus: "NOT_CHECKED_IN",
      currencyCode: "USD",
      totalAmount: dlxBarRate * 3,
      taxAmount: Math.round(dlxBarRate * 3 * 0.12 * 100) / 100,
      balance: 0,
      ratePlanId: dlxBarRatePlanId,
      guaranteeType: "NONE",
      cancellationPolicy: "FLEXIBLE",
      averageRate: dlxBarRate,
      cancelledAt: addDays(today(), -1),
      cancellationReason: "Guest requested — change of plans",
      cancellationFee: 0,
    },
  });
  console.log(`  ✓ Reservation 6: ${res6.confirmationNumber} (Carlos Mendoza, CANCELLED)`);

  // ──────────── SECTION 11: HOUSEKEEPING TASKS ────────────

  console.log("\n🧹 Creating housekeeping tasks...");

  const room206Id = roomIds.get("206")!;
  const room306Id = roomIds.get("306")!;

  const hkTasks = [
    { roomId: room206Id, taskType: "CLEANING_DEPARTURE" as const, priority: 1, scheduledFor: today(), estimatedMinutes: 30, status: "PENDING" as const },
    { roomId: room504Id, taskType: "CLEANING_STAYOVER" as const, priority: 0, scheduledFor: today(), estimatedMinutes: 25, status: "PENDING" as const },
    { roomId: room306Id, taskType: "INSPECTION" as const, priority: 2, scheduledFor: addDays(today(), 4), estimatedMinutes: 45, status: "PENDING" as const },
    { roomId: room404Id, taskType: "CLEANING_DEPARTURE" as const, priority: 0, scheduledFor: addDays(today(), 1), estimatedMinutes: 35, status: "PENDING" as const },
  ];

  for (const t of hkTasks) {
    await prisma.housekeepingTask.create({
      data: {
        organizationId: org.id,
        hotelId: hotel.id,
        roomId: t.roomId,
        taskType: t.taskType,
        priority: t.priority,
        scheduledFor: t.scheduledFor,
        estimatedMinutes: t.estimatedMinutes,
        status: t.status,
        createdBy: hkManagerId,
        assignedTo: hkManagerId,
      },
    });
    console.log(`  ✓ Housekeeping task: ${t.taskType} — Room ${roomDefs.find((r) => roomIds.get(r.number) === t.roomId)?.number ?? t.roomId}`);
  }

  // ──────────── SECTION 12: MAINTENANCE REQUESTS ────────────

  console.log("\n🔧 Creating maintenance requests...");

  // MR 1 — Room 306 active
  await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      hotelId: hotel.id,
      roomId: room306Id,
      category: "PAINTING",
      priority: "HIGH",
      title: "Bathroom renovation — tile repair and repaint",
      description: "Complete bathroom renovation including tile repair, repainting, and fixture replacement.",
      reportedBy: hkManagerId,
      reportedByType: "STAFF",
      assignedTo: hkManagerId,
      status: "IN_PROGRESS",
      roomOutOfOrder: true,
      oooUntil: addDays(tomorrow(), 3),
      estimatedHours: 40,
    },
  });
  console.log("  ✓ Maintenance: Room 306 - Bathroom renovation");

  // MR 2 — Room 402 reported
  const room402Id = roomIds.get("402")!;
  await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      hotelId: hotel.id,
      roomId: room402Id,
      category: "PLUMBING",
      priority: "MEDIUM",
      title: "Slow drain in bathroom sink",
      description: "Guest reported slow drainage in the bathroom sink. Needs inspection and possible snaking.",
      reportedBy: frontDeskId,
      reportedByType: "STAFF",
      status: "REPORTED",
    },
  });
  console.log("  ✓ Maintenance: Room 402 - Slow drain");

  // ──────────── SECTION 13: INVENTORY ITEMS ────────────

  console.log("\n📦 Creating inventory items...");

  interface ItemDef {
    sku: string;
    name: string;
    category: string;
    unitOfMeasure: string;
    parLevel: number;
    reorderPoint: number;
    reorderQty: number;
    currentStock: number;
    availableStock: number;
    avgUnitCost: number;
  }

  const itemDefs: ItemDef[] = [
    { sku: "TOIL-001", name: "Toilet Paper Rolls", category: "ROOM_SUPPLIES", unitOfMeasure: "rolls", parLevel: 500, reorderPoint: 100, reorderQty: 400, currentStock: 320, availableStock: 320, avgUnitCost: 0.45 },
    { sku: "SOAP-001", name: "Guest Soap Bars", category: "ROOM_SUPPLIES", unitOfMeasure: "pcs", parLevel: 400, reorderPoint: 80, reorderQty: 300, currentStock: 250, availableStock: 250, avgUnitCost: 0.75 },
    { sku: "MNBR-001", name: "Minibar Water 500ml", category: "MINIBAR", unitOfMeasure: "bottles", parLevel: 120, reorderPoint: 30, reorderQty: 100, currentStock: 88, availableStock: 88, avgUnitCost: 0.60 },
    { sku: "MNBR-002", name: "Minibar Snack Pack", category: "MINIBAR", unitOfMeasure: "pcs", parLevel: 80, reorderPoint: 20, reorderQty: 60, currentStock: 15, availableStock: 15, avgUnitCost: 1.20 },
    { sku: "CLEN-001", name: "All-Purpose Cleaner 1L", category: "CLEANING", unitOfMeasure: "L", parLevel: 50, reorderPoint: 10, reorderQty: 40, currentStock: 38, availableStock: 38, avgUnitCost: 3.50 },
    { sku: "CLEN-002", name: "Microfiber Cloths", category: "CLEANING", unitOfMeasure: "pcs", parLevel: 60, reorderPoint: 15, reorderQty: 50, currentStock: 8, availableStock: 8, avgUnitCost: 2.20 },
    { sku: "LNRY-001", name: "Bed Sheets King", category: "ROOM_SUPPLIES", unitOfMeasure: "sets", parLevel: 80, reorderPoint: 20, reorderQty: 60, currentStock: 45, availableStock: 45, avgUnitCost: 28.00 },
    { sku: "MAIN-001", name: "Light Bulbs LED E27", category: "MAINTENANCE", unitOfMeasure: "pcs", parLevel: 50, reorderPoint: 10, reorderQty: 40, currentStock: 32, availableStock: 32, avgUnitCost: 4.50 },
    { sku: "FNDB-001", name: "Coffee Pods (Box 50)", category: "FANDB", unitOfMeasure: "boxes", parLevel: 30, reorderPoint: 8, reorderQty: 25, currentStock: 22, availableStock: 22, avgUnitCost: 18.00 },
    { sku: "PPRG-001", name: "A4 Paper Ream", category: "OFFICE", unitOfMeasure: "reams", parLevel: 20, reorderPoint: 5, reorderQty: 15, currentStock: 12, availableStock: 12, avgUnitCost: 6.50 },
  ];

  for (const item of itemDefs) {
    await prisma.inventoryItem.upsert({
      where: { uq_invitem_hotel_sku: { hotelId: hotel.id, sku: item.sku } },
      update: {},
      create: {
        organizationId: org.id,
        hotelId: hotel.id,
        sku: item.sku,
        name: item.name,
        category: item.category as any,
        unitOfMeasure: item.unitOfMeasure,
        parLevel: item.parLevel,
        reorderPoint: item.reorderPoint,
        reorderQty: item.reorderQty,
        currentStock: item.currentStock,
        reservedStock: 0,
        availableStock: item.availableStock,
        avgUnitCost: item.avgUnitCost,
        lastUnitCost: item.avgUnitCost,
        isActive: true,
      },
    });
    console.log(`  ✓ Item: ${item.sku} — ${item.name}`);
  }

  // ──────────── SECTION 14: VENDORS ────────────

  console.log("\n🏢 Creating vendors...");

  const vendorDefs = [
    { code: "VND-001", name: "Pacific Supply Co.", contactPerson: "Tom Bradley", email: "orders@pacificsupply.com", phone: "+1-555-0400", paymentTerms: "NET30", isApproved: true, rating: 4 },
    { code: "VND-002", name: "CleanPro Distributors", contactPerson: "Lisa Wong", email: "sales@cleanpro.com", paymentTerms: "NET15", isApproved: true, rating: 5 },
  ];

  for (const v of vendorDefs) {
    await prisma.vendor.upsert({
      where: { uq_vendor_hotel_code: { hotelId: hotel.id, code: v.code } },
      update: {},
      create: {
        organizationId: org.id,
        hotelId: hotel.id,
        code: v.code,
        name: v.name,
        contactPerson: v.contactPerson,
        email: v.email,
        phone: v.phone,
        paymentTerms: v.paymentTerms,
        currencyCode: "USD",
        isApproved: v.isApproved,
        isActive: true,
        rating: v.rating,
      },
    });
    console.log(`  ✓ Vendor: ${v.name} (${v.code})`);
  }

  // ──────────── SECTION 15: COMMUNICATION TEMPLATES ────────────

  console.log("\n📧 Creating communication templates...");

  interface TemplateDef {
    code: string;
    name: string;
    type: string;
    channel: string;
    subject: string | null;
    bodyTemplate: string;
    language: string;
  }

  const templateDefs: TemplateDef[] = [
    {
      code: "RESERVATION_CONFIRMATION_EMAIL",
      name: "Reservation Confirmation",
      type: "RESERVATION_CONFIRMATION",
      channel: "EMAIL",
      subject: "Your reservation at {{hotelName}} is confirmed",
      bodyTemplate: `Dear {{guestFirstName}},

Thank you for choosing {{hotelName}}. Your reservation has been confirmed.

Confirmation Number: {{confirmationNumber}}
Check-in: {{checkInDate}}
Check-out: {{checkOutDate}}
Room: {{roomType}}
Guests: {{adultCount}} adult(s)

Total: {{currencyCode}} {{totalAmount}}

Check-in time: 3:00 PM | Check-out: 11:00 AM

We look forward to welcoming you.

Warm regards,
{{hotelName}} Team`,
      language: "en",
    },
    {
      code: "PRE_ARRIVAL_REMINDER_EMAIL",
      name: "Pre-arrival Reminder",
      type: "CHECKIN_REMINDER",
      channel: "EMAIL",
      subject: "Your stay at {{hotelName}} begins tomorrow",
      bodyTemplate: `Dear {{guestFirstName}},

We're excited to welcome you tomorrow!

Arrival details:
Date: {{checkInDate}}
Check-in from: 3:00 PM
Confirmation: {{confirmationNumber}}

If you need early check-in or have any special requests, please contact us at {{hotelPhone}}.

See you soon!
{{hotelName}}`,
      language: "en",
    },
    {
      code: "POST_STAY_THANK_YOU_EMAIL",
      name: "Post-stay Thank You",
      type: "SURVEY",
      channel: "EMAIL",
      subject: "Thank you for staying at {{hotelName}}",
      bodyTemplate: `Dear {{guestFirstName}},

Thank you for staying with us. We hope you had a wonderful experience.

We would love to hear your feedback:
{{surveyLink}}

We look forward to welcoming you back soon.

{{hotelName}}`,
      language: "en",
    },
    {
      code: "BOOKING_CONFIRMATION_SMS",
      name: "Booking Confirmation SMS",
      type: "RESERVATION_CONFIRMATION",
      channel: "SMS",
      subject: null,
      bodyTemplate: `{{hotelName}}: Confirmed! Ref {{confirmationNumber}}. Check-in {{checkInDate}}. Questions? Call {{hotelPhone}}.`,
      language: "en",
    },
  ];

  for (const t of templateDefs) {
    await prisma.communicationTemplate.upsert({
      where: {
        uq_template_code_channel_lang: {
          organizationId: org.id,
          code: t.code,
          channel: t.channel as any,
          language: t.language,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        hotelId: hotel.id,
        code: t.code,
        name: t.name,
        type: t.type as any,
        channel: t.channel as any,
        subject: t.subject,
        bodyTemplate: t.bodyTemplate,
        language: t.language,
        isActive: true,
        isSystem: true,
      },
    });
    console.log(`  ✓ Template: ${t.name} (${t.channel})`);
  }

  // ─── COMPLETION ──────────────────────────────────────────────────────────────

  console.log("\n✅ Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo Credentials:");
  console.log("  Super Admin:  superadmin@hms.com / Admin@123456");
  console.log("  Org Admin:    admin@demo.com / Admin@123456");
  console.log("  Hotel Admin:  hoteladmin@demo.com / Admin@123456");
  console.log("  GM:           gm@demo.com / Admin@123456");
  console.log("  Front Desk:   frontdesk@demo.com / Admin@123456");
  console.log("  Accountant:   accounts@demo.com / Admin@123456");
  console.log("  Housekeeping: housekeeping@demo.com / Admin@123456");
  console.log("  Org Code:     DEMO");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
