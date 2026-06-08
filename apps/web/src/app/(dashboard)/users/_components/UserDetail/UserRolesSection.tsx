"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import type { UserDetail } from "@/lib/hooks/useUsers";

interface UserRolesSectionProps {
  user: UserDetail;
  canManageRoles: boolean;
  onAddRole: () => void;
  onRemoveRole: (roleId: string) => void;
  onViewPermissions?: () => void;
}

export function UserRolesSection({
  user,
  canManageRoles,
  onAddRole,
  onRemoveRole,
  onViewPermissions,
}: UserRolesSectionProps) {
  const orgWideRoles = user.roles.filter((r) => !r.hotelId);
  const hotelRoles = user.roles.filter((r) => r.hotelId);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Roles & Access
        </h4>
        {canManageRoles && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onAddRole}>
            <Plus className="h-3 w-3 mr-1" />
            Add Role
          </Button>
        )}
      </div>

      {user.roles.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">
          No roles assigned. Click Add Role to grant access.
        </p>
      ) : (
        <div className="space-y-3">
          {orgWideRoles.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                Organization-wide
              </p>
              {orgWideRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/30 group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{role.roleName}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
                        system
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {role.roleCode}
                    </p>
                  </div>
                  {canManageRoles && (
                    <Tooltip content={role.roleCode === "SUPER_ADMIN" ? "System roles cannot be removed" : ""}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={role.roleCode === "SUPER_ADMIN"}
                        onClick={() => onRemoveRole(role.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          )}

          {hotelRoles.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                Hotel-specific
              </p>
              {hotelRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/30 group"
                >
                  <div>
                    <span className="text-sm font-medium">{role.roleName}</span>
                    <p className="text-[11px] text-muted-foreground">
                      {role.hotelName}
                    </p>
                  </div>
                  {canManageRoles && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveRole(role.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        className="text-xs text-primary mt-2 hover:underline"
        onClick={onViewPermissions}
      >
        View effective permissions →
      </button>
      <Separator className="my-4" />
    </div>
  );
}
