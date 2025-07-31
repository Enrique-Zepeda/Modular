import { useEffect } from "react";
import { checkAuthSession } from "../thunks/authThunks";
import LoadingSpinner from "../../../components/shared/LoadingSpinner";
import type { ReactElement } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";

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
