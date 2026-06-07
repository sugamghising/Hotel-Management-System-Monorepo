"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomTypeGroup } from "./RoomTypeGroup";
import { Plus, Filter, ChevronDown, ChevronRight, BarChart3 } from "lucide-react";
import type { RatePlanListItem } from "@/lib/hooks/useRatePlans";

interface RatePlanSidebarProps {
  plans: RatePlanListItem[] | undefined;
  isLoading: boolean;
  selectedPlanId: string | null;
  roomTypeFilter: string;
  statusFilter: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onSelectPlan: (id: string) => void;
  onEditPlan: (id: string) => void;
  onClonePlan: (id: string) => void;
  onTogglePlanActive: (id: string, current: boolean) => void;
  onDeletePlan: (id: string) => void;
  onRoomTypeFilterChange: (v: string) => void;
  onStatusFilterChange: (v: string) => void;
  onCreateNew: () => void;
}

export function RatePlanSidebar({
  plans,
  isLoading,
  selectedPlanId,
  roomTypeFilter,
  statusFilter,
  canCreate,
  canUpdate,
  canDelete,
  onSelectPlan,
  onEditPlan,
  onClonePlan,
  onTogglePlanActive,
  onDeletePlan,
  onRoomTypeFilterChange,
  onStatusFilterChange,
  onCreateNew,
}: RatePlanSidebarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const roomTypes = useMemo(() => {
    if (!plans) return [];
    const seen = new Set<string>();
    return plans
      .filter((p) => {
        if (seen.has(p.roomType.id)) return false;
        seen.add(p.roomType.id);
        return true;
      })
      .map((p) => p.roomType);
  }, [plans]);

  const filtered = useMemo(() => {
    if (!plans) return [];
    return plans.filter((p) => {
      if (roomTypeFilter !== "all" && p.roomType.id !== roomTypeFilter) return false;
      if (statusFilter === "active" && !p.isActive) return false;
      if (statusFilter === "inactive" && p.isActive) return false;
      return true;
    });
  }, [plans, roomTypeFilter, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, RatePlanListItem[]>();
    for (const plan of filtered) {
      const key = plan.roomType.name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(plan);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const hasActiveBookings = useMemo(() => {
    const set = new Set<string>();
    if (!plans) return set;
    plans.forEach((p) => {
      if ((p as any).stats?.bookingsCount > 0) set.add(p.id);
    });
    return set;
  }, [plans]);

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">Rate Plans</h2>
          {canCreate && (
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
          )}
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setFiltersOpen(!filtersOpen)}
          onKeyDown={(e) => e.key === "Enter" && setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 border-t"
        >
          <Filter className="h-3 w-3" />
          Filters
          {filtersOpen ? (
            <ChevronDown className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronRight className="h-3 w-3 ml-auto" />
          )}
        </div>

        {filtersOpen && (
          <div className="px-4 pb-3 space-y-2 border-t pt-2">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Room Type
              </label>
              <Select value={roomTypeFilter} onValueChange={onRoomTypeFilterChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All room types</SelectItem>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Status
              </label>
              <div className="flex gap-1">
                {statusOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={statusFilter === opt.value ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => onStatusFilterChange(opt.value)}
                    className={cn(
                      "h-7 px-2.5 text-xs flex-1",
                      statusFilter === opt.value && "bg-muted font-medium",
                    )}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, g) => (
              <div key={g} className="space-y-1">
                <Skeleton className="h-5 w-28 mb-2" />
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground px-4 text-center">
            <BarChart3 className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No rate plans found</p>
            <p className="text-xs mt-1">Create your first plan to get started.</p>
            {canCreate && (
              <Button size="sm" variant="outline" className="mt-4" onClick={onCreateNew}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                New Rate Plan
              </Button>
            )}
          </div>
        ) : (
          grouped.map(([name, groupPlans]) => (
            <RoomTypeGroup
              key={name}
              roomTypeName={name}
              plans={groupPlans}
              selectedPlanId={selectedPlanId}
              canUpdate={canUpdate}
              canDelete={canDelete}
              hasActiveBookings={(id) => hasActiveBookings.has(id)}
              onSelectPlan={onSelectPlan}
              onEditPlan={onEditPlan}
              onClonePlan={onClonePlan}
              onTogglePlanActive={onTogglePlanActive}
              onDeletePlan={onDeletePlan}
            />
          ))
        )}
      </div>
    </div>
  );
}
