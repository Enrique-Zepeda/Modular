import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardKpis } from "@/features/dashboard/components";
import { useGetFinishedWorkoutsRichQuery } from "@/features/workouts/api/workoutsApi";
import { useListFriendsFeedRichQuery } from "@/features/friends/api";
import { WorkoutCard } from "@/features/workouts/components/WorkoutCard";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { normalizeSensation } from "@/features/workouts/utils/sensation";

// Título seguro
const safeTitle = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
};

export function DashboardPage() {
  // 1) Datos
  const { data: myWorkouts = [], isLoading: loadingMine } = useGetFinishedWorkoutsRichQuery({ limit: 30 });
  const { data: friendsFeed = [], isLoading: loadingFriends } = useListFriendsFeedRichQuery({ limit: 30 });

  // 2) Resolver mi id_usuario (entero)
  const [myUsuarioId, setMyUsuarioId] = useState<number | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rpc = await supabase.rpc("current_usuario_id");
        if (!rpc.error && typeof rpc.data === "number") {
          if (mounted) setMyUsuarioId(rpc.data as number);
          return;
        }
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) return;
        const prof = await supabase.from("Usuarios").select("id_usuario").eq("auth_uid", uid).single();
        if (!prof.error && prof.data?.id_usuario && mounted) setMyUsuarioId(prof.data.id_usuario as number);
      } catch {
        // noop
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 3) Mapear items base
  const baseItems = useMemo(() => {
    // Mis sesiones (FinishedWorkoutRich)
    const mine = (myWorkouts as any[]).map((w) => {
      const titulo =
        safeTitle(w.rutina_nombre) || safeTitle(w.Rutinas?.nombre) || safeTitle(w.titulo) || "Entrenamiento";

      const sensRawMine = w.sensacion_final ?? w.sensacion_global ?? null;
      const sensNormMine = normalizeSensation(sensRawMine);

      return {
        source: "mine" as const,
        key: `mine-${w.id_sesion}`,
        idSesion: Number(w.id_sesion),
        titulo,
        startedAt: String(w.started_at),
        endedAt: String(w.ended_at ?? w.started_at),
        totalSets: Number(w.total_sets ?? 0),
        totalVolume: Number(w.total_volume ?? 0),
        username: w.username ?? "Yo",
        avatarUrl: w.url_avatar ?? undefined,
        ejercicios: w.ejercicios ?? [],
        sensacionFinal: sensNormMine,
        isMine: true,
        readOnly: false,
        endedSort: String(w.ended_at ?? w.started_at),
        __score: titulo !== "Entrenamiento" ? 2 : 0,
      };
    });

    // Feed de amigos (desde BD)
    const friends = (friendsFeed as any[]).map((w) => {
      const titulo =
        safeTitle(w.rutina_nombre) ||
        safeTitle(w.nota) ||
        `Entrenamiento de ${String(w.username || "").trim() || "amigo"}`;

      const sensNormFriend = normalizeSensation(w.sensacion);
      const isMine = myUsuarioId != null && w.id_usuario === myUsuarioId;

      return {
        source: "friends" as const,
        key: `friend-${w.id_workout}`,
        idSesion: Number(w.id_workout),
        titulo,
        startedAt: String(w.fecha),
        endedAt: String(w.fecha),
        totalSets: Number(w.total_series ?? 0),
        totalVolume: Number(w.total_kg ?? 0),
        username: String(w.username ?? ""),
        avatarUrl: (w.url_avatar ?? undefined) as string | undefined,
        ejercicios: (w.ejercicios ?? []) as any[],
        sensacionFinal: sensNormFriend,
        isMine,
        readOnly: !isMine,
        endedSort: String(w.fecha),
        __score: titulo !== "Entrenamiento" ? 3 : 1,
      };
    });

    // Preferimos el feed si existe la misma sesión, dedupe por mejor score
    const merged = [...friends, ...mine];
    const byId = new Map<number, any>();
    for (const it of merged) {
      const prev = byId.get(it.idSesion);
      if (!prev || (it.__score ?? 0) > (prev.__score ?? 0)) byId.set(it.idSesion, it);
    }
    const out = Array.from(byId.values());
    out.sort((a, b) => (a.endedSort < b.endedSort ? 1 : -1));
    return out;
  }, [myWorkouts, friendsFeed, myUsuarioId]);

  // 4) Eliminación optimista en UI
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const visibleItems = useMemo(() => baseItems.filter((x) => !deletedIds.has(x.idSesion)), [baseItems, deletedIds]);

  const isLoading = loadingMine || loadingFriends;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-10"
    >
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted/30 via-muted/10 to-transparent p-8 border border-border/40"
      >
        <div className="relative flex items-center gap-5">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 shadow-xl">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent">
              Entrenamientos recientes
            </h1>
            <p className="text-muted-foreground mt-2 text-lg leading-relaxed">
              Tus entrenamientos y los de tus amigos, con ejercicios completados y sensación final.
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <DashboardKpis />
      </motion.div>

      {/* Feed */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden border-border/40 shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl">
          <CardHeader className="relative bg-gradient-to-br from-muted/40 via-muted/20 to-transparent border-b border-border/40 p-8">
            <CardTitle className="relative flex items-center gap-4 text-2xl font-bold">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 shadow-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Entrenamientos recientes
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  Una sola vista con tus sesiones y las de tus amigos. La papelera solo aparece en tus sesiones.
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-4">
            {isLoading && <div className="text-sm text-muted-foreground">Cargando actividad…</div>}
            {!isLoading && visibleItems.length === 0 && (
              <div className="text-sm text-muted-foreground">Aún no hay actividad reciente.</div>
            )}

            {!isLoading && (
              <AnimatePresence initial={false}>
                {visibleItems.map((w) => (
                  <WorkoutCard
                    key={w.key}
                    idSesion={w.idSesion}
                    titulo={w.titulo}
                    startedAt={w.startedAt}
                    endedAt={w.endedAt}
                    totalSets={w.totalSets}
                    totalVolume={w.totalVolume}
                    username={w.username}
                    avatarUrl={w.avatarUrl}
                    ejercicios={w.ejercicios}
                    sensacionFinal={w.sensacionFinal}
                    isMine={w.isMine}
                    readOnly={w.readOnly}
                    // 👇 remueve inmediatamente del feed
                    onDeleted={(id) =>
                      setDeletedIds((prev) => {
                        const next = new Set(prev);
                        next.add(id);
                        return next;
                      })
                    }
                  />
                ))}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
