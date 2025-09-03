// src/features/exercises/exercisesSlice.ts
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";

export interface Exercise {
  id: number;
  nombre: string | null;
  grupo_muscular: string | null;
  descripcion: string | null;
  equipamento: string | null;
  dificultad: string | null;
  musculos_involucrados: string | null;
  ejemplo: string | null; // url/imagen
}

type GetExercisesArgs = {
  search?: string;
  grupo_muscular?: string;
  dificultad?: string;
  equipamento?: string;
  limit?: number;
  offset?: number;
};

type GetExercisesResp = { data: Exercise[]; count: number };

function mapPgError(err: PostgrestError | null) {
  if (!err) return undefined;
  return { status: err.code ?? 500, data: { message: err.message } as any };
}

export const exercisesApi = createApi({
  reducerPath: "exercisesApi",
  baseQuery: fakeBaseQuery(), // usamos queryFn con Supabase
  endpoints: (builder) => ({
    // Lista de ejercicios con filtros + paginación
    getExercises: builder.query<GetExercisesResp, GetExercisesArgs>({
      async queryFn(args) {
        const { search, grupo_muscular, dificultad, equipamento, limit = 12, offset = 0 } = args ?? {};

        let query = supabase
          .from("Ejercicios")
          .select("id,nombre,grupo_muscular,descripcion,equipamento,dificultad,musculos_involucrados,ejemplo", {
            count: "exact",
          });

        // filtros
        if (grupo_muscular) {
          query = query.eq("grupo_muscular", grupo_muscular);
        }
        if (dificultad) {
          query = query.eq("dificultad", dificultad);
        }
        if (equipamento) {
          query = query.eq("equipamento", equipamento);
        }
        if (search && search.trim() !== "") {
          // ilike por nombre o descripción
          const s = `%${search.trim()}%`;
          query = query.or(`nombre.ilike.${s},descripcion.ilike.${s}`);
        }

        // paginación
        if (limit != null && offset != null) {
          query = query.range(offset, offset + limit - 1);
        }

        const { data, error, count } = await query;

        if (error) return { error: mapPgError(error) as any };
        return { data: { data: (data as Exercise[]) ?? [], count: count ?? 0 } };
      },
      // Si quieres reusar cache por args
      serializeQueryArgs: ({ queryArgs }) => JSON.stringify(queryArgs ?? {}),
      // Opcional: merge si usas useGetExercisesQuery incremental (no necesario para lazy)
      // keepUnusedDataFor: 30,
    }),

    // Grupos musculares (únicos)
    getMuscleGroups: builder.query<{ data: string[] }, void>({
      async queryFn() {
        const { data, error } = await supabase
          .from("Ejercicios")
          .select("grupo_muscular")
          .not("grupo_muscular", "is", null);

        if (error) return { error: mapPgError(error) as any };

        const uniq = Array.from(new Set((data ?? []).map((r: any) => String(r.grupo_muscular)))).sort((a, b) =>
          a.localeCompare(b, "es")
        );
        return { data: { data: uniq } };
      },
    }),

    // Tipos de equipamiento (únicos)
    getEquipmentTypes: builder.query<{ data: string[] }, void>({
      async queryFn() {
        const { data, error } = await supabase.from("Ejercicios").select("equipamento").not("equipamento", "is", null);

        if (error) return { error: mapPgError(error) as any };

        const uniq = Array.from(new Set((data ?? []).map((r: any) => String(r.equipamento)))).sort((a, b) =>
          a.localeCompare(b, "es")
        );
        return { data: { data: uniq } };
      },
    }),

    // Dificultades (únicas, normalizadas)
    getDifficultyLevels: builder.query<{ data: string[] }, void>({
      async queryFn() {
        const { data, error } = await supabase.from("Ejercicios").select("dificultad").not("dificultad", "is", null);

        if (error) return { error: mapPgError(error) as any };

        const allowed = new Set(["principiante", "intermedio", "avanzado"]);
        const uniq = Array.from(
          new Set((data ?? []).map((r: any) => String(r.dificultad ?? "").toLowerCase()).filter((d) => allowed.has(d)))
        ).sort((a, b) => a.localeCompare(b, "es"));
        return { data: { data: uniq } };
      },
    }),
  }),
});

// ⚠️ Exporta TODOS los hooks, incluyendo el LAZY:
export const {
  useGetExercisesQuery,
  useLazyGetExercisesQuery,
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
  useGetDifficultyLevelsQuery,
} = exercisesApi;
