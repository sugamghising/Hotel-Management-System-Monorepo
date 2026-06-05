"use client";

import type { NightAuditPreCheck } from "@/lib/hooks/useNightAudits";
import { PreCheckChecklist } from "./PreCheckChecklist";

interface PreCheckTabProps {
  preCheck: NightAuditPreCheck | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function PreCheckTab({
  preCheck,
  isLoading,
  isError,
  onRetry,
}: PreCheckTabProps) {
  return (
    <PreCheckChecklist
      preCheck={preCheck}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
    />
  );
}
