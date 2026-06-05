"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePermission } from "@/lib/hooks/usePermission";
import { VIP_MAP } from "@/lib/constants/statuses";
import { formatDate, formatInitials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Mail, Phone, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import type { Guest } from "@/lib/hooks/useGuests";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-amber-500", "bg-cyan-500",
];

function hashColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const guestTypeColors: Record<string, string> = {
  TRANSIENT: "bg-gray-100 text-gray-700 border-gray-200",
  CORPORATE: "bg-blue-100 text-blue-700 border-blue-200",
  GROUP: "bg-purple-100 text-purple-700 border-purple-200",
  COMP: "bg-green-100 text-green-700 border-green-200",
  STAFF: "bg-orange-100 text-orange-700 border-orange-200",
};

interface GuestProfileHeaderProps {
  guest: Guest;
  onEdit: () => void;
  onUpdateVip: () => void;
}

export function GuestProfileHeader({
  guest,
  onEdit,
  onUpdateVip,
}: GuestProfileHeaderProps) {
  const router = useRouter();
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const canEditGuest = usePermission("GUEST.UPDATE");
  const canUpdateVip = usePermission("GUEST.VIP_UPDATE");
  const canCreateReservation = usePermission("RESERVATION.CREATE");

  const vip = VIP_MAP[guest.vipStatus];
  const typeColor = guestTypeColors[guest.guestType] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20">
          <AvatarFallback
            className={cn(
              "text-2xl font-bold text-white",
              hashColor(guest.firstName + guest.lastName),
            )}
          >
            {formatInitials(guest.firstName, guest.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {guest.firstName} {guest.lastName}
            </h1>
            <Badge className={cn("font-medium text-xs px-2 py-0.5 border", vip.color)}>
              {vip.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("font-medium text-[11px] px-2 py-0.5 h-auto", typeColor)}
            >
              {guest.guestType}
            </Badge>
            {guest.companyName && (
              <span className="text-sm text-muted-foreground">
                {guest.companyName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            {guest.email && (
              <a
                href={`mailto:${guest.email}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                {guest.email}
              </a>
            )}
            {guest.phone && (
              <a
                href={`tel:${guest.phone}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {guest.phone}
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Member since {formatDate(guest.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canCreateReservation && (
          <Button
            size="sm"
            className="gap-2"
            onClick={() =>
              router.push(
                `/hotels/${activeHotel?.id ?? ""}/reservations/new?guestId=${guest.id}`,
              )
            }
          >
            <CalendarPlus className="h-4 w-4" />
            New Reservation
          </Button>
        )}
        {canEditGuest && (
          <Button size="sm" variant="outline" onClick={onEdit}>
            Edit Profile
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {canUpdateVip && (
              <DropdownMenuItem onClick={onUpdateVip}>
                Update VIP Status
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info("Merge coming soon")}
            >
              Merge with another guest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
