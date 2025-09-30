import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/user";
import type { ProfileSummary, PublicLastWorkout, PublicLastWorkoutExercise } from "../types";

export type PublicProfile = Pick<
  UserProfile,
  | "id_usuario"
  | "auth_uid"
  | "username"
  | "nombre"
  | "correo"
  | "url_avatar"
  | "nivel_experiencia"
  | "objetivo"
  | "sexo"
>;

export const userProfileApi = createApi({
  reducerPath: "userProfileApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["MyProfile", "PublicProfile", "ProfileSummary", "ProfileLastWorkout"],
  endpoints: (builder) => ({
    getMyProfile: builder.query<PublicProfile, void>({
      async queryFn() {
        try {
          const { data: authData, error: authErr } = await supabase.auth.getUser();
          if (authErr) return { error: authErr as any };
          const u = authData?.user;
          if (!u) return { error: { status: 401, data: "No hay sesión" } as any };

          const { data, error } = await supabase
            .from("Usuarios")
            .select("id_usuario, auth_uid, username, nombre, correo, url_avatar, nivel_experiencia, objetivo, sexo")
            .eq("auth_uid", u.id)
            .single();

          if (error) return { error };
          return { data: data as PublicProfile };
        } catch (e: any) {
          return { error: { status: 500, data: e?.message ?? "Error de perfil" } as any };
        }
      },
      providesTags: ["MyProfile"],
    }),

    getProfileByUsername: builder.query<PublicProfile | null, { username: string }>({
      async queryFn({ username }) {
        try {
          const uname = username.replace(/^@+/, "");
          const { data, error } = await supabase
            .from("Usuarios")
            .select("id_usuario, auth_uid, username, nombre, correo, url_avatar, nivel_experiencia, objetivo, sexo")
            .ilike("username", uname)
            .maybeSingle();
          if (error) return { error };
          return { data: (data as PublicProfile) ?? null };
        } catch (e: any) {
          return { error: { status: 500, data: e?.message ?? "Error buscando usuario" } as any };
        }
      },
      providesTags: (_r, _e, a) => [{ type: "PublicProfile", id: a.username }],
    }),

    getProfileSummaryByUsername: builder.query<ProfileSummary | null, { username: string }>({
      async queryFn({ username }) {
        try {
          const uname = username.replace(/^@+/, "");
          const { data, error } = await supabase.rpc("get_profile_summary_v2", {
            target_username: uname,
          });
          if (error) return { error };
          const row = Array.isArray(data) ? (data[0] as ProfileSummary | undefined) : null;
          return { data: row ?? null };
        } catch (e: any) {
          return { error: { status: 500, data: e?.message ?? "Error obteniendo resumen" } as any };
        }
      },
      providesTags: (_r, _e, a) => [{ type: "ProfileSummary", id: a.username }],
    }),

    /** Último entrenamiento PÚBLICO (sets, volumen, duración, sensaciones) */
    getPublicLastWorkoutByUsername: builder.query<PublicLastWorkout | null, { username: string }>({
      async queryFn({ username }) {
        try {
          const uname = username.replace(/^@+/, "");
          const { data, error } = await supabase.rpc("get_last_workout_public_v2", {
            target_username: uname,
          });
          if (error) return { error };
          const row = Array.isArray(data) ? (data[0] as PublicLastWorkout | undefined) : null;
          return { data: row ?? null };
        } catch (e: any) {
          return { error: { status: 500, data: e?.message ?? "Error obteniendo último entrenamiento" } as any };
        }
      },
      providesTags: (_r, _e, a) => [{ type: "ProfileLastWorkout", id: a.username }],
    }),

    /** Ejercicios del último entrenamiento (público) */
    getPublicLastWorkoutExercisesByUsername: builder.query<PublicLastWorkoutExercise[], { username: string }>({
      async queryFn({ username }) {
        try {
          const uname = username.replace(/^@+/, "");
          const { data, error } = await supabase.rpc("get_last_workout_exercises_public_v1", {
            target_username: uname,
          });
          if (error) return { error };
          return { data: (data as PublicLastWorkoutExercise[]) ?? [] };
        } catch (e: any) {
          return { error: { status: 500, data: e?.message ?? "Error obteniendo ejercicios" } as any };
        }
      },
      providesTags: (_r, _e, a) => [{ type: "ProfileLastWorkout", id: a.username }],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetProfileByUsernameQuery,
  useGetProfileSummaryByUsernameQuery,
  useGetPublicLastWorkoutByUsernameQuery,
  useGetPublicLastWorkoutExercisesByUsernameQuery,
} = userProfileApi;
