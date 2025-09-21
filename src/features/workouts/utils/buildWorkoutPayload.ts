import type { WorkoutState } from "@/features/workouts/types";

export type NewWorkoutSessionPayload = {
  id_rutina: number;
  started_at: string;
  ended_at: string;
  duracion_seg: number;
  total_volumen: number;
  sensacion_global: string | null;
  notas: string | null;
  exercise_order?: { id_ejercicio: number; orden: number }[];
  sets: Array<{
    id_ejercicio: number;
    idx: number;
    kg: number;
    reps: number;
    rpe: string | null;
    done: boolean;
    done_at: string | null;
  }>;
};

export function buildWorkoutPayload(workout: WorkoutState): NewWorkoutSessionPayload {
  // 1) Orden final 1..N
  const exercise_order = (workout.exercises ?? [])
    .slice()
    .sort((a, b) => (a.orden ?? 999999) - (b.orden ?? 999999))
    .map((ex, i) => ({ id_ejercicio: ex.id_ejercicio, orden: i + 1 }));

  const orderMap = new Map(exercise_order.map((eo) => [eo.id_ejercicio, eo.orden]));

  // 2) Sets válidos
  const setsValidos = workout.exercises.flatMap(
    (ex) =>
      ex.sets
        .map((s) => {
          const kg = parseFloat(s.kg);
          const reps = parseInt(s.reps, 10);
          if (Number.isNaN(kg) || Number.isNaN(reps)) return null;
          return {
            id_ejercicio: ex.id_ejercicio,
            idx: s.idx,
            kg,
            reps,
            rpe: s.rpe || null,
            done: !!s.done,
            done_at: s.done ? s.doneAt ?? new Date().toISOString() : null,
          };
        })
        .filter(Boolean) as any[]
  );

  // 3) Orden defensivo sets: por ejercicio (orden) y luego idx
  setsValidos.sort((a, b) => {
    const ao = (orderMap.get(a.id_ejercicio) ?? 999999) - (orderMap.get(b.id_ejercicio) ?? 999999);
    return ao !== 0 ? ao : a.idx - b.idx;
  });

  // 4) Duración robusta
  const duracion_seg = Math.max(1, Math.round((Date.now() - new Date(workout.startedAt).getTime()) / 1000));

  const total_volumen = setsValidos.filter((s) => s.done).reduce((acc, s) => acc + s.kg * s.reps, 0);

  return {
    id_rutina: workout.id_rutina,
    started_at: workout.startedAt,
    ended_at: new Date().toISOString(),
    duracion_seg,
    total_volumen,
    sensacion_global: null,
    notas: null,
    exercise_order,
    sets: setsValidos,
  };
}
