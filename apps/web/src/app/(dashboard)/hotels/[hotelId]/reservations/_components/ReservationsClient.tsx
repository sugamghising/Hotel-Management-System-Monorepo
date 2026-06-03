"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { useReservations } from "@/lib/hooks/useReservations";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  CalendarCheck,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Clock,
  Users,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { ReservationBadge } from "@/components/status/StatusBadge";

import { ReservationsFilters } from "./ReservationsFilters";
import { ReservationActions } from "./ReservationActions";
import { CheckInDialog } from "./CheckInDialog";
import { CheckOutDialog } from "./CheckOutDialog";
import { CancelDialog } from "./CancelDialog";

import type { ReservationListItem } from "@/lib/api/modules/reservations";

const SOURCE_LABELS: Record<string, string> = {
  DIRECT_WEB: "Direct",
  DIRECT_PHONE: "Phone",
  DIRECT_WALKIN: "Walk-in",
  BOOKING_COM: "Booking.com",
  EXPEDIA: "Expedia",
  AIRBNB: "Airbnb",
  CORPORATE: "Corporate",
  TRAVEL_AGENT: "Agent",
};

export default function ReservationsClient() {
  const router = useRouter();
  const { hotelId } = useParams<{ hotelId: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currencyCode = useAuthStore((s) => s.activeHotel?.currencyCode ?? "USD");

  const canCreate = usePermission("RESERVATION.CREATE");
  const canCheckIn = usePermission("RESERVATION.CHECK_IN");
  const canCheckOut = usePermission("RESERVATION.CHECK_OUT");
  const canCancel = usePermission("RESERVATION.CANCEL");

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") ?? "all",
  );
  const [checkInFrom, setCheckInFrom] = useState(
    searchParams.get("checkInFrom") ?? "",
  );
  const [checkInTo, setCheckInTo] = useState(
    searchParams.get("checkInTo") ?? "",
  );
  const [guestName, setGuestName] = useState(
    searchParams.get("guestName") ?? "",
  );
  const [confirmationNumber, setConfirmationNumber] = useState(
    searchParams.get("confirmationNumber") ?? "",
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const initialSearch = guestName || confirmationNumber || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        setGuestName("");
        setConfirmationNumber("");
        return;
      }
      if (/^[A-Z0-9]{6,}$/.test(trimmed)) {
        setConfirmationNumber(trimmed);
        setGuestName("");
      } else {
        setGuestName(trimmed);
        setConfirmationNumber("");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (checkInFrom) params.set("checkInFrom", checkInFrom);
    if (checkInTo) params.set("checkInTo", checkInTo);
    if (guestName) params.set("guestName", guestName);
    if (confirmationNumber) params.set("confirmationNumber", confirmationNumber);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [statusFilter, checkInFrom, checkInTo, guestName, confirmationNumber, page, router, pathname]);

  const apiParams = useMemo(() => {
    const p: Record<string, any> = { limit: 20 };
    if (statusFilter !== "all") p.status = statusFilter;
    if (checkInFrom) p.checkInFrom = checkInFrom;
    if (checkInTo) p.checkInTo = checkInTo;
    if (guestName) p.guestName = guestName;
    if (confirmationNumber) p.confirmationNumber = confirmationNumber;
    if (page > 1) p.page = page;
    return p;
  }, [statusFilter, checkInFrom, checkInTo, guestName, confirmationNumber, page]);

  const { data, isLoading, isError, refetch } = useReservations(apiParams);
  const reservations = data?.reservations ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const [selectedReservation, setSelectedReservation] =
    useState<ReservationListItem | null>(null);
  const [dialogType, setDialogType] = useState<
    "checkin" | "checkout" | "cancel" | null
  >(null);

  const handleOpenCheckIn = useCallback((r: ReservationListItem) => {
    setSelectedReservation(r);
    setDialogType("checkin");
  }, []);
  const handleOpenCheckOut = useCallback((r: ReservationListItem) => {
    setSelectedReservation(r);
    setDialogType("checkout");
  }, []);
  const handleOpenCancel = useCallback((r: ReservationListItem) => {
    setSelectedReservation(r);
    setDialogType("cancel");
  }, []);
  const handleCloseDialog = useCallback(() => {
    setSelectedReservation(null);
    setDialogType(null);
  }, []);

  const handleQuickStat = useCallback(
    (type: "arriving" | "departing" | "inhouse" | "pending") => {
      setPage(1);
      switch (type) {
        case "arriving":
          if (
            statusFilter === "CONFIRMED" &&
            checkInFrom === todayStr &&
            checkInTo === todayStr
          ) {
            setStatusFilter("all");
            setCheckInFrom("");
            setCheckInTo("");
          } else {
            setStatusFilter("CONFIRMED");
            setCheckInFrom(todayStr);
            setCheckInTo(todayStr);
          }
          break;
        case "departing":
          if (statusFilter === "CHECKED_IN" && !checkInFrom && !checkInTo) {
            setStatusFilter("all");
          } else {
            setStatusFilter("CHECKED_IN");
            setCheckInFrom("");
            setCheckInTo("");
          }
          break;
        case "inhouse":
          if (statusFilter === "CHECKED_IN" && !checkInFrom && !checkInTo) {
            setStatusFilter("all");
          } else {
            setStatusFilter("CHECKED_IN");
            setCheckInFrom("");
            setCheckInTo("");
          }
          break;
        case "pending":
          if (statusFilter === "PENDING") {
            setStatusFilter("all");
          } else {
            setStatusFilter("PENDING");
          }
          break;
      }
    },
    [statusFilter, checkInFrom, checkInTo, todayStr],
  );

  const isArrivingActive =
    statusFilter === "CONFIRMED" &&
    checkInFrom === todayStr &&
    checkInTo === todayStr;
  const isDepartingActive =
    statusFilter === "CHECKED_IN" && !checkInFrom && !checkInTo;
  const isInHouseActive = isDepartingActive;
  const isPendingActive = statusFilter === "PENDING";

  const handleClearFilters = useCallback(() => {
    setStatusFilter("all");
    setCheckInFrom("");
    setCheckInTo("");
    setGuestName("");
    setConfirmationNumber("");
    setSearchTerm("");
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      statusFilter !== "all" ||
      !!checkInFrom ||
      !!checkInTo ||
      !!guestName ||
      !!confirmationNumber,
    [statusFilter, checkInFrom, checkInTo, guestName, confirmationNumber],
  );

  const totalPages = pagination.totalPages;
  const total = pagination.total;
  const limit = 20;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPages]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      const el = document.getElementById("reservations-table");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [totalPages],
  );

  const columns = useMemo<ColumnDef<ReservationListItem>[]>(
    () => [
      {
        accessorKey: "confirmationNumber",
        header: "Confirmation #",
        size: 140,
        cell: ({ row }) => (
          <span
            className="font-mono text-xs font-bold text-blue-600 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/hotels/${hotelId}/reservations/${row.original.id}`);
            }}
          >
            {row.original.confirmationNumber}
          </span>
        ),
      },
      {
        accessorKey: "guestName",
        header: "Guest",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div>
              <span
                className="font-medium cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/hotels/${hotelId}/reservations/${r.id}`);
                }}
              >
                {r.guestName}
              </span>
              <div className="text-xs text-muted-foreground mt-0.5">
                {SOURCE_LABELS[r.source] ?? r.source}
              </div>
            </div>
          );
        },
      },
      {
        id: "dates",
        header: () => <span className="hidden md:inline">Dates</span>,
        size: 160,
        cell: ({ row }) => (
          <div className="hidden md:block text-sm">
            <span>
              {formatDate(row.original.checkInDate)} →{" "}
              {formatDate(row.original.checkOutDate)}
            </span>
            <div className="text-xs text-muted-foreground">
              {row.original.nights}{" "}
              {row.original.nights === 1 ? "night" : "nights"}
            </div>
          </div>
        ),
      },
      {
        id: "room",
        header: "Room",
        size: 100,
        cell: ({ row }) => {
          const r = row.original;
          return r.roomNumber ? (
            <span className="font-mono text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">
              {r.roomNumber}
            </span>
          ) : (
            <span
              className="text-xs text-muted-foreground italic"
              title="No room assigned"
            >
              {r.roomType}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        cell: ({ row }) => {
          const r = row.original;
          const showCheckInStatus =
            r.checkInStatus === "EARLY_CHECK_IN" ||
            r.checkInStatus === "LATE_CHECK_OUT";
          return (
            <div>
              <ReservationBadge status={r.status} />
              {showCheckInStatus && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {r.checkInStatus === "EARLY_CHECK_IN"
                    ? "Early check-in"
                    : "Late check-out"}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "balance",
        accessorKey: "balance",
        header: () => <span className="hidden md:inline">Balance</span>,
        size: 100,
        cell: ({ row }) => {
          const bal = row.original.balance;
          const inner =
            bal === 0 ? (
              <span className="text-sm font-medium text-emerald-600">Paid</span>
            ) : bal > 0 ? (
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(bal, currencyCode)}
              </span>
            ) : (
              <span className="text-sm font-medium text-blue-600">
                {formatCurrency(Math.abs(bal), currencyCode)} CR
              </span>
            );
          return <span className="hidden md:inline">{inner}</span>;
        },
      },
      {
        id: "actions",
        header: "",
        size: 60,
        cell: ({ row }) => (
          <ReservationActions
            reservation={row.original}
            hotelId={hotelId}
            onNavigate={(url) => router.push(url)}
            onCheckIn={() => handleOpenCheckIn(row.original)}
            onCheckOut={() => handleOpenCheckOut(row.original)}
            onCancel={() => handleOpenCancel(row.original)}
            canCheckIn={canCheckIn}
            canCheckOut={canCheckOut}
            canCancel={canCancel}
          />
        ),
      },
    ],
    [
      hotelId,
      router,
      currencyCode,
      canCheckIn,
      canCheckOut,
      canCancel,
      handleOpenCheckIn,
      handleOpenCheckOut,
      handleOpenCancel,
    ],
  );

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reservations"
          subtitle="Manage all bookings and stays"
          breadcrumb={[
            { label: "Dashboard", href: `/hotels/${hotelId}` },
            { label: "Reservations" },
          ]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-muted-foreground">
              Failed to load reservations
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        subtitle={`${total.toLocaleString()} reservation${total !== 1 ? "s" : ""}`}
        breadcrumb={[
          { label: "Dashboard", href: `/hotels/${hotelId}` },
          { label: "Reservations" },
        ]}
        actions={
          canCreate && (
            <Button
              size="sm"
              onClick={() =>
                router.push(`/hotels/${hotelId}/reservations/new`)
              }
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Reservation
            </Button>
          )
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant={isArrivingActive ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickStat("arriving")}
          className="gap-1.5"
        >
          <CalendarCheck className="h-4 w-4" />
          Arriving Today
        </Button>
        <Button
          variant={isDepartingActive ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickStat("departing")}
          className="gap-1.5"
        >
          <Clock className="h-4 w-4" />
          Departing Today
        </Button>
        <Button
          variant={isInHouseActive ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickStat("inhouse")}
          className="gap-1.5"
        >
          <Hotel className="h-4 w-4" />
          In House
        </Button>
        <Button
          variant={isPendingActive ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickStat("pending")}
          className="gap-1.5"
        >
          <Users className="h-4 w-4" />
          Pending
        </Button>
      </div>

      <ReservationsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        checkInFrom={checkInFrom}
        checkInTo={checkInTo}
        onCheckInFromChange={(v) => {
          setCheckInFrom(v);
          setPage(1);
        }}
        onCheckInToChange={(v) => {
          setCheckInTo(v);
          setPage(1);
        }}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div id="reservations-table">
        <DataTable
          columns={columns}
          data={reservations}
          isLoading={isLoading}
          pageSize={Math.max(reservations.length, 20)}
          emptyMessage="No reservations found"
          emptyIcon={<CalendarCheck className="h-8 w-8 opacity-20" />}
          onRowClick={(row) =>
            router.push(`/hotels/${hotelId}/reservations/${row.id}`)
          }
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {startItem}–{endItem} of {total.toLocaleString()}{" "}
            reservation{total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 min-w-8"
                onClick={() => handlePageChange(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CheckInDialog
        reservation={selectedReservation}
        open={dialogType === "checkin"}
        onClose={handleCloseDialog}
      />
      <CheckOutDialog
        reservation={selectedReservation}
        open={dialogType === "checkout"}
        onClose={handleCloseDialog}
      />
      <CancelDialog
        reservation={selectedReservation}
        open={dialogType === "cancel"}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
