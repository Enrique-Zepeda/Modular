import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/hooks";

export const PublicRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, loading, isRecoveryMode } = useAppSelector((s) => s.auth);

  if (loading) return null;

  // Bypass si la URL trae el flujo de recuperación aunque Redux aún no lo marque
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const search = typeof window !== "undefined" ? window.location.search : "";
  const isRecoveryInURL =
    hash.includes("type=recovery") ||
    search.includes("type=recovery") ||
    hash.includes("access_token=") ||
    search.includes("access_token=");

  if (isAuthenticated && !isRecoveryMode && !isRecoveryInURL) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
