import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  permissions: string[];
  organizationId: string;
}

export interface ActiveHotel {
  id: string;
  name: string;
  code: string;
  currencyCode: string;
  timezone: string;
  totalRooms: number;
}

interface AuthState {
  // Data
  user: AuthUser | null;
  activeHotel: ActiveHotel | null;
  organizationId: string | null;
  organizationCode: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (
    user: AuthUser,
    orgId: string,
    orgCode: string,
    accessToken: string,
  ) => void;
  setActiveHotel: (hotel: ActiveHotel) => void;
  updateAccessToken: (token: string) => void;
  logout: () => void;

  // Permission check
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

// In-memory access token — never persisted to localStorage
let _accessToken: string | null = null;

export const getAccessToken = () => _accessToken;
export const setAccessToken = (token: string) => {
  _accessToken = token;
};
export const clearAccessToken = () => {
  _accessToken = null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeHotel: null,
      organizationId: null,
      organizationCode: null,
      isAuthenticated: false,

      setAuth: (user, orgId, orgCode, accessToken) => {
        setAccessToken(accessToken);
        set({
          user,
          organizationId: orgId,
          organizationCode: orgCode,
          isAuthenticated: true,
        });
      },

      setActiveHotel: (hotel) => {
        set({ activeHotel: hotel });
      },

      updateAccessToken: (token) => {
        setAccessToken(token);
      },

      logout: () => {
        clearAccessToken();
        set({
          user: null,
          activeHotel: null,
          organizationId: null,
          organizationCode: null,
          isAuthenticated: false,
        });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.isSuperAdmin) return true;
        return user.permissions.includes(permission);
      },

      hasAnyPermission: (permissions: string[]) => {
        const { user } = get();
        if (!user) return false;
        if (user.isSuperAdmin) return true;
        return permissions.some((p) => user.permissions.includes(p));
      },

      hasAllPermissions: (permissions: string[]) => {
        const { user } = get();
        if (!user) return false;
        if (user.isSuperAdmin) return true;
        return permissions.every((p) => user.permissions.includes(p));
      },
    }),
    {
      name: "hms-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        organizationId: state.organizationId,
        organizationCode: state.organizationCode,
        activeHotel: state.activeHotel,
        // Don't persist user.permissions or isAuthenticated
        // Those get re-hydrated from the API on refresh
      }),
    },
  ),
);
