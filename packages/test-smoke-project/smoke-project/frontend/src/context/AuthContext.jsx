import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/api/auth.api";
import { setAccessToken, setAuthHandlers } from "@/api/axiosInstance";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const didBootstrap = useRef(false);

  const applySession = useCallback((data) => {
    const nextToken = data?.accessToken || null;
    setUser(data?.user || null);
    setToken(nextToken);
    setAccessToken(nextToken);
    return nextToken;
  }, []);

  const refreshSession = useCallback(async () => {
    const response = await authApi.refresh();
    return applySession(response.data);
  }, [applySession]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null);
    applySession(null);
  }, [applySession]);

  useEffect(() => {
    setAuthHandlers({ onRefresh: refreshSession, onLogout: () => applySession(null) });
  }, [refreshSession, applySession]);

  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;

    const rehydrate = async () => {
      try {
        // STARTER-KIT: /auth/me is the single app-load session check.
        const response = await authApi.me();
        applySession(response.data);
      } catch {
        applySession(null);
      } finally {
        setLoading(false);
      }
    };

    rehydrate();
  }, [applySession]);

  const login = useCallback(async (payload) => {
    const response = await authApi.login(payload);
    applySession(response.data);
    toast.success("Welcome back");
  }, [applySession]);

  const register = useCallback(async (payload) => {
    const response = await authApi.register(payload);
    applySession(response.data);
    toast.success("Account created");
  }, [applySession]);

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
