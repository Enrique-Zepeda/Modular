import { useEffect } from "react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { checkAuthSession } from "../features/auth/authThunks";
import LoadingSpinner from "./LoadingSpinner";
import type { ReactElement } from "react";

interface AuthProviderProps {
  children: ReactElement;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return children;
}
