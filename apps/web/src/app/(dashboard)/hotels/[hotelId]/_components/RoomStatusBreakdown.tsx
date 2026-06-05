"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status/StatusBadge";
import { ROOM_STATUS_MAP } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

interface RoomGridFloor {
  floor: number | null;
  rooms: Array<{
    id: string;
    roomNumber: string;
    status: string;
    roomTypeCode: string;
    roomTypeName: string;
    isOutOfOrder: boolean;
    cleaningPriority: number;
    currentGuest?: string;
    nextArrival?: string;
  }>;
}

interface RoomGrid {
  floors: RoomGridFloor[];
  stats: {
    total: number;
    vacantClean: number;
    vacantDirty: number;
    occupied: number;
    outOfOrder: number;
  };
}

interface RoomStatusBreakdownProps {
  grid: RoomGrid | undefined;
  isLoading: boolean;
  hotelId: string;
}

const HK_STATUSES = new Set(["VACANT_DIRTY", "OCCUPIED_DIRTY"]);

export function RoomStatusBreakdown({
  grid,
  isLoading,
  hotelId,
}: RoomStatusBreakdownProps) {
  const router = useRouter();

  const statusGroups = new Map<string, number>();
  const hkRooms: Array<{ roomNumber: string; floor: number | null; status: string }> = [];

  if (grid) {
    for (const floor of grid.floors) {
      for (const room of floor.rooms) {
        statusGroups.set(room.status, (statusGroups.get(room.status) ?? 0) + 1);
        if (HK_STATUSES.has(room.status)) {
          hkRooms.push({
            roomNumber: room.roomNumber,
            floor: floor.floor,
            status: room.status,
          });
        }
      }
    }
    hkRooms.sort((a, b) => (a.floor ?? 99) - (b.floor ?? 99));
  }

  const statusOrder = ["VACANT_CLEAN", "VACANT_DIRTY", "OCCUPIED_CLEAN", "OCCUPIED_DIRTY", "OUT_OF_ORDER", "RESERVED", "BLOCKED", "VACANT_CLEANING", "OCCUPIED_CLEANING"];

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Room Status Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-8" />
              </div>
            ))}
          </div>
        ) : !grid ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No room data available
          </p>
        ) : (
          <div className="space-y-4">
            {statusOrder
              .filter((key) => (statusGroups.get(key) ?? 0) > 0)
              .map((key) => {
                const cfg = ROOM_STATUS_MAP[key as keyof typeof ROOM_STATUS_MAP];
                const count = statusGroups.get(key) ?? 0;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("h-2 w-2 rounded-full", cfg?.bg)}
                      />
                      <span className="text-sm">{cfg?.label ?? key}</span>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}

              {hkRooms.length > 0 && (
                <>
                  <hr className="my-3" />
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Housekeeping Needed
                    </h4>
                    <div className="space-y-1.5">
                      {hkRooms.slice(0, 5).map((r) => {
                        const cfg =
                          ROOM_STATUS_MAP[
                            r.status as keyof typeof ROOM_STATUS_MAP
                          ];
                        return (
                          <div
                            key={r.roomNumber}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="font-medium">
                              Room {r.roomNumber}
                              {r.floor !== null && (
                                <span className="text-muted-foreground font-normal">
                                  {" "}
                                  · Floor {r.floor}
                                </span>
                              )}
                            </span>
                            <StatusBadge
                              label={cfg?.label ?? r.status}
                              color={cfg?.light ?? ""}
                              dot={cfg?.bg}
                              showDot
                              size="sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                    {hkRooms.length > 5 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-xs"
                        onClick={() =>
                          router.push(
                            `/hotels/${hotelId}/rooms?status=VACANT_DIRTY`,
                          )
                        }
                      >
                        View all {hkRooms.length} rooms &rarr;
                      </Button>
                    )}
                  </div>
                </>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
