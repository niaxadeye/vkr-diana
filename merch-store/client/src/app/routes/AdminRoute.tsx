import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "@/features/auth/model/auth.store";

const ADMIN_ROLES = ["ADMIN", "MANAGER"];

export function AdminRoute() {
  const user = useAuthStore((state) => state.user);

  // Не авторизован — на страницу входа.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Авторизован, но без прав администратора — на главную.
  if (!ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
