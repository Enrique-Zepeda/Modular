import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Shield, LogOut, Loader2, Eye, EyeOff } from "lucide-react";
import { passwordSchema } from "@/lib/validations/schemas/passwordSchema";
import { supabase } from "@/lib/supabase/client";
import { useAppDispatch } from "@/hooks/useStore";
import { clearUser } from "@/features/auth/slices/authSlice";
import { FormPasswordStrengthIndicator } from "@/components/form/FormPasswordStrengthIndicator";
import { resetPassword } from "@/features/auth/thunks";

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stagedData, setStagedData] = useState<ChangePasswordFormData | null>(null);

  // 👁️ toggles de visibilidad
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const password = watch("password");

  // ---------- Detectar proveedor (si es OAuth no hay password que cambiar) ----------
  const [canChangePassword, setCanChangePassword] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const provider = (data.user?.app_metadata as any)?.provider ?? "email";
      setCanChangePassword(provider === "email");
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  // Lógica real de cambio (reutiliza tu thunk del login)
  const performChange = async (data: ChangePasswordFormData) => {
    if (!canChangePassword) {
      toast.error("Esta cuenta se creó con proveedor externo (Google/Apple). No tiene contraseña local.");
      return;
    }
    if (!userEmail) {
      toast.error("No se pudo obtener tu cuenta actual.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1) Reautenticación con la contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: data.currentPassword,
      });
      if (signInError) {
        toast.error("Tu contraseña actual es incorrecta.");
        setIsSubmitting(false);
        return;
      }

      // 2) Reutiliza lógica centralizada (update + sign-out)
      const action = await dispatch(resetPassword({ password: data.password }));
      if (resetPassword.rejected.match(action)) {
        const msg = (action.payload as string) ?? "No se pudo actualizar la contraseña";
        throw new Error(msg);
      }

      // 3) Limpiar y redirigir
      dispatch(clearUser());
      reset();
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      navigate("/login");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error?.message ?? "Error al cambiar la contraseña");
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
      setStagedData(null);
    }
  };

  // Abre el diálogo solo cuando el formulario es válido
  const onSubmit = (data: ChangePasswordFormData) => {
    setStagedData(data);
    setConfirmOpen(true);
  };

  const strengthLabel = useMemo(() => {
    if (!password) return "";
    if (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password)) return "Fuerte";
    if (password.length >= 8) return "Media";
    return "Débil";
  }, [password]);

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

      {!canChangePassword ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          Esta cuenta usa un proveedor externo (por ejemplo Google). No es posible cambiar contraseña local desde aquí.
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contraseña actual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    placeholder="********"
                    autoComplete="current-password"
                    {...register("currentPassword")}
                    className={`h-12 bg-background/50 border-border/50 pr-10 focus-visible:ring-primary/20 transition-all duration-200 ${
                      errors.currentPassword ? "border-destructive/50 focus-visible:border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-destructive font-medium">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showNew ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    autoComplete="new-password"
                    {...register("password")}
                    className={`h-12 bg-background/50 border-border/50 pr-10 focus-visible:ring-primary/20 transition-all duration-200 ${
                      errors.password ? "border-destructive/50 focus-visible:border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
                <FormPasswordStrengthIndicator password={password ?? ""} />
                {strengthLabel && <p className="text-xs text-muted-foreground">Fortaleza estimada: {strengthLabel}</p>}
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="********"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={`h-12 bg-background/50 border-border/50 pr-10 focus-visible:ring-primary/20 transition-all duration-200 ${
                      errors.confirmPassword ? "border-destructive/50 focus-visible:border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              {/* Botón normal: abre el diálogo de confirmación solo si el form es válido */}
              <Button type="submit" disabled={!isValid || isSubmitting} className="h-12 px-6 font-semibold">
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

          {/* 🔒 Confirmación antes de aplicar el cambio */}
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Confirmar cambio de contraseña?</AlertDialogTitle>
                <AlertDialogDescription>
                  Por seguridad, se cerrará tu sesión y tendrás que iniciar sesión nuevamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => stagedData && performChange(stagedData)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Aplicando…" : "Confirmar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
