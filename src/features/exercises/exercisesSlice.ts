import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";
import { ExerciseQueryParams, ExerciseListResponse } from "@/types/exercises";

export const exercisesApi = createApi({
  reducerPath: "exercisesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Exercises"],
  endpoints: (builder) => ({
    getExercises: builder.query<ExerciseListResponse, ExerciseQueryParams>({
      queryFn: async ({ grupo_muscular, dificultad, equipamento, search, from = 0, to = 19 }) => {
        console.log("Query params:", { grupo_muscular, dificultad, equipamento, search, from, to });

        let query = supabase.from("Ejercicios").select("*", { count: "exact" });

        // Apply muscle group filter
        if (grupo_muscular?.length) {
          query = query.in("grupo_muscular", grupo_muscular);
          console.log("Applied muscle group filter:", grupo_muscular);
        }

        // Apply difficulty filter
        if (dificultad && dificultad !== "all") {
          query = query.eq("dificultad", dificultad);
          console.log("Applied difficulty filter:", dificultad);
        }

        // Apply equipment filter
        if (equipamento && equipamento !== "all") {
          query = query.eq("equipamento", equipamento);
          console.log("Applied equipment filter:", equipamento);
        }

        // Apply search filter
        if (search && search.trim()) {
          query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%`);
          console.log("Applied search filter:", search);
        }

        const { data, error, count } = await query.range(from, to).order("nombre");

        if (error) {
          console.error("Supabase error:", error);
          return { error };
        }

        console.log("Query result:", { count, dataLength: data?.length });
        return { data: { data: data || [], error: null, count } };
      },
      providesTags: ["Exercises"],
    }),

    getMuscleGroups: builder.query<{ data: string[]; error: unknown }, void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("Ejercicios")
          .select("grupo_muscular")
          .not("grupo_muscular", "is", null);

        if (error) {
          console.error("Supabase error getting muscle groups:", error);
          return { error };
        }

        const uniqueGroups = [...new Set(data.map((item) => item.grupo_muscular).filter(Boolean))];
        console.log("Muscle groups found:", uniqueGroups);
        return { data: { data: uniqueGroups, error: null } };
      },
    }),

    getEquipmentTypes: builder.query<{ data: string[]; error: unknown }, void>({
      queryFn: async () => {
        const { data, error } = await supabase.from("Ejercicios").select("equipamento").not("equipamento", "is", null);

        if (error) {
          console.error("Supabase error getting equipment types:", error);
          return { error };
        }

        const uniqueEquipment = [...new Set(data.map((item) => item.equipamento).filter(Boolean))];
        console.log("Equipment types found:", uniqueEquipment);
        return { data: { data: uniqueEquipment, error: null } };
      },
    }),

    getDifficultyLevels: builder.query<{ data: string[]; error: unknown }, void>({
      queryFn: async () => {
        const { data, error } = await supabase.from("Ejercicios").select("dificultad").not("dificultad", "is", null);

        if (error) {
          console.error("Supabase error getting difficulty levels:", error);
          return { error };
        }

        const uniqueDifficulties = [...new Set(data.map((item) => item.dificultad).filter(Boolean))];
        console.log("Difficulty levels found:", uniqueDifficulties);
        return { data: { data: uniqueDifficulties, error: null } };
      },
    }),
  }),
});

export const { useGetExercisesQuery, useGetMuscleGroupsQuery, useGetEquipmentTypesQuery, useGetDifficultyLevelsQuery } =
  exercisesApi;
