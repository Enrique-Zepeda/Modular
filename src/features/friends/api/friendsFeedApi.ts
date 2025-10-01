import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";

/** ===== Tipos del feed =====
 * Mantengo los nombres/exports que ya usa el Dashboard.
 * Añadimos `duracion_seg?: number | null` porque v2 lo devuelve.
 */
export type FriendWorkoutCard = {
  id_workout: number; // id_sesion en Entrenamientos
  id_usuario: number; // dueño (entero)
  fecha: string; // timestamptz (fin o fecha base del post)
  sensacion: string | null;
  nota: string | null;
  username: string;
  nombre: string | null;
  url_avatar: string | null;
  total_series: number | null;
  total_kg: number | null;
  id_rutina: number | null;
  rutina_nombre: string | null;
  duracion_seg?: number | null;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
};

export type FriendWorkoutExercise = {
  id: number;
  nombre: string | null;
  grupo_muscular: string | null;
  equipamento: string | null;
  ejemplo: string | null;
  sets_done: number;
  volume: number;
};

export type FriendWorkoutCardRich = FriendWorkoutCard & {
  ejercicios: FriendWorkoutExercise[];
  total_series_done: number;
  total_kg_done: number;
};

export const friendsFeedApi = createApi({
  reducerPath: "friendsFeedApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["FriendsFeed"],
  endpoints: (builder) => ({
    /** ============================
     * Feed simple (usa RPC v2)
     * ============================ */
    listFriendsFeed: builder.query<FriendWorkoutCard[], { limit?: number; before?: string } | void>({
      async queryFn(args) {
        const { limit = 20, before = null as any } = args || {};
        // 🔁 Usar la versión v2 que incluye `duracion_seg`, `id_rutina`, `rutina_nombre`
        const { data, error } = await supabase.rpc("feed_friends_workouts_v3", {
          p_limit: limit,
          p_before: before,
        });
        if (error) return { error };
        return { data: (data ?? []) as FriendWorkoutCard[] };
      },
      providesTags: ["FriendsFeed"],
    }),

    /** =====================================
     * Feed “rich” con ejercicios agregados
     * 1) Base desde RPC v2 (trae duracion_seg)
     * 2) Join manual de sets (como ya estaba)
     * ===================================== */
    listFriendsFeedRich: builder.query<FriendWorkoutCardRich[], { limit?: number; before?: string } | void>({
      async queryFn(args) {
        try {
          const { limit = 20, before = null as any } = args || {};

          // 1) Base (ahora con v2)
          const baseRes = await supabase.rpc("feed_friends_workouts_v3", {
            p_limit: limit,
            p_before: before,
          });
          if (baseRes.error) throw baseRes.error;

          const base = (baseRes.data ?? []) as FriendWorkoutCard[];
          if (base.length === 0) return { data: [] };

          const sessionIds = base.map((f) => f.id_workout);

          // 2) Cargar sets/ejercicios relacionados (idéntico a tu lógica previa)
          type Row = {
            id_sesion: number;
            id_ejercicio: number;
            id: number; // Ejercicios.id
            nombre: string | null;
            grupo_muscular: string | null;
            equipamento: string | null;
            ejemplo: string | null;
            idx: number;
            kg: number | null;
            reps: number | null;
            done: boolean | null;
          };

          const setsRes = await supabase
            .from("EntrenamientoSets")
            .select(
              `
    id_sesion,
    id_ejercicio,
    idx,
    kg,
    reps,
    done,
    Ejercicios:Ejercicios (
      id,
      nombre,
      grupo_muscular,
      equipamento,
      ejemplo
    )
  `
            )
            .in("id_sesion", sessionIds)
            .eq("done", true); // ⬅️ SOLO sets marcados como hechos

          if (setsRes.error) throw setsRes.error;

          const rows = (setsRes.data ?? []) as any[];

          // 3) Agregación en memoria (igual que antes)
          const bySesion = new Map<number, FriendWorkoutCardRich>();
          for (const b of base) {
            bySesion.set(b.id_workout, {
              ...b,
              ejercicios: [],
              total_series_done: 0,
              total_kg_done: 0,
            });
          }

          for (const r of rows) {
            if (!r?.done) continue; // ⬅️ Guard de seguridad
            const sId = Number(r.id_sesion);
            const bucket = bySesion.get(sId);
            if (!bucket) continue;

            const ex = r.Ejercicios as {
              id: number;
              nombre: string | null;
              grupo_muscular: string | null;
              equipamento: string | null;
              ejemplo: string | null;
            } | null;

            bucket.total_series_done += 1; // totales de la sesión (si los usas)
            const kg = Number(r.kg ?? 0);
            const reps = Number(r.reps ?? 0);
            bucket.total_kg_done += Number.isFinite(kg * reps) ? kg * reps : 0;

            if (ex) {
              const found = bucket.ejercicios.find((e) => e.id === ex?.id);
              if (!found) {
                bucket.ejercicios.push({
                  id: ex?.id ?? r.id_ejercicio,
                  nombre: ex?.nombre ?? null,
                  grupo_muscular: ex?.grupo_muscular ?? null,
                  equipamento: ex?.equipamento ?? null,
                  ejemplo: ex?.ejemplo ?? null,
                  sets_done: 1, // ✅ solo hechos
                  volume: Number.isFinite(kg * reps) ? kg * reps : 0,
                });
              } else {
                found.sets_done += 1; // ✅ solo hechos
                const add = Number.isFinite(kg * reps) ? kg * reps : 0;
                found.volume = Number(found.volume ?? 0) + add; // ✅ solo hechos
              }
            }
          }

          const out = Array.from(bySesion.values()).sort((a, b) =>
            a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0
          );

          return { data: out };
        } catch (error) {
          return { error: error as any };
        }
      },
      providesTags: ["FriendsFeed"],
    }),
  }),
});

export const { useListFriendsFeedQuery, useListFriendsFeedRichQuery } = friendsFeedApi;
