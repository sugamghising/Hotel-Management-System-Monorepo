import axios from "axios";
import { apiClient } from "../client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export interface LoginPayload {
  organizationCode: string;
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
    organizationId: string;
    status: string;
    mfaEnabled: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  mfaRequired?: boolean;
  mfaToken?: string;
  organizationId: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // Use raw axios — no token needed for login
    const { data } = await axios.post(`${BASE_URL}/auth/login`, payload, {
      withCredentials: true,
    });
    return data.data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post("/auth/logout", { refreshToken }).catch(() => {
      // Ignore errors on logout — local state will clear anyway
    });
  },

  me: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data.data.user;
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
