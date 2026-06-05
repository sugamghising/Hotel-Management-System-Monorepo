"use client";

import { cn } from "@/lib/utils";
import { HK_STATUS_MAP } from "@/lib/constants/statuses";

interface TaskStatusBadgeProps {
  status: string;
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = HK_STATUS_MAP[status as keyof typeof HK_STATUS_MAP];
  if (!config) {
    return (
      <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}>
        {status}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.color, className)}>
      {config.label}
    </span>
  );
}
