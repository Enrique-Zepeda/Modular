import { useEffect } from "react";
import type { ReactElement } from "react";
import { useAppDispatch } from "@/hooks";
import { checkAuthSession } from "../thunks";

interface AuthProviderProps {
  children: ReactElement;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  return children;
}
