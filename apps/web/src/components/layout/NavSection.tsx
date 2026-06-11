"use client";

import { useState, useEffect, useCallback, Children, isValidElement } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavSectionProps {
  label: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}

function hasActiveChild(
  children: React.ReactNode,
  currentPath: string,
): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (found) return;
    if (isValidElement<{ href?: string }>(child) && child.props.href) {
      const href = child.props.href as string;
      if (currentPath === href || currentPath.startsWith(href + "/")) {
        found = true;
      }
    }
  });
  return found;
}

function hasVisibleChildren(
  children: React.ReactNode,
  user: { isSuperAdmin: boolean; permissions: string[] } | null,
): boolean {
  let count = 0;
  Children.forEach(children, (child) => {
    if (count > 0) return;
    if (!isValidElement<{ permission?: string; disabled?: boolean }>(child)) {
      if (child !== null && child !== undefined && child !== false) count++;
      return;
    }
    if (child.props.disabled) return;
    if (!child.props.permission) { count++; return; }
    if (!user) return;
    if (user.isSuperAdmin) { count++; return; }
    if (user.permissions.includes(child.props.permission)) count++;
  });
  return count > 0;
}

export function NavSection({
  label,
  icon: Icon,
  defaultOpen,
  children,
  disabled,
}: NavSectionProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const storageKey = `hms_nav_section_${label}`;

  const hasActive = hasActiveChild(children, pathname);

  const [open, setOpen] = useState(() => {
    if (hasActive) return true;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) return stored === "true";
    }
    return defaultOpen ?? false;
  });

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  const handleOpenChange = useCallback(
    (val: boolean) => {
      setOpen(val);
      try {
        localStorage.setItem(storageKey, String(val));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  if (!hasVisibleChildren(children, user)) return null;

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger
        className={cn(
          "flex items-center w-full gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
          "hover:text-foreground transition-colors rounded-md",
          disabled && "opacity-50 pointer-events-none",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-6 space-y-0.5 pb-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
