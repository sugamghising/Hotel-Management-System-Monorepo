"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/formatters";
import type { UserDetail } from "@/lib/hooks/useUsers";

interface UserProfileSectionProps {
  user: UserDetail;
}

const EMPLOYMENT_BADGES: Record<string, string> = {
  FULL_TIME: "bg-blue-100 text-blue-700 border-blue-200",
  PART_TIME: "bg-gray-100 text-gray-700 border-gray-200",
  CONTRACT: "bg-orange-100 text-orange-700 border-orange-200",
  SEASONAL: "bg-teal-100 text-teal-700 border-teal-200",
};

export function UserProfileSection({ user }: UserProfileSectionProps) {
  const age = user.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(user.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Profile
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Contact</p>
          <div className="space-y-1">
            <p className="flex items-center gap-1.5">
              {user.email}
              {user.emailVerified ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
              )}
            </p>
            <p className="text-muted-foreground">{user.phone || "—"}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Identity</p>
          <div className="space-y-1">
            <p>Employee ID: {user.employeeId || "—"}</p>
            <p className="text-muted-foreground">
              {user.dateOfBirth
                ? `${formatDate(user.dateOfBirth)} (${age} yrs)`
                : "—"}
            </p>
            <p className="text-muted-foreground">{user.gender || "—"}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Employment</p>
          <div className="space-y-1">
            <p>{user.jobTitle || "—"}</p>
            <p className="text-muted-foreground">{user.department || "—"}</p>
            {user.employmentType && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  EMPLOYMENT_BADGES[user.employmentType] ?? "",
                )}
              >
                {user.employmentType.replace("_", " ")}
              </Badge>
            )}
            <p className="text-muted-foreground">
              {user.hireDate ? `Hired: ${formatDate(user.hireDate)}` : "—"}
            </p>
            <p className="text-muted-foreground">
              Manager: {user.managerId || "—"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-0.5">System</p>
          <div className="space-y-1">
            <p>
              {user.languageCode} / {user.timezone}
            </p>
            <p className="flex items-center gap-1.5">
              MFA:{" "}
              {user.mfaEnabled ? (
                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-600 border-gray-200">
                  Disabled
                </Badge>
              )}
            </p>
          </div>
        </div>
      </div>
      <Separator className="my-4" />
    </div>
  );
}
