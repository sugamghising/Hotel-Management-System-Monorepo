"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUpdateHotelStatus } from "@/lib/hooks/useHotelSettings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Hotel } from "@/lib/api/modules/hotels";

interface DangerZoneTabProps {
  hotel: Hotel;
  canManageStatus: boolean;
  canDeleteHotel: boolean;
}

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  UNDER_CONSTRUCTION: "bg-yellow-50 text-yellow-700 border-yellow-200",
  MAINTENANCE: "bg-orange-50 text-orange-700 border-orange-200",
  CLOSED: "bg-red-50 text-red-700 border-red-200",
};

export function DangerZoneTab({ hotel, canManageStatus, canDeleteHotel }: DangerZoneTabProps) {
  const { mutate: updateStatus, isPending } = useUpdateHotelStatus();
  const [closingDate, setClosingDate] = useState("");
  const [confirmCloseCode, setConfirmCloseCode] = useState("");
  const [showPermanentClose, setShowPermanentClose] = useState(false);

  if (!canManageStatus && !canDeleteHotel) return null;

  const h = hotel as any;
  const status = hotel.status ?? "ACTIVE";
  const existingClosingDate = h.dates?.closingDate ?? "";
  const statusColor = STATUS_BADGES[status] ?? STATUS_BADGES.ACTIVE;

  const handleSetClosingDate = () => {
    if (!closingDate) return;
    updateStatus({ input: { closingDate } });
  };

  const handleClearClosingDate = () => {
    updateStatus({ input: { closingDate: null } });
  };

  const handlePermanentClose = () => {
    if (confirmCloseCode !== hotel.code) return;
    updateStatus({
      input: { status: "CLOSED", closingDate: format(new Date(), "yyyy-MM-dd") },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-red-600">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Destructive actions for this hotel. Proceed with caution.
        </p>
      </div>
      <Separator />

      {canManageStatus && (
        <>
          <div>
            <h4 className="text-sm font-semibold mb-2">Hotel Status</h4>
            <Badge variant="outline" className={cn("text-sm px-3 py-1", statusColor)}>
              {status}
            </Badge>

            <div className="flex flex-wrap gap-2 mt-4">
              {status === "ACTIVE" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    onClick={() => updateStatus({ input: { status: "MAINTENANCE" } })}
                    disabled={isPending}
                  >
                    Set to Maintenance Mode
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={() => updateStatus({ input: { status: "INACTIVE" } })}
                    disabled={isPending}
                  >
                    Set to Inactive
                  </Button>
                </>
              )}
              {(status === "MAINTENANCE" || status === "INACTIVE") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => updateStatus({ input: { status: "ACTIVE" } })}
                  disabled={isPending}
                >
                  Reactivate Hotel
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Closing Date</h4>
            {existingClosingDate ? (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Closing: {format(new Date(existingClosingDate), "MMM d, yyyy")}
                </Badge>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleClearClosingDate} disabled={isPending}>
                  Clear
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="h-8 text-sm w-44" />
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!closingDate || isPending} onClick={handleSetClosingDate}>
                  Set Closing Date
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {canDeleteHotel && (
        <>
          <Separator />
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
            <button
              onClick={() => setShowPermanentClose(!showPermanentClose)}
              className="flex items-center gap-2 text-sm font-semibold text-red-800"
            >
              <AlertTriangle className="h-4 w-4" />
              {showPermanentClose ? "Cancel" : "⚠ Close Hotel Permanently"}
            </button>

            {showPermanentClose && (
              <div className="space-y-3">
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-semibold">Destructive action</AlertTitle>
                  <AlertDescription className="text-xs">
                    This will mark the hotel as permanently closed. This is a serious action.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label className="text-xs font-medium">
                    Type <strong>{hotel.code}</strong> to confirm:
                  </Label>
                  <Input
                    value={confirmCloseCode}
                    onChange={(e) => setConfirmCloseCode(e.target.value)}
                    className="mt-1 h-8 text-sm font-mono"
                    placeholder={hotel.code}
                  />
                </div>

                <Button
                  size="sm"
                  disabled={confirmCloseCode !== hotel.code || isPending}
                  onClick={handlePermanentClose}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Closing...</> : "Close Hotel"}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
