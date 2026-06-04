"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

interface RoomListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  floor: string;
  onFloorChange: (value: string) => void;
  roomTypeId: string;
  onRoomTypeChange: (value: string) => void;
  isOooOnly: boolean;
  onOooOnlyChange: (value: boolean) => void;
  uniqueFloors: number[];
  uniqueRoomTypes: Array<{ id: string; code: string; name: string }>;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function RoomListFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  floor,
  onFloorChange,
  roomTypeId,
  onRoomTypeChange,
  isOooOnly,
  onOooOnlyChange,
  uniqueFloors,
  uniqueRoomTypes,
  hasActiveFilters,
  onClear,
}: RoomListFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) onSearchChange(localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative w-full max-w-[220px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Room number, type or guest..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-8 h-8"
        />
      </div>

      {/* Status */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          {Object.entries(ROOM_STATUS_MAP).map(([key, val]) => (
            <SelectItem key={key} value={key}>
              {val.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Room type */}
      <Select value={roomTypeId} onValueChange={onRoomTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Room type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          {uniqueRoomTypes.map((rt) => (
            <SelectItem key={rt.id} value={rt.id}>
              {rt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Floor */}
      <Select value={floor} onValueChange={onFloorChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Floor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          {uniqueFloors.map((f) => (
            <SelectItem key={f} value={String(f)}>
              Floor {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* OOO checkbox */}
      <Label className="flex items-center gap-1.5 text-sm font-normal cursor-pointer">
        <Checkbox
          checked={isOooOnly}
          onCheckedChange={(checked: boolean | "indeterminate") => onOooOnlyChange(!!checked)}
        />
        Out of order only
      </Label>

      {/* Clear */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
