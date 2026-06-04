"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export const GUEST_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "TRANSIENT", label: "Transient" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "GROUP", label: "Group" },
  { value: "CONTRACTUAL", label: "Contractual" },
  { value: "COMP", label: "Comp" },
  { value: "STAFF", label: "Staff" },
  { value: "FAMILY_FRIENDS", label: "Family & Friends" },
] as const;

export const VIP_OPTIONS = [
  { value: "", label: "All VIP Status" },
  { value: "NONE", label: "None" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "BLACK", label: "Black" },
] as const;

interface GuestFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  guestType: string;
  onGuestTypeChange: (v: string) => void;
  vipStatus: string;
  onVipStatusChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function GuestFilters({
  search,
  onSearchChange,
  guestType,
  onGuestTypeChange,
  vipStatus,
  onVipStatusChange,
  hasActiveFilters,
  onClear,
}: GuestFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Name, email or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <Select value={guestType} onValueChange={onGuestTypeChange}>
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {GUEST_TYPE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={vipStatus} onValueChange={onVipStatusChange}>
        <SelectTrigger className="h-9 w-[155px]">
          <SelectValue placeholder="All VIP Status" />
        </SelectTrigger>
        <SelectContent>
          {VIP_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-9">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
