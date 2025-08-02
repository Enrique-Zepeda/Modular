import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks";
import { forgotPassword } from "@/features/auth/thunks/authThunks";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/schemas";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await dispatch(forgotPassword(data.email));
      setEmailSent(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEmailSent(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            {emailSent
              ? "Te hemos enviado un enlace de restablecimiento a tu correo."
              : "Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña."}
          </DialogDescription>
        </DialogHeader>

        {!emailSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de restablecimiento"
                )}
              </Button>

              <Button type="button" variant="ghost" onClick={handleClose}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="flex items-center justify-center bg-green-100 rounded-full w-12 h-12">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              ¡Revisa tu correo electrónico para restablecer tu contraseña!
            </p>
            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
