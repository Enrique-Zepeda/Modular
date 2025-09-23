import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, Mail, Loader2 } from "lucide-react";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    (async () => {
      try {
        // 1) OAuth PKCE → ?code=...
        const qs = new URLSearchParams(location.search);
        const code = qs.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // 2) Email link / verificación → #access_token=...
        const hasAccessTokenHash = typeof window !== "undefined" && window.location.hash.includes("access_token");

        // 3) Cerrar sesión SIEMPRE para forzar login manual
        await supabase.auth.signOut();

        // 4) Limpiar URL para que no se reprocese el token
        try {
          window.history.replaceState({}, "", "/auth/callback");
        } catch {
          /* no-op */
        }

        // 5) Redirigir a /login (con estado "verified" para mostrar un toast)
        const nextState = hasAccessTokenHash || code ? { verified: true } : undefined;

        const iv = setInterval(() => {
          setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
          setProgress((prev) => (prev > 0 ? prev - 20 : 0));
        }, 1000);

        const to = setTimeout(() => {
          navigate("/login", { replace: true, state: nextState });
        }, 5000);

        return () => {
          clearInterval(iv);
          clearTimeout(to);
        };
      } catch (e) {
        console.error("[AuthCallback] error:", e);
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
      }
    })();
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">¡Correo verificado!</CardTitle>
          <CardDescription className="text-base">Tu cuenta ha sido verificada exitosamente</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Ahora inicia sesión con tu cuenta</span>
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
