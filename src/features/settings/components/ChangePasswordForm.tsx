import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, LogOut } from "lucide-react";
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

export default function ChangePasswordForm() {
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
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Por seguridad, cerraremos tu sesión después de cambiar la contraseña. Tendrás que iniciar sesión nuevamente.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Contraseña actual</Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="Ingresa tu contraseña actual"
            {...register("currentPassword")}
            className={errors.currentPassword ? "border-destructive" : ""}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive font-medium">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            {...register("password")}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirma tu nueva contraseña"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2 min-w-32">
            {isSubmitting ? (
              "Cambiando..."
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Cambiar contraseña
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
