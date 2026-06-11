"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { useToggleChannel, useSyncChannel, useDisconnectChannel, type Channel, type ChannelCode } from "@/lib/hooks/useChannelManager";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatRelative } from "date-fns";
import { ConnectChannelDialog } from "./ConnectChannelDialog";
import { EditChannelDialog } from "./EditChannelDialog";
import { Loader2, RefreshCw, Settings, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface SupportedChannel {
  code: ChannelCode;
  name: string;
  icon: string;
  color: string;
}

interface ChannelCardProps {
  supported: SupportedChannel;
  channel: Channel | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  CONNECTED: { label: "Connected", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DISCONNECTED: { label: "Not connected", className: "bg-gray-100 text-gray-600 border-gray-200" },
  ERROR: { label: "Error", className: "bg-red-50 text-red-700 border-red-200" },
  PENDING: { label: "Connecting...", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  RATE_LIMITED: { label: "Rate limited", className: "bg-orange-50 text-orange-700 border-orange-200" },
};

export function ChannelCard({ supported, channel }: ChannelCardProps) {
  const { activeHotel } = useAuthStore();
  const hotelId = activeHotel?.id ?? "";
  const [connectOpen, setConnectOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);

  const canCreate = usePermission("CHANNEL.CREATE");
  const canUpdate = usePermission("CHANNEL.UPDATE");
  const canDelete = usePermission("CHANNEL.DELETE");

  const { mutate: toggleChannel, isPending: toggling } = useToggleChannel();
  const { mutate: syncChannel, isPending: syncing } = useSyncChannel();
  const { mutate: disconnectChannel, isPending: disconnecting } = useDisconnectChannel();

  const isConnected = channel?.status === "CONNECTED";
  const isError = channel?.status === "ERROR";
  const statusCfg = channel ? STATUS_CONFIG[channel.status] ?? STATUS_CONFIG.DISCONNECTED : null;

  const cardClasses = cn(
    "border rounded-lg p-4 transition-all",
    isConnected && "hover:shadow-md border-border",
    isError && "border-destructive/50 bg-destructive/5",
    !channel && "border-dashed opacity-70",
  );

  const lastSync = channel?.lastSyncAt
    ? formatRelative(new Date(channel.lastSyncAt), new Date())
    : null;

  return (
    <>
      <div className={cardClasses}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                supported.color,
              )}
            >
              {supported.icon}
            </div>
            <div>
              <p className="text-sm font-semibold">{supported.name}</p>
              {!channel && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Connect to manage distribution
                </p>
              )}
            </div>
          </div>
          {statusCfg && (
            <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 shrink-0", statusCfg.className)}>
              {statusCfg.label}
            </Badge>
          )}
        </div>

        {channel && isConnected && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {channel.lastSyncStatus === "SUCCESS" && <CheckCircle className="h-3 w-3 text-green-500" />}
                {channel.lastSyncStatus === "FAILED" && <XCircle className="h-3 w-3 text-red-500" />}
                {channel.lastSyncStatus === "PARTIAL" && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                {lastSync ? `Synced ${lastSync}` : "Never synced"}
              </span>
              <span>{channel.totalBookings} bookings received</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={channel.isActive}
                  onCheckedChange={(v) =>
                    toggleChannel({ hotelId, channelId: channel.id, isActive: v })
                  }
                  disabled={toggling || !canUpdate}
                />
                <span className="text-xs text-muted-foreground">
                  {channel.isActive ? "Active" : "Paused"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Tooltip content={syncing ? "Syncing..." : "Sync Now"}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={syncing || !canUpdate}
                  onClick={() => syncChannel({ hotelId, channelId: channel.id })}
                >
                  {syncing ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Sync Now
                </Button>
              </Tooltip>
              {canUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setEditOpen(true)}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              )}
              {canDelete && (
                <AlertDialog
                  open={disconnectConfirmOpen}
                  onOpenChange={setDisconnectConfirmOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect {supported.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will stop all syncing with this channel. Connected mappings
                        will be preserved but deactivated.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={disconnecting}
                        onClick={() => {
                          disconnectChannel({ hotelId, channelId: channel.id });
                          setDisconnectConfirmOpen(false);
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {disconnecting ? "Disconnecting..." : "Disconnect"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}

        {channel && isError && channel.lastSyncError && (
          <div className="mt-3 p-2 rounded bg-red-50 border border-red-200">
            <p className="text-[11px] text-red-700 truncate">{channel.lastSyncError}</p>
          </div>
        )}

        {!channel && canCreate && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 h-7 text-xs"
            onClick={() => setConnectOpen(true)}
          >
            Connect
          </Button>
        )}
      </div>

      {connectOpen && (
        <ConnectChannelDialog
          open={connectOpen}
          onOpenChange={setConnectOpen}
          channelCode={supported.code}
          channelName={supported.name}
        />
      )}

      {editOpen && channel && (
        <EditChannelDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          channel={channel}
        />
      )}
    </>
  );
}
