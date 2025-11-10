import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { CalendarDays, Trash2, TrendingUp, Dumbbell, Timer, ListChecks } from "lucide-react";
import { useDeleteWorkoutSessionMutation } from "@/features/workouts/api/workoutsApi";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { diffSecondsSafe, formatDurationShort } from "@/lib/duration";
import { SocialActionsBar } from "@/features/social/components/SocialActionsBar";
import { normalizeSensation, sensationPillClasses, getSensationStyles } from "@/features/workouts/utils/sensation";
import { WorkoutDetailsDialog } from "./WorkoutDetailsDialog";
import type { Sexo } from "@/lib/avatar";
import UserAvatar from "@/components/ui/user-avatar";
import { Link } from "react-router-dom"; // 👈 nuevo

type ExerciseItem = {
  id?: number | string | null;
  nombre?: string | null;
  grupo_muscular?: string | null;
  equipamento?: string | null;
  ejemplo?: string | null;
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
  avatarUrl?: string | null;
  sexo?: Sexo;
  ejercicios?: ExerciseItem[];
  className?: string;
  dayHeader?: string | null;
  sensacionFinal?: string | null;
  duracionSeg?: number | null;
  readOnly?: boolean;
  isMine?: boolean;
  onDeleted?: (idSesion: number) => void;
  socialInitial?: { likesCount: number; commentsCount: number; likedByMe: boolean };
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
  sexo,
  ejercicios = [],
  className,
  dayHeader,
  sensacionFinal,
  duracionSeg,
  readOnly = false,
  isMine = false,
  onDeleted,
  socialInitial,
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
  const [openDetails, setOpenDetails] = useState(false);

  const [deleteWorkout, { isLoading: deleting }] = useDeleteWorkoutSessionMutation();

  const canDelete = isMine && !readOnly;
  const isAnyDialogOpen = openConfirm || openDetails;

  const handleOpenDetails = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      if (isAnyDialogOpen) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-open]")) return; // 👈 respeta zonas “no abre modal”
      setOpenDetails(true);
    },
    [isAnyDialogOpen]
  );

  const openConfirmExclusively = useCallback(() => {
    setOpenDetails(false);
    setOpenConfirm(true);
  }, []);

  const openDetailsExclusively = useCallback(() => {
    setOpenConfirm(false);
    setOpenDetails(true);
  }, []);

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
  const sensationStyles = getSensationStyles(sensationText);

  const durationSeconds = useMemo(() => {
    if (duracionSeg != null) return Math.max(0, Math.floor(duracionSeg));
    return diffSecondsSafe(endedAt, startedAt);
  }, [duracionSeg, endedAt, startedAt]);

  const durationLabel = useMemo(() => formatDurationShort(durationSeconds), [durationSeconds]);

  const doneExercises = useMemo(() => (ejercicios ?? []).filter((ex) => (ex.sets_done ?? 0) > 0), [ejercicios]);

  // Ruta segura al perfil (no rompe tu UI ni lógica)
  const profileHref = useMemo(() => {
    const handle = String(username || "")
      .replace(/^@+/, "")
      .trim();
    if (!handle) return isMine ? "/profile" : "/dashboard";
    return isMine ? "/profile" : `/u/${encodeURIComponent(handle)}`;
  }, [username, isMine]);

  useEffect(() => {
    console.debug("[WorkoutCard] usuario=", username, "sexo=", sexo, "avatarUrl=", avatarUrl);
  }, [username, sexo, avatarUrl]);

  const exercisesCount = doneExercises.length;

  return (
    <>
      {dayHeader ? (
        <div className="px-2 mb-4 mt-8 text-xs font-bold text-muted-foreground/80 uppercase tracking-widest flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span>{dayHeader}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          onClick={handleOpenDetails}
          className={cn(
            "relative overflow-hidden border-2 border-border/60 rounded-3xl cursor-pointer",
            "backdrop-blur-xl bg-gradient-to-br from-card/95 via-card/90 to-card/95",
            "shadow-2xl transition-all duration-700",
            "hover:shadow-[0_20px_70px_-15px_rgba(139,92,246,0.3)]",
            "hover:-translate-y-0.5",
            "supports-[backdrop-filter]:backdrop-blur-xl",
            className
          )}
        >
          <CardHeader className="pb-5 pt-6 px-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1" />
              {canDelete && (
                <Button
                  data-no-open
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 hover:bg-destructive/15 hover:text-destructive hover:scale-110 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmExclusively();
                  }}
                  aria-label="Eliminar entrenamiento"
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-5">
              <h3 className="text-xl font-bold leading-tight line-clamp-2 text-balance bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                {titulo}
              </h3>

              <div className="flex items-center gap-3.5">
                {/* 👇 Avatar clickeable al perfil, sin abrir el modal */}
                <Link
                  to={profileHref}
                  data-no-open
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={`Ver perfil de ${username}`}
                  title={`Ver perfil de ${username}`}
                >
                  <UserAvatar
                    url={avatarUrl ?? null}
                    sexo={sexo}
                    alt={username}
                    size={44}
                    className="border-2 border-primary/20 ring-2 ring-primary/10 shadow-lg shadow-primary/5 rounded-full"
                    imageClassName="object-cover"
                    fallbackText={initials}
                  />
                </Link>

                <div className="leading-tight min-w-0 flex-1">
                  <div className="text-sm font-bold truncate text-foreground">{username}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mt-1">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {dayLabel}
                      {timeLabel ? ` · ${timeLabel}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div
                className="flex flex-wrap items-center gap-3 pt-1"
                role="list"
                aria-label="Estadísticas del entrenamiento"
              >
                <div
                  className="flex items-center justify-center gap-2 min-w-[90px] px-3 py-2.5 bg-gradient-to-br from-indigo-500/15 to-indigo-600/10 border-2 border-indigo-500/40 rounded-xl hover:from-indigo-500/25 hover:to-indigo-600/20 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-105 transition-all duration-200"
                  role="listitem"
                >
                  <ListChecks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">{exercisesCount}</span>
                  <span className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-semibold">
                    Ejercicio{exercisesCount === 1 ? "" : "s"}
                  </span>
                </div>

                <div
                  className="flex items-center justify-center gap-2 min-w-[90px] px-3 py-2.5 bg-gradient-to-br from-blue-500/15 to-blue-600/10 border-2 border-blue-500/40 rounded-xl hover:from-blue-500/25 hover:to-blue-600/20 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-200"
                  role="listitem"
                >
                  <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span className="font-bold text-blue-700 dark:text-blue-300">{totalSets}</span>
                  <span className="text-xs text-blue-600/80 dark:text-blue-400/80 font-semibold">Sets</span>
                </div>

                <div
                  className="flex items-center justify-center gap-2 min-w-[90px] px-3 py-2.5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border-2 border-emerald-500/40 rounded-xl hover:from-emerald-500/25 hover:to-emerald-600/20 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all duration-200"
                  role="listitem"
                >
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {Intl.NumberFormat("es-MX").format(totalVolume)}
                  </span>
                  <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold">kg</span>
                </div>

                {!!durationLabel && (
                  <div
                    className="flex items-center justify-center gap-2 min-w-[90px] px-3 py-2.5 bg-gradient-to-br from-amber-500/15 to-amber-600/10 border-2 border-amber-500/40 rounded-xl hover:from-amber-500/25 hover:to-amber-600/20 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105 transition-all duration-200"
                    role="listitem"
                  >
                    <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <span className="font-bold text-amber-700 dark:text-amber-300">{durationLabel}</span>
                  </div>
                )}

                <div
                  className={cn(
                    "flex items-center justify-center gap-2 min-w-[90px] px-3 py-2.5 rounded-xl border-2 font-semibold",
                    "bg-gradient-to-br transition-all duration-200",
                    "hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:saturate-125 hover:contrast-110",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    sensationPillClasses(sensationText)
                  )}
                  role="listitem"
                  title={`Sensación: ${normalizeSensation(sensationText)}`}
                  aria-label={`Sensación: ${normalizeSensation(sensationText)}`}
                >
                  {sensationStyles.icon ? (
                    <sensationStyles.icon className="h-4 w-4 opacity-90" aria-hidden="true" />
                  ) : null}
                  {normalizeSensation(sensationText)}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-6 px-6 space-y-5">
            {!ejercicios || ejercicios.length === 0 ? (
              <div className="border-2 border-dashed border-border/80 bg-gradient-to-br from-muted/30 to-muted/10 p-6 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-muted to-muted/80 rounded-xl shadow-sm">
                    <Dumbbell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Sin ejercicios registrados</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3" role="list" aria-label="Ejercicios realizados">
                {ejercicios.map((ex, idx) => (
                  <div
                    key={(ex.id ?? idx)?.toString()}
                    className="flex items-start gap-3.5 p-4 border-2 border-border/80 bg-gradient-to-br from-muted/20 via-muted/10 to-transparent hover:from-muted/40 hover:via-muted/30 hover:to-muted/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group/exercise rounded-xl"
                    role="listitem"
                  >
                    <div className="shrink-0">
                      {ex.ejemplo ? (
                        <img
                          src={ex.ejemplo || "/placeholder.svg"}
                          alt={ex.nombre ?? "Ejercicio"}
                          className="h-12 w-12 object-cover border-2 border-border/80 rounded-lg group-hover/exercise:border-primary/50 group-hover/exercise:shadow-md transition-all duration-200"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center rounded-lg border-2 border-primary/40 group-hover/exercise:border-primary/60 group-hover/exercise:shadow-md group-hover/exercise:shadow-primary/20 transition-all duration-200">
                          <Dumbbell className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold line-clamp-1 text-foreground mb-2.5">
                        {ex.nombre ?? "Ejercicio"}
                      </div>
                      <div className="flex items-center gap-2">
                        {ex.sets_done && (
                          <span className="inline-flex items-center justify-center gap-1 min-w-[70px] px-2.5 py-1 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/40 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm">
                            {ex.sets_done} sets
                          </span>
                        )}
                        {ex.volume && (
                          <span className="inline-flex items-center justify-center gap-1 min-w-[70px] px-2.5 py-1 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-sm">
                            {Intl.NumberFormat("es-MX").format(Number(ex.volume))} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Social bar: evitar que abra el modal */}
            <div
              className="pt-5 border-t-2 border-border/80"
              data-no-open
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <SocialActionsBar
                sessionId={idSesion}
                initialLikesCount={socialInitial?.likesCount}
                initialLikedByMe={socialInitial?.likedByMe}
                initialCommentsCount={socialInitial?.commentsCount}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <WorkoutDetailsDialog
        sessionId={idSesion}
        open={openDetails}
        onOpenChange={(v) => {
          if (v) openDetailsExclusively();
          else setOpenDetails(false);
        }}
        durationLabelSeed={durationLabel}
        sensacionSeed={sensationText}
      />

      <AlertDialog
        open={openConfirm}
        onOpenChange={(v) => {
          if (v) openConfirmExclusively();
          else setOpenConfirm(false);
        }}
      >
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
    </>
  );
}
