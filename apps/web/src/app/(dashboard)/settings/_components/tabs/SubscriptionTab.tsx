"use client";

import { useOrgLimits } from "@/lib/hooks/useOrgSettings";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, CreditCard } from "lucide-react";
import { addDays, formatDistanceToNow, isAfter, parseISO } from "date-fns";

interface SubscriptionTabProps {
  orgId: string;
}

function UsageBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max > 0 ? (used / max) * 100 : 0;
  const color =
    pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{used} / {max}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function SubscriptionTab({ orgId }: SubscriptionTabProps) {
  const { data: limits, isLoading, isError } = useOrgLimits(orgId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !limits) {
    return (
      <p className="text-sm text-muted-foreground">
        Failed to load subscription details.
      </p>
    );
  }

  const trialEnd = null;
  const isTrialExpiring = trialEnd && isAfter(new Date(), addDays(parseISO(trialEnd), -7));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Your current plan and resource usage.
        </p>
      </div>
      <Separator />

      {isTrialExpiring && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Trial ending soon
            </p>
            <p className="text-xs text-yellow-700">
              Your trial ends {trialEnd ? formatDistanceToNow(parseISO(trialEnd), { addSuffix: true }) : ""}. Add a payment method to avoid interruption.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Plan</span>
          </div>
          <Badge variant="outline" className="text-xs">Current</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Your organization&apos;s subscription details are managed through the billing portal.
        </p>
        <UsageBar used={limits.hotels.used} max={limits.hotels.max} label="Hotels" />
        <UsageBar used={limits.users.used} max={limits.users.max} label="Users" />
        <UsageBar used={limits.rooms.used} max={limits.rooms.max} label="Rooms" />
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2">
        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">All systems operational</p>
          <p className="text-xs text-green-700">
            {limits.hotels.canAdd && limits.users.canAdd && limits.rooms.canAdd
              ? "You have capacity to add more resources."
              : "You have reached the limit for one or more resources."}
          </p>
        </div>
      </div>
    </div>
  );
}
