"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserStatusBadge } from "../UserStatusBadge";
import { UserProfileSection } from "./UserProfileSection";
import { UserRolesSection } from "./UserRolesSection";
import { UserActivitySection } from "./UserActivitySection";
import { UserPermissionsSection } from "./UserPermissionsSection";
import {
  useUser,
  useUserPermissions,
} from "@/lib/hooks/useUsers";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const STATUS_RINGS: Record<string, string> = {
  ACTIVE: "ring-2 ring-emerald-400",
  PENDING_VERIFICATION: "ring-2 ring-yellow-400",
  INACTIVE: "ring-2 ring-gray-300",
  SUSPENDED: "ring-2 ring-red-400",
};

interface UserDetailSheetProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onAssignRole: (id: string) => void;
  onResetPassword: (id: string) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
}

export function UserDetailSheet({
  userId,
  open,
  onClose,
  onEdit,
  onAssignRole,
  onResetPassword,
  onDeactivate,
  onReactivate,
}: UserDetailSheetProps) {
  const { user: currentUser } = useAuthStore();
  const { data: user, isLoading, isError, refetch } = useUser(userId);
  const { data: permData, isLoading: permLoading } = useUserPermissions(userId);

  const canEdit = usePermission("USER.UPDATE");
  const canDeactivate = usePermission("USER.DELETE");
  const canResetPassword = usePermission("USER.RESET_PASSWORD");
  const canManageRoles = usePermission("USER.ASSIGN_ROLE");
  const canViewPerms = usePermission("RBAC.VIEW_PERMISSIONS");

  const isSelf = userId === currentUser?.id;

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="max-w-lg overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Failed to load user details.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : user ? (
          <>
            <SheetHeader className="pb-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback
                      className={cn(
                        "text-sm font-medium",
                        STATUS_RINGS[user.status] ?? "ring-2 ring-gray-300",
                      )}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-base">{user.fullName}</SheetTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      <UserStatusBadge status={user.status} />
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onEdit(user.id)}>
                    Edit
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="py-4 space-y-1">
              <UserProfileSection user={user} />
              <UserRolesSection
                user={user}
                canManageRoles={canManageRoles}
                onAddRole={() => onAssignRole(user.id)}
                onRemoveRole={(roleId) => {}}
              />
              <UserActivitySection
                user={user}
                canResetPassword={canResetPassword}
                canEdit={canEdit}
                onResetPassword={() => onResetPassword(user.id)}
              />
              {canViewPerms && (
                <UserPermissionsSection
                  permissions={permData?.permissions}
                  isLoading={permLoading}
                />
              )}
            </div>

            <SheetFooter className="border-t pt-4">
              {user.status === "ACTIVE" || user.status === "PENDING_VERIFICATION" ? (
                canDeactivate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200"
                    disabled={isSelf}
                    onClick={() => onDeactivate(user.id)}
                  >
                    {isSelf ? "Cannot deactivate self" : "Deactivate Account"}
                  </Button>
                )
              ) : (
                canDeactivate && (
                  <Button size="sm" onClick={() => onReactivate(user.id)}>
                    Reactivate Account
                  </Button>
                )
              )}
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
