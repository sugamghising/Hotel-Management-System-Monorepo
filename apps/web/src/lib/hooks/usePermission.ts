import { useAuthStore } from "@/stores/auth.store";

/**
 * Returns true if the current user has the given permission.
 * Usage: const canCheckIn = usePermission('RESERVATION.CHECK_IN');
 */
export const usePermission = (permission: string): boolean => {
  return useAuthStore((s) => s.hasPermission(permission));
};

/**
 * Returns true if the user has ANY of the given permissions.
 * Usage: const canManageRooms = useAnyPermission(['ROOM.CREATE', 'ROOM.UPDATE']);
 */
export const useAnyPermission = (permissions: string[]): boolean => {
  return useAuthStore((s) => s.hasAnyPermission(permissions));
};

/**
 * Returns true if the user has ALL of the given permissions.
 * Usage: const isFullAdmin = useAllPermissions(['HOTEL.CREATE', 'USER.CREATE']);
 */
export const useAllPermissions = (permissions: string[]): boolean => {
  return useAuthStore((s) => s.hasAllPermissions(permissions));
};

/**
 * Returns the raw permission checker functions directly — useful when you
 * need to check permissions imperatively inside event handlers.
 */
export const usePermissionChecker = () => {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);
  const hasAllPermissions = useAuthStore((s) => s.hasAllPermissions);
  return { hasPermission, hasAnyPermission, hasAllPermissions };
};
