import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/useAppSelector";
import type { ReactElement } from "react";

export const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};
