"use client";

import { useState, useEffect, useCallback, Children, isValidElement } from "react";
import { usePathname } from "next/navigation";
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

function countVisibleChildren(children: React.ReactNode): number {
  let count = 0;
  Children.forEach(children, (child) => {
    if (child !== null && child !== undefined && child !== false) {
      count++;
    }
  });
  return count;
}

export function NavSection({
  label,
  icon: Icon,
  defaultOpen,
  children,
  disabled,
}: NavSectionProps) {
  const pathname = usePathname();
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

  const visibleCount = countVisibleChildren(children);
  if (visibleCount === 0) return null;

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
