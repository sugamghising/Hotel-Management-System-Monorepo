"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
  useOccupancyReport,
  useRevenueReport,
  useADRReport,
  useRevPARReport,
  useReportNightAuditHistory,
} from "@/lib/hooks";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, Check } from "lucide-react";
import { format, startOfMonth, differenceInDays } from "date-fns";
import { computeDates, autoGroupBy, ReportControls } from "./ReportControls";
import { OccupancyReportTab } from "./Tabs/OccupancyReport";
import { RevenueReportTab } from "./Tabs/RevenueReport";
import { ADRReportTab } from "./Tabs/ADRReport";
import { RevPARReportTab } from "./Tabs/RevPARReport";
import { NightAuditSummaryReportTab } from "./Tabs/NightAuditSummaryReport";
import { formatCurrency as fmtCurrency } from "@/lib/utils/formatters";
import type {
  OccupancyReport,
  RevenueReport,
  ADRReport,
  NightAuditSummary,
} from "@/lib/hooks/useReports";

const TABS = [
  { key: "occupancy", label: "Occupancy", perm: "REPORT.OCCUPANCY" },
  { key: "revenue", label: "Revenue", perm: "REPORT.REVENUE" },
  { key: "adr", label: "ADR", perm: "REPORT.ADR" },
  { key: "revpar", label: "RevPAR", perm: "REPORT.REVPAR" },
  { key: "audit", label: "Night Audit Summary", perm: "REPORT.NIGHT_AUDIT" },
] as const;

const todayStr = () => format(new Date(), "yyyy-MM-dd");
const monthStartStr = () => format(startOfMonth(new Date()), "yyyy-MM-dd");

