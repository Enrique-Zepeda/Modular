import { ThemeToggleButton } from "@/features/theme/components/ThemeToggleButton";
import { Dumbbell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface AuthFormLayoutProps {
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  extraActions?: ReactNode;
  loading?: boolean;
  buttonText: string;
  altOption?: ReactNode; // Google login, forgot password, etc.
}

export const AuthFormLayout = ({
  title,
  description,
  onSubmit,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
  extraActions,
  loading,
  altOption,
}: AuthFormLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FitTracker</h1>
          <p className="text-sm text-muted-foreground">Transforma tu viaje fitness</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-4">
              {children}

              {extraActions && <div>{extraActions}</div>}

              <Button type="submit" disabled={loading} aria-busy={loading} className="w-full h-10 font-medium">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </Button>
            </form>

            {altOption && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o</span>
                  </div>
                </div>
                {altOption}
              </>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{footerText}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" asChild>
              <a href={footerLinkTo}>{footerLinkText}</a>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestros Términos de servicio y Política de privacidad
        </p>
      </div>
    </div>
  );
};
