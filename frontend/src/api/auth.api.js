import { api } from "./axiosInstance";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload, { skipAuthRefresh: true }),
  login: (payload) => api.post("/auth/login", payload, { skipAuthRefresh: true }),
  logout: () => api.post("/auth/logout", null, { silent: true, skipAuthRefresh: true }),
  refresh: () => api.post("/auth/refresh-token", null, { silent: true, skipAuthRefresh: true }),
  me: () => api.get("/auth/me", { silent: true, skipAuthRefresh: true }),
};
