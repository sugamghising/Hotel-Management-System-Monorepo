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
  UserCog,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string | null;
  badge?: string;
}

export const buildNav = (orgId: string, hotelId: string): NavItem[] => [
  {
    label: "Dashboard",
    href: `/hotels/${hotelId}`,
    icon: LayoutDashboard,
    permission: null,
  },
  {
    label: "Reservations",
    href: `/hotels/${hotelId}/reservations`,
    icon: CalendarCheck,
    permission: "RESERVATION.READ",
  },
  {
    label: "Rooms",
    href: `/hotels/${hotelId}/rooms/grid`,
    icon: BedDouble,
    permission: "ROOM.READ",
  },
  {
    label: "Guests",
    href: `/hotels/${hotelId}/guests`,
    icon: Users,
    permission: "GUEST.READ",
  },
  {
    label: "Housekeeping",
    href: `/hotels/${hotelId}/housekeeping`,
    icon: ClipboardList,
    permission: "HOUSEKEEPING.READ",
  },
  {
    label: "Maintenance",
    href: `/hotels/${hotelId}/maintenance`,
    icon: Wrench,
    permission: "MAINTENANCE.READ",
  },
  {
    label: "POS",
    href: `/hotels/${hotelId}/pos`,
    icon: Coffee,
    permission: null,
  },
  {
    label: "Inventory",
    href: `/hotels/${hotelId}/inventory`,
    icon: Package,
    permission: null,
  },
  {
    label: "Night Audit",
    href: `/hotels/${hotelId}/night-audit`,
    icon: Moon,
    permission: "NIGHT_AUDIT.PRE_CHECK",
  },
  {
    label: "Reports",
    href: `/hotels/${hotelId}/reports`,
    icon: BarChart3,
    permission: "REPORT.OCCUPANCY",
  },
  {
    label: "Channels",
    href: `/hotels/${hotelId}/channels`,
    icon: Radio,
    permission: null,
  },
];

export const buildSettingsNav = (orgId: string) => [
  { label: "Hotels", href: `/settings/hotels`, icon: Building2 },
  { label: "Users", href: `/settings/users`, icon: UserCog },
  { label: "Roles", href: `/settings/roles`, icon: ShieldCheck },
];
