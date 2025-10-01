import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMainExercise } from "@/features/profile/hooks/useMainExercise";
import { TrendingUp, Target, Zap } from "lucide-react";

export default function ProfileMainExercise({ username }: { username: string }) {
  const { main, isLoading } = useMainExercise(username);

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  if (!main) {
    return (
      <Card className="border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no hay suficiente actividad para detectar un ejercicio principal.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <CardContent className="p-6 relative">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ejercicio principal</h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <TrendingUp className="h-4 w-4" />
            <span>Top ejercicio</span>
          </div>
        </div>

        <div className="flex items-start gap-5">
          <div className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-primary/30 ring-4 ring-primary/10 shadow-lg shrink-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-purple-500/10">
            {main.ejemplo ? (
              <img src={main.ejemplo || "/placeholder.svg"} alt={main.nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1">
                <Zap className="h-6 w-6 text-primary/60" />
                <span className="text-xs font-medium text-muted-foreground">GIF</span>
              </div>
            )}
            <div className="absolute top-1 right-1 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              #1
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start gap-2">
              <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-lg font-bold leading-tight">{main.nombre}</div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/40 rounded-lg">
                <span className="text-blue-700 dark:text-blue-300 font-semibold">{main.sets}</span>
                <span className="text-blue-600/70 dark:text-blue-400/70 text-xs">sets</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/40 rounded-lg">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{main.sesiones}</span>
                <span className="text-emerald-600/70 dark:text-emerald-400/70 text-xs">sesiones</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/15 border border-purple-500/40 rounded-lg">
                <span className="text-purple-700 dark:text-purple-300 font-semibold">
                  {main.volumen_kg.toLocaleString()}
                </span>
                <span className="text-purple-600/70 dark:text-purple-400/70 text-xs">kg</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Volumen acumulado</span>
                <span className="font-semibold">{main.volumen_kg.toLocaleString()} kg</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full transition-all duration-500"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
