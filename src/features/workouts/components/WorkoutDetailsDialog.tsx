import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dumbbell, Timer, TrendingUp, Activity, CheckCircle2, XCircle } from "lucide-react";
import { useWorkoutDetails } from "@/features/workouts/hooks/useWorkoutDetails";
import { cn } from "@/lib/utils";
import { formatDurationShort } from "@/lib/duration";
import { useWeightUnit } from "@/hooks";
import { presentInUserUnit } from "@/lib/weight";

type Props = {
  sessionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** semillas (del Card) */
  durationLabelSeed?: string | null;
  sensacionSeed?: string | number | null;
};

export function WorkoutDetailsDialog({ sessionId, open, onOpenChange, durationLabelSeed, sensacionSeed }: Props) {
  const { data, loading, error } = useWorkoutDetails(sessionId, {
    durationLabel: durationLabelSeed ?? undefined,
    sensacion: sensacionSeed ?? undefined,
  });

  const { unit } = useWeightUnit();
  // Mostrar duración inmediata usando la semilla del Card;
  // si el hook trae segundos, formatearlos; si trae label, usarla.
  const displayDuration =
    data?.durationLabel ??
    durationLabelSeed ??
    (typeof data?.durationSeconds === "number"
      ? formatDurationShort(Math.max(0, Math.floor(data.durationSeconds)))
      : undefined) ??
    "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("w-[95vw] max-w-3xl lg:max-w-5xl p-0 overflow-hidden")}>
        <div className="flex flex-col max-h-[85vh]">
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b bg-gradient-to-r from-background via-background to-primary/5">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Detalle del Entrenamiento
                </DialogTitle>
              </div>
            </DialogHeader>
          </div>

          {/* Body con scroll interno */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 sm:p-6 space-y-6">
                {loading ? (
                  <div className="py-16 text-center">
                    <div className="inline-flex items-center gap-3 text-muted-foreground">
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Cargando detalles...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <XCircle className="h-12 w-12 text-destructive" />
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                  </div>
                ) : !data ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <p className="text-sm">No hay datos para esta sesión.</p>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Timer className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Duración
                            </p>
                            <p className="text-lg font-bold text-foreground truncate">{displayDuration}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-chart-1/10 to-chart-1/5 border border-chart-1/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-chart-1/20">
                            <TrendingUp className="h-4 w-4 text-chart-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Volumen Total
                            </p>
                            <p className="text-lg font-bold text-foreground truncate">
                              {Intl.NumberFormat("es-MX").format(presentInUserUnit(data.totalVolume ?? 0, unit))}
                              {unit}
                            </p>
                          </div>
                        </div>
                      </div>

                      {data.sensacion_global != null && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-chart-2/10 to-chart-2/5 border border-chart-2/20">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-chart-2/20">
                              <Activity className="h-4 w-4 text-chart-2" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Sensación
                              </p>
                              <p className="text-lg font-bold text-foreground">{String(data.sensacion_global)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                        <h3 className="text-lg font-bold">Ejercicios Realizados</h3>
                        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30">
                          <Dumbbell className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-bold text-primary">{data.exercises.length}</span>
                          <span className="text-xs font-medium text-muted-foreground">
                            {data.exercises.length === 1 ? "ejercicio" : "ejercicios"}
                          </span>
                        </div>
                      </div>

                      {data.exercises.length === 0 ? (
                        <div className="py-12 text-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
                          <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Sin ejercicios registrados.</p>
                        </div>
                      ) : (
                        data.exercises.map((ex, idx) => (
                          <div
                            key={ex.id_ejercicio}
                            className="rounded-xl border-2 border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="p-4 sm:p-5 bg-gradient-to-r from-muted/30 to-transparent border-b">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="shrink-0">
                                  {ex.ejemplo ? (
                                    <img
                                      src={ex.ejemplo || "/placeholder.svg"}
                                      alt={ex.nombre ?? "Ejercicio"}
                                      loading="lazy"
                                      className="h-14 w-14 sm:h-16 sm:w-16 object-cover border-2 border-border/80 rounded-xl shadow-sm"
                                    />
                                  ) : (
                                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-2 border-border/80 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                      <Dumbbell className="h-6 w-6 sm:h-7 sm:w-7 text-primary" aria-hidden="true" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-base sm:text-lg leading-tight truncate">
                                        {ex.nombre ?? `Ejercicio ${ex.id_ejercicio}`}
                                      </h4>
                                      {ex.grupo_muscular && (
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                          {ex.grupo_muscular}
                                        </p>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="shrink-0 text-xs">
                                      #{idx + 1}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 sm:p-5">
                              <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b-2 border-border/60">
                                        <th className="py-3 px-2 text-left font-semibold text-muted-foreground">Set</th>
                                        <th className="py-3 px-2 text-left font-semibold text-muted-foreground">
                                          Peso
                                        </th>
                                        <th className="py-3 px-2 text-left font-semibold text-muted-foreground">
                                          Reps
                                        </th>
                                        <th className="py-3 px-2 text-left font-semibold text-muted-foreground">RPE</th>
                                        <th className="py-3 px-2 text-center font-semibold text-muted-foreground">
                                          Estado
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ex.sets.map((s, i) => (
                                        <tr
                                          key={`${ex.id_ejercicio}-${i}`}
                                          className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                                        >
                                          <td className="py-3 px-2">
                                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                                              {s.idx ?? i + 1}
                                            </span>
                                          </td>
                                          <td className="py-3 px-2 font-medium">
                                            {s.kg != null ? (
                                              <span className="text-foreground">
                                                {presentInUserUnit(s.kg, unit)} {unit}
                                              </span>
                                            ) : (
                                              <span className="text-muted-foreground">—</span>
                                            )}
                                          </td>
                                          <td className="py-3 px-2 font-medium">
                                            {s.reps != null ? (
                                              <span className="text-foreground">{s.reps}</span>
                                            ) : (
                                              <span className="text-muted-foreground">—</span>
                                            )}
                                          </td>
                                          <td className="py-3 px-2 font-medium">
                                            {s.rpe != null ? (
                                              <span className="text-foreground">{s.rpe}</span>
                                            ) : (
                                              <span className="text-muted-foreground">—</span>
                                            )}
                                          </td>
                                          <td className="py-3 px-2 text-center">
                                            {s.done ? (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chart-4/10 text-chart-4 text-xs font-medium border border-chart-4/20">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Realizado
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
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
