// src/features/auth/components/AuthProvider.tsx
import { useEffect } from "react";
import type { ReactElement } from "react";
import { useAppDispatch } from "@/hooks";
import { supabase } from "@/lib/supabase/client";
import { setUser, clearUser, setRecoveryMode, setLoading } from "../slices/authSlice";

interface AuthProviderProps {
  children: ReactElement;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const bootstrap = async () => {
      dispatch(setLoading(true));

      const hash = new URLSearchParams(window.location.hash.slice(1));
      const query = new URLSearchParams(window.location.search);

      const typeFromHash = hash.get("type");
      const typeFromQuery = query.get("type");
      const hasAccessToken = !!(hash.get("access_token") || query.get("access_token"));

      // Si viene de email de recuperación, activar modo recuperación LO ANTES POSIBLE
      if (typeFromHash === "recovery" || typeFromQuery === "recovery" || hasAccessToken) {
        dispatch(setRecoveryMode(true));
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) dispatch(setUser(session.user.email || ""));
      else dispatch(clearUser());

      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") dispatch(setRecoveryMode(true));
        if (session?.user) dispatch(setUser(session.user.email || ""));
        else dispatch(clearUser());
      });

      unsub = () => listener.subscription.unsubscribe();
      dispatch(setLoading(false));
    };

    bootstrap();
    return () => {
      if (unsub) unsub();
    };
  }, [dispatch]);

  return children;
}
