import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardKpis } from "@/features/dashboard/components";
import { useGetFinishedWorkoutsRichQuery } from "@/features/workouts/api/workoutsApi";

import { WorkoutCard } from "@/features/workouts/components/WorkoutCard";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { normalizeSensation } from "@/features/workouts/utils/sensation";
import { diffSecondsSafe } from "@/lib/duration";
import { useListFriendsFeedRichQuery } from "@/features/friends/api/friendsFeedApi";
import { useFriendsFeedRealtime } from "@/features/friends/hooks/useFriendsFeedRealtime";
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

  console.debug("[DBG] myWorkouts raw sample:", Array.isArray(myWorkouts) ? myWorkouts.slice(0, 2) : myWorkouts);
  console.debug("[DBG] friendsFeed raw sample:", Array.isArray(friendsFeed) ? friendsFeed.slice(0, 2) : friendsFeed);

  const friendSessionIds = useMemo(
    () => (Array.isArray(friendsFeed) ? friendsFeed.map((w: any) => Number(w.id_workout)).filter(Boolean) : []),
    [friendsFeed]
  );

  useFriendsFeedRealtime(friendSessionIds, { limit: 30 });

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

  // 3) Mapear items base (+ duración calculada si falta)
  const baseItems = useMemo(() => {
    // Mis sesiones (FinishedWorkoutRich)
    const mine = (myWorkouts as any[]).map((w) => {
      const titulo =
        safeTitle(w.rutina_nombre) || safeTitle(w.Rutinas?.nombre) || safeTitle(w.titulo) || "Entrenamiento";

      const sensRawMine = w.sensacion_final ?? w.sensacion_global ?? null;
      const sensNormMine = normalizeSensation(sensRawMine);

      // 👇 prioridad: usar w.duracion_seg si la API lo trae; si no, calcular por fechas
      const dSeg =
        (typeof w.duracion_seg === "number" ? w.duracion_seg : null) ??
        diffSecondsSafe(String(w.ended_at ?? w.started_at), String(w.started_at));

      if (w.duracion_seg == null) {
        console.warn("[WARN] myWorkouts item sin duracion_seg:", w);
      }

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
        sexo: w.sexo ?? null,
        ejercicios: w.ejercicios ?? [],
        sensacionFinal: sensNormMine,
        isMine: true,
        readOnly: false,
        duracionSeg: dSeg ?? undefined, // 👈 lo pasamos a la card
        endedSort: String(w.ended_at ?? w.started_at),
        __score: titulo !== "Entrenamiento" ? 2 : 0,
        socialInitial: {
          likesCount: Number(w.likes_count ?? 0),
          commentsCount: Number(w.comments_count ?? 0),
          likedByMe: !!w.liked_by_me,
        },
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

      // 👇 si no viene duracion_seg en el feed, calculamos
      const dSeg =
        (typeof w.duracion_seg === "number" ? w.duracion_seg : null) ??
        diffSecondsSafe(String(w.fecha), String(w.fecha));

      if (w.duracion_seg == null) {
        console.warn("[WARN] friendsFeed item sin duracion_seg:", w);
      }

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
        sexo: (w.sexo as any) ?? null,
        avatarUrl: (w.url_avatar ?? undefined) as string | undefined,
        ejercicios: (w.ejercicios ?? []) as any[],
        sensacionFinal: sensNormFriend,
        isMine,
        readOnly: !isMine,
        duracionSeg: dSeg ?? undefined, // 👈 lo pasamos a la card
        endedSort: String(w.fecha),
        __score: titulo !== "Entrenamiento" ? 3 : 1,
        socialInitial: {
          likesCount: Number(w.likes_count ?? 0),
          commentsCount: Number(w.comments_count ?? 0),
          likedByMe: !!w.liked_by_me,
        },
      };
    });

    // Dedupe por id, preferimos el feed si tiene mejor score
    const merged = [...friends, ...mine];
    const byId = new Map<number, any>();

    for (const it of merged) {
      const prev = byId.get(it.idSesion);
      if (!prev) {
        byId.set(it.idSesion, it);
        continue;
      }

      // Elige como base el de mejor score
      const base = (prev.__score ?? 0) >= (it.__score ?? 0) ? prev : it;
      const other = base === prev ? it : prev;

      // Completa huecos clave (sexo, avatar, username, ejercicios…)
      byId.set(it.idSesion, {
        ...base,
        sexo: base.sexo ?? other.sexo ?? null,
        avatarUrl: base.avatarUrl ?? other.avatarUrl ?? null,
        username: base.username || other.username,
        ejercicios: (base.ejercicios?.length ? base.ejercicios : other.ejercicios) ?? [],
        socialInitial: base.socialInitial ?? other.socialInitial,
      });
    }

    const out = Array.from(byId.values());
    out.sort((a, b) => (a.endedSort < b.endedSort ? 1 : -1));

    console.debug("[DBG] baseItems sample:", out.slice(0, 2));
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
      className="space-y-8 sm:space-y-10"
    >
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 sm:p-8 lg:p-10 border-2 border-border/60 backdrop-blur-xl shadow-2xl shadow-primary/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/30 to-accent/20 ring-2 ring-primary/30 shadow-2xl shadow-primary/30">
            <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-primary drop-shadow-lg" />
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl opacity-50 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary/90 to-accent/90 bg-clip-text text-transparent drop-shadow-sm">
              Entrenamientos recientes
            </h1>
            <p className="text-muted-foreground mt-2 sm:mt-3 text-sm sm:text-lg leading-relaxed font-medium">
              Tus entrenamientos y los de tus amigos.
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="min-w-0"
      >
        <DashboardKpis />
      </motion.div>

      {/* Feed */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="min-w-0"
      >
        <Card>
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
            {isLoading && <div className="text-sm text-muted-foreground py-4">Cargando actividad…</div>}
            {!isLoading && visibleItems.length === 0 && (
              <div className="text-sm text-muted-foreground py-4">Aún no hay actividad reciente.</div>
            )}

            {!isLoading && (
              <AnimatePresence initial={false}>
                {visibleItems.map((w) => (
                  <motion.div
                    key={w.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <WorkoutCard
                      idSesion={w.idSesion}
                      titulo={w.titulo}
                      startedAt={w.startedAt}
                      endedAt={w.endedAt}
                      totalSets={w.totalSets}
                      totalVolume={w.totalVolume}
                      username={w.username}
                      avatarUrl={w.avatarUrl}
                      sexo={w.sexo ?? null}
                      ejercicios={w.ejercicios}
                      sensacionFinal={w.sensacionFinal}
                      isMine={w.isMine}
                      readOnly={w.readOnly}
                      duracionSeg={w.duracionSeg}
                      onDeleted={(id) => setDeletedIds((prev) => new Set(prev).add(id))}
                      socialInitial={w.socialInitial}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
