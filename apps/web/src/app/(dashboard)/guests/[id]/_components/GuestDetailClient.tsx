"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuest } from "@/lib/hooks/useGuests";
import { formatCurrency } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth.store";
import { RefreshCw, AlertCircle } from "lucide-react";
import { GuestProfileHeader } from "./GuestProfileHeader";
import { GuestInfoCard } from "./GuestInfoCard";
import { GuestPreferencesCard } from "./GuestPreferencesCard";
import { GuestStayHistoryCard } from "./GuestStayHistory";
import { GuestMarketingCard } from "./GuestMarketingCard";
import { AlertNotesCard } from "./AlertNotesCard";
import { EditGuestDialog } from "./EditGuestDialog";
import { UpdateVipDialog } from "./UpdateVipDialog";

interface GuestDetailClientProps {
  id: string;
}

export function GuestDetailClient({ id }: GuestDetailClientProps) {
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const { data: guest, isLoading, isError, refetch } = useGuest(id);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [vipDialogGuest, setVipDialogGuest] = useState<any>(null);

  const statItems = useMemo(() => {
    if (!guest) return [];
    const h = guest.history;
    return [
      { label: "Total Stays", value: h.totalStays },
      { label: "Total Nights", value: h.totalNights },
      {
        label: "Total Revenue",
        value: formatCurrency(h.totalRevenue, activeHotel?.currencyCode ?? "USD"),
      },
      {
        label: "Avg Rate",
        value: formatCurrency(h.averageRate, activeHotel?.currencyCode ?? "USD"),
      },
    ];
  }, [guest, activeHotel]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader title="Loading..." />
        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !guest) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader title="Guest Profile" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-muted-foreground">Failed to load guest profile</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={`${guest.firstName} ${guest.lastName}`}
        subtitle={`Guest profile`}
      />

      <AlertNotesCard guest={guest} />

      <GuestProfileHeader
        guest={guest}
        onEdit={() => setEditDialogOpen(true)}
        onUpdateVip={() =>
          setVipDialogGuest({
            id: guest.id,
            firstName: guest.firstName,
            lastName: guest.lastName,
            vipStatus: guest.vipStatus,
            vipReason: guest.vipReason,
          })
        }
      />

      {/* Stay Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GuestStayHistoryCard id={id} />
          <GuestPreferencesCard guest={guest} />
        </div>
        <div className="space-y-6">
          <GuestInfoCard
            guest={guest}
            onEdit={() => setEditDialogOpen(true)}
          />
          <GuestMarketingCard guest={guest} />
        </div>
      </div>

      <EditGuestDialog
        guest={guest ?? null}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />

      <UpdateVipDialog
        guest={vipDialogGuest}
        open={!!vipDialogGuest}
        onClose={() => setVipDialogGuest(null)}
      />
    </div>
  );
}
