import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  ClipboardList,
  Wrench,
  Moon,
  Coffee,
  Package,
  BarChart3,
  Radio,
  Settings,
  Building2,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/{orgSlug}/hotels/{hotelId}",
    icon: LayoutDashboard,
    permission: null, // always visible
  },
  {
    label: "Reservations",
    href: "/{orgSlug}/hotels/{hotelId}/reservations",
    icon: CalendarCheck,
    permission: "RESERVATION.READ",
  },
  {
    label: "Rooms",
    href: "/{orgSlug}/hotels/{hotelId}/rooms/grid",
    icon: BedDouble,
    permission: "ROOM.READ",
  },
  {
    label: "Guests",
    href: "/{orgSlug}/hotels/{hotelId}/guests",
    icon: Users,
    permission: "GUEST.READ",
  },
  {
    label: "Housekeeping",
    href: "/{orgSlug}/hotels/{hotelId}/housekeeping",
    icon: ClipboardList,
    permission: "HOUSEKEEPING.READ",
  },
  {
    label: "Maintenance",
    href: "/{orgSlug}/hotels/{hotelId}/maintenance",
    icon: Wrench,
    permission: "MAINTENANCE.READ",
  },
  {
    label: "POS",
    href: "/{orgSlug}/hotels/{hotelId}/pos",
    icon: Coffee,
    permission: null,
  },
  {
    label: "Inventory",
    href: "/{orgSlug}/hotels/{hotelId}/inventory",
    icon: Package,
    permission: null,
  },
  {
    label: "Night Audit",
    href: "/{orgSlug}/hotels/{hotelId}/night-audit",
    icon: Moon,
    permission: "NIGHT_AUDIT.PRE_CHECK",
  },
  {
    label: "Reports",
    href: "/{orgSlug}/hotels/{hotelId}/reports",
    icon: BarChart3,
    permission: "REPORT.OCCUPANCY",
  },
  {
    label: "Channels",
    href: "/{orgSlug}/hotels/{hotelId}/channels",
    icon: Radio,
    permission: null,
  },
] as const;

export const SETTINGS_ITEMS = [
  {
    label: "Hotel Settings",
    href: "/{orgSlug}/settings/hotels",
    icon: Building2,
  },
  { label: "Users & Staff", href: "/{orgSlug}/settings/users", icon: Users },
  { label: "Roles", href: "/{orgSlug}/settings/roles", icon: Settings },
] as const;
