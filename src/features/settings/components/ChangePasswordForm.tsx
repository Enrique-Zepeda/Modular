import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, LogOut, Loader2 } from "lucide-react";
import { passwordSchema } from "@/lib/validations/schemas/passwordSchema";
import { supabase } from "@/lib/supabase/client";
import { useAppDispatch } from "@/hooks/useStore";
import { clearUser } from "@/features/auth/slices/authSlice";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsSubmitting(true);

      // Verificar contraseña actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No authenticated user");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error("La contraseña actual es incorrecta");
        return;
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) throw updateError;

      // Cerrar sesión automáticamente
      await supabase.auth.signOut();
      dispatch(clearUser());

      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      navigate("/login");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error al cambiar la contraseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-0.5">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Información de seguridad</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Por seguridad, cerraremos tu sesión después de cambiar la contraseña. Tendrás que iniciar sesión nuevamente.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="currentPassword" className="text-sm font-medium">
            Contraseña actual
          </Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="Ingresa tu contraseña actual"
            {...register("currentPassword")}
            className={`h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 ${
              errors.currentPassword ? "border-destructive/50 focus:border-destructive" : ""
            }`}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive font-medium flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-destructive"></div>
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-medium">
            Nueva contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            {...register("password")}
            className={`h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 ${
              errors.password ? "border-destructive/50 focus:border-destructive" : ""
            }`}
          />
          {errors.password && (
            <p className="text-xs text-destructive font-medium flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-destructive"></div>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar nueva contraseña
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirma tu nueva contraseña"
            {...register("confirmPassword")}
            className={`h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 ${
              errors.confirmPassword ? "border-destructive/50 focus:border-destructive" : ""
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive font-medium flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-destructive"></div>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 min-w-48"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cambiando contraseña...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Cambiar contraseña
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
