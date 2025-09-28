import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardKpis } from "@/features/dashboard/components";
import { useListFriendsFeedRichQuery } from "@/features/friends/api";
import { WorkoutCard } from "@/features/workouts/components/WorkoutCard";
import { motion } from "framer-motion";
import { BarChart3, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * Dashboard unificado (propios + amigos)
 *
 * - Mantiene el hero y las KPIs.
 * - Unifica el feed en una sola sección.
 * - Obtiene el id_usuario del usuario autenticado para:
 *    * Mostrar el icono de eliminar SOLO en tus entrenamientos.
 *    * Bloquear acciones en entrenamientos de amigos (readOnly).
 * - NO toca la UI social de la card (likes/comentarios visuales permanecen).
 */
export function DashboardPage() {
  // Feed enriquecido (propios + amigos) ya con ejercicios "done" por sesión
  const { data: feed = [], isLoading } = useListFriendsFeedRichQuery({ limit: 30 });

  // Guardamos mi id_usuario (entero) para comparar con w.id_usuario del feed
  const [myUsuarioId, setMyUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) Preferido: RPC que devuelve tu id_usuario (más eficiente)
        const rpc = await supabase.rpc("current_usuario_id");
        if (!rpc.error && typeof rpc.data === "number") {
          if (mounted) setMyUsuarioId(rpc.data as number);
          return;
        }

        // 2) Fallback: resolver por auth.uid en tabla Usuarios
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) return;

        const prof = await supabase.from("Usuarios").select("id_usuario").eq("auth_uid", uid).single();

        if (!prof.error && prof.data?.id_usuario && mounted) {
          setMyUsuarioId(prof.data.id_usuario as number);
        }
      } catch {
        // noop
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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
              Tus entrenamientos y los de tus amigos, con ejercicios completados
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

      {/* Feed unificado (propios + amigos) */}
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
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  Tus entrenamientos y los de tus amigos — la papelera solo aparece en los tuyos
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-4">
            {isLoading && <div className="text-sm text-muted-foreground">Cargando actividad…</div>}
            {!isLoading && feed.length === 0 && (
              <div className="text-sm text-muted-foreground">Aún no hay actividad reciente.</div>
            )}

            {!isLoading &&
              feed.map((w) => {
                // Marcamos si la sesión es mía comparando ids numéricos
                const isMine = myUsuarioId != null && w.id_usuario === myUsuarioId;

                // Título: nombre de la rutina (preferido) o nota; si no, fallback
                const titulo =
                  (w.rutina_nombre && w.rutina_nombre.trim()) ||
                  (w.nota && w.nota.trim()) ||
                  (isMine ? "Entrenamiento" : `Entrenamiento de ${w.username}`);

                return (
                  <WorkoutCard
                    key={w.id_workout}
                    idSesion={w.id_workout}
                    titulo={titulo as string}
                    startedAt={w.fecha}
                    endedAt={w.fecha}
                    // Totales solo con sets "done" si vienen; si no, usa totales agregados
                    totalSets={(w as any).total_series_done ?? w.total_series ?? 0}
                    totalVolume={Math.round((((w as any).total_kg_done ?? w.total_kg ?? 0) as number) * 100) / 100}
                    username={w.username}
                    avatarUrl={w.url_avatar ?? undefined}
                    // Lista de ejercicios (solo los que tienen sets marcados done)
                    ejercicios={(w as any).ejercicios ?? []}
                    sensacionFinal={w.sensacion ?? undefined}
                    // 🔒 Acciones visuales:
                    //  - isMine=true  -> ver papelera y UI social (likes/comentarios) habilitada
                    //  - isMine=false -> NO ver papelera y UI social deshabilitada (solo visual si la card lo permite)
                    isMine={!!isMine}
                    readOnly={!isMine}
                  />
                );
              })}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
