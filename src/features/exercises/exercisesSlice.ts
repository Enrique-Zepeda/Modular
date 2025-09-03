import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";

type GetExercisesArgs = {
  search?: string;
  grupo_muscular?: string | string[];
  dificultad?: string; // "principiante" | "intermedio" | "avanzado"
  equipamento?: string;
  limit?: number;
  offset?: number;
};

type ExercisesResp<T> = { data: T[]; count: number };

export const exercisesApi = createApi({
  reducerPath: "exercisesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }), // no se usa, trabajamos con queryFn
  endpoints: (builder) => ({
    getExercises: builder.query<ExercisesResp<any>, GetExercisesArgs>({
      async queryFn(args) {
        try {
          const {
            search,
            grupo_muscular,
            dificuldade, // <- por si te llega en PT, lo normalizamos abajo
            dificultad,
            equipamento,
            limit = 12,
            offset = 0,
          } = args;

          const diff = (dificultad ?? (dificuldade as any) ?? "").toString().toLowerCase().trim() || undefined;
          const equip = equipamento?.toString().toLowerCase().trim();

          let q = supabase.from("Ejercicios").select("*", { count: "exact" });

          // --- SEARCH (nombre O descripcion) - AND con el resto de filtros
          if (search && search.trim() !== "") {
            const s = search.trim().toLowerCase();
            // or() agrupa internamente con OR, pero toda la or() queda en AND con el resto
            q = q.or(`nombre.ilike.%${s}%,descripcion.ilike.%${s}%`);
          }

          // --- GRUPO MUSCULAR (uno o varios) - AND
          if (Array.isArray(grupo_muscular) && grupo_muscular.length > 0) {
            q = q.in("grupo_muscular", grupo_muscular);
          } else if (typeof grupo_muscular === "string" && grupo_muscular !== "" && grupo_muscular !== "all") {
            q = q.eq("grupo_muscular", grupo_muscular);
          }

          // --- DIFICULTAD (case-insensitive) - AND
          if (diff && diff !== "all") {
            // usa ilike para no depender de mayúsculas en DB
            q = q.ilike("dificultad", diff);
          }

          // --- EQUIPAMENTO (OJO: en la tabla es `equipamento`) - AND
          if (equip && equip !== "all") {
            q = q.ilike("equipamento", equip);
          }

          // --- Orden + paginación
          const from = offset;
          const to = offset + limit - 1;
          q = q.order("id", { ascending: true }).range(from, to);

          const { data, error, count } = await q;

          if (error) return { error: { status: 500, data: error.message } };

          return { data: { data: data ?? [], count: count ?? 0 } };
        } catch (e: any) {
          return { error: { status: 500, data: e?.message ?? "Unknown error" } };
        }
      },
    }),

    // si ya tienes estos endpoints, deja los tuyos
    getMuscleGroups: builder.query<{ data: string[] }, void>({
      async queryFn() {
        const { data, error } = await supabase
          .from("Ejercicios")
          .select("grupo_muscular")
          .not("grupo_muscular", "is", null);

        if (error) return { error: { status: 500, data: error.message } };

        const list = Array.from(new Set((data ?? []).map((r: any) => r.grupo_muscular))).sort();
        return { data: { data: list } };
      },
    }),

    getEquipmentTypes: builder.query<{ data: string[] }, void>({
      async queryFn() {
        const { data, error } = await supabase.from("Ejercicios").select("equipamento").not("equipamento", "is", null);

        if (error) return { error: { status: 500, data: error.message } };

        const list = Array.from(new Set((data ?? []).map((r: any) => (r.equipamento ?? "").toString()))).sort();
        return { data: { data: list } };
      },
    }),

    getDifficultyLevels: builder.query<{ data: string[] }, void>({
      async queryFn() {
        const { data, error } = await supabase.from("Ejercicios").select("dificultad").not("dificultad", "is", null);

        if (error) return { error: { status: 500, data: error.message } };

        const norm = Array.from(
          new Set((data ?? []).map((r: any) => (r.dificultad ?? "").toString().toLowerCase()))
        ).filter((d) => ["principiante", "intermedio", "avanzado"].includes(d));
        return { data: { data: norm } };
      },
    }),
  }),
});

export const {
  useLazyGetExercisesQuery,
  useGetExercisesQuery,
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
  useGetDifficultyLevelsQuery,
} = exercisesApi;
