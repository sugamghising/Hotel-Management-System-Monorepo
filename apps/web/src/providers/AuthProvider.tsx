"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, getAccessToken, setTokens } from "@/stores/auth.store";
import { authApi } from "@/lib/api/modules/auth";

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
  const { setAuth, organizationId, organizationCode, logout } = useAuthStore();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const restoreSession = async () => {
      if (getAccessToken()) {
        return;
      }

      try {
        const tokens = await authApi.refresh();
        setTokens(tokens.accessToken);
        const me = await authApi.me();
        const decoded = decodeJwt(tokens.accessToken);
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

        setAuth(user, orgId, organizationCode ?? "", tokens.accessToken);
      } catch (error) {
        console.error("Session restoration failed:", error);
        logout();
      }
    };

    restoreSession();
  }, [organizationId, organizationCode, setAuth, logout]);

  return <>{children}</>;
}
