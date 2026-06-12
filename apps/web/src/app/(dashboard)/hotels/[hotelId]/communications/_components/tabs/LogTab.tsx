"use client";

import type { CommunicationLogFilters } from "@/lib/hooks/useCommunications";
import { useCommunicationLog, useResendCommunication } from "@/lib/hooks/useCommunications";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAuthStore } from "@/stores/auth.store";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { format, subDays, formatISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  RotateCcw,
  X,
} from "lucide-react";
import { CommunicationRow } from "../CommunicationRow";
import { CommunicationDetailSheet } from "../CommunicationDetailSheet";
import type { Communication, CommunicationChannel, CommunicationType, CommunicationStatus, CommunicationDirection } from "@/lib/hooks/useCommunications";

export function LogTab() {
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const sp = useSearchParams();
  const router = useRouter();
  const canSend = usePermission("COMMUNICATION.SEND");
  const resendMutation = useResendCommunication();

  const [showMore, setShowMore] = useState(false);
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters: CommunicationLogFilters = {
    search: sp.get("search") ?? undefined,
    dateFrom: sp.get("dateFrom") ?? formatISO(subDays(new Date(), 7), { representation: "date" }),
    dateTo: sp.get("dateTo") ?? formatISO(new Date(), { representation: "date" }),
    channel: (sp.get("channel") as CommunicationChannel) ?? undefined,
    type: (sp.get("commType") as CommunicationType) ?? undefined,
    status: (sp.get("status") as CommunicationStatus) ?? undefined,
    direction: (sp.get("direction") as CommunicationDirection) ?? undefined,
    page: sp.get("page") ? Number(sp.get("page")) : 1,
    pageSize: 25,
  };

  const { data, isLoading } = useCommunicationLog(activeHotel?.id ?? null, filters);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.set("page", "1");
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [sp, router],
  );

  const hasActiveFilters = !!(
    filters.search ||
    filters.channel ||
    filters.type ||
    filters.status ||
    filters.direction
  );

  const clearFilters = () => {
    router.replace("?tab=log", { scroll: false });
  };

  const totalPages = data ? Math.ceil(data.total / (filters.pageSize ?? 25)) : 0;

  return (
    <div>
      {/* Filter row 1 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Input
          placeholder="Guest name, email, or subject…"
          className="max-w-xs h-9 text-sm"
          value={filters.search ?? ""}
          onChange={(e) => updateFilter("search", e.target.value || null)}
        />
        <Input
          type="date"
          className="w-36 h-9 text-sm"
          value={filters.dateFrom ?? ""}
          onChange={(e) => updateFilter("dateFrom", e.target.value || null)}
        />
        <Input
          type="date"
          className="w-36 h-9 text-sm"
          value={filters.dateTo ?? ""}
          onChange={(e) => updateFilter("dateTo", e.target.value || null)}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          More filters
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground"
            onClick={clearFilters}
          >
            <X size={14} className="mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Filter row 2 (collapsible) */}
      {showMore && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Select
            value={filters.channel ?? "all"}
            onValueChange={(v) => updateFilter("channel", v === "all" ? null : v)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="SMS">SMS</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="PUSH">Push</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.type ?? "all"}
            onValueChange={(v) => updateFilter("commType", v === "all" ? null : v)}
          >
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="RESERVATION_CONFIRMATION">Confirmation</SelectItem>
              <SelectItem value="CHECKIN_REMINDER">Check-in Reminder</SelectItem>
              <SelectItem value="CHECKOUT_REMINDER">Check-out Reminder</SelectItem>
              <SelectItem value="WELCOME">Welcome</SelectItem>
              <SelectItem value="SURVEY">Survey</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="ALERT">Alert</SelectItem>
              <SelectItem value="CUSTOM">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) => updateFilter("status", v === "all" ? null : v)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="OPENED">Opened</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="BOUNCED">Bounced</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.direction ?? "all"}
            onValueChange={(v) => updateFilter("direction", v === "all" ? null : v)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="OUTBOUND">Outbound</SelectItem>
              <SelectItem value="INBOUND">Inbound</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left py-2 px-4 font-medium">Channel</th>
              <th className="text-left py-2 px-4 font-medium">Guest</th>
              <th className="text-left py-2 px-4 font-medium">Type</th>
              <th className="text-left py-2 px-4 font-medium">Subject</th>
              <th className="text-left py-2 px-4 font-medium">Status</th>
              <th className="text-left py-2 px-4 font-medium">Sent</th>
              <th className="text-left py-2 px-4 font-medium">Reservation</th>
              <th className="py-2 px-4 w-12" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : !data?.communications.length ? (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare size={32} className="mb-2 opacity-40" />
                    <p className="font-medium">No communications found</p>
                    <p className="text-sm">
                      {hasActiveFilters
                        ? "Try adjusting your filters."
                        : "Messages sent to guests will appear here."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.communications.map((comm) => (
                <CommunicationRow
                  key={comm.id}
                  comm={comm}
                  canResend={canSend}
                  onResend={(id) => resendMutation.mutate({ communicationId: id })}
                  onClick={(id) => {
                    const found = data.communications.find((c) => c.id === id);
                    if (found) {
                      setSelectedComm(found);
                      setSheetOpen(true);
                    }
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">
            Page {filters.page} of {totalPages} ({data?.total ?? 0} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!filters.page || filters.page <= 1}
              onClick={() => updateFilter("page", String((filters.page ?? 1) - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) >= totalPages}
              onClick={() => updateFilter("page", String((filters.page ?? 1) + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CommunicationDetailSheet
        comm={selectedComm}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
