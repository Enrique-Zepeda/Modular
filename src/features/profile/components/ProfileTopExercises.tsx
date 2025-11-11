import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Zap } from "lucide-react";
import { useTopExercises } from "@/features/profile/hooks/useTopExercises";
import { useWeightUnit } from "@/hooks";
import { presentInUserUnit } from "@/lib/weight";

export default function ProfileTopExercises({ username, topN = 3 }: { username: string; topN?: number }) {
  const { top, isLoading } = useTopExercises(username, topN);
  const { unit } = useWeightUnit();

  // ✅ Calcular maxVolume ANTES de cualquier early return para cumplir reglas de hooks
  const items = top ?? [];
  const maxVolume = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(0, ...items.map((ex) => (Number.isFinite(ex.volumen_kg) ? Number(ex.volumen_kg) : 0)));
  }, [items]);

  const displayMaxVolume = presentInUserUnit(maxVolume, unit);

  if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />;

  if (items.length === 0) {
    return (
      <Card className="border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90">
        <CardContent className="p-6 text-center">
          <div className="text-sm text-muted-foreground">
            Aún no hay suficiente actividad para detectar ejercicios destacados.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border/60 bg-gradient-to-br from-card via-card/98 to-card/95 shadow-lg hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <CardContent className="p-6 relative">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground uppercase tracking-wider">
            Top {items.length} ejercicios destacados
          </h3>
          <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/30">
            <TrendingUp className="h-4 w-4" />
            <span>Por sets</span>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((ex, idx) => {
            const volKg = Number(ex.volumen_kg) || 0;
            const pct = maxVolume > 0 ? Math.min(100, Math.max(0, (volKg / maxVolume) * 100)) : 0;
            const displayVol = presentInUserUnit(volKg, unit);

            return (
              <div key={ex.id} className="flex items-start gap-5">
                <div className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-primary/40 ring-4 ring-primary/15 shadow-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-primary/15 to-purple-500/15 hover:scale-105 transition-transform duration-300">
                  {ex.ejemplo ? (
                    <img
                      src={ex.ejemplo || "/placeholder.svg"}
                      alt={ex.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Zap className="h-7 w-7 text-primary/70" />
                      <span className="text-xs font-medium text-muted-foreground">GIF</span>
                    </div>
                  )}
                  <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                    #{idx + 1}
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="text-lg font-extrabold leading-tight">{ex.nombre}</div>

                  <div className="flex flex-wrap items-center gap-2.5 text-sm">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border-2 border-blue-500/50 rounded-lg shadow-sm">
                      <span className="text-blue-700 dark:text-blue-200 font-bold">{ex.sets}</span>
                      <span className="text-blue-600/80 dark:text-blue-300/80 text-xs font-medium">sets</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-lg shadow-sm">
                      <span className="text-emerald-700 dark:text-emerald-200 font-bold">{ex.sesiones}</span>
                      <span className="text-emerald-600/80 dark:text-emerald-300/80 text-xs font-medium">sesiones</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border-2 border-purple-500/50 rounded-lg shadow-sm">
                      <span className="text-purple-700 dark:text-purple-200 font-bold">
                        {displayVol.toLocaleString()}
                      </span>
                      <span className="text-purple-600/80 dark:text-purple-300/80 text-xs font-medium">{unit}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-semibold">Volumen acumulado</span>
                      <span className="font-bold">
                        {displayVol.toLocaleString()} {unit}
                      </span>
                    </div>
                    <div
                      className="h-2 bg-muted/60 rounded-full overflow-hidden shadow-inner"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(pct)}
                      aria-label={`Volumen acumulado de ${ex.nombre}`}
                      title={`${Math.round(pct)}% del mayor volumen (${displayMaxVolume.toLocaleString()} ${unit})`}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full transition-all duration-700 shadow-lg"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
