import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks";

type Props = { children: ReactNode };

function isPostReset(location: ReturnType<typeof useLocation>): boolean {
  const state = location.state as any;
  if (state?.passwordReset) return true;

  // Soporte opcional para ?reset=1
  const sp = new URLSearchParams(location.search);
  if (sp.get("reset") === "1") return true;

  // Fallback robusto si se pierde el state del router
  try {
    if (typeof window !== "undefined" && sessionStorage.getItem("justResetPwd") === "1") {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
  return false;
}

export function PublicRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAppSelector((s) => s.auth);
  const location = useLocation();

  const postReset = isPostReset(location);

  // Limpia el flag/URL una vez ya estamos en la página pública
  if (postReset) {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("justResetPwd");
      }
      // Quita query/state del history (si existieran)
      const cleanUrl = location.pathname;
      if (window.location.pathname + window.location.search !== cleanUrl) {
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Mientras se resuelve auth, renderiza sin redirigir (evita parpadeos)
  if (loading) return <>{children}</>;

  // ⛑️ Si venimos de reset, NO redirigir al dashboard aunque isAuthenticated parpadee en true
  if (postReset) return <>{children}</>;

  // Resto de páginas públicas: si hay sesión, ir a dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default PublicRoute;
