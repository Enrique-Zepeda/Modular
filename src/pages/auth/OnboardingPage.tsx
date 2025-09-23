import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
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
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="p-6">
          <CardContent className="p-0">Cargando…</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-6">
      <h1 className="mb-2 text-2xl font-semibold">¡Bienvenido! 🏋️</h1>
      <p className="mb-6 text-muted-foreground">Antes de empezar, necesitamos algunos datos.</p>
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
    </div>
  );
}
