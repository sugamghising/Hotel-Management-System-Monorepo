"use client";

import type { Communication } from "@/lib/hooks/useCommunications";
import { useResendCommunication } from "@/lib/hooks/useCommunications";
import { usePermission } from "@/lib/hooks/usePermission";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { ChannelIcon } from "./ChannelIcon";
import { StatusBadge } from "./StatusBadge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RotateCcw, Send, CheckCheck, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  comm: Communication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunicationDetailSheet({ comm, open, onOpenChange }: Props) {
  const canResend = usePermission("COMMUNICATION.SEND");
  const resendMutation = useResendCommunication();

  if (!comm) return null;

  const hasDelivered = !!comm.deliveredAt;
  const hasOpened = !!comm.openedAt;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ChannelIcon channel={comm.channel} showLabel />
            <StatusBadge status={comm.status} />
          </div>
          <SheetTitle className="text-left">
            {comm.subject ?? "Communication Detail"}
          </SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
          <MetaItem label="To" value={comm.toAddress ?? "—"} />
          <MetaItem label="From" value={comm.fromAddress ?? "—"} />
          <MetaItem
            label="Sent"
            value={comm.sentAt ? formatDateTime(comm.sentAt) : "—"}
          />
          <MetaItem
            label="Delivered"
            value={comm.deliveredAt ? formatDateTime(comm.deliveredAt) : "—"}
          />
          <MetaItem
            label="Opened"
            value={comm.openedAt ? formatDateTime(comm.openedAt) : "—"}
          />
          <MetaItem
            label="Type"
            value={comm.type.replace(/_/g, " ")}
          />
          <MetaItem
            label="Template"
            value={comm.templateName ?? "Custom"}
          />
          <MetaItem
            label="Reservation"
            value={comm.confirmationNumber ?? "—"}
          />
        </div>

        {comm.subject && (
          <h3 className="font-semibold text-base mb-2">{comm.subject}</h3>
        )}

        <div className="bg-muted rounded p-4 font-mono text-sm max-h-[300px] overflow-y-auto mb-6 whitespace-pre-wrap">
          {comm.content}
        </div>

        {comm.channel === "EMAIL" && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Delivery Timeline</h4>
            <div className="flex items-center gap-2">
              <TimelineStep
                icon={Send}
                label="Sent"
                active
                done
              />
              <div className="h-px flex-1 bg-border" />
              <TimelineStep
                icon={CheckCheck}
                label="Delivered"
                active={hasDelivered}
                done={hasDelivered}
              />
              <div className="h-px flex-1 bg-border" />
              <TimelineStep
                icon={MailOpen}
                label="Opened"
                active={hasOpened}
                done={hasOpened}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t">
          {canResend &&
            (comm.status === "FAILED" || comm.status === "BOUNCED") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => resendMutation.mutate({ communicationId: comm.id })}
                disabled={resendMutation.isPending}
              >
                <RotateCcw size={14} className="mr-2" />
                {resendMutation.isPending ? "Resending…" : "Resend"}
              </Button>
            )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}

function TimelineStep({
  icon: Icon,
  label,
  active,
  done,
}: {
  icon: typeof Send;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <div
        className={cn(
          "rounded-full p-1.5",
          done
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon size={16} />
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
}
