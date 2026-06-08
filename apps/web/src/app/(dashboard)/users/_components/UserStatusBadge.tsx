import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  PENDING_VERIFICATION: "bg-yellow-50 text-yellow-700 border-yellow-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  SUSPENDED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PENDING_VERIFICATION: "Pending",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
};

interface UserStatusBadgeProps {
  status: string;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", STATUS_STYLES[status] ?? "")}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
