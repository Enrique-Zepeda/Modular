import { useMemo } from "react";
import { useGetFinishedWorkoutsRichQuery } from "@/features/workouts/api/workoutsApi";
import { parseVolume, type FinishedWorkoutRich } from "@/types/workouts";
import { Loader2, Activity } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";
import { groupWorkoutsByDay } from "@/features/workouts/utils/groupByDay";
import { motion, AnimatePresence } from "framer-motion";

type Props = { limit?: number };

export function FinishedWorkoutsSection({ limit = 20 }: Props) {
  const { data, isLoading, isFetching, error } = useGetFinishedWorkoutsRichQuery({ limit });

  const groups = useMemo(() => {
    const workouts: FinishedWorkoutRich[] = data ?? [];
    return groupWorkoutsByDay(workouts, { locale: "es-MX", timeZone: "America/Mexico_City" });
  }, [data]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-muted-foreground"
      >
        <div className="relative">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-primary/20" />
            <div className="absolute inset-0 h-10 w-10 animate-pulse rounded-full bg-primary/10" />
          </div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-xl"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Cargando entrenamientos
          </p>
          <p className="mt-2 text-sm text-muted-foreground/80">Preparando tu historial de entrenamientos…</p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/5 via-destructive/3 to-transparent p-8"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_50%)]" />
        </div>
        <div className="relative flex items-start gap-4">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20"
          >
            <Activity className="h-6 w-6 text-destructive" />
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-destructive">Error al cargar entrenamientos</h3>
            <p className="text-sm text-destructive/80 leading-relaxed">
              Hubo un problema al cargar los entrenamientos. Verifica tu conexión e intenta recargar la página.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!groups.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40 shadow-lg"
          >
            <Activity className="h-10 w-10 text-muted-foreground/60" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-xl"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-3"
        >
          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            ¡Comienza tu primer entrenamiento!
          </h3>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Cuando completes tu primer entrenamiento, aparecerá aquí junto con todas tus estadísticas y progreso.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-10">
        <AnimatePresence mode="popLayout">
          {groups.map((g, groupIndex) => (
            <motion.section
              key={g.header}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                delay: groupIndex * 0.15,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="space-y-6"
            >
              <div className="relative flex items-center gap-4 px-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: groupIndex * 0.15 + 0.2, duration: 0.8 }}
                  className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border/50"
                />
              </div>

              <div className="space-y-5">
                <AnimatePresence>
                  {g.items.map((w, idx) => (
                    <motion.div
                      key={w.id_sesion}
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.95 }}
                      transition={{
                        delay: idx * 0.08,
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                    >
                      <WorkoutCard
                        idSesion={w.id_sesion}
                        titulo={w.titulo}
                        endedAt={w.ended_at}
                        startedAt={w.started_at}
                        totalSets={w.total_sets}
                        totalVolume={parseVolume(w.total_volume)}
                        username={w.username ?? "Usuario"}
                        avatarUrl={w.url_avatar ?? undefined}
                        sexo={(w as any).sexo ?? null}
                        ejercicios={w.ejercicios as any}
                        sensacionFinal={w.sensacion_final ?? null}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFetching && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5 p-4"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Loader2 className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-primary">Actualizando entrenamientos…</span>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                className="flex gap-1"
              >
                <div className="h-1 w-1 rounded-full bg-primary/60" />
                <div className="h-1 w-1 rounded-full bg-primary/40" />
                <div className="h-1 w-1 rounded-full bg-primary/20" />
              </motion.div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
