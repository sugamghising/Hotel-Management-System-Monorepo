"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/lib/api/modules/auth";
import { getAccessToken } from "@/stores/auth.store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth, organizationId, logout } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    // On mount, if we have no access token but localStorage says authenticated,
    // try to restore the session by calling /auth/me (which will trigger
    // the refresh interceptor if needed)
    if (!initialized.current && isAuthenticated && !getAccessToken()) {
      initialized.current = true;
      authApi
        .me()
        .then((user) => {
          // Session restored successfully — user is already in store,
          // just update the permissions from the latest /me response
          useAuthStore.getState().setAuth(
            {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              isSuperAdmin: user.isSuperAdmin,
              permissions: user.permissions ?? [],
              organizationId: user.organizationId ?? organizationId ?? "",
            },
            user.organizationId ?? organizationId ?? "",
            useAuthStore.getState().organizationCode ?? "",
            getAccessToken() ?? "",
          );
        })
        .catch(() => {
          // Refresh failed → force logout
          logout();
        });
    } else {
      initialized.current = true;
    }
  }, []); // run once on mount

  return <>{children}</>;
}
