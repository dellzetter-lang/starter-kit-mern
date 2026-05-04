import { useAuth } from "@/hooks/useAuth";

export function RoleGuard({ role, children, fallback = null }) {
  const { user } = useAuth();
  return user?.role === role ? children : fallback;
}
