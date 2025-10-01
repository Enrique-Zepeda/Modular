import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UserProfile } from "@/types/user";
import { useBmiFromProfile } from "../hooks/useBmi";
import BmiBadge from "./BmiBadge";

// ✅ Hook correcto (el mismo que usa Settings)
import { useGetCurrentUserProfileQuery } from "@/features/settings/api/profileApi";

export default function BmiCard({ profile }: { profile?: UserProfile | null }) {
  const shouldFetch = typeof profile === "undefined";
  const { data: myProfile, isLoading } = useGetCurrentUserProfileQuery(undefined, { skip: !shouldFetch });
  const effectiveProfile = shouldFetch ? myProfile ?? null : profile ?? null;

  const { canCompute, bmi, label, heightM, weightKg, sexo, edad } = useBmiFromProfile(effectiveProfile);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Índice de Masa Corporal (IMC)</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading && !effectiveProfile ? (
          <div className="text-sm text-muted-foreground">Cargando…</div>
        ) : canCompute && bmi !== null ? (
          <div className="flex flex-wrap items-center gap-2">
            <BmiBadge profile={effectiveProfile} showPlaceholder={false} />
            <span className="text-sm text-muted-foreground">
              {weightKg!.toFixed(0)} kg • {heightM!.toFixed(2)} m{sexo ? <> • {String(sexo)}</> : null}
              {typeof edad === "number" ? <> • {edad} años</> : null}
            </span>
          </div>
        ) : (
          <Alert>
            <AlertTitle>Completa tu perfil</AlertTitle>
            <AlertDescription>
              Necesitamos tu <b>peso</b> y <b>altura</b> para calcular el IMC. Ve a{" "}
              <span className="font-medium">Ajustes</span> y actualízalos.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
