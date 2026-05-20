export const RESERVATION_STATUS_MAP = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  NO_SHOW: {
    label: "No Show",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  WAITLIST: {
    label: "Waitlist",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
} as const;

export const ROOM_STATUS_MAP = {
  VACANT_CLEAN: { label: "Vacant Clean", color: "bg-emerald-500", text: "VC" },
  VACANT_DIRTY: { label: "Vacant Dirty", color: "bg-amber-500", text: "VD" },
  VACANT_CLEANING: { label: "Being Cleaned", color: "bg-blue-500", text: "CL" },
  OCCUPIED_CLEAN: { label: "Occupied Clean", color: "bg-cyan-500", text: "OC" },
  OCCUPIED_DIRTY: { label: "Occupied Dirty", color: "bg-red-500", text: "OD" },
  OCCUPIED_CLEANING: {
    label: "Occ. Cleaning",
    color: "bg-violet-500",
    text: "OR",
  },
  OUT_OF_ORDER: { label: "Out of Order", color: "bg-rose-900", text: "OO" },
  RESERVED: { label: "Reserved", color: "bg-indigo-500", text: "RE" },
  BLOCKED: { label: "Blocked", color: "bg-slate-400", text: "BL" },
} as const;

export const HK_STATUS_MAP = {
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  VERIFIED: { label: "Verified", color: "bg-slate-100 text-slate-600" },
  ISSUES_REPORTED: { label: "Issues Found", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-slate-100 text-slate-400" },
} as const;

export const MAINTENANCE_STATUS_MAP = {
  REPORTED: { label: "Reported", color: "bg-red-100 text-red-800" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "bg-amber-100 text-amber-800" },
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-indigo-100 text-indigo-800" },
  PENDING_PARTS: {
    label: "Pending Parts",
    color: "bg-orange-100 text-orange-800",
  },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  VERIFIED: { label: "Verified", color: "bg-slate-100 text-slate-600" },
  CANCELLED: { label: "Cancelled", color: "bg-slate-100 text-slate-400" },
} as const;

export const PRIORITY_MAP = {
  LOW: { label: "Low", color: "bg-slate-100 text-slate-600" },
  MEDIUM: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-800" },
  URGENT: { label: "Urgent", color: "bg-red-100 text-red-800" },
  EMERGENCY: { label: "Emergency", color: "bg-rose-900 text-white" },
} as const;

export const VIP_MAP = {
  NONE: { label: "Guest", color: "bg-slate-100 text-slate-600" },
  BRONZE: { label: "Bronze", color: "bg-orange-100 text-orange-900" },
  SILVER: { label: "Silver", color: "bg-slate-200 text-slate-700" },
  GOLD: { label: "Gold", color: "bg-yellow-100 text-yellow-800" },
  PLATINUM: { label: "Platinum", color: "bg-blue-100 text-blue-900" },
  BLACK: { label: "Black", color: "bg-slate-900 text-white" },
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
  },
  ROOM: {
    READ: "ROOM.READ",
    UPDATE: "ROOM.UPDATE",
    STATUS_UPDATE: "ROOM.STATUS_UPDATE",
    OOO_MANAGE: "ROOM.OOO_MANAGE",
  },
  NIGHT_AUDIT: {
    RUN: "NIGHT_AUDIT.RUN",
    PRE_CHECK: "NIGHT_AUDIT.PRE_CHECK",
    VIEW_HISTORY: "NIGHT_AUDIT.VIEW_HISTORY",
  },
  HOUSEKEEPING: {
    CREATE: "HOUSEKEEPING.CREATE",
    READ: "HOUSEKEEPING.READ",
    UPDATE: "HOUSEKEEPING.UPDATE",
  },
  REPORT: {
    OCCUPANCY: "REPORT.OCCUPANCY",
    REVENUE: "REPORT.REVENUE",
  },
} as const;
