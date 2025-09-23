import { useEffect } from "react";
import type { ReactElement } from "react";
import { useAppDispatch } from "@/hooks";
import { supabase } from "@/lib/supabase/client";
import { setUser, clearUser, setLoading, setRecoveryMode } from "../slices/authSlice";
import { rutinasApi } from "@/features/routines/api/rutinasApi";

interface AuthProviderProps {
  children: ReactElement;
}

function hashHasRecovery(): boolean {
  try {
    const raw = (typeof window !== "undefined" ? window.location.hash : "")?.replace(/^#/, "");
    const h = new URLSearchParams(raw);
    const type = (h.get("type") || "").toLowerCase();
    return type === "recovery" && (h.has("access_token") || h.has("refresh_token"));
  } catch {
    return false;
  }
}

function isRecoveryInProgress(): boolean {
  try {
    return sessionStorage.getItem("__recovery_in_progress") === "true";
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const bootstrap = async () => {
      dispatch(setLoading(true));

      // 🔒 Si hay recovery en progreso en otra pestaña, no autenticar
      if (isRecoveryInProgress() && !window.location.pathname.includes("/auth/reset-password")) {
        dispatch(setRecoveryMode(true));
        dispatch(clearUser());
        dispatch(setLoading(false));
        return;
      }

      // Marca modo recovery si el hash actual lo indica (pestaña de reset)
      if (hashHasRecovery()) {
        dispatch(setRecoveryMode(true));
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 🚨 Si detectamos recovery en el hash, NO autenticar aunque haya sesión
      if (hashHasRecovery() || isRecoveryInProgress()) {
        dispatch(setRecoveryMode(true));
        dispatch(clearUser());
      } else if (session?.user) {
        dispatch(setUser(session.user.email || ""));
      } else {
        dispatch(clearUser());
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, newSession) => {
        // 🔒 Si hay recovery en progreso, ignorar CUALQUIER evento de auth
        if (isRecoveryInProgress() && !window.location.pathname.includes("/auth/reset-password")) {
          return;
        }

        // ⛔ Si llega PASSWORD_RECOVERY en esta pestaña: NO autenticar
        if (event === "PASSWORD_RECOVERY") {
          dispatch(setRecoveryMode(true));
          dispatch(clearUser());
          return; // evita setUser()
        }

        // 🚨 Si hay tokens de recovery en URL, también ignorar
        if (hashHasRecovery()) {
          dispatch(setRecoveryMode(true));
          dispatch(clearUser());
          return;
        }

        if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          dispatch(setRecoveryMode(false));
          dispatch(clearUser());
          dispatch((rutinasApi as any).util.resetApiState());
          return;
        }

        // Solo autenticar si NO estamos en proceso de recovery
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (newSession?.user && !isRecoveryInProgress() && !hashHasRecovery()) {
            dispatch(setUser(newSession.user.email || ""));
            dispatch(setRecoveryMode(false));
          } else {
            dispatch(clearUser());
          }
        } else if (newSession?.user && !isRecoveryInProgress() && !hashHasRecovery()) {
          dispatch(setUser(newSession.user.email || ""));
        } else {
          dispatch(clearUser());
        }

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
