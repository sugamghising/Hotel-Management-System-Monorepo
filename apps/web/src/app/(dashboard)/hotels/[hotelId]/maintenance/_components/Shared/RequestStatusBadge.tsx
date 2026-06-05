"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { MAINTENANCE_STATUS_MAP } from "@/lib/constants/statuses";

interface RequestStatusBadgeProps {
  status: string;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const config = MAINTENANCE_STATUS_MAP[status as keyof typeof MAINTENANCE_STATUS_MAP];
  const isVerified = status === "VERIFIED";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config?.color,
        className,
      )}
    >
      {isVerified && <Check className="h-3 w-3" />}
      {config?.label ?? status}
    </span>
  );
}

export const STATUS_OPTIONS = Object.entries(MAINTENANCE_STATUS_MAP).map(([value, c]) => ({
  value,
  label: c.label,
}));
