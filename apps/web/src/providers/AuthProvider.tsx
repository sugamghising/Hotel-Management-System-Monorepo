"use client";

import { useEffect, useRef } from "react";
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
  const { isAuthenticated, setAuth, organizationId, organizationCode, logout } =
    useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // If localStorage says we're authenticated but we have no access token in memory
    // (page reload case), we can't do anything without a refresh token.
    // The refresh token is also in memory only — so on hard reload we must
    // redirect to login. This is the correct secure behavior.
    //
    // The session cookie keeps the middleware from blocking protected routes
    // but the API calls will 401 until the user logs in again.
    //
    // For production, consider storing the refresh token in an httpOnly cookie
    // (set by the backend) so it survives page reloads transparently.
    if (isAuthenticated && !getAccessToken()) {
      // Tokens lost on reload — clear session and redirect to login
      logout();
    }
  }, []);

  return <>{children}</>;
}
