// FILE: src/features/workouts/utils/buildInitialWorkoutState.ts
import { type RutinaDetalle } from "@/features/routines/api/rutinasApi";
import { type WorkoutState, type WorkoutExercise, type WorkoutSet } from "../types";

export function buildInitialWorkoutState(data: RutinaDetalle): WorkoutState {
  const ejercicios = data.EjerciciosRutinas ?? [];
  const exercises: WorkoutExercise[] = ejercicios
    .slice()
    .sort((a: any, b: any) => (a.orden ?? 999999) - (b.orden ?? 999999) || a.id_ejercicio - b.id_ejercicio)
    .map((ex: any) => {
      const plantilla = (ex.sets ?? []).slice().sort((s1: any, s2: any) => (s1.idx ?? 0) - (s2.idx ?? 0));

      // ⬇️ Fallback cuando no existen sets en EjerciciosRutinaSets
      const nSeries = Number(ex.series ?? 0);
      const repsSugeridas = ex.repeticiones ?? null;
      const kgSugerido = ex.peso_sugerido ?? null;

      const sets: WorkoutSet[] =
        plantilla.length > 0
          ? plantilla.map((s: any) => ({
              idx: s.idx,
              kg: s.kg != null ? String(s.kg) : "",
              reps: s.reps != null ? String(s.reps) : "",
              rpe: "",
              done: false,
            }))
          : Array.from({ length: Math.max(1, nSeries || 1) }, (_, i) => ({
              idx: i + 1,
              kg: kgSugerido != null ? String(kgSugerido) : "",
              reps: repsSugeridas != null ? String(repsSugeridas) : "",
              rpe: "",
              done: false,
            }));

      return {
        id_ejercicio: ex.id_ejercicio,
        nombre: ex.Ejercicios?.nombre,
        imagen: ex.Ejercicios?.ejemplo ?? null,
        orden: ex.orden ?? 0,
        sets,
      };
    });

  return {
    id_rutina: data.id_rutina,
    nombre: data.nombre,
    descripcion: data.descripcion,
    startedAt: new Date().toISOString(),
    exercises,
  };
}
