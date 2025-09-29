import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CalendarDays, Trash2, TrendingUp, Dumbbell, Heart, Timer } from "lucide-react";
import { useDeleteWorkoutSessionMutation } from "@/features/workouts/api/workoutsApi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { diffSecondsSafe, formatDurationShort } from "@/lib/duration";

type ExerciseItem = {
  id?: number | string | null;
  nombre?: string | null;
  grupo_muscular?: string | null;
  equipamento?: string | null;
  ejemplo?: string | null; // URL imagen
  sets_done?: number | null;
  volume?: number | string | null;
};

type Props = {
  idSesion: number;
  titulo: string;
  startedAt: string;
  endedAt: string;
  totalSets: number;
  totalVolume: number;
  username?: string;
  avatarUrl?: string;
  ejercicios?: ExerciseItem[];
  className?: string;
  dayHeader?: string | null;
  sensacionFinal?: string | null;

  // 👇 NUEVO: duración, si viene de la API la usamos; si no, calculamos con las fechas
  duracionSeg?: number | null;

  readOnly?: boolean;
  isMine?: boolean;
  onDeleted?: (idSesion: number) => void;
};

const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const formatAsDMY = (ts?: string) => {
  if (!ts) return "";
  const d = new Date(ts);
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatHourAmPm = (ts?: string) => {
  if (!ts) return "";
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m} ${suffix}`;
};

const ymdKey = (d: Date, tz = LOCAL_TZ) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

const labelForDay = (ts: string, tz = LOCAL_TZ) => {
  const d = new Date(ts);
  const now = new Date();
  const today = ymdKey(now, tz);
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yesterday = ymdKey(y, tz);
  const key = ymdKey(d, tz);
  if (key === today) return "Hoy";
  if (key === yesterday) return "Ayer";
  return formatAsDMY(ts);
};

export function WorkoutCard({
  idSesion,
  titulo,
  startedAt,
  endedAt,
  totalSets,
  totalVolume,
  username = "Usuario",
  avatarUrl,
  ejercicios = [],
  className,
  dayHeader,
  sensacionFinal,
  duracionSeg, // 👈 puede venir null/undefined
  readOnly = false,
  isMine = false,
  onDeleted,
}: Props) {
  const endTs = endedAt || startedAt;
  const dayLabel = labelForDay(endTs);
  const timeLabel = formatHourAmPm(endTs);
  const initials = (username || "U")
    .split(" ")
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteWorkout, { isLoading: deleting }] = useDeleteWorkoutSessionMutation();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 15) + 1);

  const canDelete = isMine && !readOnly;

  const handleDelete = async () => {
    try {
      await deleteWorkout({ id_sesion: idSesion }).unwrap();
      toast.success("Entrenamiento eliminado");
      onDeleted?.(idSesion);
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo eliminar la sesión");
    } finally {
      setOpenConfirm(false);
    }
  };

  const sensationText = (sensacionFinal && sensacionFinal.trim()) || "Sin sensaciones";

  // 👇 Calcular duración si no viene de props
  const durationSeconds = useMemo(() => {
    if (duracionSeg != null) return Math.max(0, Math.floor(duracionSeg));
    return diffSecondsSafe(endedAt, startedAt);
  }, [duracionSeg, endedAt, startedAt]);

  const durationLabel = useMemo(() => formatDurationShort(durationSeconds), [durationSeconds]);

  return (
    <>
      {dayHeader ? <div className="px-1 mb-2 mt-6 text-sm font-medium text-muted-foreground">{dayHeader}</div> : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Card
          className={cn(
            "group relative overflow-hidden bg-card text-card-foreground rounded-3xl border border-border/40 shadow-sm transition-all duration-500",
            "hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20",
            className
          )}
        >
          <CardHeader className="relative pb-5 z-10">
            <div className="flex items-start justify-between gap-4">
              {/* Usuario + fecha */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-border/30">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary font-bold text-sm">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="leading-tight min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground truncate">{username}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {dayLabel}
                      {timeLabel ? ` · ${timeLabel}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Borrar (solo mío) */}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-xl hover:bg-destructive/15 hover:text-destructive transition-all duration-200 text-muted-foreground/60"
                  onClick={() => setOpenConfirm(true)}
                  aria-label="Eliminar entrenamiento"
                  title="Eliminar entrenamiento"
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <h3 className="text-xl font-bold leading-tight line-clamp-2">{titulo}</h3>

              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="secondary" className="rounded-2xl px-4 py-2 text-xs font-semibold">
                  <Dumbbell className="h-3.5 w-3.5 mr-2" />
                  {totalSets} sets
                </Badge>

                <Badge className="rounded-2xl px-4 py-2 text-xs font-semibold">
                  <TrendingUp className="h-3.5 w-3.5 mr-2" />
                  {Intl.NumberFormat("es-MX").format(totalVolume)} kg
                </Badge>

                <Badge variant="outline" className="rounded-2xl px-4 py-2 text-xs font-semibold">
                  {sensationText}
                </Badge>

                {/* 👇 NUEVO: Badge de duración (neutro/secondary, discreto) */}
                {durationLabel && (
                  <Badge variant="secondary" className="rounded-2xl px-3 py-1.5 text-xs font-medium">
                    <Timer className="h-3.5 w-3.5 mr-1.5" />
                    {durationLabel}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative pt-0 z-10">
            {!ejercicios || ejercicios.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 bg-muted/10 p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                    <Dumbbell className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Sin ejercicios registrados</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Los ejercicios aparecerán cuando estén disponibles
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence>
                  {ejercicios.map((ex, idx) => (
                    <motion.div
                      key={(ex.id ?? idx)?.toString()}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.25 }}
                      className="rounded-2xl border border-border/30 bg-muted/20 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          {ex.ejemplo ? (
                            <img
                              src={ex.ejemplo}
                              alt={ex.nombre ?? "Ejercicio"}
                              className="h-14 w-14 rounded-2xl object-cover border"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                              <Dumbbell className="h-6 w-6 text-muted-foreground/70" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold">{ex.nombre ?? "Ejercicio"}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {ex.sets_done && (
                              <span className="font-semibold text-foreground/80">{ex.sets_done} sets</span>
                            )}
                            {ex.sets_done && (ex.grupo_muscular || ex.volume) && (
                              <span className="text-muted-foreground/40">·</span>
                            )}
                            {ex.grupo_muscular && !ex.volume && <span className="truncate">{ex.grupo_muscular}</span>}
                            {ex.volume && (
                              <span className="font-semibold">
                                {Intl.NumberFormat("es-MX").format(Number(ex.volume))} kg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!readOnly && (
              <div className="mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsLiked((v) => !v);
                      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
                    }}
                  >
                    <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current text-red-500")} />
                    <span className="text-sm font-medium">{likesCount}</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          {canDelete && (
            <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar entrenamiento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará la sesión y sus sets asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Eliminando…" : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </Card>
      </motion.div>
    </>
  );
}
