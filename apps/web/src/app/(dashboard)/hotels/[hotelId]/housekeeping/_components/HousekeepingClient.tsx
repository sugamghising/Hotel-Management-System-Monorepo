"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  useHousekeepingTasks,
  useHousekeepingDashboard,
  useStaffTasks,
  useHousekeepingInspections,
  useCreateHousekeepingTask,
  useAutoGenerateTasks,
  useBulkAssignTasks,
  useStartTask,
  useCompleteTask,
  useVerifyTask,
  useReportTaskIssues,
} from "@/lib/hooks/useMaintenance";
import type { HousekeepingTask } from "@/lib/hooks/useMaintenance";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Wand2, Users } from "lucide-react";

import { HKDashboardStats } from "./ManagerView/HKDashboardStats";
import { StaffWorkloadPanel } from "./ManagerView/StaffWorkloadPanel";
import { TaskBoard } from "./ManagerView/TaskBoard";
import { TaskTable } from "./Shared/TaskTable";
import { TaskFilters } from "./Shared/TaskFilters";
import { MyTaskList } from "./StaffView/MyTaskList";
import { CreateTaskDialog } from "./Dialogs/CreateTaskDialog";
import { AssignTasksDialog } from "./Dialogs/AssignTasksDialog";
import { CompleteTaskDialog } from "./Dialogs/CompleteTaskDialog";
import { VerifyTaskDialog } from "./Dialogs/VerifyTaskDialog";
import { ReportIssuesDialog } from "./Dialogs/ReportIssuesDialog";

