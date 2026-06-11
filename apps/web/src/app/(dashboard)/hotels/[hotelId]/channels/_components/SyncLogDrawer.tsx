"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useChannelSyncLogs, useChannels } from "@/lib/hooks/useChannelManager";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface SyncLogDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const SYNC_TYPE_LABELS: Record<string, string> = {
  AVAILABILITY: "Availability",
  RATES: "Rates",
  BOOKINGS: "Bookings",
  FULL: "Full Sync",
};

const STATUS_CONFIG = {
  SUCCESS: { icon: CheckCircle, className: "text-green-600" },
  FAILED: { icon: XCircle, className: "text-red-600" },
  PARTIAL: { icon: AlertCircle, className: "text-yellow-600" },
};

export function SyncLogDrawer({ open, onOpenChange }: SyncLogDrawerProps) {
  const { activeHotel } = useAuthStore();
  const hotelId = activeHotel?.id ?? "";
  const [channelFilter, setChannelFilter] = useState<string>("all");

  const { data: channels } = useChannels(hotelId);
  const { data: syncLogs, isLoading } = useChannelSyncLogs(
    hotelId,
    channelFilter === "all" ? undefined : channelFilter,
    open,
  );

  const logs = syncLogs?.logs ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>Sync Log</SheetTitle>
          <SheetDescription>
            Recent sync activity across all channels.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-3">
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="All channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {channels?.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.channelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}

          {!isLoading && logs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sync logs yet.
            </p>
          )}

          {logs.map((log) => {
            const STATUS = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.SUCCESS;
            const Icon = STATUS.icon;
            const duration =
              log.durationMs != null
                ? log.durationMs < 1000
                  ? `${log.durationMs}ms`
                  : `${(log.durationMs / 1000).toFixed(1)}s`
                : null;

            return (
              <div
                key={log.id}
                className="border rounded-lg p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", STATUS.className)} />
                    <span className="text-xs font-medium">
                      {SYNC_TYPE_LABELS[log.syncType] ?? log.syncType}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] h-4 px-1",
                        log.status === "SUCCESS" &&
                          "bg-green-50 text-green-700 border-green-200",
                        log.status === "FAILED" &&
                          "bg-red-50 text-red-700 border-red-200",
                        log.status === "PARTIAL" &&
                          "bg-yellow-50 text-yellow-700 border-yellow-200",
                      )}
                    >
                      {log.status}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(log.startedAt), "MMM d, HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{log.channelName}</span>
                  {duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {duration}
                    </span>
                  )}
                  <span>
                    {log.recordsPushed} pushed, {log.recordsFailed} failed
                  </span>
                </div>
                {log.errorMessage && (
                  <p className="text-[10px] text-red-600 truncate">
                    {log.errorMessage}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
