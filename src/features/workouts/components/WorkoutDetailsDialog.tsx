import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dumbbell, Timer, TrendingUp, Activity, CheckCircle2, XCircle } from "lucide-react";
import { useWorkoutDetails } from "@/features/workouts/hooks/useWorkoutDetails";
import { cn } from "@/lib/utils";
import { formatDurationShort } from "@/lib/duration";
import { useWeightUnit } from "@/hooks";
import { presentInUserUnit } from "@/lib/weight";
import { getRPEStyles } from "@/features/workouts/utils/rpeStyles";

type Props = {
  sessionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  durationLabelSeed?: string | null;
  sensacionSeed?: string | number | null;
};

export function WorkoutDetailsDialog({ sessionId, open, onOpenChange, durationLabelSeed, sensacionSeed }: Props) {
  const { data, loading, error } = useWorkoutDetails(sessionId, {
    durationLabel: durationLabelSeed ?? undefined,
    sensacion: sensacionSeed ?? undefined,
  });

  const { unit } = useWeightUnit();

  // duración
  const displayDuration =
    data?.durationLabel ??
    durationLabelSeed ??
    (typeof data?.durationSeconds === "number"
      ? formatDurationShort(Math.max(0, Math.floor(data.durationSeconds)))
      : undefined) ??
    "—";

  // volumen solo de sets realizados
  const completedVolumeKg = useMemo(() => {
    if (!data) return 0;
    let total = 0;
    for (const ex of data.exercises ?? []) {
      for (const s of ex.sets ?? []) {
        if (!s.done) continue;
        const kg = typeof s.kg === "number" ? s.kg : Number(s.kg);
        const reps = typeof s.reps === "number" ? s.reps : Number(s.reps);
        if (!Number.isFinite(kg) || !Number.isFinite(reps)) continue;
        total += kg * reps;
      }
    }
    return total;
  }, [data]);

  // sensación global con tus estilos
  const sensationText =
    (data?.sensacion_global != null
      ? String(data.sensacion_global)
      : sensacionSeed != null
      ? String(sensacionSeed)
      : ""
    ).trim() || "Sin sensaciones";

  const sensationStyles = getRPEStyles(sensationText);
  const SensationIcon = sensationStyles.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-full sm:w-[96vw] max-w-[480px] sm:max-w-2xl lg:max-w-4xl p-0 overflow-hidden mx-auto",
          "rounded-t-2xl sm:rounded-2xl border border-border/60 bg-card"
        )}
      >
        <div className="flex flex-col max-h-[100vh] sm:max-h-[90vh]">
          {/* HEADER */}
          <div className="px-3 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b bg-gradient-to-r from-background via-background to-primary/5">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <DialogTitle className="text-sm sm:text-lg font-semibold">Detalle del entrenamiento</DialogTitle>
              </div>
              <p className="text-[0.65rem] sm:text-xs text-muted-foreground px-8 sm:px-0">
                Revisa duración, volumen y todos los sets.
              </p>
            </DialogHeader>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center gap-3 text-muted-foreground">
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-sm font-medium">Cargando detalles...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
                      <p className="text-xs sm:text-sm text-destructive font-medium px-4">{error}</p>
                    </div>
                  </div>
                ) : !data ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="text-xs sm:text-sm">No hay datos para esta sesión.</p>
                  </div>
                ) : (
                  <div>
                    {/* RESUMEN */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      {/* Duración */}
                      <div className="p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 shrink-0">
                            <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.6rem] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Duración
                            </p>
                            <p className="text-base sm:text-lg font-bold text-foreground truncate">{displayDuration}</p>
                          </div>
                        </div>
                      </div>

                      {/* Volumen */}
                      <div className="p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-chart-1/10 to-chart-1/5 border border-chart-1/20">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-chart-1/20 shrink-0">
                            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-chart-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.6rem] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Volumen
                            </p>
                            <p className="text-base sm:text-lg font-bold text-foreground truncate">
                              {Intl.NumberFormat("es-MX").format(presentInUserUnit(completedVolumeKg ?? 0, unit))}
                              {unit}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sensación */}
                      <div
                        className={cn(
                          "p-3 rounded-lg sm:rounded-xl border bg-gradient-to-br",
                          sensationStyles.bgClass,
                          sensationStyles.borderClass
                        )}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-background/40 shrink-0">
                            <SensationIcon className={cn("h-3.5 w-3.5 sm:h-5 sm:w-5", sensationStyles.iconColor)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.6rem] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Sensación
                            </p>
                            <p className={cn("text-base sm:text-lg font-bold truncate", sensationStyles.textClass)}>
                              {sensationText}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EJERCICIOS */}
                    <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-0.5 sm:h-6 sm:w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                        <h3 className="text-sm sm:text-base font-bold">Ejercicios</h3>
                        <div className="ml-auto flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30">
                          <Dumbbell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                          <span className="text-[0.65rem] sm:text-xs font-bold text-primary">
                            {data.exercises.length}
                          </span>
                        </div>
                      </div>

                      {data.exercises.length === 0 ? (
                        <div className="py-8 text-center rounded-lg sm:rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
                          <Dumbbell className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-muted-foreground">Sin ejercicios registrados.</p>
                        </div>
                      ) : (
                        data.exercises.map((ex, idx) => (
                          <div
                            key={ex.id_ejercicio ?? idx}
                            className="rounded-lg sm:rounded-xl border border-border/60 bg-card/95 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* HEADER EJERCICIO */}
                            <div className="p-3 sm:p-4 bg-gradient-to-r from-muted/40 to-transparent border-b">
                              <div className="flex items-center gap-3">
                                <div className="shrink-0">
                                  {ex.ejemplo ? (
                                    <img
                                      src={ex.ejemplo || "/placeholder.svg"}
                                      alt={ex.nombre ?? "Ejercicio"}
                                      loading="lazy"
                                      className="h-12 w-12 sm:h-14 sm:w-14 object-cover border border-border/80 rounded-lg sm:rounded-xl shadow-sm"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl border border-border/80 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                      <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-xs sm:text-sm leading-tight truncate">
                                        {ex.nombre ?? `Ejercicio ${ex.id_ejercicio}`}
                                      </h4>
                                      {ex.grupo_muscular && (
                                        <p className="text-[0.6rem] sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                          <span className="h-1 w-1 rounded-full bg-primary" />
                                          {ex.grupo_muscular}
                                        </p>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="shrink-0 text-[0.6rem] sm:text-xs py-0 px-1.5">
                                      #{idx + 1}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* SETS - Card layout for mobile, table for desktop */}
                            <div className="p-3 sm:p-4 space-y-2 sm:space-y-0">
                              {/* Mobile: Cards */}
                              <div className="sm:hidden space-y-2">
                                {ex.sets.map((s, i) => (
                                  <div
                                    key={`${ex.id_ejercicio}-${i}`}
                                    className="p-2.5 rounded-lg bg-muted/50 border border-border/40 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[0.65rem] font-semibold text-muted-foreground uppercase">
                                        Set {s.idx ?? i + 1}
                                      </span>
                                      {s.done ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-4/10 text-chart-4 text-[0.6rem] font-medium border border-chart-4/20">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Hecho
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[0.6rem] font-medium border border-destructive/20">
                                          <XCircle className="h-3 w-3" />
                                          No
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-[0.7rem]">
                                      <div>
                                        <p className="text-muted-foreground text-[0.6rem] mb-0.5">Peso</p>
                                        <p className="font-semibold">
                                          {s.kg != null ? `${presentInUserUnit(s.kg, unit)}${unit}` : "—"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-[0.6rem] mb-0.5">Reps</p>
                                        <p className="font-semibold">{s.reps != null ? s.reps : "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-[0.6rem] mb-0.5">RPE</p>
                                        <p className="font-semibold">{s.rpe != null ? s.rpe : "—"}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Desktop: Table */}
                              <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm">
                                  <thead>
                                    <tr className="border-b-2 border-border/60">
                                      <th className="py-2 px-2 text-left font-semibold text-muted-foreground">Set</th>
                                      <th className="py-2 px-2 text-left font-semibold text-muted-foreground">Peso</th>
                                      <th className="py-2 px-2 text-left font-semibold text-muted-foreground">Reps</th>
                                      <th className="py-2 px-2 text-left font-semibold text-muted-foreground">RPE</th>
                                      <th className="py-2 px-2 text-center font-semibold text-muted-foreground">
                                        Estado
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {ex.sets.map((s, i) => (
                                      <tr
                                        key={`${ex.id_ejercicio}-${i}`}
                                        className="border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors"
                                      >
                                        <td className="py-2 px-2">
                                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-primary/10 text-primary font-semibold text-[0.65rem]">
                                            {s.idx ?? i + 1}
                                          </span>
                                        </td>
                                        <td className="py-2 px-2 font-medium">
                                          {s.kg != null ? (
                                            <span className="text-foreground">
                                              {presentInUserUnit(s.kg, unit)} {unit}
                                            </span>
                                          ) : (
                                            <span className="text-muted-foreground">—</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2 font-medium">
                                          {s.reps != null ? (
                                            <span className="text-foreground">{s.reps}</span>
                                          ) : (
                                            <span className="text-muted-foreground">—</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2 font-medium">
                                          {s.rpe != null ? (
                                            <span className="text-foreground">{s.rpe}</span>
                                          ) : (
                                            <span className="text-muted-foreground">—</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                          {s.done ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-chart-4/10 text-chart-4 text-[0.65rem] font-medium border border-chart-4/20">
                                              <CheckCircle2 className="h-3 w-3" />
                                              Realizado
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-[0.65rem] font-medium border border-destructive/20">
                                              <XCircle className="h-3 w-3" />
                                              No realizado
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
