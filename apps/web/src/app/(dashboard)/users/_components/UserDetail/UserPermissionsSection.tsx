"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserPermissionsSectionProps {
  permissions: string[] | undefined;
  isLoading: boolean;
}

export function UserPermissionsSection({
  permissions,
  isLoading,
}: UserPermissionsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const grouped = useMemo(() => {
    if (!permissions) return [];
    const map = new Map<string, string[]>();
    for (const perm of permissions) {
      const prefix = perm.includes(".") ? perm.split(".")[0] : "OTHER";
      if (!map.has(prefix)) map.set(prefix, []);
      map.get(prefix)!.push(perm);
    }
    return Array.from(map.entries())
      .map(([group, perms]) => ({
        group,
        permissions: perms.sort(),
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }, [permissions]);

  return (
    <div>
      <button
        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-full mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Effective Permissions
        {permissions && (
          <span className="text-[10px] font-normal text-muted-foreground ml-1">
            ({permissions.length})
          </span>
        )}
      </button>

      {expanded && (
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground italic">Loading...</p>
          ) : !permissions || permissions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No permissions — assign a role first.
            </p>
          ) : (
            grouped.map(({ group, permissions: perms }) => (
              <div key={group}>
                <p className="text-[11px] font-medium text-muted-foreground mb-1">
                  {group}
                </p>
                <div className="flex flex-wrap gap-1">
                  {perms.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      className="text-[10px] font-mono bg-muted/30 px-1.5 py-0"
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
