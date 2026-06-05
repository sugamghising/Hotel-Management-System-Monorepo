"use client";

import type { NightAuditStatus_ } from "@/lib/hooks/useNightAudits";
import { StatCard } from "@/components/layout/StatCard";
import { Banknote, Receipt, CreditCard, UserX } from "lucide-react";

interface QuickStatsProps {
  audit: NightAuditStatus_ | null;
  isLoading: boolean;
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function QuickStats({ audit, isLoading }: QuickStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Room Revenue"
        value={formatCurrency(audit?.roomRevenue)}
        icon={<Banknote className="h-5 w-5 text-emerald-600" />}
        iconBg="bg-emerald-50"
        isLoading={isLoading}
        subtitle="Total room charges posted"
      />
      <StatCard
        title="Other Revenue"
        value={formatCurrency(audit?.otherRevenue)}
        icon={<Receipt className="h-5 w-5 text-blue-600" />}
        iconBg="bg-blue-50"
        isLoading={isLoading}
        subtitle="Incidentals & services"
      />
      <StatCard
        title="Payments Received"
        value={formatCurrency(audit?.paymentsReceived)}
        icon={<CreditCard className="h-5 w-5 text-violet-600" />}
        iconBg="bg-violet-50"
        isLoading={isLoading}
        subtitle="Payments collected"
      />
      <StatCard
        title="No-Shows Marked"
        value={audit?.noShowsMarked ?? 0}
        icon={<UserX className="h-5 w-5 text-orange-600" />}
        iconBg="bg-orange-50"
        isLoading={isLoading}
        subtitle="Guests marked no-show"
      />
    </div>
  );
}
