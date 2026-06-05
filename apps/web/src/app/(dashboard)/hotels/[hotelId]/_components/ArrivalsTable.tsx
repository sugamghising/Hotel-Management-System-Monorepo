"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReservationBadge } from "@/components/status/StatusBadge";
import { formatCurrency, formatNights } from "@/lib/utils/formatters";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArrivalRow {
  id: string;
  confirmationNumber: string;
  guests: { primaryGuestName: string };
  dates: { checkIn: string; checkOut: string; nights: number };
  rooms: Array<{
    roomNumber: string | null;
    roomTypeName: string;
    roomRate: number;
  }>;
  financial: { balance: number; currencyCode: string };
  status: { reservation: string };
  source: { bookingSource: string };
}

interface ArrivalsTableProps {
  arrivals: ArrivalRow[];
  isLoading: boolean;
  hotelId: string;
  currencyCode: string;
}

export function ArrivalsTable({
  arrivals,
  isLoading,
  hotelId,
  currencyCode,
}: ArrivalsTableProps) {
  const router = useRouter();
  const displayed = arrivals.slice(0, 8);
  const hasMore = arrivals.length > 8;

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">
          Today&apos;s Arrivals ({arrivals.length})
        </CardTitle>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() =>
            router.push(
              `/hotels/${hotelId}/reservations?status=CONFIRMED&checkIn=today`,
            )
          }
        >
          View all {arrivals.length} arrivals &rarr;
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : arrivals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2" />
            <p className="text-sm">No arrivals today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Room</th>
                  <th className="pb-2 pr-3 font-medium">Guest Name</th>
                  <th className="pb-2 pr-3 font-medium">Nights</th>
                  <th className="pb-2 pr-3 font-medium">Rate</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 pr-3 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/hotels/${hotelId}/reservations/${r.id}`,
                      )
                    }
                  >
                    <td className="py-2.5 pr-3 font-medium">
                      {r.rooms[0]?.roomNumber ?? r.rooms[0]?.roomTypeName ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3 truncate max-w-[160px]">
                      {r.guests.primaryGuestName}
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {r.dates.nights}
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {formatCurrency(
                        r.rooms[0]?.roomRate ?? 0,
                        currencyCode,
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      <ReservationBadge
                        status={r.status.reservation as any}
                        size="sm"
                      />
                    </td>
                    <td
                      className={cn(
                        "py-2.5 text-right font-medium tabular-nums",
                        r.financial.balance > 0 && "text-red-600",
                      )}
                    >
                      {formatCurrency(
                        r.financial.balance,
                        currencyCode,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && hasMore && (
          <div className="mt-3 text-center">
            <Button
              variant="link"
              size="sm"
              className="text-xs"
              onClick={() =>
                router.push(
                  `/hotels/${hotelId}/reservations?status=CONFIRMED&checkIn=today`,
                )
              }
            >
              View all {arrivals.length} arrivals &rarr;
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
