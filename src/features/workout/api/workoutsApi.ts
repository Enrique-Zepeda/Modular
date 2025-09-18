import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";

export type WorkoutSetInput = {
  id_ejercicio: number;
  idx: number;
  kg: number;
  reps: number;
  rpe?: string | null; // 'Fácil' | 'Moderado' | ...
  done?: boolean;
  done_at?: string | null; // ISO
};

export type CreateWorkoutInput = {
  id_rutina: number;
  started_at: string; // ISO
  ended_at: string; // ISO
  duracion_seg: number;
  total_volumen: number;
  sensacion_global?: string | null;
  notas?: string | null;
  sets: WorkoutSetInput[];
};

export type WorkoutSetRow = {
  id_ejercicio: number;
  idx: number;
  kg: number;
  reps: number;
  rpe?: string | null;
  done: boolean;
  Ejercicios?: { id: number; nombre: string | null } | null;
};

export type WorkoutSessionRow = {
  id_sesion: number;
  id_rutina: number | null;
  started_at: string;
  ended_at: string | null;
  duracion_seg: number | null;
  total_volumen: number | null;
  sensacion_global?: string | null;
  Rutinas?: { id_rutina: number; nombre: string | null } | null;
  EntrenamientoSets?: WorkoutSetRow[];
};

export type CreateWorkoutResult = { id_sesion: number };

export const workoutsApi = createApi({
  reducerPath: "workoutsApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    createWorkoutSession: builder.mutation<CreateWorkoutResult, CreateWorkoutInput>({
      async queryFn(payload) {
        // RPC transaccional
        const { data, error } = await supabase.rpc("create_workout_session", {
          p_id_rutina: payload.id_rutina,
          p_started_at: payload.started_at,
          p_ended_at: payload.ended_at,
          p_duracion_seg: payload.duracion_seg,
          p_total_volumen: payload.total_volumen,
          p_sensacion_global: payload.sensacion_global ?? null,
          p_notas: payload.notas ?? null,
          p_sets: payload.sets as any,
        });
        if (error) return { error };

        // RPC devuelve tabla (id_sesion); supabase-js la mapea a array o single
        const id_sesion =
          typeof data === "number" ? data : Array.isArray(data) ? data[0]?.id_sesion : (data as any)?.id_sesion;

        if (!id_sesion) {
          return { error: { status: 500, data: new Error("La RPC no devolvió id_sesion") } as any };
        }

        return { data: { id_sesion } };
      },
    }),
    getMyWorkouts: builder.query<WorkoutSessionRow[], void>({
      async queryFn() {
        const { data, error } = await supabase
          .from("Entrenamientos")
          .select(
            `
            id_sesion,
            id_rutina,
            started_at,
            ended_at,
            duracion_seg,
            total_volumen,
            sensacion_global,
            Rutinas ( id_rutina, nombre ),
            EntrenamientoSets (
              id_ejercicio, idx, kg, reps, rpe, done,
              Ejercicios ( id, nombre )
            )
          `
          )
          .not("ended_at", "is", null)
          .order("started_at", { ascending: false }); // más reciente primero

        if (error) return { error };
        return { data: (data ?? []) as WorkoutSessionRow[] };
      },
      // Si luego agregas invalidations, puedes usar tagTypes para refrescar
    }),
  }),
});

export const {
  useCreateWorkoutSessionMutation,
  useGetMyWorkoutsQuery, // 👈 nuevo hook
} = workoutsApi;
