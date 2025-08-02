import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAppSelector } from "@/hooks";

export const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};
