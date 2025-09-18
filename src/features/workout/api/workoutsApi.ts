import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";
import { dashboardApi } from "@/features/dashboard/api/dashboardApi"; // 👈 importar para invalidar KPIs

/** ===== Tipos ===== **/
export type WorkoutSetInput = {
  id_ejercicio: number;
  idx: number;
  kg: number;
  reps: number;
  rpe?: string | null;
  done?: boolean;
  done_at?: string | null;
};

export type CreateWorkoutInput = {
  id_rutina: number;
  started_at: string;
  ended_at: string;
  duracion_seg: number;
  total_volumen: number;
  sensacion_global?: string | null;
  notas?: string | null;
  sets: WorkoutSetInput[];
};

export type CreateWorkoutResult = { id_sesion: number };

export type WorkoutListItem = {
  id_sesion: number;
  started_at: string;
  ended_at: string | null;
  duracion_seg: number | null;
  total_volumen: number | null;
  sensacion_global: string | null;
  notas: string | null;
  Rutinas?: { id_rutina: number; nombre: string | null } | null;
  sets?: Array<{
    id_ejercicio: number;
    idx: number;
    kg: number;
    reps: number;
    rpe: string | null;
    done: boolean;
    Ejercicios?: { id: number; nombre: string | null; ejemplo: string | null } | null;
  }>;
};

export const workoutsApi = createApi({
  reducerPath: "workoutsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Workouts"],
  endpoints: (builder) => ({
    createWorkoutSession: builder.mutation<CreateWorkoutResult, CreateWorkoutInput>({
      async queryFn(payload) {
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
        const id_sesion = Array.isArray(data) ? data[0]?.id_sesion : (data as any)?.id_sesion;
        return { data: { id_sesion } };
      },
      invalidatesTags: [{ type: "Workouts", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // 👇 refrescar KPIs del dashboard
          dispatch(dashboardApi.util.invalidateTags([{ type: "Kpis", id: "MONTH" }]));
        }
      },
    }),

    listUserWorkouts: builder.query<WorkoutListItem[], void>({
      async queryFn() {
        const { data, error } = await supabase
          .from("Entrenamientos")
          .select(
            `
            id_sesion, started_at, ended_at, duracion_seg, total_volumen, sensacion_global, notas,
            Rutinas: id_rutina ( id_rutina, nombre ),
            sets: EntrenamientoSets (
              id_ejercicio, idx, kg, reps, rpe, done,
              Ejercicios ( id, nombre, ejemplo )
            )
          `
          )
          .not("ended_at", "is", null)
          .order("ended_at", { ascending: false });

        if (error) return { error };
        return { data: (data ?? []) as WorkoutListItem[] };
      },
      providesTags: [{ type: "Workouts", id: "LIST" }],
    }),

    deleteWorkoutSession: builder.mutation<{ success: true }, { id_sesion: number }>({
      async queryFn({ id_sesion }) {
        const rpc = await supabase.rpc("delete_workout_session", { p_id_sesion: id_sesion });
        if (!rpc.error) return { data: { success: true } };

        const { error: sErr } = await supabase.from("EntrenamientoSets").delete().eq("id_sesion", id_sesion);
        if (sErr) return { error: sErr };
        const { error: eErr } = await supabase.from("Entrenamientos").delete().eq("id_sesion", id_sesion);
        if (eErr) return { error: eErr };

        return { data: { success: true } };
      },
      invalidatesTags: [{ type: "Workouts", id: "LIST" }],
      async onQueryStarted({ id_sesion }, { dispatch, queryFulfilled }) {
        // Optimista: quitar de la lista
        const patch = dispatch(
          workoutsApi.util.updateQueryData("listUserWorkouts", undefined, (draft) => {
            const i = draft.findIndex((w) => w.id_sesion === id_sesion);
            if (i >= 0) draft.splice(i, 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        } finally {
          // 👇 refrescar KPIs del dashboard
          dispatch(dashboardApi.util.invalidateTags([{ type: "Kpis", id: "MONTH" }]));
        }
      },
    }),
  }),
});

export const { useCreateWorkoutSessionMutation, useListUserWorkoutsQuery, useDeleteWorkoutSessionMutation } =
  workoutsApi;
