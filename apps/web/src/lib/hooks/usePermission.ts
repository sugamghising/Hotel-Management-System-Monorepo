import { useAuthStore } from "@/stores/auth.store";

export const usePermission = (permission: string): boolean => {
  return useAuthStore((s) => s.hasPermission(permission));
};

export const usePermissions = (permissions: string[]) => {
  const { hasPermission } = useAuthStore();
  return {
    hasAll: permissions.every(hasPermission),
    hasAny: permissions.some(hasPermission),
    check: hasPermission,
  };
};
