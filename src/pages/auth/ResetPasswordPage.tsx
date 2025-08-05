// src/pages/auth/ResetPasswordPage.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { supabase } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/schemas";
import { setRecoveryMode } from "@/features/auth/slices/authSlice";
import { AuthFormLayout } from "@/features/auth/components/AuthFormLayout";
import { FormField } from "@/components/form/FormField";
import { FormPasswordStrengthIndicator } from "@/components/form/FormPasswordStrengthIndicator";
import { Toaster, toast } from "react-hot-toast";

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  useEffect(() => {
    // Asegura que el guard de rutas permita esta página aunque haya sesión temporal
    dispatch(setRecoveryMode(true));
  }, [dispatch]);

  const onSubmit = async ({ password }: ResetPasswordFormData) => {
    try {
      // En el flujo de recuperación Supabase ya tiene una sesión temporal.
      // Por eso NO pasamos accessToken aquí.
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Limpia cualquier hash/query de la URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Cerrar sesión para evitar login automático
      await supabase.auth.signOut();

      // Apaga el modo recuperación
      dispatch(setRecoveryMode(false));

      toast.success("Contraseña actualizada. Inicia sesión.");
      navigate("/login");
    } catch (e) {
      console.log(e);
      toast.error("No se pudo actualizar la contraseña. Intenta de nuevo.");
    }
  };

  if (loading) return null;

  return (
    <>
      <Toaster />
      <AuthFormLayout
        title="Restablecer contraseña"
        description="Ingresa tu nueva contraseña."
        onSubmit={handleSubmit(onSubmit)}
        buttonText="Cambiar contraseña"
        loading={isSubmitting}
        loadingText="Cambiando..."
        showLegalNotice={false}
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
