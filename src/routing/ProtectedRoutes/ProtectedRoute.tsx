import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAppSelector } from "@/hooks";

export const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};
