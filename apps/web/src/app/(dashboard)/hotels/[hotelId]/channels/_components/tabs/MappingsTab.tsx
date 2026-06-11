"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  useChannels,
  useChannelMappings,
  useUpdateMappings,
  type ChannelMapping,
} from "@/lib/hooks/useChannelManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { Loader2, Save, Layers } from "lucide-react";

interface EditableMapping {
  original: ChannelMapping;
  channelRoomTypeCode: string;
  channelRoomTypeName: string;
  channelRatePlanCode: string;
  isActive: boolean;
}

export function MappingsTab() {
  const { activeHotel } = useAuthStore();
  const hotelId = activeHotel?.id ?? "";

  const { data: channels } = useChannels(hotelId);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const connectedChannels = (channels ?? []).filter(
    (c) => c.status === "CONNECTED",
  );

  const { data: mappings, isLoading } = useChannelMappings(
    hotelId,
    selectedChannelId || null,
  );
  const { mutate: saveMappings, isPending } = useUpdateMappings();

  const [editing, setEditing] = useState<Record<string, EditableMapping>>({});

  const getMapping = (m: ChannelMapping): EditableMapping => {
    if (editing[m.id]) return editing[m.id];
    return {
      original: m,
      channelRoomTypeCode: m.channelRoomTypeCode,
      channelRoomTypeName: m.channelRoomTypeName,
      channelRatePlanCode: m.channelRatePlanCode ?? "",
      isActive: m.isActive,
    };
  };

  const updateField = (
    id: string,
    field: keyof EditableMapping,
    value: string | boolean,
  ) => {
    setEditing((prev) => {
      const m = mappings?.find((m) => m.id === id);
      if (!m) return prev;
      const base =
        prev[id] ??
        ({
          original: m,
          channelRoomTypeCode: m.channelRoomTypeCode,
          channelRoomTypeName: m.channelRoomTypeName,
          channelRatePlanCode: m.channelRatePlanCode ?? "",
          isActive: m.isActive,
        } as EditableMapping);
      return { ...prev, [id]: { ...base, [field]: value } };
    });
  };

  const handleSave = () => {
    const updatedMappings = Object.values(editing).map((e) => ({
      roomTypeId: e.original.roomTypeId,
      channelRoomTypeCode: e.channelRoomTypeCode,
      channelRoomTypeName: e.channelRoomTypeName,
      ratePlanId: e.original.ratePlanId,
      channelRatePlanCode: e.channelRatePlanCode || null,
      isActive: e.isActive,
    }));
    saveMappings(
      { hotelId, channelId: selectedChannelId, input: { mappings: updatedMappings } },
      { onSuccess: () => setEditing({}) },
    );
  };

  const hasChanges = Object.keys(editing).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={selectedChannelId}
            onValueChange={(v) => {
              setSelectedChannelId(v);
              setEditing({});
            }}
          >
            <SelectTrigger className="h-8 text-sm w-56">
              <SelectValue placeholder="Select a channel..." />
            </SelectTrigger>
            <SelectContent>
              {connectedChannels.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.channelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedChannelId && (
            <p className="text-xs text-muted-foreground">
              Select a connected channel to manage room type mappings.
            </p>
          )}
        </div>
        {hasChanges && (
          <Button size="sm" className="h-8 text-xs" disabled={isPending} onClick={handleSave}>
            {isPending ? (
              <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-3 w-3 mr-1" />Save Changes</>
            )}
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && selectedChannelId && (mappings ?? []).length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Layers className="h-8 w-8" />
          <p className="text-sm">No mappings found for this channel.</p>
          <p className="text-xs">
            Mappings are created automatically when you connect a channel.
          </p>
        </div>
      )}

      {!isLoading && (mappings ?? []).length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Active</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Channel Room Code</TableHead>
              <TableHead>Channel Room Name</TableHead>
              <TableHead>Rate Plan Code</TableHead>
              <TableHead className="w-24">Mapping ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(mappings ?? []).map((m) => {
              const edit = getMapping(m);
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <Switch
                      checked={edit.isActive}
                      onCheckedChange={(v) => updateField(m.id, "isActive", v)}
                    />
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {m.roomTypeName}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={edit.channelRoomTypeCode}
                      onChange={(e) =>
                        updateField(m.id, "channelRoomTypeCode", e.target.value)
                      }
                      className="h-7 text-xs w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={edit.channelRoomTypeName}
                      onChange={(e) =>
                        updateField(m.id, "channelRoomTypeName", e.target.value)
                      }
                      className="h-7 text-xs w-36"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={edit.channelRatePlanCode}
                      onChange={(e) =>
                        updateField(m.id, "channelRatePlanCode", e.target.value)
                      }
                      className="h-7 text-xs w-28"
                      placeholder={m.ratePlanName ?? "—"}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip content={m.id}>
                      <span className="text-[10px] font-mono text-muted-foreground truncate block max-w-[80px]">
                        {m.id.slice(0, 8)}...
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
