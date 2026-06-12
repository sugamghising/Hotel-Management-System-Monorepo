"use client";

import type { CommunicationChannel } from "@/lib/hooks/useCommunications";
import { Mail, MessageSquare, MessageCircle, Bell } from "lucide-react";

const channelConfig: Record<
  CommunicationChannel,
  { icon: typeof Mail; className: string; label: string }
> = {
  EMAIL: {
    icon: Mail,
    className: "text-blue-600 bg-blue-100",
    label: "Email",
  },
  SMS: {
    icon: MessageSquare,
    className: "text-green-600 bg-green-100",
    label: "SMS",
  },
  WHATSAPP: {
    icon: MessageCircle,
    className: "text-emerald-600 bg-emerald-100",
    label: "WhatsApp",
  },
  PUSH: {
    icon: Bell,
    className: "text-purple-600 bg-purple-100",
    label: "Push",
  },
};

export function ChannelIcon({
  channel,
  showLabel,
  size = 16,
}: {
  channel: CommunicationChannel;
  showLabel?: boolean;
  size?: number;
}) {
  const config = channelConfig[channel];
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center rounded-md p-0.5 ${config.className}`}
      >
        <Icon size={size} />
      </span>
      {showLabel && (
        <span className="text-sm font-medium">{config.label}</span>
      )}
    </span>
  );
}
