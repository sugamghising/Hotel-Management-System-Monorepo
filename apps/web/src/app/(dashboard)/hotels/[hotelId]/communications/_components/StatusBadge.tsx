"use client";

import type { CommunicationStatus } from "@/lib/hooks/useCommunications";
import {
  Clock,
  Send,
  CheckCheck,
  MailOpen,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

const statusConfig: Record<
  CommunicationStatus,
  { icon: LucideIcon; className: string; label: string }
> = {
  PENDING: { icon: Clock, className: "bg-gray-100 text-gray-600", label: "Pending" },
  QUEUED: { icon: Clock, className: "bg-gray-100 text-gray-600", label: "Queued" },
  SENT: { icon: Send, className: "bg-blue-100 text-blue-600", label: "Sent" },
  DELIVERED: {
    icon: CheckCheck,
    className: "bg-green-100 text-green-600",
    label: "Delivered",
  },
  OPENED: {
    icon: MailOpen,
    className: "bg-teal-100 text-teal-600",
    label: "Opened",
  },
  FAILED: { icon: XCircle, className: "bg-red-100 text-red-600", label: "Failed" },
  BOUNCED: {
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-600",
    label: "Bounced",
  },
};

export function StatusBadge({
  status,
  size = 14,
}: {
  status: CommunicationStatus;
  size?: number;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <Icon size={size} />
      {config.label}
    </span>
  );
}
