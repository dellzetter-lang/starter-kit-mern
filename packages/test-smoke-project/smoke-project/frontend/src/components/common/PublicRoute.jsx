import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";
import { ROUTES } from "@/utils/constants";

export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner className="min-h-screen" label="Loading" />;

  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
}
