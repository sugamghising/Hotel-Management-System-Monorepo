"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/lib/hooks/usePermission";
import { VIP_MAP } from "@/lib/constants/statuses";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { Pencil, MapPin, CreditCard, AlertTriangle } from "lucide-react";
import type { Guest } from "@/lib/hooks/useGuests";

const languageNames: Record<string, string> = {
  en: "English", fr: "French", es: "Spanish",
  ar: "Arabic", zh: "Chinese", de: "German",
  pt: "Portuguese", ru: "Russian", ja: "Japanese",
  ko: "Korean",
};

const countryNames: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada",
  AU: "Australia", DE: "Germany", FR: "France", IT: "Italy",
  ES: "Spain", NL: "Netherlands", BR: "Brazil", MX: "Mexico",
  JP: "Japan", CN: "China", IN: "India", AE: "United Arab Emirates",
  SA: "Saudi Arabia", SG: "Singapore", HK: "Hong Kong", KR: "South Korea",
  ZA: "South Africa",
};

const idTypeNames: Record<string, string> = {
  PASSPORT: "Passport",
  DRIVERS_LICENSE: "Driver\u2019s License",
  NATIONAL_ID: "National ID",
  RESIDENCE_PERMIT: "Residence Permit",
  MILITARY_ID: "Military ID",
  OTHER: "Other",
};

function computeAge(dob: string): number {
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
}

function maskIdNumber(num: string): string {
  if (num.length <= 4) return num;
  return "\u2022".repeat(num.length - 4) + num.slice(-4);
}

interface GuestInfoCardProps {
  guest: Guest;
  onEdit: () => void;
}

export function GuestInfoCard({ guest, onEdit }: GuestInfoCardProps) {
  const canViewId = usePermission("GUEST.VIEW_ID");

  const expiryWarning = guest.idExpiryDate
    ? (() => {
        const daysLeft = Math.floor(
          (new Date(guest.idExpiryDate).getTime() - Date.now()) /
            (24 * 60 * 60 * 1000),
        );
        return daysLeft < 0
          ? { message: "Expired", severity: "error" as const }
          : daysLeft < 30
            ? { message: `Expires in ${daysLeft} days`, severity: "warning" as const }
            : null;
      })()
    : null;

  const addr = guest.address;
  const hasAddress = addr.line1 || addr.line2 || addr.city || addr.stateProvince || addr.postalCode || addr.countryCode;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-sm font-semibold">Contact &amp; Identity</CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Contact */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Contact
          </h5>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>
                {guest.email ? (
                  <a
                    href={`mailto:${guest.email}`}
                    className="hover:underline"
                  >
                    {guest.email}
                  </a>
                ) : (
                  "\u2014"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{guest.phone ?? guest.mobile ?? "\u2014"}</span>
            </div>
            {guest.dateOfBirth && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of birth</span>
                <span>
                  {formatDate(guest.dateOfBirth, "d MMM yyyy")} (
                  {computeAge(guest.dateOfBirth)} years)
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nationality</span>
              <span>
                {guest.nationality
                  ? countryNames[guest.nationality] ?? guest.nationality
                  : "\u2014"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language</span>
              <span>{languageNames[guest.languageCode] ?? guest.languageCode}</span>
            </div>
          </div>
        </div>

        <hr className="border-t" />

        {/* Address */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Address
          </h5>
          {hasAddress ? (
            <div className="text-sm space-y-0.5">
              {addr.line1 && <p>{addr.line1}</p>}
              {addr.line2 && <p>{addr.line2}</p>}
              <p>
                {[addr.city, addr.stateProvince, addr.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {addr.countryCode && (
                <p className="text-muted-foreground">
                  {countryNames[addr.countryCode] ?? addr.countryCode}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No address on file
            </p>
          )}
        </div>

        <hr className="border-t" />

        {/* Identity */}
        {canViewId && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Identity
            </h5>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID type</span>
                <span>{guest.idType ? (idTypeNames[guest.idType] ?? guest.idType) : "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID number</span>
                <span>
                  {guest.idNumber ? maskIdNumber(guest.idNumber) : "\u2014"}
                </span>
              </div>
              {guest.idExpiryDate && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Expiry</span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      expiryWarning?.severity === "error" && "text-red-600 font-medium",
                      expiryWarning?.severity === "warning" && "text-amber-600",
                    )}
                  >
                    {formatDate(guest.idExpiryDate)}
                    {expiryWarning && (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-xs">{expiryWarning.message}</span>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {canViewId && <hr className="border-t" />}

        {/* Classification */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Classification
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Guest type</span>
              <Badge variant="outline" className="font-medium text-[11px] px-2 py-0.5 h-auto">
                {guest.guestType}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">VIP status</span>
              <Badge
                className={cn(
                  "font-medium text-[11px] px-2 py-0.5 h-auto border",
                  VIP_MAP[guest.vipStatus].color,
                )}
              >
                {VIP_MAP[guest.vipStatus].label}
              </Badge>
            </div>
            {guest.vipReason && (
              <p className="text-xs text-muted-foreground italic">
                {guest.vipReason}
              </p>
            )}
            {guest.companyName && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span>{guest.companyName}</span>
                </div>
                {guest.companyTaxId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ID</span>
                    <span>{guest.companyTaxId}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
