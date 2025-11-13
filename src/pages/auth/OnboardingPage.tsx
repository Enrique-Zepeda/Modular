import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileCompletion } from "@/features/onboarding/hooks/useProfileCompletion";
import ProfileForm from "@/features/onboarding/components/ProfileForm"; // ⬅️ Asegúrate de tener este import

export default function OnboardingPage() {
  const { loading, profile, complete, refresh } = useProfileCompletion();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && complete) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, complete, navigate, profile]);

  const handleCompleted = async () => {
    await refresh();
    // 🔔 avisar a cualquier guard que esté montado
    window.dispatchEvent(new CustomEvent("profile:updated"));
    // además: one-shot bypass
    sessionStorage.setItem("onboardingJustCompleted", "1");
    navigate("/dashboard", { replace: true, state: { bypassOnboarding: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full mx-auto max-w-[min(100%,theme(spacing.7xl))]">
          <Card className="rounded-2xl shadow-lg border-0 bg-card">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <Skeleton className="h-7 w-40 sm:h-8 sm:w-48 mx-auto" />
                  <Skeleton className="h-4 w-56 sm:w-64 mx-auto" />
                </div>

                <Skeleton className="h-2 w-full" />

                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />

                  {/* grid responsiva para evitar “dientes” y mantener alturas iguales */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-14 sm:h-16 w-full" />
                    <Skeleton className="h-14 sm:h-16 w-full" />
                  </div>

                  <Skeleton className="h-14 sm:h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[min(100%,theme(spacing.7xl))] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {/* padding responsivo para icono táctil sin romper alineación */}
              <div className="p-2 sm:p-3 rounded-2xl bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2 max-w-prose mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">¡Bienvenido a tu entrenamiento!</h1>
              <p className="text-sm sm:text-lg text-muted-foreground text-pretty">
                Configura tu perfil para personalizar tu experiencia de entrenamiento
              </p>
            </div>
          </div>

          {/* El form se mantiene; solo contenedor responsivo para evitar overflow en móvil */}
          <div className="mx-auto w-full">
            <ProfileForm
              // ⬇️ Pasamos DOB y el resto de campos. La edad se calculará automáticamente dentro del form.
              defaults={{
                username: profile?.username ?? "",
                nombre: profile?.nombre ?? "",
                fecha_nacimiento: (profile?.fecha_nacimiento ?? "") as any,
                peso: (profile?.peso ?? undefined) as any,
                altura: (profile?.altura ?? undefined) as any,
                nivel_experiencia: profile?.nivel_experiencia ?? "",
                objetivo: profile?.objetivo ?? "",
                sexo: profile?.sexo ?? "",
              }}
              onCompleted={handleCompleted}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
