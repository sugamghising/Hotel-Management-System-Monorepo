"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { UserStatusBadge } from "./UserStatusBadge";
import { MoreHorizontal, Crown, Lock, ShieldAlert, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/formatters";
import { ColumnDef } from "@tanstack/react-table";
import type { UserListItem } from "@/lib/hooks/useUsers";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
  "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",
];

function getAvatarColor(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

interface UserTableProps {
  users: UserListItem[] | undefined;
  isLoading: boolean;
  currentUserId: string | undefined;
  canEdit: boolean;
  canDeactivate: boolean;
  canResetPassword: boolean;
  canManageRoles: boolean;
  onViewProfile: (id: string) => void;
  onEdit: (id: string) => void;
  onAssignRole: (id: string) => void;
  onResetPassword: (id: string) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
  onCreateNew: () => void;
}

export function UserTable({
  users,
  isLoading,
  currentUserId,
  canEdit,
  canDeactivate,
  canResetPassword,
  canManageRoles,
  onViewProfile,
  onEdit,
  onAssignRole,
  onResetPassword,
  onDeactivate,
  onReactivate,
  onCreateNew,
}: UserTableProps) {
  const columns: ColumnDef<UserListItem>[] = useMemo(
    () => [
      {
        header: "User",
        accessorKey: "fullName",
        cell: ({ row }) => {
          const u = row.original;
          const color = getAvatarColor(u.email);
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={cn("text-xs font-medium", color)}>
                  {getInitials(u.firstName, u.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{u.fullName}</span>
                  {(u as any).isSuperAdmin && (
                    <Tooltip content="Super Admin">
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                    </Tooltip>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        header: "Roles",
        accessorKey: "roles",
        cell: ({ row }) => {
          const roles = row.original.roles;
          if (!roles.length) {
            return <span className="text-xs italic text-muted-foreground">No roles</span>;
          }
          const visible = roles.slice(0, 2);
          const remaining = roles.length - 2;
          return (
            <div className="flex flex-wrap gap-1">
              {visible.map((role) => (
                <Badge
                  key={role.id}
                  variant="outline"
                  className={cn(
                    "text-[10px] font-normal px-1.5 py-0",
                    role.hotelId
                      ? "bg-gray-100 text-gray-700 border-gray-200"
                      : "bg-blue-100 text-blue-700 border-blue-200",
                  )}
                >
                  {role.roleName}
                </Badge>
              ))}
              {remaining > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted">
                  +{remaining} more
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        header: "Department / Title",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div>
              <p className="text-sm">{u.jobTitle || "—"}</p>
              <p className="text-xs text-muted-foreground">{u.department || "—"}</p>
            </div>
          );
        },
      },
      {
        header: "Status",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex flex-col gap-1">
              <UserStatusBadge status={u.status} />
              {u.status === "ACTIVE" && !u.emailVerified && (
                <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                  Email unverified
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        header: "Last Login",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div>
              <p className="text-sm tabular-nums">
                {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
              </p>
              {(u as any).lockedUntil && new Date((u as any).lockedUntil) > new Date() && (
                <Tooltip content={`Locked until ${formatDate((u as any).lockedUntil)}`}>
                  <span className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
                    <Lock className="h-3 w-3" />
                    Locked
                  </span>
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = u.id === currentUserId;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onViewProfile(u.id)}>
                  View Profile
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(u.id)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {canManageRoles && (
                  <DropdownMenuItem onClick={() => onAssignRole(u.id)}>
                    Assign Role
                  </DropdownMenuItem>
                )}
                {canResetPassword && (
                  <DropdownMenuItem onClick={() => onResetPassword(u.id)}>
                    Reset Password
                  </DropdownMenuItem>
                )}
                {(canEdit || canManageRoles) && <DropdownMenuSeparator />}
                {(u.status === "ACTIVE" || u.status === "PENDING_VERIFICATION") && canDeactivate && (
                  <Tooltip content={isSelf ? "You cannot deactivate your own account" : ""}>
                    <DropdownMenuItem
                      disabled={isSelf}
                      className="text-red-600"
                      onClick={() => !isSelf && onDeactivate(u.id)}
                    >
                      Deactivate
                    </DropdownMenuItem>
                  </Tooltip>
                )}
                {(u.status === "INACTIVE" || u.status === "SUSPENDED") && canDeactivate && (
                  <DropdownMenuItem onClick={() => onReactivate(u.id)}>
                    Reactivate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [currentUserId, canEdit, canDeactivate, canResetPassword, canManageRoles, onViewProfile, onEdit, onAssignRole, onResetPassword, onDeactivate, onReactivate],
  );

  return (
    <DataTable
      columns={columns}
      data={users ?? []}
      isLoading={isLoading}
      onRowClick={(row) => onViewProfile(row.id)}
      emptyMessage="No users found"
      emptyIcon={<UserPlus className="h-8 w-8 text-muted-foreground/50" />}
      pageSize={20}
      hidePagination={false}
    />
  );
}
