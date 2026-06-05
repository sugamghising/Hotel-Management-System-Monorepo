"use client";

import { cn } from "@/lib/utils";
import type { MaintenanceRequestType } from "@/lib/hooks/useMaintenanceRequests";

const TYPE_MAP: Record<MaintenanceRequestType, { label: string; color: string }> = {
  PLUMBING: { label: "Plumbing", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/30 dark:text-blue-300" },
  ELECTRICAL: { label: "Electrical", color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/30 dark:text-yellow-300" },
  HVAC: { label: "HVAC", color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/30 dark:text-cyan-300" },
  FURNITURE: { label: "Furniture", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/30 dark:text-amber-300" },
  APPLIANCE: { label: "Appliance", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/30 dark:text-orange-300" },
  STRUCTURAL: { label: "Structural", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/30 dark:text-purple-300" },
  CLEANING: { label: "Cleaning", color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/30 dark:text-teal-300" },
  PEST_CONTROL: { label: "Pest", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/30 dark:text-red-300" },
  SECURITY: { label: "Security", color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/30 dark:text-slate-300" },
  GENERAL: { label: "General", color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/30 dark:text-gray-300" },
};

interface RequestTypeBadgeProps {
  requestType: MaintenanceRequestType;
  className?: string;
}

export function RequestTypeBadge({ requestType, className }: RequestTypeBadgeProps) {
  const config = TYPE_MAP[requestType];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config?.color, className)}>
      {config?.label ?? requestType}
    </span>
  );
}

export const REQUEST_TYPE_OPTIONS = Object.entries(TYPE_MAP).map(([value, c]) => ({
  value,
  label: c.label,
}));
