import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "@/features/auth/model/auth.store";

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}