"use client";

import { cn } from "@/lib/utils";
import type { MaintenancePriority } from "@/lib/hooks/useMaintenanceRequests";

const PRIORITY_CONFIG: Record<MaintenancePriority, { label: string; classes: string }> = {
  LOW: { label: "Low", classes: "bg-gray-100 text-gray-600 border-gray-200" },
  MEDIUM: { label: "Medium", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  HIGH: { label: "High", classes: "bg-orange-50 text-orange-800 border-orange-200" },
  URGENT: { label: "Urgent", classes: "bg-red-50 text-red-700 border-red-200" },
  EMERGENCY: {
    label: "EMERGENCY",
    classes: "bg-red-600 text-white border-red-600 animate-pulse",
  },
};

interface PriorityBadgeProps {
  priority: MaintenancePriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const isEmergency = priority === "EMERGENCY";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config?.classes,
        isEmergency && "shadow-sm",
        className,
      )}
    >
      {isEmergency && <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-200" />
      </span>}
      {config?.label ?? priority}
    </span>
  );
}

export const PRIORITY_OPTIONS: { value: MaintenancePriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
  { value: "EMERGENCY", label: "Emergency" },
];

export const PRIORITY_SORT_ORDER: Record<MaintenancePriority, number> = {
  EMERGENCY: 0,
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};
