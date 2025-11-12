import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, Mail, Loader2 } from "lucide-react";
import { syncProviderAvatarIfNeeded } from "@/features/auth/utils/syncProviderAvatar";

/** Params del hash (#...) como SearchParams */
function getHashParams(): URLSearchParams {
  const raw = (typeof window !== "undefined" ? window.location.hash : "")?.replace(/^#/, "");
  return new URLSearchParams(raw);
}

/** Verificación por email SOLO si el hash trae el tipo típico de correos */
function isEmailVerificationFlow(): boolean {
  try {
    const h = getHashParams();
    const type = (h.get("type") || "").toLowerCase();
    // Importante: NO decidir por "access_token", porque Google también puede regresar con hash
    return ["signup", "invite", "email_change", "magiclink", "recovery"].includes(type);
  } catch {
    return false;
  }
}

/** Lee el provider actual de la sesión (google/email) */
function providerFromSession(sessionUser: any | null): string | null {
  if (!sessionUser) return null;
  const p1 = sessionUser?.app_metadata?.provider || null;
  const p2 = (sessionUser?.identities?.[0]?.provider as string | undefined) || null;
  return (p1 || p2 || null)?.toLowerCase() ?? null;
}

/** ¿El perfil necesita onboarding? (no hay fila o no tiene username) */
async function shouldGoToOnboarding(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true;

  const { data: row } = await supabase
    .from("Usuarios")
    .select("id_usuario, username")
    .eq("auth_uid", user.id)
    .maybeSingle();

  if (!row) return true;
  return !row.username || String(row.username).trim().length === 0;
}

/** Redirección dura para salir 100% de /auth/callback (evita quedarse ahí) */
function hardRedirect(path: string) {
  try {
    window.location.replace(path);
  } catch {
    window.location.href = path;
  }
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado UI para la verificación por correo
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(100);
  const [showEmailVerifyUI, setShowEmailVerifyUI] = useState(false);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | undefined;
    let to: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        // 1) Verificación por correo → NO mantener sesión → mostrar UI y redirigir a /login a los 5s
        if (isEmailVerificationFlow()) {
          await supabase.auth.signOut().catch(() => {});
          try {
            window.history.replaceState({}, "", "/auth/callback");
          } catch {}
          setShowEmailVerifyUI(true);

          // Inicia cuenta regresiva de 5s y barra de progreso
          iv = setInterval(() => {
            setCountdown((p) => (p > 0 ? p - 1 : 0));
            setProgress((p) => (p > 0 ? p - 20 : 0));
          }, 1000);
          to = setTimeout(() => {
            navigate("/login", { replace: true, state: { verified: true } });
          }, 5000);

          return; // ¡OJO! No continuar con la lógica de Google/normal
        }

        // 2) Google OAuth (PKCE): si viene ?code=..., intercambia por si detectSessionInUrl no lo hizo
        const qs = new URLSearchParams(location.search);
        const code = qs.get("code");
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch {
            /* puede que ya esté hecho */
          }
        }

        // 3) Espera breve a que exista sesión (hasta 3s)
        let sessionUser = null;
        for (let i = 0; i < 30; i++) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          sessionUser = session?.user ?? null;
          if (sessionUser) break;
          await new Promise((r) => setTimeout(r, 100));
        }

        // 4) Con sesión → Google entra directo; email sin verificación también entra
        if (sessionUser) {
          const provider = providerFromSession(sessionUser);

          if (provider === "google") {
            // Google: sincroniza avatar y decide destino
            try {
              await syncProviderAvatarIfNeeded();
            } catch {}
            const goOnboarding = await shouldGoToOnboarding();
            try {
              window.history.replaceState({}, "", "/");
            } catch {}
            hardRedirect(goOnboarding ? "/onboarding" : "/dashboard");
            return;
          }

          // Provider email pero NO venimos de verificación → deja pasar a dashboard (o tu guard hará lo suyo)
          try {
            window.history.replaceState({}, "", "/");
          } catch {}
          hardRedirect("/dashboard");
          return;
        }

        // 5) Sin sesión → /login
        hardRedirect("/login");
      } catch (e) {
        console.error("[AuthCallback] error:", e);
        await supabase.auth.signOut().catch(() => {});
        hardRedirect("/login");
      }
    })();

    // Cleanup timers si el componente se desmonta
    return () => {
      if (iv) clearInterval(iv);
      if (to) clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI SOLO para verificación por email (muestra la cuenta regresiva de 5s)
  if (!showEmailVerifyUI) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">¡Correo verificado!</CardTitle>
          <CardDescription className="text-base">
            Tu cuenta fue verificada. Te enviaremos al inicio de sesión.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Entra con tu correo y contraseña para continuar.</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Redirigiendo automáticamente</span>
              <Badge variant="secondary" className="font-mono">
                {countdown}s
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/login", { replace: true, state: { verified: true } })}
              className="w-full"
              size="lg"
            >
              Ir al inicio de sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Procesando…</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthCallbackPage;
