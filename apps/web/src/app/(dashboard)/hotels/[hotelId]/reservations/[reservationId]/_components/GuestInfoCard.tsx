"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Phone,
  AlertTriangle,
  Utensils,
  Accessibility,
  User,
} from "lucide-react";
import { formatCurrency, formatDate, formatNights } from "@/lib/utils/formatters";
import type { Guest } from "@/lib/hooks/useGuests";
import type { Reservation } from "@/lib/api/modules/reservations";

interface GuestInfoCardProps {
  guest: Guest | undefined;
  reservation: Reservation;
}

const vipBadgeClass: Record<string, string> = {
  BRONZE: "bg-amber-100 text-amber-800 border-amber-200",
  SILVER: "bg-gray-100 text-gray-800 border-gray-200",
  GOLD: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PLATINUM: "bg-blue-100 text-blue-800 border-blue-200",
  BLACK: "bg-black text-white border-black",
};

export function GuestInfoCard({ guest, reservation }: GuestInfoCardProps) {
  const params = useParams<{ hotelId: string }>();
  const hotelId = params?.hotelId ?? "";

  if (!guest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{guest.firstName} {guest.lastName}</span>
          {guest.vipStatus !== "NONE" && (
            <Badge className={vipBadgeClass[guest.vipStatus] ?? ""}>
              {guest.vipStatus}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {guest.email && (
            <a
              href={`mailto:${guest.email}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              {guest.email}
            </a>
          )}
          {guest.phone && (
            <a
              href={`tel:${guest.phone}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {guest.phone}
            </a>
          )}
          {guest.nationality && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <span className="w-3.5" />
              {guest.nationality}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="w-3.5" />
            <Badge variant="outline">{guest.guestType}</Badge>
          </div>
          {guest.companyName && (
            <p className="text-muted-foreground pl-[22px]">{guest.companyName}</p>
          )}
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            {guest.history.totalStays} stays · {guest.history.totalNights} nights ·{" "}
            {formatCurrency(guest.history.totalRevenue)}
          </p>
          {guest.history.lastStayDate && (
            <p>Last stay: {formatDate(guest.history.lastStayDate)}</p>
          )}
        </div>

        {guest.alertNotes && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{guest.alertNotes}</span>
          </div>
        )}

        {guest.dietaryRequirements && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Utensils className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{guest.dietaryRequirements}</span>
          </div>
        )}

        {guest.specialNeeds && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Accessibility className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{guest.specialNeeds}</span>
          </div>
        )}

        <a
          href={`/hotels/${hotelId}/guests/${guest.id}`}
          className="block text-sm text-primary hover:underline"
        >
          View full profile →
        </a>

        <Separator />

        <p className="text-xs text-muted-foreground">
          {reservation.guests.adultCount} adults · {reservation.guests.childCount} children ·{" "}
          {reservation.guests.infantCount} infants
        </p>
      </CardContent>
    </Card>
  );
}
