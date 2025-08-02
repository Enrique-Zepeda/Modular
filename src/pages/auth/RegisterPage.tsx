import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/features/auth/thunks/authThunks";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { ThemeToggleButton } from "@/features/theme/components/ThemeToggleButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/form/FormField";
import { Dumbbell, Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { registerSchema, type RegisterFormData } from "@/lib/validations/schemas";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerUser(data.email, data.password));
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggleButton />
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FitTracker</h1>
            <p className="text-sm text-muted-foreground">Transforma tu viaje fitness</p>
          </div>

          {/* Formulario */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-xl font-semibold">Crea tu cuenta</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Únete a miles de entusiastas del fitness
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  label="Correo electrónico"
                  placeholder="Ingresa tu correo electrónico"
                  type="email"
                  registration={register("email")}
                  error={errors.email}
                />
                <FormField
                  label="Contraseña"
                  placeholder="Crea una contraseña segura"
                  type="password"
                  registration={register("password")}
                  error={errors.password}
                />
                <FormField
                  label="Confirmar contraseña"
                  placeholder="Confirmar contraseña"
                  type="password"
                  registration={register("confirmPassword")}
                  error={errors.confirmPassword}
                />

                <Button type="submit" className="w-full h-10 font-medium" disabled={loading} aria-busy={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">¿Ya tienes una cuenta?</span>
                </div>
              </div>

              {/* Botón para ir a login */}
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link to="/login">Inicia sesión</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            Al continuar, aceptas nuestros Términos de servicio y Política de privacidad
          </p>
        </div>
      </div>
    </>
  );
}
