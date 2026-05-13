import axios from "axios";
import { toast } from "sonner";

let accessToken = null;
let refreshHandler = null;
let logoutHandler = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setAuthHandlers = ({ onRefresh, onLogout }) => {
  refreshHandler = onRefresh;
  logoutHandler = onLogout;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// STARTER-KIT: Tokens stay in memory; refresh tokens stay inside httpOnly cookies.
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;

    const shouldRefresh =
      error.response?.status === 401 &&
      !original?._retry &&
      !original?.skipAuthRefresh &&
      refreshHandler;

    if (shouldRefresh) {
      original._retry = true;
      try {
        refreshPromise ||= refreshHandler().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        original.headers ||= {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        logoutHandler?.();
        throw refreshError;
      }
    }

    const message = error.response?.data?.message || "Something went wrong";
    if (!original?.silent) toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
