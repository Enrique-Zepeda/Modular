export type WorkoutSet = { idx: number; kg: string; reps: string; rpe: string; done: boolean; doneAt?: string };

export type WorkoutExercise = {
  id_ejercicio: number;
  nombre?: string;
  imagen?: string | null;
  orden: number;
  sets: WorkoutSet[];
};

export type WorkoutState = {
  id_rutina: number;
  nombre?: string | null;
  descripcion?: string | null;
  startedAt: string;
  exercises: WorkoutExercise[];
};

export const RPE_OPTIONS = ["Fácil", "Moderado", "Difícil", "Muy difícil", "Al fallo"] as const;
