import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { dashboardApi } from "@/features/dashboard/api/dashboardApi";
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
  ejercicios_count?: number;
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

export type SetEntry = {
  idx: number; // 1..N
  kg: number | null;
  reps: number | null;
};

export type EjercicioRutina = {
  id_rutina: number;
  id_ejercicio: number;
  series: number | null;
  repeticiones: number | null; // legado / sugerencia general
  peso_sugerido: number | null; // legado / sugerencia general
  orden?: number | null; // posición del ejercicio en la rutina
  Ejercicios?: Ejercicio | null;
  sets?: SetEntry[]; // 👈 NUEVO
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

// --------------------------------------
// Helpers
// --------------------------------------
const SELECT_RUTINA_FIELDS = `
  id_rutina, nombre, descripcion, nivel_recomendado, objetivo, duracion_estimada, owner_uid
` as const;

const sortByOrdenThenId = (
  a: Pick<EjercicioRutina, "orden" | "id_ejercicio">,
  b: Pick<EjercicioRutina, "orden" | "id_ejercicio">
) => {
  const ao = (a.orden ?? 999_999) - (b.orden ?? 999_999);
  return ao !== 0 ? ao : a.id_ejercicio - b.id_ejercicio;
};

const sortSets = (sets?: SetEntry[]) => (sets ?? []).slice().sort((a, b) => a.idx - b.idx);

export const rutinasApi = createApi({
  reducerPath: "rutinasApi",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 60, // reduce churn al navegar
  refetchOnFocus: false,
  refetchOnReconnect: false,
  tagTypes: ["Rutinas", "RutinaDetalle", "Ejercicios", "Programas"],
  endpoints: (builder) => ({
    // ✅ INICIO DEL BLOQUE CORREGIDO
    // Reemplaza el endpoint COMPLETO con este bloque en rutinasApi.ts

    // Reemplaza el endpoint COMPLETO con este bloque final en rutinasApi.ts

    getProgramByName: builder.query<
      {
        nombre: string;
        descripcion: string | null;
        ProgramasRutinas: {
          Rutinas: { nombre: string; descripcion: string | null };
        }[];
      } | null,
      string
    >({
      async queryFn(programName) {
        try {
          // CAMBIO: En lugar de .from().select(), usamos .rpc()
          const { data, error } = await supabase.rpc("get_program_details", {
            p_nombre: programName, // Pasamos el argumento a la función SQL
          });

          if (error) return { error };
          // El resultado de la función viene directamente en la propiedad 'data'
          return { data: (data as any) ?? null };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (_r, _e, name) => [{ type: "Programas", id: name }],
    }),
    // ✅ FIN DEL BLOQUE CORREGIDO
    /** Lista de rutinas del usuario autenticado (cache key = ownerUid) */
    getRutinas: builder.query<Rutina[], string | undefined>({
      async queryFn(ownerUid) {
        if (!ownerUid) return { data: [] };
        try {
          const { data, error } = await supabase
            .from("Rutinas")
            .select(
              `
              id_rutina,
              nombre,
              descripcion,
              nivel_recomendado,
              objetivo,
              duracion_estimada,
              owner_uid,
              ejercicios_count:EjerciciosRutinas(count)
            `
            )
            .eq("owner_uid", ownerUid)
            .order("id_rutina", { ascending: false });

          if (error) throw error;

          const rutinasWithCount = (data ?? []).map((rutina: any) => ({
            ...rutina,
            ejercicios_count: rutina.ejercicios_count?.[0]?.count || 0,
          }));

          return {
            data: rutinasWithCount as (Rutina & { ejercicios_count: number })[],
          };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (_res, _err, uid) => [
        { type: "Rutinas", id: "LIST" },
        { type: "Rutinas", id: uid ?? "ANON" },
      ],
    }),

    /** Listado de ejercicios (tabla pública) */
    getEjercicios: builder.query<
      Ejercicio[],
      {
        search?: string;
        grupo_muscular?: string;
        dificultad?: string;
        limit?: number;
        offset?: number;
      } | void
    >({
      async queryFn(args) {
        const params = args ?? {};
        const { search, grupo_muscular, dificultad, limit, offset } = params;

        let query = supabase
          .from("Ejercicios")
          .select(
            "id, nombre, grupo_muscular, descripcion, equipamento, dificultad, musculos_involucrados, ejemplo"
          )
          .order("id", { ascending: true });

        if (search && search.trim().length > 0) {
          query = query.or(
            `nombre.ilike.%${search}%,descripcion.ilike.%${search}%`
          );
        }
        if (grupo_muscular && grupo_muscular !== "all") {
          query = query.eq("grupo_muscular", grupo_muscular);
        }
        if (dificultad && dificultad !== "all") {
          query = query.eq("dificultad", dificultad);
        }

        // Paginación: usar sólo range para evitar conflictos con limit
        const from = typeof offset === "number" ? offset : 0;
        const size = typeof limit === "number" ? limit : 50;
        query = query.range(from, from + size - 1);

        const { data, error } = await query;
        if (error) return { error };
        return { data: (data ?? []) as Ejercicio[] };
      },
      providesTags: [{ type: "Ejercicios", id: "LIST" }],
    }),

    /** Detalle de rutina + ejercicios + sets (todo bajo RLS) */
    getRutinaById: builder.query<RutinaDetalle | null, number>({
      async queryFn(id_rutina) {
        const { data, error } = await supabase
          .from("Rutinas")
          .select(
            `
            id_rutina, nombre, descripcion, nivel_recomendado, objetivo, duracion_estimada, owner_uid,
            EjerciciosRutinas (
              id_rutina, id_ejercicio, series, repeticiones, peso_sugerido, orden,
              Ejercicios ( id, nombre, grupo_muscular, dificultad, ejemplo ),
              sets:EjerciciosRutinaSets ( idx, kg, reps )
            )
          `
          )
          .eq("id_rutina", id_rutina)
          .single();

        if (error) return { error };

        const ejercicios = (data?.EjerciciosRutinas ?? [])
          .slice()
          .sort(sortByOrdenThenId);
        ejercicios.forEach((er: EjercicioRutina & { sets?: SetEntry[] }) => {
          er.sets = sortSets(er.sets);
        });

        return {
          data: {
            ...(data as Rutina),
            EjerciciosRutinas: ejercicios,
          } as RutinaDetalle,
        };
      },
      providesTags: (_r, _e, id) => [{ type: "RutinaDetalle", id }],
    }),

    /** Crear rutina */
    createRutina: builder.mutation<Rutina, UpsertRutinaInput>({
      async queryFn(rutinaData) {
        try {
          const { data, error } = await supabase
            .from("Rutinas")
            .insert([rutinaData])
            .select(SELECT_RUTINA_FIELDS)
            .single();

          if (error) throw error;
          return { data: data as Rutina };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: [{ type: "Rutinas", id: "LIST" }],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // 👇 refrescar KPIs (rutinas creadas y potencialmente otras)
          dispatch(
            dashboardApi.util.invalidateTags([{ type: "Kpis", id: "MONTH" }])
          );
        }
      },
    }),

    /** Actualizar rutina */
    updateRutina: builder.mutation<
      Rutina,
      { id_rutina: number } & UpsertRutinaInput
    >({
      async queryFn({ id_rutina, ...rutinaData }) {
        try {
          const { data, error } = await supabase
            .from("Rutinas")
            .update(rutinaData)
            .eq("id_rutina", id_rutina)
            .select(SELECT_RUTINA_FIELDS)
            .single();

          if (error) throw error;
          return { data: data as Rutina };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "Rutinas", id: "LIST" },
        { type: "RutinaDetalle", id: arg.id_rutina },
      ],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // 👇 por consistencia, refrescamos KPIs
          dispatch(
            dashboardApi.util.invalidateTags([{ type: "Kpis", id: "MONTH" }])
          );
        }
      },
    }),

    /** Añadir ejercicio a la rutina (trigger pone orden al final si no se envía) */
    addEjercicioToRutina: builder.mutation<
      EjercicioRutina,
      {
        id_rutina: number;
        id_ejercicio: number;
        series?: number;
        repeticiones?: number;
        peso_sugerido?: number;
        orden?: number;
      }
    >({
      async queryFn({
        id_rutina,
        id_ejercicio,
        series = null,
        repeticiones = null,
        peso_sugerido = null,
        orden,
      }) {
        const payload: any = {
          id_rutina,
          id_ejercicio,
          series,
          repeticiones,
          peso_sugerido,
        };
        if (typeof orden === "number") payload.orden = orden;

        const { data, error } = await supabase
          .from("EjerciciosRutinas")
          .insert([payload])
          .select(
            `
            id_rutina, id_ejercicio, series, repeticiones, peso_sugerido, orden,
            Ejercicios ( id, nombre, grupo_muscular, dificultad, ejemplo )
          `
          )
          .single();
        if (error) return { error };
        return { data: data as unknown as EjercicioRutina };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "RutinaDetalle", id: arg.id_rutina },
      ],
    }),

    /** Quitar ejercicio de la rutina */
    removeEjercicioFromRutina: builder.mutation<
      { success: true },
      { id_rutina: number; id_ejercicio: number }
    >({
      async queryFn({ id_rutina, id_ejercicio }) {
        const { error } = await supabase
          .from("EjerciciosRutinas")
          .delete()
          .eq("id_rutina", id_rutina)
          .eq("id_ejercicio", id_ejercicio);
        if (error) return { error };
        return { data: { success: true } };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "RutinaDetalle", id: arg.id_rutina },
      ],
    }),

    /** Reordenamiento en bloque (ejercicios) */
    reorderEjercicios: builder.mutation<
      { success: true },
      { id_rutina: number; items: { id_ejercicio: number; orden: number }[] }
    >({
      async queryFn({ id_rutina, items }) {
        const { error } = await supabase.rpc("reorder_exercises", {
          p_id_rutina: id_rutina,
          p_pairs: items,
        });
        if (error) return { error };
        return { data: { success: true } };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "RutinaDetalle", id: arg.id_rutina },
      ],
      async onQueryStarted({ id_rutina, items }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          rutinasApi.util.updateQueryData(
            "getRutinaById",
            id_rutina,
            (draft) => {
              if (!draft) return;
              const mapOrden = new Map(
                items.map((i) => [i.id_ejercicio, i.orden] as const)
              );
              draft.EjerciciosRutinas.forEach((er) => {
                const nuevo = mapOrden.get(er.id_ejercicio);
                if (typeof nuevo === "number") er.orden = nuevo;
              });
              draft.EjerciciosRutinas.sort(sortByOrdenThenId);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    /** 👇 NUEVO: Reemplazar todos los sets de un ejercicio en una rutina (transaccional) */
    replaceExerciseSets: builder.mutation<
      { success: true },
      { id_rutina: number; id_ejercicio: number; sets: SetEntry[] }
    >({
      async queryFn({ id_rutina, id_ejercicio, sets }) {
        const { error } = await supabase.rpc("replace_exercise_sets", {
          p_id_rutina: id_rutina,
          p_id_ejercicio: id_ejercicio,
          p_sets: sets,
        });
        if (error) return { error };
        return { data: { success: true } };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "RutinaDetalle", id: arg.id_rutina },
      ],
      // optimista simple
      async onQueryStarted(
        { id_rutina, id_ejercicio, sets },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          rutinasApi.util.updateQueryData(
            "getRutinaById",
            id_rutina,
            (draft) => {
              if (!draft) return;
              const er = draft.EjerciciosRutinas.find(
                (x) => x.id_ejercicio === id_ejercicio
              );
              if (er) {
                er.sets = sortSets(sets);
                er.series = sets.length;
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    /** Eliminar rutina */
    deleteRutina: builder.mutation<{ success: true }, { id_rutina: number }>({
      async queryFn({ id_rutina }) {
        const { error } = await supabase
          .from("Rutinas")
          .delete()
          .eq("id_rutina", id_rutina);
        if (error) return { error };
        return { data: { success: true } };
      },
      async onQueryStarted({ id_rutina }, { dispatch, queryFulfilled }) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id;

        const patchList = uid
          ? dispatch(
              rutinasApi.util.updateQueryData("getRutinas", uid, (draft) => {
                const idx = draft.findIndex((r) => r.id_rutina === id_rutina);
                if (idx !== -1) draft.splice(idx, 1);
              })
            )
          : { undo: () => {} };

        const patchDetail = dispatch(
          rutinasApi.util.updateQueryData(
            "getRutinaById",
            id_rutina,
            (_draft) => {}
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchDetail.undo();
        } finally {
          // 👇 refrescar KPIs (rutinas creadas)
          dispatch(
            dashboardApi.util.invalidateTags([{ type: "Kpis", id: "MONTH" }])
          );
        }
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "Rutinas", id: "LIST" },
        { type: "RutinaDetalle", id: arg.id_rutina },
      ],
    }),
  }),
});

// Hooks
export const {
  useGetRutinasQuery,
  useGetRutinaByIdQuery,
  useCreateRutinaMutation,
  useUpdateRutinaMutation,
  useAddEjercicioToRutinaMutation,
  useRemoveEjercicioFromRutinaMutation,
  useDeleteRutinaMutation,
  useGetEjerciciosQuery,
  useReorderEjerciciosMutation,
  useReplaceExerciseSetsMutation,
  useGetProgramByNameQuery,
} = rutinasApi;

// Aliases (mantener por compatibilidad; idealmente remover en limpieza futura)
export const useCrearRutinaMutation = useCreateRutinaMutation;
export const useActualizarRutinaMutation = useUpdateRutinaMutation;
export const useEliminarRutinaMutation = useDeleteRutinaMutation;
export const useObtenerEjerciciosQuery = useGetEjerciciosQuery;
