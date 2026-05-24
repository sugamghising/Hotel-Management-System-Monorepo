"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/lib/api/modules/auth";
import { getAccessToken } from "@/stores/auth.store";

/** Decode JWT payload without verifying signature */
const decodeJwt = (token: string): Record<string, any> | null => {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, organizationId, organizationCode, refreshToken, logout } =
    useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      // If the app has a persisted refresh token but no in-memory access token,
      // restore the session once and repopulate in-memory auth state.
      if (!getAccessToken() && refreshToken) {
        try {
          // This call will trigger the interceptor refresh flow if needed.
          const me = await authApi.me();
          const decoded = decodeJwt(getAccessToken() ?? "");
          const tokenIsSuperAdmin: boolean =
            decoded?.user?.isSuperAdmin ?? false;
          const tokenPermissions: string[] = decoded?.session?.permissions ?? [];
          const orgId = me.organizationId ?? organizationId ?? "";

          const user = {
            id: me.id,
            email: me.email,
            firstName: me.firstName,
            lastName: me.lastName,
            isSuperAdmin: tokenIsSuperAdmin,
            permissions: tokenPermissions,
            organizationId: orgId,
          };

          setAuth(
            user,
            orgId,
            organizationCode ?? "",
            getAccessToken() ?? "",
            useAuthStore.getState().refreshToken ?? refreshToken,
          );
        } catch (error) {
          console.error("Session restoration failed:", error);
          logout();
        }
      }
    };

    restoreSession();
  }, [refreshToken, organizationId, organizationCode, setAuth, logout]);

  return <>{children}</>;
}
