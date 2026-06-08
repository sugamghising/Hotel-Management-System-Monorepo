"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import type { UserDetail } from "@/lib/hooks/useUsers";

interface UserActivitySectionProps {
  user: UserDetail;
  canResetPassword: boolean;
  canEdit: boolean;
  onResetPassword: () => void;
}

export function UserActivitySection({
  user,
  canResetPassword,
  canEdit,
  onResetPassword,
}: UserActivitySectionProps) {
  const isLocked = user.lockedUntil && new Date(user.lockedUntil) > new Date();

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Activity
      </h4>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Last login</p>
          <p>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Failed logins</p>
          <p className="flex items-center gap-1">
            {user.failedLoginAttempts}
            {user.failedLoginAttempts > 0 && (
              <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                {user.failedLoginAttempts}
              </Badge>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Account locked</p>
          <p>
            {isLocked ? (
              <span className="flex items-center gap-1 text-red-600">
                <Lock className="h-3.5 w-3.5" />
                Locked until {formatDate(user.lockedUntil!)}
              </span>
            ) : (
              "No"
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Member since</p>
          <p>{formatDate(user.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {canResetPassword && (
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onResetPassword}>
            Send Password Reset Email
          </Button>
        )}
        {canEdit && isLocked && (
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Unlock Account
          </Button>
        )}
      </div>
      <Separator className="my-4" />
    </div>
  );
}
