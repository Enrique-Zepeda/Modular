import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMainExercise } from "@/features/profile/hooks/useMainExercise";

export default function ProfileMainExercise({ username }: { username: string }) {
  const { main, isLoading } = useMainExercise(username);

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }
  if (!main) {
    return (
      <Card className="bg-muted/30 border-muted/40">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Aún no hay suficiente actividad para detectar un ejercicio principal.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30 border-muted/40">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted/40 shrink-0 flex items-center justify-center">
          {main.ejemplo ? (
            // si es un gif/mp4 remoto, el <img> funciona; si fuera mp4, podrías cambiar a <video muted loop autoPlay>
            <img src={main.ejemplo} alt={main.nombre} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">GIF</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-muted-foreground">Ejercicio principal</div>
          <div className="text-base font-semibold truncate">{main.nombre}</div>
          <div className="mt-1 text-xs text-muted-foreground flex gap-3">
            <span>{main.sets} sets</span>
            <span>{main.sesiones} sesiones</span>
            <span>{main.volumen_kg.toLocaleString()} kg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
