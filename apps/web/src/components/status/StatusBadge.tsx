import { cn } from "@/lib/utils";
import {
  RESERVATION_STATUS_MAP,
  ROOM_STATUS_MAP,
  HK_STATUS_MAP,
  MAINTENANCE_STATUS_MAP,
  PRIORITY_MAP,
  VIP_MAP,
} from "@/lib/constants/statuses";

interface StatusBadgeProps {
  label: string;
  color: string;
  dot?: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export function StatusBadge({
  label,
  color,
  dot,
  size = "md",
  showDot = false,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-0.5 text-xs",
        size === "lg" && "px-3 py-1 text-sm",
        color,
      )}
    >
      {showDot && dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
      )}
      {label}
    </span>
  );
}

// Typed badge for each domain
export function ReservationBadge({
  status,
  size,
}: {
  status: keyof typeof RESERVATION_STATUS_MAP;
  size?: "sm" | "md" | "lg";
}) {
  const cfg = RESERVATION_STATUS_MAP[status];
  return (
    <StatusBadge
      label={cfg.label}
      color={cfg.color}
      dot={cfg.dot}
      showDot
      size={size}
    />
  );
}

export function HKBadge({ status }: { status: keyof typeof HK_STATUS_MAP }) {
  const cfg = HK_STATUS_MAP[status];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
}

export function MaintenanceBadge({
  status,
}: {
  status: keyof typeof MAINTENANCE_STATUS_MAP;
}) {
  const cfg = MAINTENANCE_STATUS_MAP[status];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
}

export function PriorityBadge({
  priority,
}: {
  priority: keyof typeof PRIORITY_MAP;
}) {
  const cfg = PRIORITY_MAP[priority];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
}

export function VIPBadge({ status }: { status: keyof typeof VIP_MAP }) {
  const cfg = VIP_MAP[status];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
}

export function RoomStatusDot({
  status,
}: {
  status: keyof typeof ROOM_STATUS_MAP;
}) {
  const cfg = ROOM_STATUS_MAP[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={cn("h-2 w-2 rounded-full", cfg.bg)} />
      {cfg.label}
    </span>
  );
}
