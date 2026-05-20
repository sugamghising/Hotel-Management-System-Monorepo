import { cn } from "@/lib/utils/formatters";
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
  size?: "sm" | "md";
}

export function StatusBadge({ label, color, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        color,
      )}
    >
      {label}
    </span>
  );
}

export const ReservationBadge = ({
  status,
}: {
  status: keyof typeof RESERVATION_STATUS_MAP;
}) => {
  const cfg = RESERVATION_STATUS_MAP[status];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
};

export const HKBadge = ({ status }: { status: keyof typeof HK_STATUS_MAP }) => {
  const cfg = HK_STATUS_MAP[status];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
};

export const MaintenanceBadge = ({
  status,
}: {
  status: keyof typeof MAINTENANCE_STATUS_MAP;
}) => {
  const cfg = MAINTENANCE_STATUS_MAP[status];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
};

export const PriorityBadge = ({
  priority,
}: {
  priority: keyof typeof PRIORITY_MAP;
}) => {
  const cfg = PRIORITY_MAP[priority];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
};

export const VIPBadge = ({ status }: { status: keyof typeof VIP_MAP }) => {
  const cfg = VIP_MAP[status];
  return <StatusBadge label={cfg.label} color={cfg.color} />;
};
