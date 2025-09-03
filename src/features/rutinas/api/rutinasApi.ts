// src/features/rutinas/api/rutinasApi.ts
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";

/** Tipos básicos */
export type Rutina = {
  id_rutina: number;
  nombre: string | null;
  descripcion: string | null;
  nivel_recomendado: "principiante" | "intermedio" | "avanzado" | null;
  objetivo: "fuerza" | "hipertrofia" | "resistencia" | null;
  duracion_estimada: number | null;
  owner_uid?: string | null;
};

export type Ejercicio = {
  id: number;
  nombre: string | null;
  grupo_muscular: string | null;
  descripcion: string | null;
  equipamento: string | null;
  dificultad: string | null;
  musculos_involucrados: string | null;
  ejemplo: string | null;
};

export type EjercicioRutina = {
  id_rutina: number;
  id_ejercicio: number;
  series: number | null;
  repeticiones: number | null;
  peso_sugerido: number | null;
  Ejercicios?: Ejercicio | null;
};

export type RutinaDetalle = Rutina & {
  EjerciciosRutinas: EjercicioRutina[];
};

export type UpsertRutinaInput = {
  nombre?: string | null;
  descripcion?: string | null;
  nivel_recomendado?: "principiante" | "intermedio" | "avanzado" | null;
  objetivo?: "fuerza" | "hipertrofia" | "resistencia" | null;
  duracion_estimada?: number | null;
};