export default function HousekeepingClient() {
  const router = useRouter();
  const { hotelId } = useParams<{ hotelId: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  // Role detection
  const canManage = usePermission("HOUSEKEEPING.CREATE");
  const canUpdate = usePermission("HOUSEKEEPING.UPDATE");
  const isManager = canManage;
  const isStaff = !isManager && canUpdate;

  // URL-synced state
  const tab = searchParams.get("tab") ?? "dashboard";
  const status = searchParams.get("status") ?? "";
  const taskType = searchParams.get("taskType") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const assignedTo = searchParams.get("assignedTo") ?? "";
  const date = searchParams.get("date") ?? "";
  const page = Number(searchParams.get("page")) || 1;
  const viewMode = searchParams.get("view") ?? "table";

  // Data hooks
  const { data: dashboard, isLoading: dashLoading } = useHousekeepingDashboard();
  const hkParams = useMemo(
    () => ({
      status: status || undefined,
      taskType: taskType || undefined,
      priority: priority || undefined,
      assignedTo: assignedTo || undefined,
      scheduledFor: date || undefined,
      page,
      limit: 50,
    }),
    [status, taskType, priority, assignedTo, date, page],
  );
  const { data: taskList, isLoading: listLoading } = useHousekeepingTasks(hkParams);
  const { data: inspections, isLoading: inspLoading } = useHousekeepingInspections();
  const { data: staffTasks, isLoading: staffLoading } = useStaffTasks(user?.id ?? "");

  // Mutation hooks
  const createTask = useCreateHousekeepingTask();
  const autoGenerate = useAutoGenerateTasks();
  const bulkAssign = useBulkAssignTasks();
  const startTask = useStartTask();
  const completeTask = useCompleteTask();
  const verifyTask = useVerifyTask();
  const reportIssues = useReportTaskIssues();

  const isPending =
    createTask.isPending ||
    autoGenerate.isPending ||
    bulkAssign.isPending ||
    startTask.isPending ||
    completeTask.isPending ||
    verifyTask.isPending ||
    reportIssues.isPending;

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [actionDialog, setActionDialog] = useState<{
    type: "complete" | "verify" | "report";
    task: HousekeepingTask;
  } | null>(null);

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
    navigate({ tab: newTab, status: null, taskType: null, priority: null, assignedTo: null, date: null, page: null });
  }, [navigate]);

  const handleStatusClick = useCallback((clickedKey: string) => {
    const statusMap: Record<string, string> = {
      pending: "PENDING",
      inProgress: "IN_PROGRESS",
      completed: "COMPLETED",
      verified: "VERIFIED",
      issuesReported: "ISSUES_REPORTED",
    };
    const newStatus = statusMap[clickedKey] ?? null;
    navigate({ tab: "tasks", status: newStatus, page: null });
  }, [navigate]);

  const handleStaffClick = useCallback((staffId: string) => {
    navigate({ tab: "tasks", assignedTo: staffId, page: null });
  }, [navigate]);

  const handleFilterChange = useCallback((key: string, value: string | null) => {
    const effectiveValue = value === "all" ? null : value;
    navigate({ [key]: effectiveValue, page: null });
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    navigate({ status: null, taskType: null, priority: null, assignedTo: null, date: null, page: null });
  }, [navigate]);

  const handlePageChange = useCallback((newPage: number) => {
    navigate({ page: String(newPage) });
  }, [navigate]);

  const handleStartTask = useCallback((task: HousekeepingTask) => {
    startTask.mutate(task.id);
  }, [startTask]);

  const handleCompleteTask = useCallback((task: HousekeepingTask) => {
    setActionDialog({ type: "complete", task });
  }, []);

  const handleVerifyTask = useCallback((task: HousekeepingTask) => {
    setActionDialog({ type: "verify", task });
  }, []);

  const handleReportIssues = useCallback((task: HousekeepingTask) => {
    setActionDialog({ type: "report", task });
  }, []);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedTaskIds(ids);
  }, []);

  // Task data
  const tasks = taskList?.tasks ?? [];
  const total = taskList?.pagination?.total ?? 0;

  // Compute hasActiveFilters
  const hasActiveFilters = !!(status || taskType || priority || assignedTo || date);

  // Access guard
  if (!isManager && !isStaff) {
    return (
      <div>
        <PageHeader title="Housekeeping" />
        <div className="text-center py-16">
          <p className="text-muted-foreground">You do not have access to housekeeping.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Housekeeping"
        actions={
          <>
            {isManager && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => autoGenerate.mutate()}
                  disabled={isPending}
                >
                  <Wand2 className="h-4 w-4 mr-1.5" />
                  Auto-Generate
                </Button>
                <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Task
                </Button>
              </>
            )}
          </>
        }
      />

      {isManager ? (
        <div className="space-y-6">
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="inspections">Inspections</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              <HKDashboardStats
                dashboard={dashboard}
                isLoading={dashLoading}
                onStatusClick={handleStatusClick}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StaffWorkloadPanel
                  workload={dashboard?.staffWorkload}
                  isLoading={dashLoading}
                  onStaffClick={handleStaffClick}
                />
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{dashboard?.roomsNeedingCleaning ?? 0}</span> rooms need cleaning
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{dashboard?.overdueTask ?? 0}</span> overdue tasks
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-6">
              <TaskFilters
                status={status}
                onStatusChange={(v) => handleFilterChange("status", v)}
                taskType={taskType}
                onTaskTypeChange={(v) => handleFilterChange("taskType", v)}
                priority={priority}
                onPriorityChange={(v) => handleFilterChange("priority", v)}
                assignedTo={assignedTo}
                onAssignedToChange={(v) => handleFilterChange("assignedTo", v || null)}
                date={date}
                onDateChange={(v) => handleFilterChange("date", v || null)}
                hasActiveFilters={hasActiveFilters}
                onClear={handleClearFilters}
              />

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigate({ view: "table", page: null })}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === "board" ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigate({ view: "board", page: null })}
                >
                  Board
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  {selectedTaskIds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssignDialogOpen(true)}
                      disabled={isPending}
                    >
                      <Users className="h-4 w-4 mr-1.5" />
                      Assign ({selectedTaskIds.length})
                    </Button>
                  )}
                </div>
              </div>

              {viewMode === "board" ? (
                <TaskBoard
                  tasks={tasks}
                  isLoading={listLoading}
                  isPending={isPending}
                  onStart={handleStartTask}
                  onComplete={handleCompleteTask}
                  onVerify={handleVerifyTask}
                  onReportIssues={handleReportIssues}
                />
              ) : (
                <TaskTable
                  tasks={tasks}
                  isLoading={listLoading}
                  total={total}
                  page={page}
                  onPageChange={handlePageChange}
                  isPending={isPending}
                  selectedTaskIds={selectedTaskIds}
                  onSelectionChange={handleSelectionChange}
                  onStart={handleStartTask}
                  onComplete={handleCompleteTask}
                  onVerify={handleVerifyTask}
                  onReportIssues={handleReportIssues}
                />
              )}
            </TabsContent>

            <TabsContent value="inspections" className="space-y-4 mt-6">
              <TaskTable
                tasks={inspections ?? []}
                isLoading={inspLoading}
                total={inspections?.length ?? 0}
                page={1}
                onPageChange={() => {}}
                isPending={isPending}
                onComplete={handleCompleteTask}
                onVerify={handleVerifyTask}
                onReportIssues={handleReportIssues}
                emptyMessage="No inspections found."
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <MyTaskList
            tasks={staffTasks}
            isLoading={staffLoading}
            isPending={isPending}
            onStart={handleStartTask}
            onComplete={handleCompleteTask}
            onReportIssues={handleReportIssues}
          />
        </div>
      )}

      {/* Dialogs */}
      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <AssignTasksDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        taskIds={selectedTaskIds}
      />

      {actionDialog?.type === "complete" && (
        <CompleteTaskDialog
          task={actionDialog.task}
          open
          onClose={() => setActionDialog(null)}
        />
      )}

      {actionDialog?.type === "verify" && (
        <VerifyTaskDialog
          task={actionDialog.task}
          open
          onClose={() => setActionDialog(null)}
        />
      )}

      {actionDialog?.type === "report" && (
        <ReportIssuesDialog
          task={actionDialog.task}
          open
          onClose={() => setActionDialog(null)}
        />
      )}
    </div>
  );
}
