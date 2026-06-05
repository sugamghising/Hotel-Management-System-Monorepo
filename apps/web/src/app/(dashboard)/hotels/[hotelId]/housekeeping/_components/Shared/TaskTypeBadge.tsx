"use client";

import { cn } from "@/lib/utils";
import type { HousekeepingType } from "@/lib/hooks/useMaintenance";

const TASK_TYPE_MAP: Record<HousekeepingType, { label: string; color: string }> = {
  CLEANING_DEPARTURE: {
    label: "Departure Clean",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/30 dark:text-blue-300",
  },
  CLEANING_STAYOVER: {
    label: "Stayover Clean",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/30 dark:text-emerald-300",
  },
  CLEANING_TOUCHUP: {
    label: "Touchup",
    color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/30 dark:text-teal-300",
  },
  DEEP_CLEAN: {
    label: "Deep Clean",
    color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/30 dark:text-violet-300",
  },
  TURNDOWN_SERVICE: {
    label: "Turndown",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/30 dark:text-rose-300",
  },
  INSPECTION: {
    label: "Inspection",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/30 dark:text-amber-300",
  },
  SPECIAL_REQUEST: {
    label: "Special Request",
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/30 dark:text-purple-300",
  },
};

interface TaskTypeBadgeProps {
  taskType: HousekeepingType;
  className?: string;
}

export function TaskTypeBadge({ taskType, className }: TaskTypeBadgeProps) {
  const config = TASK_TYPE_MAP[taskType];
  if (!config) {
    return (
      <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}>
        {taskType}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.color, className)}>
      {config.label}
    </span>
  );
}

export const TASK_TYPE_OPTIONS = Object.entries(TASK_TYPE_MAP).map(([value, config]) => ({
  value,
  label: config.label,
}));
