"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useReservations } from "@/lib/hooks/useReservations";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { reservationColumns } from "./columns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CalendarCheck } from "lucide-react";
import { RESERVATION_STATUS_MAP } from "@/lib/constants/statuses";
import { usePermission } from "@/lib/hooks/usePermission";

export default function ReservationsPage() {
  const router = useRouter();
  const { hotelId } = useParams<{ hotelId: string }>();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") ?? "all",
  );

  const canCreate = usePermission("RESERVATION.CREATE");

  const { data, isLoading } = useReservations(
    statusFilter !== "all" ? { status: statusFilter } : undefined,
  );

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle="Manage all bookings and stays"
        breadcrumb={[
          { label: "Dashboard", href: `/hotels/${hotelId}` },
          { label: "Reservations" },
        ]}
        actions={
          canCreate && (
            <Button
              size="sm"
              onClick={() => router.push(`/hotels/${hotelId}/reservations/new`)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Reservation
            </Button>
          )
        }
      />

      <DataTable
        columns={reservationColumns}
        data={data?.reservations ?? []}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search guest, confirmation number..."
        emptyMessage="No reservations found"
        emptyIcon={<CalendarCheck className="h-8 w-8 opacity-20" />}
        onRowClick={(row) =>
          router.push(`/hotels/${hotelId}/reservations/${row.id}`)
        }
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(RESERVATION_STATUS_MAP).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
