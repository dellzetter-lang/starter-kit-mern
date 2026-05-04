import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { NotFound } from "@/components/common/NotFound";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PublicRoute } from "@/components/common/PublicRoute";
import { ROUTES } from "@/utils/constants";

const LandingPage = lazy(() => import("@/pages/landing/LandingPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-screen" />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<AppShell><LandingPage /></AppShell>} />
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD} element={<AppShell secure><DashboardPage /></AppShell>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
