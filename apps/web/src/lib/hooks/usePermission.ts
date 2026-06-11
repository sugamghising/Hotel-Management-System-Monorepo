import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Returns true if the current user has the given permission.
 * Usage: const canCheckIn = usePermission('RESERVATION.CHECK_IN');
 * SSR-safe: returns false until mounted to prevent hydration mismatches
 * caused by zustand persist rehydrating synchronously before first render.
 */
export const usePermission = (permission: string): boolean => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const hasPermission = useAuthStore((s) => s.hasPermission(permission));
  return mounted ? hasPermission : false;
};

/**
 * Returns true if the user has ANY of the given permissions.
 * Usage: const canManageRooms = useAnyPermission(['ROOM.CREATE', 'ROOM.UPDATE']);
 * SSR-safe: returns false until mounted.
 */
export const useAnyPermission = (permissions: string[]): boolean => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const hasAny = useAuthStore((s) => s.hasAnyPermission(permissions));
  return mounted ? hasAny : false;
};

/**
 * Returns true if the user has ALL of the given permissions.
 * Usage: const isFullAdmin = useAllPermissions(['HOTEL.CREATE', 'USER.CREATE']);
 * SSR-safe: returns false until mounted.
 */
export const useAllPermissions = (permissions: string[]): boolean => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const hasAll = useAuthStore((s) => s.hasAllPermissions(permissions));
  return mounted ? hasAll : false;
};

/**
 * Returns the raw permission checker functions directly — useful when you
 * need to check permissions imperatively inside event handlers.
 * SSR-safe: functions return false when called before mount.
 */
export const usePermissionChecker = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);
  const hasAllPermissions = useAuthStore((s) => s.hasAllPermissions);
  return {
    hasPermission: mounted ? hasPermission : () => false,
    hasAnyPermission: mounted ? hasAnyPermission : () => false,
    hasAllPermissions: mounted ? hasAllPermissions : () => false,
  };
};
