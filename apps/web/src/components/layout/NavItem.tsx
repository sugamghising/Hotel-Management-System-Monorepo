"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  badge?: string | number;
  disabled?: boolean;
  sublabel?: string;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  permission,
  badge: badgeCount,
  disabled,
  sublabel,
}: NavItemProps) {
  const pathname = usePathname();
  const isSuperAdmin = useAuthStore((s) => s.user?.isSuperAdmin);

  const hasPermission = usePermission(permission ?? "");
  const canSee = !permission || isSuperAdmin || hasPermission;

  if (!canSee) return null;

  const isDashboard = href === pathname.split("/").slice(0, 3).join("/");
  const isActive = disabled
    ? false
    : isDashboard
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        "group relative",
        isActive
          ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary -ml-px"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {sublabel && (
        <span className="text-[10px] text-muted-foreground hidden lg:block">
          {sublabel}
        </span>
      )}
      {badgeCount !== undefined && Number(badgeCount) > 0 && (
        <Badge
          variant="destructive"
          className="h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
        >
          {badgeCount}
        </Badge>
      )}
    </div>
  );

  if (disabled) {
    return (
      <Tooltip content="Select a hotel first" side="right">
        <span tabIndex={0} className="block">{content}</span>
      </Tooltip>
    );
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
