import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileCompletion } from "@/features/onboarding/hooks/useProfileCompletion";
import ProfileForm from "@/features/onboarding/components/ProfileForm";

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <Card className="rounded-2xl shadow-lg border-0 bg-card">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <Skeleton className="h-16 w-full" />
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
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-balance">¡Bienvenido a tu entrenamiento!</h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Configura tu perfil para personalizar tu experiencia de entrenamiento
              </p>
            </div>
          </div>

          <ProfileForm
            defaults={{
              username: profile?.username ?? "",
              nombre: profile?.nombre ?? "",
              edad: (profile?.edad ?? undefined) as any,
              peso: (profile?.peso ?? undefined) as any,
              altura: (profile?.altura ?? undefined) as any,
              nivel_experiencia: profile?.nivel_experiencia ?? "",
              objetivo: profile?.objetivo ?? "",
              sexo: profile?.sexo ?? "",
            }}
            onCompleted={handleCompleted}
          />
        </motion.div>
      </div>
    </div>
  );
}
