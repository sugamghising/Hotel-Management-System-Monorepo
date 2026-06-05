"use client";

import { useCallback, useRef } from "react";
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
import { STATUS_OPTIONS } from "../Shared/RequestStatusBadge";
import { REQUEST_TYPE_OPTIONS } from "../Shared/RequestTypeBadge";
import { PRIORITY_OPTIONS } from "../Shared/PriorityBadge";
import type { StaffWorkloadItem } from "@/lib/hooks/useMaintenanceRequests";

interface MaintenanceFiltersProps {
  status: string;
  onStatusChange: (v: string) => void;
  priority: string;
  onPriorityChange: (v: string) => void;
  requestType: string;
  onRequestTypeChange: (v: string) => void;
  assignedTo: string;
  onAssignedToChange: (v: string) => void;
  from: string;
  onFromChange: (v: string) => void;
  to: string;
  onToChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  staffWorkload?: StaffWorkloadItem[];
}

export function MaintenanceFilters({
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  requestType,
  onRequestTypeChange,
  assignedTo,
  onAssignedToChange,
  from,
  onFromChange,
  to,
  onToChange,
  search,
  onSearchChange,
  hasActiveFilters,
  onClear,
  staffWorkload,
}: MaintenanceFiltersProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearchChange(value), 400);
    },
    [onSearchChange],
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative max-w-[200px] w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Room number or title..."
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="All Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          {PRIORITY_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={requestType} onValueChange={onRequestTypeChange}>
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {REQUEST_TYPE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={assignedTo} onValueChange={onAssignedToChange}>
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue placeholder="Assigned to" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {staffWorkload?.map((s) => (
            <SelectItem key={s.staffId} value={s.staffId}>{s.staffName}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="h-9 w-[150px]"
        placeholder="From"
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="h-9 w-[150px]"
        placeholder="To"
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-9">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
