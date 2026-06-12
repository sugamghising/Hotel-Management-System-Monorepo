"use client";

import type { Communication } from "@/lib/hooks/useCommunications";
import { formatDate } from "@/lib/utils/formatters";
import { ChannelIcon } from "./ChannelIcon";
import { StatusBadge } from "./StatusBadge";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

interface Props {
  comm: Communication;
  canResend: boolean;
  onResend: (id: string) => void;
  onClick: (id: string) => void;
}

export function CommunicationRow({ comm, canResend, onResend, onClick }: Props) {
  const subjectPreview =
    comm.subject ?? (comm.content.length > 50
      ? comm.content.slice(0, 50) + "…"
      : comm.content);

  return (
    <tr
      className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
      onClick={() => onClick(comm.id)}
    >
      <td className="py-3 px-4">
        <ChannelIcon channel={comm.channel} showLabel />
      </td>
      <td className="py-3 px-4">
        <div className="font-medium text-sm">{comm.guestName ?? "—"}</div>
        {comm.guestEmail && (
          <div className="text-xs text-muted-foreground">{comm.guestEmail}</div>
        )}
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {comm.type.replace(/_/g, " ")}
        </span>
      </td>
      <td className="py-3 px-4 text-sm max-w-[200px] truncate">
        {subjectPreview}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={comm.status} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(comm.sentAt ?? comm.createdAt)}
      </td>
      <td className="py-3 px-4 text-sm whitespace-nowrap">
        {comm.confirmationNumber ? (
          <span className="font-mono text-xs">{comm.confirmationNumber}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {canResend && (comm.status === "FAILED" || comm.status === "BOUNCED") && (
            <Tooltip content="Resend">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onResend(comm.id)}
              >
                <RotateCcw size={14} />
              </Button>
            </Tooltip>
          )}
        </div>
      </td>
    </tr>
  );
}
