import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, Dumbbell } from "lucide-react";
import type { WorkoutSessionRow } from "@/features/workouts/api/workoutsApi";

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  // Formato corto local (ES-MX)
  const fDate = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(d);
  const fTime = new Intl.DateTimeFormat("es-MX", { timeStyle: "short" }).format(d);
  return `${fDate} · ${fTime}`;
}

function formatDuration(sec?: number | null) {
  if (!sec || sec <= 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

type Props = {
  session: WorkoutSessionRow;
};

export function WorkoutCard({ session }: Props) {
  const dateLabel = formatDateTime(session.ended_at ?? session.started_at);
  const routineName = session.Rutinas?.nombre ?? "Rutina";
  const totalVol = session.total_volumen ?? 0;
  const dur = formatDuration(session.duracion_seg ?? 0);

  // Agrupar sets "hechos" por ejercicio
  const sets = (session.EntrenamientoSets ?? []).filter((s) => s.done);
  const byExercise = new Map<number, { name: string; items: Array<{ kg: number; reps: number }> }>();
  for (const s of sets) {
    const key = s.id_ejercicio;
    const name = s.Ejercicios?.nombre ?? `Ejercicio #${s.id_ejercicio}`;
    if (!byExercise.has(key)) byExercise.set(key, { name, items: [] });
    byExercise.get(key)!.items.push({ kg: s.kg, reps: s.reps });
  }

  const totalSets = (session.EntrenamientoSets ?? []).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{routineName}</CardTitle>
          <div className="text-sm text-muted-foreground">{dateLabel}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Resumen */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span>
              Volumen: <span className="font-medium">{totalVol.toLocaleString()} kg</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Tiempo: <span className="font-medium">{dur}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Sets: <span className="font-medium">{totalSets}</span>
            </span>
          </div>
        </div>

        <Separator />

        {/* Detalle por ejercicio: solo sets con "Hecho" */}
        <div className="space-y-2">
          {Array.from(byExercise.values()).map(({ name, items }) => {
            const line = items.map((it) => `${Number(it.kg)}×${it.reps}`).join(", ");
            return (
              <div key={name} className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <div className="text-sm text-muted-foreground">{line}</div>
              </div>
            );
          })}

          {byExercise.size === 0 && (
            <div className="text-sm text-muted-foreground">No hay sets marcados como hechos en esta sesión.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
