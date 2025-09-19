import { useAppSelector } from "@/hooks";
import { FormField } from "@/components/form/FormField";
import { AuthFormLayout } from "@/features/auth/components/AuthFormLayout";
import { Toaster } from "react-hot-toast";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import { FormPasswordStrengthIndicator } from "@/components/form/FormPasswordStrengthIndicator";

export function RegisterPage() {
  const { form, onSubmit } = useRegisterForm();
  const { loading } = useAppSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const password = watch("password", "");

  return (
    <>
      <Toaster position="top-center" />
      <AuthFormLayout
        title="Crea tu cuenta"
        description="Únete a miles de entusiastas del fitness"
        onSubmit={handleSubmit(onSubmit)}
        footerText="¿Ya tienes una cuenta?"
        footerLinkText="Inicia sesión"
        footerLinkTo="/login"
        loading={loading}
        buttonText={loading ? "Creando cuenta..." : "Crear cuenta"}
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
        <FormPasswordStrengthIndicator password={password} />
      </AuthFormLayout>
    </>
  );
}
