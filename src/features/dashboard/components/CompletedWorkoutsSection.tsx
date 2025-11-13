import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useListUserWorkoutsQuery } from "@/features/workouts/api/workoutsApi";
import { WorkoutCard } from "@/features/workouts/components";
import type { FinishedWorkoutRich } from "@/types/workouts";

function toLocalDayKey(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // clave estable para agrupar
}

function formatDayHeader(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d);
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "full" }).format(date);
}

export function CompletedWorkoutsSection() {
  const { data, isLoading, isError } = useListUserWorkoutsQuery();
  const mySexo = me?.sexo ?? null;
  const grouped = useMemo(() => {
    const g = new Map<string, FinishedWorkoutRich[]>();
    for (const s of (data ?? []) as FinishedWorkoutRich[]) {
      const base = s.ended_at ?? s.started_at;
      if (!base) continue;
      const key = toLocalDayKey(base);
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(s);
    }
    // más recientes primero
    return Array.from(g.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando entrenamientos…
      </div>
    );
  }

  if (isError) {
    return <div className="text-sm text-destructive">No se pudo cargar tus entrenamientos.</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">Aún no has completado entrenamientos.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando entrenamientos…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive" role="alert">
        No se pudo cargar tus entrenamientos.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">Aún no has completado entrenamientos.</div>;
  }

  return (
    <section className="space-y-5 sm:space-y-6">
      <h2 className="text-base sm:text-lg font-semibold">Entrenamientos completados</h2>

      <div className="space-y-6 sm:space-y-8">
        {grouped.map(([dayKey, sessions]) => (
          <div key={dayKey} className="space-y-2.5 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{formatDayHeader(dayKey)}</h3>

            {/* Grid responsive: 1 col móvil, 2 en sm, 3 en xl. min-w-0 evita overflow horizontal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 min-w-0">
              {sessions.map((s) => (
                <div key={s.id_sesion} className="min-w-0">
                  <WorkoutCard
                    key={s.id_sesion}
                    idSesion={s.id_sesion}
                    titulo={s.titulo ?? s.Rutinas?.nombre ?? "Entrenamiento"}
                    startedAt={s.started_at}
                    endedAt={s.ended_at ?? s.started_at}
                    totalSets={(s as any).total_sets ?? 0}
                    totalVolume={Number((s as any).total_volume ?? 0)}
                    username={"Tú"}
                    avatarUrl={undefined}
                    sexo={mySexo}
                    ejercicios={(s as any).ejercicios ?? []}
                    sensacionFinal={s.sensacion_final ?? (s as any).sensacion_global ?? null}
                    isMine={true}
                    readOnly={false}
                    sexo={mySexo}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
