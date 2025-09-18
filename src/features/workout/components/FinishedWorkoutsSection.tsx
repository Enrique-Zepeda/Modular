import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";
import { useDeleteWorkoutSessionMutation, useListUserWorkoutsQuery } from "@/features/workout/api/workoutsApi";

/** Agrupa por fecha (YYYY-MM-DD) usando ended_at; si no hay, usa started_at */
function groupByDay(items: ReturnType<typeof useListUserWorkoutsQuery>["data"] | undefined) {
  const groups = new Map<string, typeof items>();
  (items ?? []).forEach((w) => {
    const keySrc = w.ended_at ?? w.started_at;
    const d = new Date(keySrc);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
      2,
      "0"
    )}`;
    const arr = groups.get(key) ?? [];
    arr.push(w);
    groups.set(key, arr);
  });
  // ordenar keys recientes -> antiguas
  const ordered = Array.from(groups.entries()).sort(([a], [b]) => (a > b ? -1 : 1));
  return ordered;
}

export function FinishedWorkoutsSection() {
  const { data, isLoading } = useListUserWorkoutsQuery();
  const [deleteWorkout] = useDeleteWorkoutSessionMutation();

  const grouped = useMemo(() => groupByDay(data), [data]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando entrenamientos...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">Aún no hay entrenamientos finalizados.</div>;
  }

  return (
    <div className="space-y-6">
      {grouped.map(([day, items]) => {
        const human = new Date(items![0]!.ended_at ?? items![0]!.started_at).toLocaleDateString();
        return (
          <section key={day} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{human}</h3>
            <div className="grid gap-3">
              {items!.map((w) => (
                <WorkoutCard
                  key={w.id_sesion}
                  workout={w}
                  onDelete={async (id) => {
                    await deleteWorkout({ id_sesion: id }).unwrap();
                  }}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
