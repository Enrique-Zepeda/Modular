import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useProfileCompletion } from "@/features/onboarding/hooks/useProfileCompletion";
import { SplinePointer } from "lucide-react";

type Props = {
  children: ReactNode;
  allowIncomplete?: boolean; // si true, deja pasar aunque el perfil no esté completo (para /onboarding)
};

export function ProtectedRoute({ children, allowIncomplete = false }: Props) {
  const location = useLocation();

  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 👇 ahora recibimos también refresh()
  const { loading: profileLoading, complete, refresh } = useProfileCompletion();

  // --- BYPASS: leerlo SINCRÓNICAMENTE en el primer render ---
  const initialBypass =
    typeof window !== "undefined" &&
    (sessionStorage.getItem("onboardingJustCompleted") === "1" || Boolean((location.state as any)?.bypassOnboarding));

  const [bypass, setBypass] = useState<boolean>(initialBypass);

  // Limpia el flag y fuerza un refresh (una sola vez)
  useEffect(() => {
    if (initialBypass) {
      sessionStorage.removeItem("onboardingJustCompleted");
      refresh(); // fuerza a este guard a actualizar su propio hook
      setTimeout(() => setBypass(false), 0); // se quita al siguiente tick
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const ok = !!data.session;

      setIsAuthenticated(ok);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((evt, session) => {
      if (!mounted) return;
      setIsAuthenticated(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (authLoading) return <SplinePointer />; // solo espera la sesión
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowIncomplete) {
    // ✅ si venimos del onboarding, deja pasar en el primer render
    if (bypass) {
      return <>{children}</>;
    }
    if (profileLoading) {
      return <SplinePointer />;
    }
    if (!complete) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