export const rutinasApi = createApi({
  reducerPath: "rutinasApi",
  // ⬅️ Importante: usamos fakeBaseQuery porque las llamadas las hace el SDK de Supabase
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Rutinas", "RutinaDetalle", "EjerciciosRutinas", "Ejercicios"],
  endpoints: (builder) => ({
    /** Lista de rutinas del usuario autenticado (cache key = ownerUid) */
    getRutinas: builder.query<Rutina[], string | undefined>({
      async queryFn(ownerUid) {
        if (!ownerUid) return { data: [] };
        try {
          const { data, error } = await supabase
            .from("Rutinas")
            .select("id_rutina, nombre, descripcion, nivel_recomendado, objetivo, duracion_estimada, owner_uid")
            .eq("owner_uid", ownerUid)
            .order("id_rutina", { ascending: false });

          if (error) throw error;
          return { data: (data ?? []) as Rutina[] };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (_res, _err, uid) => [{ type: "Rutinas", id: uid ?? "LIST" }],
    }),

    /** Listado de ejercicios (tabla pública) */
    getEjercicios: builder.query<
      Ejercicio[],
      { search?: string; grupo_muscular?: string; dificultad?: string; limit?: number; offset?: number } | void
    >({
      async queryFn(args) {
        const params = args ?? {};
        const { search, grupo_muscular, dificultad, limit, offset } = params;

        let query = supabase
          .from("Ejercicios")
          .select("id, nombre, grupo_muscular, descripcion, equipamento, dificultad, musculos_involucrados, ejemplo")
          .order("id", { ascending: true });

        if (search && search.trim().length > 0) {
          query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%`);
        }
        if (grupo_muscular && grupo_muscular !== "all") {
          query = query.eq("grupo_muscular", grupo_muscular);
        }
        if (dificultad && dificultad !== "all") {
          query = query.eq("dificultad", dificultad);
        }

        if (typeof limit === "number") query = query.limit(limit);
        if (typeof offset === "number") query = query.range(offset, offset + (limit ?? 50) - 1);

        const { data, error } = await query;
        if (error) return { error };
        return { data: (data ?? []) as Ejercicio[] };
      },
      providesTags: [{ type: "Ejercicios", id: "LIST" }],
    }),

    /** Detalle de rutina + ejercicios (todo bajo RLS) */
    getRutinaById: builder.query<RutinaDetalle | null, number>({
      async queryFn(id_rutina) {
        const { data, error } = await supabase
          .from("Rutinas")
          .select(
            `
            id_rutina, nombre, descripcion, nivel_recomendado, objetivo, duracion_estimada, owner_uid,
            EjerciciosRutinas (
              id_rutina, id_ejercicio, series, repeticiones, peso_sugerido,
              Ejercicios ( id, nombre, grupo_muscular, descripcion, equipamento, dificultad, musculos_involucrados, ejemplo )
            )
          `
          )
          .eq("id_rutina", id_rutina)
          .single();
        if (error) return { error };
        return { data: data as unknown as RutinaDetalle };
      },
      providesTags: (_r, _e, id) => [{ type: "RutinaDetalle", id }],
    }),

    /** Crear rutina (el trigger/DEFAULT pone owner_uid = auth.uid()) */
    createRutina: builder.mutation<Rutina, UpsertRutinaInput>({
      async queryFn(rutinaData) {
        try {
          const { data, error } = await supabase
            .from("Rutinas")
            .insert([rutinaData])
            .select("id_rutina, nombre, descripcion, nivel_recomendado, objetivo, duracion_estimada, owner_uid")
            .single();

          if (error) throw error;
          return { data: data as Rutina };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: [{ type: "Rutinas", id: "LIST" }],
    }),

    /** Añadir ejercicio a la rutina (sólo si eres dueño por RLS) */
    addEjercicioToRutina: builder.mutation<
      EjercicioRutina,
      { id_rutina: number; id_ejercicio: number; series?: number; repeticiones?: number; peso_sugerido?: number }
    >({
      async queryFn({ id_rutina, id_ejercicio, series = null, repeticiones = null, peso_sugerido = null }) {
        const { data, error } = await supabase
          .from("EjerciciosRutinas")
          .insert([{ id_rutina, id_ejercicio, series, repeticiones, peso_sugerido }])
          .select(
            `
            id_rutina, id_ejercicio, series, repeticiones, peso_sugerido,
            Ejercicios ( id, nombre, grupo_muscular, dificultad, ejemplo )
          `
          )
          .single();
        if (error) return { error };
        return { data: data as unknown as EjercicioRutina };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: "RutinaDetalle", id: arg.id_rutina }],
    }),

    /** Quitar ejercicio de la rutina (sólo si eres dueño por RLS) */
    removeEjercicioFromRutina: builder.mutation<{ success: true }, { id_rutina: number; id_ejercicio: number }>({
      async queryFn({ id_rutina, id_ejercicio }) {
        const { error } = await supabase
          .from("EjerciciosRutinas")
          .delete()
          .eq("id_rutina", id_rutina)
          .eq("id_ejercicio", id_ejercicio);
        if (error) return { error };
        return { data: { success: true } };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: "RutinaDetalle", id: arg.id_rutina }],
    }),

    /** Eliminar rutina (confía en RLS + cascadas si las tienes) */
    deleteRutina: builder.mutation<{ success: true }, { id_rutina: number }>({
      async queryFn({ id_rutina }) {
        const { error } = await supabase.from("Rutinas").delete().eq("id_rutina", id_rutina);
        if (error) return { error };
        return { data: { success: true } };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "Rutinas", id: "LIST" },
        { type: "RutinaDetalle", id: arg.id_rutina },
      ],
    }),
  }),
});

// Hooks principales
export const {
  useGetRutinasQuery,
  useGetRutinaByIdQuery,
  useCreateRutinaMutation,
  useAddEjercicioToRutinaMutation,
  useRemoveEjercicioFromRutinaMutation,
  useDeleteRutinaMutation,
  useGetEjerciciosQuery,
} = rutinasApi;

// Aliases (si los usabas en español)
export const useCrearRutinaMutation = useCreateRutinaMutation;
export const useEliminarRutinaMutation = useDeleteRutinaMutation;
export const useObtenerEjerciciosQuery = useGetEjerciciosQuery;
