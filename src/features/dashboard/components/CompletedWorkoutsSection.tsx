import { useMemo } from "react";

import { Loader2 } from "lucide-react";
import { useGetMyWorkoutsQuery } from "@/features/workout/api/workoutsApi";
import { WorkoutCard } from "@/features/workout/components/WorkoutCard";

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
  const { data, isLoading, isError } = useGetMyWorkoutsQuery();

  const grouped = useMemo(() => {
    const g = new Map<string, any[]>();
    for (const s of data ?? []) {
      const base = s.ended_at ?? s.started_at;
      if (!base) continue;
      const key = toLocalDayKey(base);
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(s);
    }
    // Convertir a array ordenado por fecha (más reciente primero)
    const entries = Array.from(g.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    return entries;
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

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Entrenamientos completados</h2>

      <div className="space-y-8">
        {grouped.map(([dayKey, sessions]) => (
          <div key={dayKey} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{formatDayHeader(dayKey)}</h3>
            <div className="grid gap-3">
              {sessions.map((s) => (
                <WorkoutCard key={s.id_sesion} session={s} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
