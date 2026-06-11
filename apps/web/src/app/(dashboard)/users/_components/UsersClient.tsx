"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { useUsers, useUser, useActivateUser } from "@/lib/hooks/useUsers";
import { useHotels } from "@/lib/hooks/useHotels";
import { Button } from "@/components/ui/button";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserDetailSheet } from "./UserDetail/UserDetailSheet";
import { InviteUserDialog } from "./Dialogs/InviteUserDialog";
import { EditUserDialog } from "./Dialogs/EditUserDialog";
import { AssignRoleDialog } from "./Dialogs/AssignRoleDialog";
import { ResetPasswordDialog } from "./Dialogs/ResetPasswordDialog";
import { DeactivateUserDialog } from "./Dialogs/DeactivateUserDialog";
import { Plus } from "lucide-react";

export default function UsersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuthStore();

  const canCreate = usePermission("USER.CREATE");

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const department = searchParams.get("department") ?? "";
  const roleCode = searchParams.get("roleCode") ?? "";
  const hotelId = searchParams.get("hotelId") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const selectedUserId = searchParams.get("user");

  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearchChange = useCallback(
    (v: string) => {
      setLocalSearch(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (v) params.set("search", v);
        else params.delete("search");
        params.delete("page");
        router.replace(`${pathname}?${params}`);
      }, 400);
    },
    [router, pathname, searchParams],
  );

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      return `${pathname}?${params}`;
    },
    [pathname, searchParams],
  );

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      router.replace(buildUrl(overrides));
    },
    [router, buildUrl],
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const user = searchParams.get("user");
    if (user) params.set("user", user);
    router.replace(params.toString() ? `${pathname}?${params}` : pathname);
  }, [router, pathname, searchParams]);

  const { data: usersData, isLoading } = useUsers({
    search: search || undefined,
    status: status && status !== "all" ? status : undefined,
    department: department && department !== "all" ? department : undefined,
    roleCode: roleCode && roleCode !== "all" ? roleCode : undefined,
    hotelId: hotelId && hotelId !== "all" ? hotelId : undefined,
    page,
    limit: 20,
  });

  const { data: hotelsData } = useHotels();

  const canEdit = usePermission("USER.UPDATE");
  const canDeactivate = usePermission("USER.DELETE");
  const canResetPassword = usePermission("USER.RESET_PASSWORD");
  const canManageRoles = usePermission("USER.ASSIGN_ROLE");

  const users = usersData?.users;

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [assignRoleUserId, setAssignRoleUserId] = useState<string | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateUserId, setDeactivateUserId] = useState<string | null>(null);

  const sheetOpen = !!selectedUserId;

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const { data: editUserDetail } = useUser(editUserId);

  const handleViewProfile = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("user", id);
      router.replace(`${pathname}?${params}`);
    },
    [router, pathname, searchParams],
  );

  const handleSheetClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("user");
    router.replace(params.toString() ? `${pathname}?${params}` : pathname);
  }, [router, pathname, searchParams]);

  const handleEdit = useCallback((id: string) => {
    setEditUserId(id);
    setEditOpen(true);
  }, []);

  const handleAssignRole = useCallback((id: string) => {
    setAssignRoleUserId(id);
    setAssignRoleOpen(true);
  }, []);

  const handleResetPassword = useCallback((id: string) => {
    setResetPasswordUserId(id);
    setResetPasswordOpen(true);
  }, []);

  const handleDeactivate = useCallback((id: string) => {
    setDeactivateUserId(id);
    setDeactivateOpen(true);
  }, []);

  const { mutate: activateUser } = useActivateUser();

  const handleReactivate = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to reactivate this user?")) {
        activateUser(id);
      }
    },
    [activateUser],
  );

  const getUserName = (id: string | null) => {
    if (!id || !users) return "";
    const u = users.find((x) => x.id === id);
    return u?.fullName ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage organization users and their roles
          </p>
        </div>
        {canCreate && (
          <Button size="sm" className="h-9" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Invite User
          </Button>
        )}
      </div>

      <UserFilters
        search={localSearch}
        status={status}
        department={department}
        roleCode={roleCode}
        hotelId={hotelId}
        users={users}
        showHotelFilter={false}
        hotels={hotelsData?.hotels}
        onSearchChange={handleSearchChange}
        onStatusChange={(v) => navigate({ status: v === "all" ? null : v })}
        onDepartmentChange={(v) => navigate({ department: v === "all" ? null : v })}
        onRoleCodeChange={(v) => navigate({ roleCode: v === "all" ? null : v })}
        onHotelIdChange={(v) => navigate({ hotelId: v === "all" ? null : v })}
        onClear={clearFilters}
      />

      <UserTable
        users={users}
        isLoading={isLoading}
        currentUserId={currentUser?.id}
        canEdit={canEdit}
        canDeactivate={canDeactivate}
        canResetPassword={canResetPassword}
        canManageRoles={canManageRoles}
        onViewProfile={handleViewProfile}
        onEdit={handleEdit}
        onAssignRole={handleAssignRole}
        onResetPassword={handleResetPassword}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        onCreateNew={() => setInviteOpen(true)}
      />

      <UserDetailSheet
        userId={selectedUserId}
        open={sheetOpen}
        onClose={handleSheetClose}
        onEdit={handleEdit}
        onAssignRole={handleAssignRole}
        onResetPassword={handleResetPassword}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
      />

      {inviteOpen && (
        <InviteUserDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
        />
      )}

      {editOpen && editUserId && (
        <EditUserDialog
          user={editUserDetail}
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditUserId(null);
          }}
        />
      )}

      {assignRoleOpen && assignRoleUserId && (
        <AssignRoleDialog
          userId={assignRoleUserId}
          userName={getUserName(assignRoleUserId)}
          open={assignRoleOpen}
          onClose={() => {
            setAssignRoleOpen(false);
            setAssignRoleUserId(null);
          }}
        />
      )}

      {resetPasswordOpen && resetPasswordUserId && (
        <ResetPasswordDialog
          userId={resetPasswordUserId}
          userName={getUserName(resetPasswordUserId)}
          open={resetPasswordOpen}
          onClose={() => {
            setResetPasswordOpen(false);
            setResetPasswordUserId(null);
          }}
        />
      )}

      {deactivateOpen && deactivateUserId && (
        <DeactivateUserDialog
          userId={deactivateUserId}
          userName={getUserName(deactivateUserId)}
          open={deactivateOpen}
          onClose={() => {
            setDeactivateOpen(false);
            setDeactivateUserId(null);
          }}
        />
      )}
    </div>
  );
}
