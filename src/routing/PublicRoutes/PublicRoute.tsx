import { useAppSelector } from "@/hooks/useStore";
import { Navigate } from "react-router-dom";

export const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return children;
};
