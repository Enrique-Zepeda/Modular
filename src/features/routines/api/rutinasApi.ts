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

export type EjercicioRutina = {
  id_rutina: number;
  id_ejercicio: number;
  series: number | null;
  repeticiones: number | null;
  peso_sugerido: number | null;
  /** NUEVO: posición dentro de la rutina (1..N) */
  orden?: number | null;
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
  // usamos fakeBaseQuery porque llamamos al SDK de Supabase
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

          const rutinasWithCount = (data ?? []).map((rutina) => ({
            ...rutina,
            ejercicios_count: rutina.ejercicios_count?.[0]?.count || 0,
          }));

          return { data: rutinasWithCount as (Rutina & { ejercicios_count: number })[] };
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
        // Nota: se ordena por 'orden' asc y luego por id_ejercicio asc como tie-breaker
        const { data, error } = await supabase
          .from("Rutinas")
          .select(
            `
            id_rutina, nombre, descripcion, nivel_recomendado, objetivo, duracion_estimada, owner_uid,
            EjerciciosRutinas (
              id_rutina, id_ejercicio, series, repeticiones, peso_sugerido, orden,
              Ejercicios ( id, nombre, grupo_muscular, dificultad, ejemplo )
            )
          `
          )
          .eq("id_rutina", id_rutina)
          .single();

        if (error) return { error };

        // Aseguramos orden consistente en el cliente por si acaso
        const sorted =
          data?.EjerciciosRutinas?.slice().sort((a: EjercicioRutina, b: EjercicioRutina) => {
            const ao = (a.orden ?? 999999) - (b.orden ?? 999999);
            return ao !== 0 ? ao : a.id_ejercicio - b.id_ejercicio;
          }) ?? [];

        return {
          data: {
            ...(data as Rutina),
            EjerciciosRutinas: sorted,
          } as RutinaDetalle,
        };
      },
      providesTags: (_r, _e, id) => [{ type: "RutinaDetalle", id }],
    }),

    /** Crear rutina (el DEFAULT pone owner_uid = auth.uid()) */
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

    /** Actualizar rutina existente */
    updateRutina: builder.mutation<Rutina, { id_rutina: number } & UpsertRutinaInput>({
      async queryFn({ id_rutina, ...rutinaData }) {
        try {
          const { data, error } = await supabase
            .from("Rutinas")
            .update(rutinaData)
            .eq("id_rutina", id_rutina)
            .select("id_rutina, nombre, descripcion, nivel_recomendado, objetivo, duracion_estimada, owner_uid")
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
    }),

    /** Añadir ejercicio a la rutina (sólo si eres dueño por RLS)
     *  El trigger en DB asigna 'orden' al final si no se envía.
     */
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
      async queryFn({ id_rutina, id_ejercicio, series = null, repeticiones = null, peso_sugerido = null, orden }) {
        const payload: any = { id_rutina, id_ejercicio, series, repeticiones, peso_sugerido };
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

    /** NUEVO: Reordenamiento en bloque (tipo Hevy) usando RPC reorder_exercises
     *  items = [{ id_ejercicio, orden }, ...] con orden denso 1..N
     */
    reorderEjercicios: builder.mutation<
      { success: true },
      { id_rutina: number; items: { id_ejercicio: number; orden: number }[] }
    >({
      async queryFn({ id_rutina, items }) {
        const { error } = await supabase.rpc("reorder_exercises", {
          p_id_rutina: id_rutina,
          p_pairs: items, // Supabase convierte array TS -> jsonb
        });
        if (error) return { error };
        return { data: { success: true } };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: "RutinaDetalle", id: arg.id_rutina }],
      // Opcional: optimistic update para UX instantánea
      async onQueryStarted({ id_rutina, items }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          rutinasApi.util.updateQueryData("getRutinaById", id_rutina, (draft) => {
            if (!draft) return;
            const mapOrden = new Map(items.map((i) => [i.id_ejercicio, i.orden]));
            draft.EjerciciosRutinas.forEach((er) => {
              const nuevo = mapOrden.get(er.id_ejercicio);
              if (typeof nuevo === "number") er.orden = nuevo;
            });
            draft.EjerciciosRutinas.sort((a, b) => {
              const ao = (a.orden ?? 999999) - (b.orden ?? 999999);
              return ao !== 0 ? ao : a.id_ejercicio - b.id_ejercicio;
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    /** Eliminar rutina con optimistic update */
    deleteRutina: builder.mutation<{ success: true }, { id_rutina: number }>({
      async queryFn({ id_rutina }) {
        const { error } = await supabase.from("Rutinas").delete().eq("id_rutina", id_rutina);
        if (error) return { error };
        return { data: { success: true } };
      },
      // 🔥 optimista: quita la rutina del cache inmediatamente
      async onQueryStarted({ id_rutina }, { dispatch, queryFulfilled }) {
        // necesitamos el uid para tocar el cache de getRutinas(uid)
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
          rutinasApi.util.updateQueryData("getRutinaById", id_rutina, (_draft) => {
            /* noop */
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchDetail.undo();
        }
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
  useUpdateRutinaMutation,
  useAddEjercicioToRutinaMutation,
  useRemoveEjercicioFromRutinaMutation,
  useDeleteRutinaMutation,
  useGetEjerciciosQuery,
  useReorderEjerciciosMutation, // 👈 NUEVO
} = rutinasApi;

// Aliases (si los usabas en español)
export const useCrearRutinaMutation = useCreateRutinaMutation;
export const useActualizarRutinaMutation = useUpdateRutinaMutation;
export const useEliminarRutinaMutation = useDeleteRutinaMutation;
export const useObtenerEjerciciosQuery = useGetEjerciciosQuery;
