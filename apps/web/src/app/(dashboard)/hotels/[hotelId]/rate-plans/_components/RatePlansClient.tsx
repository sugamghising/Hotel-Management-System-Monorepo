"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { useAuthStore } from "@/stores/auth.store";
import {
  useRatePlans,
  useRatePlan,
  useCreateRatePlan,
  useUpdateRatePlan,
  useDeleteRatePlan,
  useCloneRatePlan,
} from "@/lib/hooks/useRatePlans";
import { usePermission } from "@/lib/hooks/usePermission";
import { RatePlanSidebar } from "./PlanList/RatePlanSidebar";
import { RateCalendarPanel } from "./Calendar/RateCalendarPanel";
import { CreateRatePlanDialog } from "./Dialogs/CreateRatePlanDialog";
import { EditRatePlanDialog } from "./Dialogs/EditRatePlanDialog";
import { CloneRatePlanDialog } from "./Dialogs/CloneRatePlanDialog";
import { Button } from "@/components/ui/button";
import { Calendar, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateRatePlanInput } from "@/lib/hooks/useRatePlans";

export default function RatePlansClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeHotel } = useAuthStore();

  const selectedPlanId = searchParams.get("plan") ?? "";
  const monthParam = searchParams.get("month") ?? format(new Date(), "yyyy-MM");
  const roomTypeFilter = searchParams.get("roomType") ?? "all";
  const statusFilter = searchParams.get("status") ?? "all";

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"plans" | "calendar">("plans");

  const canRead = usePermission("RATE_PLAN.READ");
  const canCreate = usePermission("RATE_PLAN.CREATE");
  const canUpdate = usePermission("RATE_PLAN.UPDATE");
  const canDelete = usePermission("RATE_PLAN.DELETE");

  const { data: plansData, isLoading: plansLoading } = useRatePlans({
    ...(roomTypeFilter !== "all" ? { roomTypeId: roomTypeFilter } : {}),
  });
  const plans = plansData?.ratePlans;

  const { data: fullPlan } = useRatePlan(selectedPlanId);

  const createPlan = useCreateRatePlan();
  const updatePlan = useUpdateRatePlan();
  const deletePlan = useDeleteRatePlan();
  const clonePlan = useCloneRatePlan();

  const selectedPlan = useMemo(() => {
    if (!plans || !selectedPlanId) return null;
    return plans.find((p) => p.id === selectedPlanId) ?? null;
  }, [plans, selectedPlanId]);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      return params.toString() ? `${pathname}?${params}` : pathname;
    },
    [pathname, searchParams],
  );

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      router.replace(buildUrl(overrides));
    },
    [router, buildUrl],
  );

  const handleSelectPlan = useCallback(
    (id: string) => {
      navigate({ plan: id });
      setMobileTab("calendar");
    },
    [navigate],
  );

  const handleMonthChange = useCallback(
    (month: string) => {
      navigate({ month });
    },
    [navigate],
  );

  const handleRoomTypeFilter = useCallback(
    (v: string) => {
      navigate({ roomType: v === "all" ? null : v });
    },
    [navigate],
  );

  const handleStatusFilter = useCallback(
    (v: string) => {
      navigate({ status: v === "all" ? null : v });
    },
    [navigate],
  );

  const handleCreatePlan = useCallback(
    (input: CreateRatePlanInput) => {
      createPlan.mutate(input, {
        onSuccess: () => {
          setCreateOpen(false);
        },
      });
    },
    [createPlan],
  );

  const handleUpdatePlan = useCallback(
    (input: Partial<CreateRatePlanInput>) => {
      if (!selectedPlanId) return;
      updatePlan.mutate({ id: selectedPlanId, input });
    },
    [selectedPlanId, updatePlan],
  );

  const handleDeletePlan = useCallback(() => {
    if (!selectedPlanId) return;
    deletePlan.mutate(selectedPlanId, {
      onSuccess: () => {
        navigate({ plan: null });
      },
    });
  }, [selectedPlanId, deletePlan, navigate]);

  const handleToggleActive = useCallback(() => {
    if (!selectedPlanId || !fullPlan) return;
    updatePlan.mutate({
      id: selectedPlanId,
      input: { isActive: !fullPlan.validity.isActive },
    });
  }, [selectedPlanId, fullPlan, updatePlan]);

  const handleClonePlan = useCallback(
    (input: { newCode: string; newName: string; roomTypeId?: string; adjustRateByPercent?: number }) => {
      clonePlan.mutate(
        { id: selectedPlanId, input },
        {
          onSuccess: () => {
            setCloneOpen(false);
          },
        },
      );
    },
    [selectedPlanId, clonePlan],
  );

  const hasActiveBookings = useCallback(
    (planId: string) => {
      return (plans?.find((p) => p.id === planId)?.stats?.bookingsCount ?? 0) > 0;
    },
    [plans],
  );

  if (!canRead) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">You do not have permission to view rate plans.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile tab bar */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b px-4 py-2 flex items-center gap-1">
        <Button
          variant={mobileTab === "plans" ? "secondary" : "ghost"}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setMobileTab("plans")}
        >
          <List className="h-3.5 w-3.5 mr-1" />
          Plans
        </Button>
        <Button
          variant={mobileTab === "calendar" ? "secondary" : "ghost"}
          size="sm"
          className="h-8 text-xs"
          disabled={!selectedPlanId}
          onClick={() => setMobileTab("calendar")}
        >
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Calendar
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div
          className={cn(
            "w-[320px] border-r bg-gray-50/50 overflow-y-auto shrink-0",
            "max-lg:hidden",
            mobileTab === "plans" && "max-lg:block",
            mobileTab === "calendar" && "max-lg:hidden",
          )}
        >
          <RatePlanSidebar
            plans={plans}
            isLoading={plansLoading}
            selectedPlanId={selectedPlanId ?? null}
            roomTypeFilter={roomTypeFilter}
            statusFilter={statusFilter}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onSelectPlan={handleSelectPlan}
            onEditPlan={() => setEditOpen(true)}
            onClonePlan={() => setCloneOpen(true)}
            onTogglePlanActive={handleToggleActive}
            onDeletePlan={handleDeletePlan}
            onRoomTypeFilterChange={handleRoomTypeFilter}
            onStatusFilterChange={handleStatusFilter}
            onCreateNew={() => setCreateOpen(true)}
          />
        </div>

        {/* Right Panel */}
        <div
          className={cn(
            "flex-1 overflow-y-auto",
            "max-lg:hidden",
            mobileTab === "calendar" && "max-lg:block",
            mobileTab === "plans" && "max-lg:hidden",
          )}
        >
          <RateCalendarPanel
            selectedPlan={selectedPlan}
            monthStr={monthParam}
            canUpdate={canUpdate}
            canCreate={canCreate}
            onMonthChange={handleMonthChange}
            onEdit={() => setEditOpen(true)}
            onClone={() => setCloneOpen(true)}
            onCreateNew={() => setCreateOpen(true)}
          />
        </div>
      </div>

      {/* Dialogs */}
      <CreateRatePlanDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreatePlan}
        roomTypes={
          plans?.map((p) => p.roomType).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i) ?? []
        }
      />

      <EditRatePlanDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleUpdatePlan}
        onDelete={handleDeletePlan}
        onToggleActive={handleToggleActive}
        plan={fullPlan}
        roomTypes={
          plans?.map((p) => p.roomType).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i) ?? []
        }
        canDelete={canDelete}
        hasActiveBookings={selectedPlanId ? hasActiveBookings(selectedPlanId) : false}
      />

      {selectedPlan && (
        <CloneRatePlanDialog
          open={cloneOpen}
          onClose={() => setCloneOpen(false)}
          onSave={handleClonePlan}
          sourcePlan={{
            id: selectedPlan.id,
            code: selectedPlan.code,
            name: selectedPlan.name,
            baseRate: selectedPlan.baseRate,
            currencyCode: selectedPlan.currencyCode,
            roomTypeId: selectedPlan.roomType.id,
            roomType: selectedPlan.roomType,
          }}
          roomTypes={
            plans?.map((p) => p.roomType).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i) ?? []
          }
        />
      )}
    </div>
  );
}
