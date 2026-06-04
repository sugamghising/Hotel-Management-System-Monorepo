import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/api/modules/reservations";

interface TimelineCardProps {
  reservation: Reservation;
}

export function TimelineCard({ reservation }: TimelineCardProps) {
  const room = reservation.rooms[0];

  const events: Array<{
    date: string;
    label: string;
    color: "red" | "green" | "gray";
    actor?: string;
  }> = [];

  events.push({
    date: reservation.source.bookedAt,
    label: `Reservation created via ${reservation.source.bookingSource}`,
    color: "gray",
  });

  if (room?.assignedAt) {
    events.push({
      date: room.assignedAt,
      label: `Room ${room.roomNumber || room.roomTypeName} assigned`,
      color: "gray",
    });
  }

  if (room?.checkInAt) {
    events.push({
      date: room.checkInAt,
      label: `Checked in to Room ${room.roomNumber || room.roomTypeName}`,
      color: "green",
    });
  }

  if (room?.checkOutAt) {
    events.push({
      date: room.checkOutAt,
      label: `Checked out from Room ${room.roomNumber || room.roomTypeName}`,
      color: "green",
    });
  }

  if (reservation.cancellation?.cancelledAt) {
    events.push({
      date: reservation.cancellation.cancelledAt,
      label: `Reservation cancelled by ${reservation.cancellation.cancelledBy}`,
      color: "red",
      actor: reservation.cancellation.cancelledBy,
    });
  }

  events.push({
    date: reservation.modifiedAt,
    label: "Last modified",
    color: "gray",
  });

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {events.map((event, i) => (
            <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
              {i < events.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
              )}
              <div
                className={cn(
                  "mt-1.5 h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-background z-10",
                  event.color === "red" && "bg-red-500",
                  event.color === "green" && "bg-emerald-500",
                  event.color === "gray" && "bg-muted-foreground/30",
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{event.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(event.date)}
                  {event.actor && <span> · {event.actor}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
