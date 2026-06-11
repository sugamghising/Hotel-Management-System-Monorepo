"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  useChannels,
  usePushAvailability,
  type Channel,
} from "@/lib/hooks/useChannelManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Info } from "lucide-react";
import { format } from "date-fns";

export function PushTab() {
  const { activeHotel } = useAuthStore();
  const hotelId = activeHotel?.id ?? "";

  const { data: channels } = useChannels(hotelId);
  const { mutate: push, isPending } = usePushAvailability();

  const connectedChannels = (channels ?? []).filter(
    (c) => c.status === "CONNECTED" && c.isActive,
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const nextWeek = format(
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd",
  );

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(nextWeek);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedChannels(connectedChannels.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedChannels([]);
  };

  const handlePush = () => {
    push({
      hotelId,
      input: {
        dateFrom,
        dateTo,
        channelIds: selectedChannels.length > 0 ? selectedChannels : undefined,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          Push current availability and rates to selected channels. This
          overrides the channel&apos;s existing data for the selected date
          range.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium">From date</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">To date</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium">Target channels</Label>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-[10px] text-primary hover:underline"
            >
              Select all
            </button>
            <button
              onClick={deselectAll}
              className="text-[10px] text-muted-foreground hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
        {connectedChannels.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">
            No active connected channels to push to. Connect and activate a
            channel first.
          </p>
        ) : (
          <div className="space-y-1.5">
            {connectedChannels.map((ch) => (
              <label
                key={ch.id}
                className="flex items-center gap-3 p-2 rounded border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedChannels.includes(ch.id)}
                  onChange={() => toggleChannel(ch.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm flex-1">{ch.channelName}</span>
                <Badge
                  variant="outline"
                  className="text-[9px] h-4 px-1 bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  Connected
                </Badge>
              </label>
            ))}
          </div>
        )}
      </div>

      <Button
        className="w-full"
        disabled={
          isPending || connectedChannels.length === 0 || !dateFrom || !dateTo
        }
        onClick={handlePush}
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Pushing...</>
        ) : (
          <><Upload className="h-4 w-4 mr-2" />Push to {selectedChannels.length > 0 ? `${selectedChannels.length} channel${selectedChannels.length > 1 ? "s" : ""}` : "all channels"}</>
        )}
      </Button>
    </div>
  );
}
