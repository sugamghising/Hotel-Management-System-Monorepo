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
import { HK_STATUS_MAP } from "@/lib/constants/statuses";
import { TASK_TYPE_OPTIONS } from "./TaskTypeBadge";
import { PRIORITY_MAP } from "@/lib/constants/statuses";

interface TaskFiltersProps {
  status: string;
  onStatusChange: (v: string) => void;
  taskType: string;
  onTaskTypeChange: (v: string) => void;
  priority: string;
  onPriorityChange: (v: string) => void;
  assignedTo: string;
  onAssignedToChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function TaskFilters({
  status,
  onStatusChange,
  taskType,
  onTaskTypeChange,
  priority,
  onPriorityChange,
  assignedTo,
  onAssignedToChange,
  date,
  onDateChange,
  hasActiveFilters,
  onClear,
}: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(HK_STATUS_MAP).map(([value, config]) => (
            <SelectItem key={value} value={value}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={taskType} onValueChange={onTaskTypeChange}>
        <SelectTrigger className="h-9 w-[155px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {TASK_TYPE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue placeholder="All Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          {Object.entries(PRIORITY_MAP).map(([value, config]) => (
            <SelectItem key={value} value={value}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative max-w-[180px] w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Assigned to..."
          value={assignedTo}
          onChange={(e) => onAssignedToChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <Input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="h-9 w-[160px]"
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
