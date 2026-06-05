"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  useMaintenanceRequests,
  useMaintenanceDashboard,
  useUrgentMaintenance,
  useCreateMaintenanceRequest,
  useAssignMaintenance,
  useStartMaintenance,
  useCompleteMaintenance,
  useVerifyMaintenance,
  useAddMaintenanceParts,
  useScheduleMaintenance,
  useUpdateMaintenance,
} from "@/lib/hooks/useMaintenanceRequests";
import type { MaintenanceRequest } from "@/lib/hooks/useMaintenanceRequests";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, CheckCircle2 } from "lucide-react";

import { UrgentAlertBanner } from "./ManagerView/UrgentAlertBanner";
import { MaintenanceDashboardStats } from "./ManagerView/MaintenanceDashboardStats";
import { StaffWorkloadPanel } from "./ManagerView/StaffWorkloadPanel";
import { MaintenanceFilters } from "./ManagerView/MaintenanceFilters";
import { MaintenanceTable } from "./ManagerView/MaintenanceTable";
import { MyWorkQueue } from "./TechnicianView/MyWorkQueue";
import { CreateRequestDialog } from "./Dialogs/CreateRequestDialog";
import { AssignDialog } from "./Dialogs/AssignDialog";
import { ScheduleDialog } from "./Dialogs/ScheduleDialog";
import { CompleteDialog } from "./Dialogs/CompleteDialog";
import { VerifyDialog } from "./Dialogs/VerifyDialog";
import { AddPartsDialog } from "./Dialogs/AddPartsDialog";

