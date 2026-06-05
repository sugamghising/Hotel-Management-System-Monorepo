"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  useNightAuditStatus,
  useNightAuditPreCheck,
  useNightAuditHistory,
  useNightAuditDetail,
} from "@/lib/hooks/useNightAudits";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { PreCheckTab } from "./PreCheckTab";
import { HistoryTab } from "./HistoryTab";
import { ReportTab } from "./ReportTab";
import { RunAuditDialog } from "./Dialogs/RunAuditDialog";
import { RollbackDialog } from "./Dialogs/RollbackDialog";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "pre-check", label: "Pre-Check" },
  { key: "history", label: "History" },
  { key: "report", label: "Report" },
] as const;

export default function NightAuditClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeHotel } = useAuthStore();

  const tab = searchParams.get("tab") ?? "overview";

  const canViewStatus = usePermission("NIGHT_AUDIT.VIEW_STATUS");
  const canViewHistory = usePermission("NIGHT_AUDIT.VIEW_HISTORY");
  const canViewReport = usePermission("NIGHT_AUDIT.VIEW_REPORT");
  const canRun = usePermission("NIGHT_AUDIT.RUN");
  const canRollback = usePermission("NIGHT_AUDIT.ROLLBACK");

  const {
    data: statusData,
    isLoading: statusLoading,
    isError: statusError,
    refetch: refetchStatus,
  } = useNightAuditStatus();
  const {
    data: preCheck,
    isLoading: preCheckLoading,
    isError: preCheckError,
    refetch: refetchPreCheck,
  } = useNightAuditPreCheck();
  const {
    data: history,
    isLoading: historyLoading,
  } = useNightAuditHistory();

  const latestCompletedId = useMemo(() => {
    if (!history) return null;
    const completed = history.find((a) => a.status === "COMPLETED");
    return completed?.id ?? null;
  }, [history]);

  const { data: auditDetail, isLoading: detailLoading } =
    useNightAuditDetail(latestCompletedId ?? "");

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

  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);

  const isInProgress = statusData?.status === "IN_PROGRESS";

  const isLoading = statusLoading || preCheckLoading;
  const isError = statusError || preCheckError;

  if (!canViewStatus) {
    return (
      <div>
        <PageHeader
          title="Night Audit"
          subtitle="End-of-day financial and operational closeout"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to view night audit.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Night Audit"
        subtitle={
          activeHotel
            ? `${activeHotel.name} — End-of-day closeout`
            : "End-of-day financial and operational closeout"
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchStatus();
                refetchPreCheck();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        }
      />

      {isInProgress && (
        <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Night audit is currently running. Please wait for it to complete
            before taking any actions.
          </AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load night audit data. Please try refreshing.
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => navigate({ tab: v })}
        className="space-y-6"
      >
        <TabsList>
          {TABS.map((t) => {
            if (t.key === "history" && !canViewHistory) return null;
            if (t.key === "report" && !canViewReport) return null;
            return (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab
            status={statusData ?? null}
            preCheck={preCheck ?? null}
            isLoading={isLoading}
            isError={isError}
            isInProgress={isInProgress}
            canRun={canRun}
            canRollback={canRollback}
            onOpenRunDialog={() => setRunDialogOpen(true)}
            onOpenRollbackDialog={() => setRollbackDialogOpen(true)}
            onNavigatePreCheck={() => navigate({ tab: "pre-check" })}
          />
        </TabsContent>

        <TabsContent value="pre-check" className="space-y-6">
          <PreCheckTab
            preCheck={preCheck ?? null}
            isLoading={preCheckLoading}
            isError={preCheckError}
            onRetry={refetchPreCheck}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistoryTab
            history={history ?? []}
            isLoading={historyLoading}
            canRollback={canRollback}
          />
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          <ReportTab
            audit={auditDetail ?? null}
            isLoading={detailLoading}
            latestCompletedId={latestCompletedId}
          />
        </TabsContent>
      </Tabs>

      <RunAuditDialog
        open={runDialogOpen}
        onClose={() => setRunDialogOpen(false)}
        preCheck={preCheck ?? null}
      />

      <RollbackDialog
        open={rollbackDialogOpen}
        onClose={() => setRollbackDialogOpen(false)}
      />
    </div>
  );
}
