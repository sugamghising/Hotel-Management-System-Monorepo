"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChevronRight, Star } from "lucide-react";

const PAGE_NAMES: Record<string, string> = {
  reservations: "Reservations",
  "reservations/new": "New Reservation",
  rooms: "Rooms",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  pos: "POS / Restaurant",
  "night-audit": "Night Audit",
  reports: "Reports",
  "rate-plans": "Rate Plans",
  settings: "Hotel Settings",
};

function derivePageName(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const hotelIdx = segments.findIndex((s) => s === "hotels");
  if (hotelIdx === -1 || hotelIdx + 2 >= segments.length) return "";

  const afterHotel = segments.slice(hotelIdx + 2);
  if (afterHotel.length === 0) return "Dashboard";

  const key = afterHotel.join("/");
  if (PAGE_NAMES[key]) return PAGE_NAMES[key];

  if (afterHotel.length >= 2 && afterHotel[0] === "reservations") {
    if (afterHotel[1] === "new") return "New Reservation";
    return "Reservation Detail";
  }

  const last = afterHotel[afterHotel.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  UNDER_CONSTRUCTION: "bg-yellow-50 text-yellow-700 border-yellow-200",
  MAINTENANCE: "bg-orange-50 text-orange-700 border-orange-200",
  CLOSED: "bg-red-50 text-red-700 border-red-200",
};

export function HotelContextBar() {
  const pathname = usePathname();
  const { activeHotel, organizationId, organizationCode } = useAuthStore();

  if (!activeHotel || !pathname.includes("/hotels/")) return null;

  const pageName = derivePageName(pathname);
  const orgName = organizationCode ?? "Organization";

  return (
    <div className="h-10 flex items-center gap-2 px-4 bg-muted/30 border-b text-sm shrink-0">
      <Link
        href="/hotels"
        className="text-muted-foreground hover:text-foreground transition-colors text-xs"
      >
        {orgName}
      </Link>
      <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
      <Link
        href={`/hotels/${activeHotel.id}`}
        className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
      >
        {activeHotel.name}
      </Link>
      {pageName && (
        <>
          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-foreground">
            {pageName}
          </span>
        </>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {(activeHotel as any).starRating && (
          <div className="flex items-center gap-0.5">
            {Array.from({
              length: Math.floor((activeHotel as any).starRating ?? 0),
            }).map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
        )}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] h-5 px-1.5",
            STATUS_COLORS[(activeHotel as any).status ?? "ACTIVE"] ??
              STATUS_COLORS.ACTIVE,
          )}
        >
          {(activeHotel as any).status ?? "ACTIVE"}
        </Badge>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-[11px] font-mono text-muted-foreground">
          {activeHotel.currencyCode}
        </span>
      </div>
    </div>
  );
}
