import { useEffect } from "react";
import { useGetDashboardKpisQuery } from "@/features/dashboard/api/dashboardApi";
import { Target, Calendar, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteWorkoutSessionMutation } from "@/features/workouts/api/workoutsApi";

export function DashboardKpis() {
  // ✅ Hacemos que el query sea más reactivo ante invalidaciones
  const {
    data,
    isLoading,
    isError,
    refetch, // lo usaremos para refrescar manualmente
    isFetching, // opcional: por si quieres mostrar un mini loader
  } = useGetDashboardKpisQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    // Si tu dashboardApi tiene providesTags([{type: "Kpis", id: "MONTH"}]),
    // se re-fetcherá automáticamente cuando invalidemos ese tag desde el delete.
  });

  // Tomamos el estado de la mutación de borrado. Si el delete se dispara desde
  // este mismo componente, esto capturará el éxito y forzará un refetch inmediato.
  const [deleteWorkout, { isSuccess: delOk }] = useDeleteWorkoutSessionMutation();

  // ✅ Refresco inmediato al completar un borrado iniciado aquí
  useEffect(() => {
    if (delOk) refetch();
  }, [delOk, refetch]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-border/40 bg-card p-6 sm:p-8 shadow-sm min-w-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-muted/10 to-transparent animate-pulse" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.3 }}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/60 animate-pulse"
                />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="h-4 w-24 sm:w-28 bg-gradient-to-r from-muted/80 to-muted/60 rounded-lg animate-pulse" />
                  <div className="h-3 w-16 sm:w-20 bg-gradient-to-r from-muted/60 to-muted/40 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-20 sm:h-10 sm:w-24 bg-gradient-to-r from-muted/80 to-muted/60 rounded-xl animate-pulse" />
              <div className="h-3 w-28 sm:w-36 bg-gradient-to-r from-muted/60 to-muted/40 rounded animate-pulse" />
            </div>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-destructive/20 bg-gradient-to-br from-destructive/5 via-destructive/3 to-transparent p-6 sm:p-8 lg:p-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(239,68,68,0.1),transparent_50%)]" />
        <div className="relative flex items-start gap-4 sm:gap-5">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/15 to-destructive/5 ring-1 ring-destructive/20 shadow-lg"
          >
            <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />
          </motion.div>
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-destructive">Error al cargar métricas</h3>
            <p className="text-sm text-destructive/80 leading-relaxed max-w-md">
              No se pudieron cargar las métrricas del dashboard. Verifica tu conexión e intenta recargar la página.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 rounded-xl bg-gradient-to-r from-destructive/10 to-destructive/5 px-5 sm:px-6 py-3 text-sm font-semibold text-destructive transition-all duration-200 hover:from-destructive/20 hover:to-destructive/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-2"
              onClick={() => refetch()}
            >
              Reintentar carga
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  const { routineCount, workoutsThisMonth, totalVolumeThisMonth } = data;

  const kpis = [
    {
      title: "Rutinas creadas",
      value: routineCount,
      description: "Rutinas disponibles",
      icon: Target,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-900 dark:text-blue-100",
      valueColor: "text-blue-600 dark:text-blue-400",
      descColor: "text-blue-700 dark:text-blue-300",
    },
    {
      title: "Entrenamientos este mes",
      value: workoutsThisMonth,
      description: "Entrenamientos completados",
      icon: Calendar,
      gradient: "from-green-500/10 via-green-500/5 to-transparent",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-900 dark:text-green-100",
      valueColor: "text-green-600 dark:text-green-400",
      descColor: "text-green-700 dark:text-green-300",
    },
    {
      title: "Volumen este mes",
      value: `${totalVolumeThisMonth.toLocaleString()} kg`,
      description: "Total levantado",
      icon: TrendingUp,
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-900 dark:text-purple-100",
      valueColor: "text-purple-600 dark:text-purple-400",
      descColor: "text-purple-700 dark:text-purple-300",
    },
  ];

  return (
    <div className="min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      <AnimatePresence>
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl lg:rounded-3xl border border-border/40 bg-card p-6 sm:p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 min-w-0"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-40 group-hover:opacity-70 transition-opacity duration-500`}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <motion.div
                animate={{
                  background: [
                    `conic-gradient(from 0deg, ${
                      kpi.iconColor.includes("blue")
                        ? "#3b82f6"
                        : kpi.iconColor.includes("green")
                        ? "#10b981"
                        : "#8b5cf6"
                    }20, transparent, ${
                      kpi.iconColor.includes("blue")
                        ? "#3b82f6"
                        : kpi.iconColor.includes("green")
                        ? "#10b981"
                        : "#8b5cf6"
                    }20)`,
                    `conic-gradient(from 360deg, ${
                      kpi.iconColor.includes("blue")
                        ? "#3b82f6"
                        : kpi.iconColor.includes("green")
                        ? "#10b981"
                        : "#8b5cf6"
                    }20, transparent, ${
                      kpi.iconColor.includes("blue")
                        ? "#3b82f6"
                        : kpi.iconColor.includes("green")
                        ? "#10b981"
                        : "#8b5cf6"
                    }20)`,
                  ],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute inset-0 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Header with icon and title */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${kpi.iconBg} ring-1 ring-border/20 shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                  >
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${kpi.iconColor}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${kpi.textColor} text-xs sm:text-sm leading-tight truncate`}>
                      {kpi.title}
                    </h3>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.3, type: "spring", bounce: 0.4 }}
                  className="mb-3 sm:mb-4"
                >
                  <p className={`text-3xl sm:text-4xl font-black ${kpi.valueColor} leading-none tracking-tight`}>
                    {kpi.value}
                  </p>
                </motion.div>

                {/* Description */}
                <p className={`text-xs sm:text-sm ${kpi.descColor} leading-relaxed`}>{kpi.description}</p>

                <motion.div
                  animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-10 group-hover:opacity-30 transition-opacity duration-500"
                >
                  <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
