import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { getRecoverySupabase } from "@/lib/supabase/noPersistClient";
import { AuthFormLayout } from "@/features/auth/components/AuthFormLayout";
import { FormField } from "@/components/form/FormField";
import { FormPasswordStrengthIndicator } from "@/components/form/FormPasswordStrengthIndicator";
import { Toaster, toast } from "react-hot-toast";
import { resetPasswordSchema } from "@/lib/validations/schemas";
import { useRecoveryProtection } from "@/lib/supabase/useRecoveryProtection";
import { disableRecoveryBlocker } from "@/lib/supabase/RecoveryBlocker";

type ResetPasswordFormData = { password: string; confirmPassword: string };

function parseRecoveryTokens() {
  const rawHash = (typeof window !== "undefined" ? window.location.hash : "")?.replace(/^#/, "");
  const hp = new URLSearchParams(rawHash);
  const rawQuery = (typeof window !== "undefined" ? window.location.search : "")?.replace(/^\?/, "");
  const qp = new URLSearchParams(rawQuery);
  const pick = (k: string) => hp.get(k) || qp.get(k) || "";
  const type = (pick("type") || "").toLowerCase();
  const access_token = pick("access_token");
  const refresh_token = pick("refresh_token");
  const hasTokens = Boolean(access_token && refresh_token);
  return { type, access_token, refresh_token, hasTokens };
}

export function ResetPasswordPage() {
  useRecoveryProtection(); // <-- activa el bloqueo aquí y se desactiva al salir

  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const recoveryClient = getRecoverySupabase();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { type, access_token, refresh_token, hasTokens } = parseRecoveryTokens();
        if (type !== "recovery") {
          navigate("/login", { replace: true });
          return;
        }

        const { data: s0 } = await recoveryClient.auth.getSession();
        if (!s0.session) {
          if (!hasTokens) {
            navigate("/login", { replace: true });
            return;
          }
          const { error: setErr } = await recoveryClient.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setErr) {
            console.error("[reset] setSession error", setErr);
            navigate("/login", { replace: true });
            return;
          }
        }

        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.log(error);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async ({ password, confirmPassword }: ResetPasswordFormData) => {
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    try {
      const { error } = await recoveryClient.auth.updateUser({ password });
      if (error) throw error;

      // Cerrar sesión global y marcar flujo post-reset
      await supabase.auth.signOut();
      try {
        sessionStorage.setItem("justResetPwd", "1");
      } catch (error) {
        console.log(error);
      }

      toast.success("Contraseña actualizada. Inicia sesión.");

      // MUY IMPORTANTE: liberar el blocker ANTES de ir a /login
      disableRecoveryBlocker();

      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo actualizar la contraseña");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <AuthFormLayout
        title="Restablecer contraseña"
        description="Ingresa tu nueva contraseña para continuar"
        onSubmit={handleSubmit(onSubmit)}
        loading={false}
        buttonText="Actualizar contraseña"
      >
        <div className="space-y-4">
          <FormField
            label="Nueva contraseña"
            placeholder="********"
            type="password"
            registration={register("password")}
            error={errors.password}
          />
          <FormField
            label="Confirmar nueva contraseña"
            placeholder="********"
            type="password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword}
          />
          <FormPasswordStrengthIndicator password={password} />
        </div>
      </AuthFormLayout>
    </>
  );
}
