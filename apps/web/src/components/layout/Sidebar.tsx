"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { buildNav, buildSettingsNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { formatInitials } from "@/lib/utils/formatters";
import {
  Building2,
  ChevronDown,
  LogOut,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api/modules/auth";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    activeHotel,
    organizationId,
    organizationCode,
    logout,
    hasPermission,
  } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = buildNav(organizationId ?? "", activeHotel?.id ?? "");
  const settingsItems = buildSettingsNav(organizationId ?? "");

  const visibleNav = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    router.replace("/login");
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  if (!mounted) {
    return <aside className={cn("flex flex-col shrink-0 h-screen sticky top-0", "bg-sidebar-bg border-r border-sidebar-border", collapsed ? "w-16" : "w-64")} />;
  }

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 h-screen sticky top-0",
        "bg-sidebar-bg border-r border-sidebar-border",
        "transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {activeHotel?.name ?? "Select Hotel"}
              </p>
              <p className="text-xs text-sidebar-text-muted truncate">
                {organizationCode}
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center mx-auto">
            <Building2 className="w-4 h-4 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-sidebar-text-muted hover:text-white hover:bg-sidebar-hover ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                "transition-colors duration-100",
                active
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-white",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings section */}
      {!collapsed && (
        <div className="px-2 py-2 border-t border-sidebar-border">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm
                       text-sidebar-text-muted hover:text-white hover:bg-sidebar-hover
                       transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                settingsOpen && "rotate-180",
              )}
            />
          </button>
          {settingsOpen && (
            <div className="mt-0.5 space-y-0.5 pl-2">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm",
                      "text-sidebar-text-muted hover:text-white hover:bg-sidebar-hover transition-colors",
                      isActive(item.href) && "bg-sidebar-active text-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* User footer */}
      <div
        className={cn(
          "p-2 border-t border-sidebar-border",
          collapsed && "flex justify-center",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2.5 w-full px-2 py-2 rounded-md",
                "hover:bg-sidebar-hover transition-colors",
                collapsed && "justify-center w-auto",
              )}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                  {user ? formatInitials(user.firstName, user.lastName) : "??"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-sidebar-text-muted truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Change Password</DropdownMenuItem>
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
    </aside>
  );
}
