import axios from "axios";
import { apiClient } from "../client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export interface LoginUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  mfaEnabled: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginPayload {
  organizationCode: string;
  email: string;
  password: string;
  mfaCode?: string;
  deviceFingerprint?: string;
  deviceName?: string;
}

export interface LoginResponse {
  user: LoginUser;
  tokens: Tokens;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface MeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  organizationId: string;
  status: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
}

export const authApi = {
  /**
   * POST /auth/login
   * Response: { success, data: { user, tokens } }
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // Use raw axios — no token needed for login
    const { data } = await axios.post(`${BASE_URL}/auth/login`, payload, {
      withCredentials: true,
    });
    return data.data as LoginResponse;
  },

  /**
   * POST /auth/logout
   * Requires the refresh token in the body
   */
  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post("/auth/logout", { refreshToken }).catch(() => {
      // Ignore errors on logout — local state will clear anyway
    });
  },

  /**
   * GET /auth/me
   * Response: { success, data: { user: { id, email, firstName, ... } } }
   * Note: does NOT return permissions — those come from the JWT
   */
  me: async () => {
    const { data } = await apiClient.get("/auth/me");
    // The backend wraps the user in an extra data object for this specific endpoint
    return data.data.user as MeUser;
  },

  /**
   * POST /auth/refresh
   * Response: { success, data: { tokens: { accessToken, refreshToken, expiresIn } } }
   */
  refresh: async (refreshToken: string): Promise<Tokens> => {
    const { data } = await axios.post(
      `${BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    return data.data.tokens as Tokens;
  },

  forgotPassword: async (
    email: string,
    organizationCode: string,
  ): Promise<void> => {
    await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email,
      organizationCode,
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await axios.post(`${BASE_URL}/auth/reset-password`, { token, newPassword });
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },
};