export default function ReportsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeHotel } = useAuthStore();

  const tab = searchParams.get("tab") ?? "occupancy";
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const presetParam = searchParams.get("preset") ?? "MTD";
  const groupByParam = searchParams.get("groupBy") ?? "day";

  const from = fromParam ?? monthStartStr();
  const to = toParam ?? todayStr();
  const preset = presetParam;
  const groupBy = groupByParam;

  const canExport = usePermission("REPORT.EXPORT");
  const [copied, setCopied] = useState(false);

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

  const handlePresetChange = useCallback(
    (newPreset: string, newFrom: string, newTo: string, newGroupBy: string) => {
      navigate({ preset: newPreset, from: newFrom, to: newTo, groupBy: newGroupBy, tab: null });
    },
    [navigate],
  );

  const handleDateRangeChange = useCallback(
    (newFrom: string, newTo: string, newGroupBy?: string) => {
      const gb = newGroupBy ?? autoGroupBy(newFrom, newTo);
      navigate({ from: newFrom, to: newTo, groupBy: gb, preset: "custom" });
    },
    [navigate],
  );

  const handleGroupByChange = useCallback(
    (newGroupBy: string) => {
      navigate({ groupBy: newGroupBy });
    },
    [navigate],
  );

  const currencyCode = activeHotel?.currencyCode ?? "USD";

  const isOccTab = tab === "occupancy";
  const isRevTab = tab === "revenue";
  const isADRTab = tab === "adr";
  const isRevPARTab = tab === "revpar";
  const isAuditTab = tab === "audit";

  const { data: occupancy, isLoading: occLoading } = useOccupancyReport(
    { startDate: from, endDate: to, groupBy: groupBy as any },
    isOccTab && !!from && !!to,
  );

  const { data: revenue, isLoading: revLoading } = useRevenueReport(
    { startDate: from, endDate: to, groupBy: groupBy as any },
    isRevTab && !!from && !!to,
  );

  const { data: adr, isLoading: adrLoading } = useADRReport(
    { startDate: from, endDate: to, groupBy: groupBy as any },
    isADRTab && !!from && !!to,
  );

  const { data: revpar, isLoading: revparLoading } = useRevPARReport(
    { startDate: from, endDate: to, groupBy: groupBy as any },
    isRevPARTab && !!from && !!to,
  );

  const { data: auditHistory, isLoading: auditLoading } = useReportNightAuditHistory();

  const filteredAudits = useMemo(() => {
    if (!auditHistory) return [];
    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    return auditHistory.filter((a) => {
      const d = new Date(a.businessDate);
      return d >= start && d <= end;
    });
  }, [auditHistory, from, to]);

  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    let csv = "";
    let filename = "";

    switch (tab) {
      case "occupancy": {
        const d = occupancy;
        if (!d) return;
        filename = `occupancy-${from}-${to}.csv`;
        csv = "Period,Total Rooms,Occupied Rooms,Occupancy Rate\n";
        csv += `${d.period},${d.totalRooms},${d.occupiedRooms},${d.occupancyRate.toFixed(2)}%\n`;
        csv += "\nDate,Occupied,Total,Rate\n";
        d.daily.forEach((r) => {
          csv += `${r.date},${r.occupied},${r.total},${r.rate.toFixed(2)}%\n`;
        });
        break;
      }
      case "revenue": {
        const d = revenue;
        if (!d) return;
        filename = `revenue-${from}-${to}.csv`;
        csv = "Period,Room Revenue,F&B Revenue,Other Revenue,Tax,Total Revenue\n";
        csv += `${d.period},${d.roomRevenue},${d.fnbRevenue},${d.otherRevenue},${d.taxTotal},${d.totalRevenue}\n`;
        csv += "\nDate,Room Revenue,F&B Revenue,Other Revenue,Total Revenue\n";
        d.daily.forEach((r) => {
          csv += `${r.date},${r.roomRevenue},${r.fnbRevenue},${r.otherRevenue},${r.totalRevenue}\n`;
        });
        break;
      }
      case "adr": {
        const d = adr;
        if (!d) return;
        filename = `adr-${from}-${to}.csv`;
        csv = "Period,ADR,RevPAR,Total Room Nights,Total Room Revenue\n";
        csv += `${d.period},${d.adr},${d.revPar},${d.totalRoomNights},${d.totalRoomRevenue}\n`;
        csv += "\nDate,ADR,RevPAR,Room Nights\n";
        d.daily.forEach((r) => {
          csv += `${r.date},${r.adr},${r.revPar},${r.roomNights}\n`;
        });
        break;
      }
      case "revpar": {
        const d = revpar;
        if (!d) return;
        filename = `revpar-${from}-${to}.csv`;
        csv = "Period,ADR,RevPAR,Total Room Nights,Total Room Revenue\n";
        csv += `${d.period},${d.adr},${d.revPar},${d.totalRoomNights},${d.totalRoomRevenue}\n`;
        csv += "\nDate,ADR,RevPAR,Room Nights\n";
        d.daily.forEach((r) => {
          csv += `${r.date},${r.adr},${r.revPar},${r.roomNights}\n`;
        });
        break;
      }
      case "audit": {
        filename = `night-audit-${from}-${to}.csv`;
        csv = "Business Date,Room Revenue,Other Revenue,Tax Collected,Payments,Adjustments,No-Shows,Check-Ins,Check-Outs,In House,Occupancy Rate\n";
        filteredAudits.forEach((a) => {
          csv += `${a.businessDate},${a.totals.roomRevenue},${a.totals.otherRevenue},${a.totals.taxCollected},${a.totals.paymentsReceived},${a.totals.adjustments},${a.noShows},${a.checkIns},${a.checkOuts},${a.inHouse},${a.occupancyRate.toFixed(2)}%\n`;
        });
        break;
      }
    }

    navigator.clipboard.writeText(csv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [tab, occupancy, revenue, adr, revpar, filteredAudits, from, to, canExport]);

  const permChecks = {
    occupancy: usePermission("REPORT.OCCUPANCY"),
    revenue: usePermission("REPORT.REVENUE"),
    adr: usePermission("REPORT.ADR"),
    revpar: usePermission("REPORT.REVPAR"),
    audit: usePermission("REPORT.NIGHT_AUDIT"),
  };

  const anyPerm = Object.values(permChecks).some(Boolean);

  if (!anyPerm) {
    return (
      <div>
        <PageHeader
          title="Reports"
          subtitle="Performance and financial analytics"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to view any reports.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={
          activeHotel
            ? `${activeHotel.name} — Performance analytics`
            : "Performance and financial analytics"
        }
        actions={
          canExport && (
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Export CSV
                </>
              )}
            </Button>
          )
        }
      />

      <ReportControls
        from={from}
        to={to}
        preset={preset}
        groupBy={groupBy}
        tab={tab}
        onPresetChange={handlePresetChange}
        onDateRangeChange={handleDateRangeChange}
        onGroupByChange={handleGroupByChange}
      />

      <Tabs
        value={tab}
        onValueChange={(v) => navigate({ tab: v })}
        className="space-y-6 mt-6"
      >
        <TabsList>
          {TABS.map((t) => {
            if (!permChecks[t.key as keyof typeof permChecks]) return null;
            return (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="occupancy" className="space-y-6">
          <OccupancyReportTab
            data={occupancy ?? undefined}
            isLoading={occLoading}
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueReportTab
            data={revenue ?? undefined}
            isLoading={revLoading}
            currencyCode={currencyCode}
          />
        </TabsContent>

        <TabsContent value="adr" className="space-y-6">
          <ADRReportTab
            data={adr ?? undefined}
            isLoading={adrLoading}
            currencyCode={currencyCode}
          />
        </TabsContent>

        <TabsContent value="revpar" className="space-y-6">
          <RevPARReportTab
            data={revpar ?? undefined}
            isLoading={revparLoading}
            currencyCode={currencyCode}
          />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <NightAuditSummaryReportTab
            data={filteredAudits}
            isLoading={auditLoading}
            currencyCode={currencyCode}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