export default function MaintenanceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const currency = activeHotel?.currencyCode ?? "USD";

  // Permissions
  const isManager = usePermission("MAINTENANCE.ASSIGN");
  const canCreate = usePermission("MAINTENANCE.CREATE");
  const canUpdate = usePermission("MAINTENANCE.UPDATE");
  const canVerify = usePermission("MAINTENANCE.VERIFY");
  const canViewCosts = usePermission("MAINTENANCE.VIEW_COSTS");
  const isTechnician = !isManager && canUpdate;

  // URL-synced state
  const tab = searchParams.get("tab") ?? "overview";
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const requestType = searchParams.get("requestType") ?? "";
  const assignedTo = searchParams.get("assignedTo") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page")) || 1;

  // Data hooks
  const { data: dashboard, isLoading: dashLoading } = useMaintenanceDashboard();
  const { data: urgentRequests } = useUrgentMaintenance();
  const hkParams = useMemo(
    () => ({
      status: status || undefined,
      priority: priority || undefined,
      requestType: requestType || undefined,
      assignedTo: assignedTo || undefined,
      from: from || undefined,
      to: to || undefined,
      search: search || undefined,
      page,
      limit: 50,
    }),
    [status, priority, requestType, assignedTo, from, to, search, page],
  );
  const { data: requestList, isLoading: listLoading } = useMaintenanceRequests(hkParams);
  const { data: verificationList, isLoading: verificationLoading } = useMaintenanceRequests(
    useMemo(() => ({ status: "COMPLETED", limit: 50 }), []),
  );
  const staffParams = useMemo(
    () => ({ assignedTo: user?.id ?? "", status: "ASSIGNED,IN_PROGRESS,COMPLETED" as any, limit: 100 }),
    [user?.id],
  );
  const { data: staffRequests, isLoading: staffLoading } = useMaintenanceRequests(
    user?.id ? staffParams : undefined,
  );

  // Mutation hooks
  const createMut = useCreateMaintenanceRequest();
  const assignMut = useAssignMaintenance();
  const startMut = useStartMaintenance();
  const completeMut = useCompleteMaintenance();
  const verifyMut = useVerifyMaintenance();
  const partsMut = useAddMaintenanceParts();
  const scheduleMut = useScheduleMaintenance();
  const updateMut = useUpdateMaintenance();

  const isPending =
    createMut.isPending || assignMut.isPending || startMut.isPending ||
    completeMut.isPending || verifyMut.isPending || partsMut.isPending ||
    scheduleMut.isPending || updateMut.isPending;

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<MaintenanceRequest | null>(null);
  const [assignTarget, setAssignTarget] = useState<MaintenanceRequest | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<MaintenanceRequest | null>(null);
  const [completeTarget, setCompleteTarget] = useState<MaintenanceRequest | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<MaintenanceRequest | null>(null);
  const [partsTarget, setPartsTarget] = useState<MaintenanceRequest | null>(null);

  // URL helpers
  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "" || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams],
  );

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      router.replace(buildUrl(overrides));
    },
    [router, buildUrl],
  );

  // Handlers
  const handleTabChange = useCallback((newTab: string) => {
    navigate({ tab: newTab, status: null, priority: null, requestType: null, assignedTo: null, from: null, to: null, search: null, page: null });
  }, [navigate]);

  const handleStatusClick = useCallback((clickedKey: string) => {
    const statusMap: Record<string, string> = {
      open: "OPEN", assigned: "ASSIGNED", inProgress: "IN_PROGRESS",
      completed: "COMPLETED", verified: "VERIFIED", onHold: "ON_HOLD",
    };
    navigate({ tab: "requests", status: statusMap[clickedKey] ?? null, page: null });
  }, [navigate]);

  const handlePriorityClick = useCallback((p: string) => {
    navigate({ tab: "requests", priority: p, page: null });
  }, [navigate]);

  const handleUrgentViewAll = useCallback(() => {
    navigate({ tab: "requests", priority: "URGENT", page: null });
  }, [navigate]);

  const handleFilterChange = useCallback((key: string, value: string | null) => {
    const effectiveValue = value === "all" ? null : value;
    navigate({ [key]: effectiveValue, page: null });
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    navigate({ status: null, priority: null, requestType: null, assignedTo: null, from: null, to: null, search: null, page: null });
  }, [navigate]);

  const handlePageChange = useCallback((newPage: number) => {
    navigate({ page: String(newPage) });
  }, [navigate]);

  const handleSearchChange = useCallback((v: string) => {
    navigate({ search: v || null, page: null });
  }, [navigate]);

  // Dialog handlers
  const handleCreate = () => {
    setEditRequest(null);
    setCreateDialogOpen(true);
  };

  const handleEdit = useCallback((req: MaintenanceRequest) => {
    setEditRequest(req);
    setCreateDialogOpen(true);
  }, []);

  const handleAssign = useCallback((req: MaintenanceRequest) => {
    setAssignTarget(req);
  }, []);

  const handleSchedule = useCallback((req: MaintenanceRequest) => {
    setScheduleTarget(req);
  }, []);

  const handleStart = useCallback((id: string) => {
    startMut.mutate(id);
  }, [startMut]);

  const handleComplete = useCallback((req: MaintenanceRequest) => {
    setCompleteTarget(req);
  }, []);

  const handleVerify = useCallback((req: MaintenanceRequest) => {
    setVerifyTarget(req);
  }, []);

  const handleAddParts = useCallback((req: MaintenanceRequest) => {
    setPartsTarget(req);
  }, []);

  const handleUpdateStatus = useCallback((id: string, newStatus: string) => {
    updateMut.mutate({ id, input: { status: newStatus as any } });
  }, [updateMut]);

  // Compute data
  const requests = requestList?.requests ?? [];
  const total = requestList?.pagination?.total ?? 0;
  const verificationRequests = verificationList?.requests ?? [];
  const hasActiveFilters = !!(status || priority || requestType || assignedTo || from || to || search);

  // Access guard
  if (!isManager && !isTechnician) {
    return (
      <div>
        <PageHeader title="Maintenance" />
        <div className="text-center py-16">
          <p className="text-muted-foreground">You don{"'"}t have access to maintenance.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Track and manage property maintenance requests"
        actions={
          canCreate && (
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Request
            </Button>
          )
        }
      />

      {isManager ? (
        <div className="max-w-7xl space-y-6">
          <UrgentAlertBanner
            urgentRequests={urgentRequests}
            isLoading={false}
            onViewAll={handleUrgentViewAll}
          />

          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requests">All Requests</TabsTrigger>
              <TabsTrigger value="verification">Pending Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <MaintenanceDashboardStats
                dashboard={dashboard}
                isLoading={dashLoading}
                onStatusClick={handleStatusClick}
                onPriorityClick={handlePriorityClick}
              />
              <StaffWorkloadPanel
                workload={dashboard?.staffWorkload}
                isLoading={dashLoading}
                onStaffClick={(staffId) => navigate({ tab: "requests", assignedTo: staffId, page: null })}
              />
            </TabsContent>

            <TabsContent value="requests" className="space-y-4 mt-6">
              <MaintenanceFilters
                status={status}
                onStatusChange={(v) => handleFilterChange("status", v)}
                priority={priority}
                onPriorityChange={(v) => handleFilterChange("priority", v)}
                requestType={requestType}
                onRequestTypeChange={(v) => handleFilterChange("requestType", v)}
                assignedTo={assignedTo}
                onAssignedToChange={(v) => handleFilterChange("assignedTo", v)}
                from={from}
                onFromChange={(v) => handleFilterChange("from", v || null)}
                to={to}
                onToChange={(v) => handleFilterChange("to", v || null)}
                search={search}
                onSearchChange={handleSearchChange}
                hasActiveFilters={hasActiveFilters}
                onClear={handleClearFilters}
                staffWorkload={dashboard?.staffWorkload}
              />

              <MaintenanceTable
                requests={requests}
                isLoading={listLoading}
                total={total}
                page={page}
                onPageChange={handlePageChange}
                isPending={isPending}
                canViewCosts={canViewCosts}
                canVerify={canVerify}
                isManager={isManager}
                userId={user?.id ?? ""}
                onAssign={handleAssign}
                onSchedule={handleSchedule}
                onStart={handleStart}
                onComplete={handleComplete}
                onVerify={handleVerify}
                onAddParts={handleAddParts}
                onEdit={handleEdit}
                onUpdateStatus={handleUpdateStatus}
              />
            </TabsContent>

            <TabsContent value="verification" className="space-y-4 mt-6">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">
                  {verificationRequests.length > 0
                    ? `${verificationRequests.length} request${verificationRequests.length !== 1 ? "s" : ""} awaiting your verification`
                    : "All requests are up to date."}
                </AlertTitle>
                <AlertDescription>
                  {verificationRequests.length === 0 && "No requests pending verification."}
                </AlertDescription>
              </Alert>

              <MaintenanceTable
                requests={verificationRequests}
                isLoading={verificationLoading}
                total={verificationRequests.length}
                page={1}
                onPageChange={() => {}}
                isPending={isPending}
                canViewCosts={canViewCosts}
                canVerify={canVerify}
                isManager={isManager}
                userId={user?.id ?? ""}
                onAssign={handleAssign}
                onSchedule={handleSchedule}
                onStart={handleStart}
                onComplete={handleComplete}
                onVerify={handleVerify}
                onAddParts={handleAddParts}
                onEdit={handleEdit}
                onUpdateStatus={handleUpdateStatus}
                emptyMessage="No requests pending verification."
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <MyWorkQueue
            requests={staffRequests?.requests}
            isLoading={staffLoading}
            isPending={isPending}
            onStart={handleStart}
            onComplete={handleComplete}
            onAddParts={handleAddParts}
          />
        </div>
      )}

      {/* Dialogs */}
      <CreateRequestDialog
        open={createDialogOpen}
        onClose={() => { setCreateDialogOpen(false); setEditRequest(null); }}
        editRequest={editRequest}
      />

      {assignTarget && (
        <AssignDialog
          requestId={assignTarget.id}
          requestTitle={assignTarget.title}
          currentAssignee={assignTarget.assignedTo}
          staffWorkload={dashboard?.staffWorkload ?? []}
          open
          onClose={() => setAssignTarget(null)}
        />
      )}

      {scheduleTarget && (
        <ScheduleDialog
          requestId={scheduleTarget.id}
          currentDate={scheduleTarget.scheduledFor}
          open
          onClose={() => setScheduleTarget(null)}
        />
      )}

      {completeTarget && (
        <CompleteDialog
          request={completeTarget}
          open
          onClose={() => setCompleteTarget(null)}
          currency={currency}
        />
      )}

      {verifyTarget && (
        <VerifyDialog
          request={verifyTarget}
          open
          onClose={() => setVerifyTarget(null)}
          currency={currency}
        />
      )}

      {partsTarget && (
        <AddPartsDialog
          requestId={partsTarget.id}
          open
          onClose={() => setPartsTarget(null)}
          currency={currency}
        />
      )}
    </div>
  );
}
