import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/model/auth.store";

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm font-medium text-neutral-500">
          Загрузка...
        </div>
      </div>
    );
  }

  return children;
}