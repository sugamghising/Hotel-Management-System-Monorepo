"use client";

import type { NightAuditStatus_, NightAuditPreCheck } from "@/lib/hooks/useNightAudits";
import { QuickStats } from "./QuickStats";
import { CurrentStatusCard } from "./CurrentStatusCard";
import { QuickActions } from "./QuickActions";

interface OverviewTabProps {
  status: NightAuditStatus_ | null;
  preCheck: NightAuditPreCheck | null;
  isLoading: boolean;
  isError: boolean;
  isInProgress: boolean;
  canRun: boolean;
  canRollback: boolean;
  onOpenRunDialog: () => void;
  onOpenRollbackDialog: () => void;
  onNavigatePreCheck: () => void;
}

export function OverviewTab({
  status,
  preCheck,
  isLoading,
  isError,
  isInProgress,
  canRun,
  canRollback,
  onOpenRunDialog,
  onOpenRollbackDialog,
  onNavigatePreCheck,
}: OverviewTabProps) {
  return (
    <>
      <QuickStats audit={status} isLoading={isLoading} />
      <CurrentStatusCard audit={status} preCheck={preCheck} isLoading={isLoading} />
      <QuickActions
        status={status?.status ?? null}
        canProceed={preCheck?.canProceed ?? false}
        canRun={canRun}
        canRollback={canRollback}
        isInProgress={isInProgress}
        onRun={onOpenRunDialog}
        onRollback={onOpenRollbackDialog}
        onViewPreCheck={onNavigatePreCheck}
      />
    </>
  );
}
