import { useState } from "react";
import { FormField } from "@/components/form/FormField";
import { AuthFormLayout, ForgotPasswordModal, GoogleAuthButton } from "@/features/auth/components";
import { Toaster } from "react-hot-toast";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export default function LoginPage() {
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors },
    },
    onSubmit,
    handleGoogleLogin,
    loginLoading,
    googleLoading,
  } = useLoginForm();

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <>
      <Toaster position="top-center" />
      <AuthFormLayout
        title="Bienvenido de nuevo"
        description="Inicia sesión en tu cuenta para continuar"
        onSubmit={handleSubmit(onSubmit)}
        footerText="¿No tienes una cuenta?"
        footerLinkText="Crea una nueva cuenta"
        footerLinkTo="/register"
        loading={loginLoading}
        buttonText={loginLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        altOption={
          <GoogleAuthButton onClick={handleGoogleLogin} loading={googleLoading}>
            Continuar con Google
          </GoogleAuthButton>
        }
        extraActions={
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setShowForgotPassword(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        }
      >
        <FormField
          label="Correo electrónico"
          placeholder="Ingresa tu correo electrónico"
          type="email"
          registration={register("email")}
          error={errors.email}
        />

        <FormField
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          type="password"
          registration={register("password")}
          error={errors.password}
        />
      </AuthFormLayout>

      <ForgotPasswordModal open={showForgotPassword} onOpenChange={setShowForgotPassword} />
    </>
  );
}
