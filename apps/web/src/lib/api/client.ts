import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, setTokens, useAuthStore } from "@/stores/auth.store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // send cookies (refresh token)
  timeout: 30_000,
});

// ── Request interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — silent refresh ─────────────────────────────────────
let isRefreshing = false;
type RefreshCallback = (token: string) => void;
let pendingQueue: Array<{
  resolve: RefreshCallback;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (token: string) => {
  pendingQueue.forEach(({ resolve }) => resolve(token));
  pendingQueue = [];
};

const rejectQueue = (err: unknown) => {
  pendingQueue.forEach(({ reject }) => reject(err));
  pendingQueue = [];
};

const handleAuthFailure = () => {
  // Keep auth state, persisted refresh token, and middleware cookie in sync.
  useAuthStore.getState().logout();

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Not a 401 or already retried → reject
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Another request is already refreshing → queue this one
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { headers: { "Content-Type": "application/json" }, withCredentials: true },
      );
      const { accessToken } = data.data.tokens;

      setTokens(accessToken);
      flushQueue(accessToken);

      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      rejectQueue(refreshError);
      handleAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
