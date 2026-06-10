"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { cn } from "@/lib/utils";
import { formatInitials } from "@/lib/utils/formatters";
import { NavItem } from "./NavItem";
import { NavSection } from "./NavSection";
import { HotelSelector } from "./HotelSelector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api/modules/auth";
import {
  Building2,
  Users,
  UserCog,
  LayoutDashboard,
  ConciergeBell,
  CalendarCheck,
  UserPlus,
  BedDouble,
  LayoutGrid,
  Sparkles,
  Wrench,
  Receipt,
  MoonStar,
  BarChart3,
  UtensilsCrossed,
  ShoppingCart,
  TrendingUp,
  Tag,
  Settings,
  Hotel,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SidebarContentProps {
  onNavClick?: () => void;
}

export function SidebarContent({ onNavClick }: SidebarContentProps) {
  const { user, activeHotel, organizationCode, logout } = useAuthStore();
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const hotelId = activeHotel?.id ?? "";
  const base = hotelId ? `/hotels/${hotelId}` : "";
  const hasHotel = !!activeHotel;

  const handleLogout = useCallback(async () => {
    await authApi.logout();
    logout();
    router.replace("/login");
  }, [logout, router]);

  const linkClick = onNavClick ?? (() => {});

  return (
    <div className="flex flex-col h-full">
      {/* Logo + org name — fixed ~56px */}
      <div className="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <Link href="/" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
            HMS
          </Link>
          <p className="text-[10px] text-muted-foreground truncate leading-tight">
            {organizationCode ?? ""}
          </p>
        </div>
      </div>

      {/* Hotel Selector */}
      <HotelSelector />

      {/* Nav — fills remaining height */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1">
        {/* ZONE A — org-scoped */}
        <div className="space-y-0.5">
          <NavItem
            href="/guests"
            label="Guests"
            icon={Users}
            permission="GUEST.READ"
            disabled={false}
          />
          <NavItem
            href="/users"
            label="Users & Staff"
            icon={UserCog}
            permission="USER.VIEW"
            disabled={false}
          />
        </div>

        <Separator className="my-2" />

        {/* ZONE B — hotel-scoped */}
        <div className="space-y-0.5">
          <NavItem
            href={base || "#"}
            label="Dashboard"
            icon={LayoutDashboard}
            disabled={!hasHotel}
          />

          <NavSection
            label="Front Desk"
            icon={ConciergeBell}
            disabled={!hasHotel}
          >
            <NavItem
              href={`${base}/reservations`}
              label="Reservations"
              icon={CalendarCheck}
              permission="RESERVATION.READ"
              disabled={!hasHotel}
            />
            <NavItem
              href={`${base}/reservations/new`}
              label="Walk-in"
              icon={UserPlus}
              permission="RESERVATION.CREATE"
              disabled={!hasHotel}
              sublabel="New walk-in"
            />
          </NavSection>

          <NavSection
            label="Rooms"
            icon={BedDouble}
            disabled={!hasHotel}
          >
            <NavItem
              href={`${base}/rooms/grid`}
              label="Room Status"
              icon={LayoutGrid}
              permission="ROOM.READ"
              disabled={!hasHotel}
            />
            <NavItem
              href={`${base}/housekeeping`}
              label="Housekeeping"
              icon={Sparkles}
              permission="HOUSEKEEPING.READ"
              disabled={!hasHotel}
            />
            <NavItem
              href={`${base}/maintenance`}
              label="Maintenance"
              icon={Wrench}
              permission="MAINTENANCE.READ"
              disabled={!hasHotel}
            />
          </NavSection>

          <NavSection
            label="Finance"
            icon={Receipt}
            disabled={!hasHotel}
          >
            <NavItem
              href={`${base}/night-audit`}
              label="Night Audit"
              icon={MoonStar}
              permission="NIGHT_AUDIT.VIEW_STATUS"
              disabled={!hasHotel}
            />
            <NavItem
              href={`${base}/reports`}
              label="Reports"
              icon={BarChart3}
              permission="REPORT.OCCUPANCY"
              disabled={!hasHotel}
            />
          </NavSection>

          <NavSection
            label="Restaurant"
            icon={UtensilsCrossed}
            disabled={!hasHotel}
          >
            <NavItem
              href={`${base}/pos`}
              label="POS / Orders"
              icon={ShoppingCart}
              permission="POS.READ_ORDER"
              disabled={!hasHotel}
            />
          </NavSection>

          <NavSection
            label="Revenue"
            icon={TrendingUp}
            disabled={!hasHotel}
          >
            <NavItem
              href={`${base}/rate-plans`}
              label="Rate Plans"
              icon={Tag}
              permission="RATE_PLAN.READ"
              disabled={!hasHotel}
            />
          </NavSection>
        </div>

        <Separator className="my-2" />

        {/* Settings section */}
        <NavSection
          label="Settings"
          icon={Settings}
          defaultOpen={false}
          disabled={false}
        >
          <NavItem
            href={hasHotel ? `${base}/settings` : "#"}
            label="Hotel Settings"
            icon={Hotel}
            permission="HOTEL.SETTINGS_UPDATE"
            disabled={!hasHotel}
          />
          <NavItem
            href="/settings"
            label="Organization"
            icon={Building2}
            permission="ORGANIZATION.READ"
            disabled={false}
          />
        </NavSection>
      </div>

      {/* User footer — fixed bottom */}
      <div className="p-2 border-t shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md hover:bg-accent transition-colors">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {user ? formatInitials(user.firstName, user.lastName) : "??"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left flex-1">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
            >
              Organization Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-background border-r w-60" />
    );
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 h-screen sticky top-0",
        "bg-background border-r transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Collapse toggle */}
      <div
        className={cn(
          "flex items-center h-14 shrink-0 border-b px-3",
          collapsed && "justify-center",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">HMS</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          <SidebarContent />
        </div>
      )}
    </aside>
  );
}
