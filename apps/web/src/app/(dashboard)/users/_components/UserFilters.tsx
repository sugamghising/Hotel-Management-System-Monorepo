"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoles } from "@/lib/hooks/useRoles";
import type { UserListItem } from "@/lib/hooks/useUsers";

interface UserFiltersProps {
  search: string;
  status: string;
  department: string;
  roleCode: string;
  hotelId: string;
  users: UserListItem[] | undefined;
  showHotelFilter: boolean;
  hotels: Array<{ id: string; name: string }> | undefined;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onDepartmentChange: (v: string) => void;
  onRoleCodeChange: (v: string) => void;
  onHotelIdChange: (v: string) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export function UserFilters({
  search,
  status,
  department,
  roleCode,
  hotelId,
  users,
  showHotelFilter,
  hotels,
  onSearchChange,
  onStatusChange,
  onDepartmentChange,
  onRoleCodeChange,
  onHotelIdChange,
  onClear,
}: UserFiltersProps) {
  const { data: rolesData } = useRoles();

  const departments = useMemo(() => {
    if (!users) return [];
    const seen = new Set<string>();
    users.forEach((u) => {
      if (u.department) seen.add(u.department);
    });
    return Array.from(seen).sort();
  }, [users]);

  const hasFilters = search || status || department || roleCode || hotelId;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative max-w-xs w-full">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 text-xs w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={department} onValueChange={onDepartmentChange}>
        <SelectTrigger className="h-9 text-xs w-[150px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={roleCode} onValueChange={onRoleCodeChange}>
        <SelectTrigger className="h-9 text-xs w-[140px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Roles</SelectItem>
          {rolesData?.roles?.map((role) => (
            <SelectItem key={role.id} value={role.code}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showHotelFilter && (
        <Select value={hotelId} onValueChange={onHotelIdChange}>
          <SelectTrigger className="h-9 text-xs w-[150px]">
            <SelectValue placeholder="Hotel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Hotels</SelectItem>
            {hotels?.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs"
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
