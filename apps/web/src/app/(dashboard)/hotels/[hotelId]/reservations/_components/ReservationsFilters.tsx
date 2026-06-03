"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ReservationsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  checkInFrom: string;
  checkInTo: string;
  onCheckInFromChange: (value: string) => void;
  onCheckInToChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ReservationsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  checkInFrom,
  checkInTo,
  onCheckInFromChange,
  onCheckInToChange,
  onClear,
  hasActiveFilters,
}: ReservationsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative min-w-[200px] flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search guest or confirmation #"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="CHECKED_IN">Checked In</SelectItem>
          <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="NO_SHOW">No Show</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={checkInFrom}
          onChange={(e) => onCheckInFromChange(e.target.value)}
          className="w-[155px] h-9"
          aria-label="Check-in from"
        />
        <span className="text-muted-foreground text-sm">—</span>
        <Input
          type="date"
          value={checkInTo}
          onChange={(e) => onCheckInToChange(e.target.value)}
          className="w-[155px] h-9"
          aria-label="Check-in to"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-9 gap-1">
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
