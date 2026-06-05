export const RESERVATION_STATUS_MAP = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    color: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-400",
  },
  NO_SHOW: {
    label: "No Show",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-400",
  },
  WAITLIST: {
    label: "Waitlist",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-400",
  },
} as const;

export const ROOM_STATUS_MAP = {
  VACANT_CLEAN: {
    label: "Vacant Clean",
    short: "VC",
    bg: "bg-emerald-500",
    text: "text-emerald-700",
    light: "bg-emerald-50 border-emerald-200",
  },
  VACANT_DIRTY: {
    label: "Vacant Dirty",
    short: "VD",
    bg: "bg-amber-500",
    text: "text-amber-700",
    light: "bg-amber-50 border-amber-200",
  },
  VACANT_CLEANING: {
    label: "Being Cleaned",
    short: "CL",
    bg: "bg-blue-500",
    text: "text-blue-700",
    light: "bg-blue-50 border-blue-200",
  },
  OCCUPIED_CLEAN: {
    label: "Occupied Clean",
    short: "OC",
    bg: "bg-cyan-500",
    text: "text-cyan-700",
    light: "bg-cyan-50 border-cyan-200",
  },
  OCCUPIED_DIRTY: {
    label: "Occupied Dirty",
    short: "OD",
    bg: "bg-red-500",
    text: "text-red-700",
    light: "bg-red-50 border-red-200",
  },
  OCCUPIED_CLEANING: {
    label: "Occ. Cleaning",
    short: "OR",
    bg: "bg-violet-500",
    text: "text-violet-700",
    light: "bg-violet-50 border-violet-200",
  },
  OUT_OF_ORDER: {
    label: "Out of Order",
    short: "OO",
    bg: "bg-rose-900",
    text: "text-rose-900",
    light: "bg-rose-50 border-rose-200",
  },
  RESERVED: {
    label: "Reserved",
    short: "RE",
    bg: "bg-indigo-500",
    text: "text-indigo-700",
    light: "bg-indigo-50 border-indigo-200",
  },
  BLOCKED: {
    label: "Blocked",
    short: "BL",
    bg: "bg-slate-400",
    text: "text-slate-600",
    light: "bg-slate-50 border-slate-200",
  },
} as const;

export const HK_STATUS_MAP = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  VERIFIED: {
    label: "Verified",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  },
  ISSUES_REPORTED: {
    label: "Issues Found",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-slate-50 text-slate-400 border-slate-200",
  },
} as const;

export const MAINTENANCE_STATUS_MAP = {
  OPEN: {
    label: "Open",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  ASSIGNED: {
    label: "Assigned",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  VERIFIED: {
    label: "Verified",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  },
  ON_HOLD: {
    label: "On Hold",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-slate-50 text-slate-400 border-slate-200",
  },
} as const;

export const PRIORITY_MAP = {
  LOW: { label: "Low", color: "bg-slate-100 text-slate-600 border-slate-200" },
  MEDIUM: {
    label: "Medium",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  HIGH: {
    label: "High",
    color: "bg-orange-50 text-orange-800 border-orange-200",
  },
  URGENT: { label: "Urgent", color: "bg-red-50 text-red-700 border-red-200" },
  EMERGENCY: {
    label: "Emergency",
    color: "bg-rose-900 text-white border-rose-900",
  },
} as const;

export const VIP_MAP = {
  NONE: {
    label: "Guest",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  BRONZE: {
    label: "Bronze",
    color: "bg-orange-50 text-orange-900 border-orange-200",
  },
  SILVER: {
    label: "Silver",
    color: "bg-slate-100 text-slate-700 border-slate-300",
  },
  GOLD: {
    label: "Gold",
    color: "bg-yellow-50 text-yellow-800 border-yellow-200",
  },
  PLATINUM: {
    label: "Platinum",
    color: "bg-blue-50 text-blue-900 border-blue-200",
  },
  BLACK: { label: "Black", color: "bg-slate-900 text-white border-slate-900" },
} as const;

export const PERMISSIONS = {
  RESERVATION: {
    CREATE: "RESERVATION.CREATE",
    READ: "RESERVATION.READ",
    UPDATE: "RESERVATION.UPDATE",
    CANCEL: "RESERVATION.CANCEL",
    CHECK_IN: "RESERVATION.CHECK_IN",
    CHECK_OUT: "RESERVATION.CHECK_OUT",
    NO_SHOW: "RESERVATION.NO_SHOW",
    ASSIGN_ROOM: "RESERVATION.ASSIGN_ROOM",
    SPLIT: "RESERVATION.SPLIT",
  },
  ROOM: {
    READ: "ROOM.READ",
    CREATE: "ROOM.CREATE",
    UPDATE: "ROOM.UPDATE",
    DELETE: "ROOM.DELETE",
    STATUS_UPDATE: "ROOM.STATUS_UPDATE",
    OOO_MANAGE: "ROOM.OOO_MANAGE",
    BULK_UPDATE: "ROOM.BULK_UPDATE",
  },
  GUEST: {
    READ: "GUEST.READ",
    CREATE: "GUEST.CREATE",
    UPDATE: "GUEST.UPDATE",
  },
  HOUSEKEEPING: {
    READ: "HOUSEKEEPING.READ",
    CREATE: "HOUSEKEEPING.CREATE",
    UPDATE: "HOUSEKEEPING.UPDATE",
  },
  MAINTENANCE: {
    READ: "MAINTENANCE.READ",
    CREATE: "MAINTENANCE.CREATE",
    UPDATE: "MAINTENANCE.UPDATE",
    ASSIGN: "MAINTENANCE.ASSIGN",
    VERIFY: "MAINTENANCE.VERIFY",
    VIEW_COSTS: "MAINTENANCE.VIEW_COSTS",
  },
  NIGHT_AUDIT: {
    RUN: "NIGHT_AUDIT.RUN",
    PRE_CHECK: "NIGHT_AUDIT.PRE_CHECK",
    VIEW_STATUS: "NIGHT_AUDIT.VIEW_STATUS",
    VIEW_HISTORY: "NIGHT_AUDIT.VIEW_HISTORY",
    VIEW_REPORT: "NIGHT_AUDIT.VIEW_REPORT",
    ROLLBACK: "NIGHT_AUDIT.ROLLBACK",
  },
  REPORT: {
    OCCUPANCY: "REPORT.OCCUPANCY",
    REVENUE: "REPORT.REVENUE",
  },
  DASHBOARD: {
    MANAGER: "DASHBOARD.MANAGER",
    REVENUE: "DASHBOARD.REVENUE",
    OPERATIONS: "DASHBOARD.OPERATIONS",
  },
  USER: {
    VIEW: "USER.VIEW",
    CREATE: "USER.CREATE",
    UPDATE: "USER.UPDATE",
    DELETE: "USER.DELETE",
    ASSIGN_ROLE: "USER.ASSIGN_ROLE",
  },
  ROLE: {
    VIEW: "ROLE.VIEW",
    CREATE: "ROLE.CREATE",
    UPDATE: "ROLE.UPDATE",
    DELETE: "ROLE.DELETE",
  },
  HOTEL: {
    READ: "HOTEL.READ",
    UPDATE: "HOTEL.UPDATE",
    CREATE: "HOTEL.CREATE",
  },
  RATE_PLAN: {
    READ: "RATE_PLAN.READ",
    CREATE: "RATE_PLAN.CREATE",
    UPDATE: "RATE_PLAN.UPDATE",
  },
} as const;
