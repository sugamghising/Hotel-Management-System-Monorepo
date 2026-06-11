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
  refreshToken: string | null;
  _hydrated: boolean;

  // Actions
  setAuth: (
    user: AuthUser,
    orgId: string,
    orgCode: string,
    accessToken: string,
    refreshToken: string,
  ) => void;
  setActiveHotel: (hotel: ActiveHotel) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;

  // Permission check
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

// In-memory access token — prefer memory but allow short-lived sessionStorage fallback
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export const getAccessToken = () => {
  // Priority 1: in-memory
  if (_accessToken) return _accessToken;

  // Priority 2: sessionStorage (survives a full page reload in the same tab)
  try {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("hms_access") : null;
    if (token) {
      _accessToken = token;
      return _accessToken;
    }
  } catch (e) {
    // ignore storage errors
  }

  return null;
};

export const getRefreshToken = () => {
  // Priority 1: Memory (Fastest)
  if (_refreshToken) return _refreshToken;

  // Priority 2: Zustand Persisted State
  const persistedRefreshToken = useAuthStore.getState().refreshToken;
  if (persistedRefreshToken) {
    _refreshToken = persistedRefreshToken;
    return persistedRefreshToken;
  }

  return null;
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hms_access", accessToken);
    }
  } catch (e) {
    // ignore storage errors
  }
};

export const clearTokens = () => {
  _accessToken = null;
  _refreshToken = null;
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hms_access");
    }
  } catch (e) {
    // ignore
  }
};
// export const setAccessToken = (token: string) => {
//   _accessToken = token;
// };
// export const clearAccessToken = () => {
//   _accessToken = null;
// };

// Custom storage to avoid SSR localStorage errors
const safeStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeHotel: null,
      organizationId: null,
      organizationCode: null,
      isAuthenticated: false,
      refreshToken: null,
      _hydrated: false,

      setAuth: (user, orgId, orgCode, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({
          user,
          organizationId: orgId,
          organizationCode: orgCode,
          isAuthenticated: true,
          refreshToken,
        });
      },

      setActiveHotel: (hotel) => {
        set({ activeHotel: hotel });
      },

      updateTokens: (accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
      },

      logout: () => {
        clearTokens();
        if (typeof document !== "undefined") {
          document.cookie = "hms_refresh=; path=/; max-age=0";
        }
        set({
          user: null,
          activeHotel: null,
          organizationId: null,
          organizationCode: null,
          isAuthenticated: false,
          refreshToken: null,
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
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hydrated: true });
      },
      partialize: (state) => ({
        organizationId: state.organizationId,
        organizationCode: state.organizationCode,
        activeHotel: state.activeHotel,
        refreshToken: state.refreshToken,
        user: state.user
          ? {
              id: state.user.id,
              email: state.user.email,
              firstName: state.user.firstName,
              lastName: state.user.lastName,
              isSuperAdmin: state.user.isSuperAdmin,
              organizationId: state.user.organizationId,
              permissions: [],
            }
          : null,
      }),
    },
  ),
);
