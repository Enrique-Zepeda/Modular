import { useMemo } from "react";
import { useGetFinishedWorkoutsRichQuery } from "@/features/workouts/api/workoutsApi";
import { parseVolume } from "@/types/workouts";
import { Loader2 } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";

type Props = { limit?: number };

export function FinishedWorkoutsSection({ limit = 20 }: Props) {
  const { data, isLoading, isFetching, error } = useGetFinishedWorkoutsRichQuery({ limit });

  const workouts = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Cargando entrenamientos…
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">No se pudieron cargar los entrenamientos.</p>;
  }

  return (
    <section aria-label="Entrenamientos recientes" className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workouts.map((w) => (
          <WorkoutCard
            key={w.id_sesion}
            idSesion={w.id_sesion}
            titulo={w.titulo}
            endedAt={w.ended_at}
            startedAt={w.started_at}
            totalSets={w.total_sets}
            totalVolume={parseVolume(w.total_volume)}
            username={w.username ?? "Usuario"}
            avatarUrl={w.url_avatar ?? undefined}
            ejercicios={w.ejercicios as any}
          />
        ))}
      </div>

      {isFetching && <div className="mt-4 text-xs text-muted-foreground">Actualizando…</div>}
    </section>
  );
}
