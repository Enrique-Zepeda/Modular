// src/features/auth/components/AuthProvider.tsx
import { useEffect } from "react";
import type { ReactElement } from "react";
import { useAppDispatch } from "@/hooks";
import { supabase } from "@/lib/supabase/client";
import { setUser, clearUser, setLoading } from "../slices/authSlice";
import { rutinasApi } from "@/features/rutinas/api/rutinasApi";

interface AuthProviderProps {
  children: ReactElement;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const bootstrap = async () => {
      dispatch(setLoading(true));

      // Estado inicial
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        dispatch(setUser(session.user.email || ""));
      } else {
        dispatch(clearUser());
      }

      // Escucha cambios y limpia el cache de RTK Query al cambiar de usuario
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (newSession?.user) {
          dispatch(setUser(newSession.user.email || ""));
        } else {
          dispatch(clearUser());
        }
        // 🔥 limpiar/invalidar estado de queries al cambiar de sesión
        dispatch((rutinasApi as any).util.resetApiState());
      });

      unsub = () => subscription.unsubscribe();
      dispatch(setLoading(false));
    };

    bootstrap();
    return () => {
      if (unsub) unsub();
    };
  }, [dispatch]);

  return children;
}
