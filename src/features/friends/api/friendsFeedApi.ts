import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";

export type FriendWorkoutCard = {
  id_workout: number;
  id_usuario: number;
  fecha: string;
  sensacion: string | null;
  nota: string | null;
  username: string;
  nombre: string | null;
  url_avatar: string | null;
  total_series: number | null;
  total_kg: number | null;
  /** 👇 NUEVO: directo del RPC */
  id_rutina: number | null;
  rutina_nombre: string | null;
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
    listFriendsFeed: builder.query<FriendWorkoutCard[], { limit?: number; before?: string } | void>({
      async queryFn(args) {
        const { limit = 20, before = null as any } = args || {};
        const { data, error } = await supabase.rpc("feed_friends_workouts", {
          p_limit: limit,
          p_before: before,
        });
        if (error) return { error };
        return { data: (data ?? []) as FriendWorkoutCard[] };
      },
      providesTags: ["FriendsFeed"],
    }),

    listFriendsFeedRich: builder.query<FriendWorkoutCardRich[], { limit?: number; before?: string } | void>({
      async queryFn(args) {
        try {
          const { limit = 20, before = null as any } = args || {};
          // 1) Base (ahora con rutina_nombre desde el RPC)
          const baseRes = await supabase.rpc("feed_friends_workouts", {
            p_limit: limit,
            p_before: before,
          });
          if (baseRes.error) throw baseRes.error;

          const base = (baseRes.data ?? []) as FriendWorkoutCard[];
          if (base.length === 0) return { data: [] };

          const sessionIds = base.map((f) => f.id_workout);

          // 2) Sets done + ejercicios
          const setsRes = await supabase
            .from("EntrenamientoSets")
            .select(
              `
              id_sesion,
              id_ejercicio,
              kg,
              reps,
              done,
              Ejercicios:Ejercicios ( id, nombre, grupo_muscular, equipamento, ejemplo )
            `
            )
            .in("id_sesion", sessionIds)
            .eq("done", true);

          if (setsRes.error) throw setsRes.error;

          type Row = {
            id_sesion: number;
            id_ejercicio: number;
            kg: number;
            reps: number;
            Ejercicios: {
              id: number;
              nombre: string | null;
              grupo_muscular: string | null;
              equipamento: string | null;
              ejemplo: string | null;
            } | null;
          };

          const rows = (setsRes.data ?? []) as Row[];

          // 3) Agregación en memoria
          const bySesion = new Map<number, FriendWorkoutCardRich>();
          for (const b of base) {
            bySesion.set(b.id_workout, {
              ...b,
              ejercicios: [],
              total_series_done: 0,
              total_kg_done: 0,
            });
          }

          const key = (sid: number, eid: number) => `${sid}-${eid}`;
          const agg = new Map<
            string,
            {
              id_sesion: number;
              id: number;
              nombre: string | null;
              grupo_muscular: string | null;
              equipamento: string | null;
              ejemplo: string | null;
              sets_done: number;
              volume: number;
            }
          >();

          for (const r of rows) {
            const vol = Number(r.kg ?? 0) * Number(r.reps ?? 0);
            const k = key(r.id_sesion, r.id_ejercicio);
            const ej = r.Ejercicios ?? ({} as any);
            if (!agg.has(k)) {
              agg.set(k, {
                id_sesion: r.id_sesion,
                id: r.id_ejercicio,
                nombre: ej?.nombre ?? null,
                grupo_muscular: ej?.grupo_muscular ?? null,
                equipamento: ej?.equipamento ?? null,
                ejemplo: ej?.ejemplo ?? null,
                sets_done: 0,
                volume: 0,
              });
            }
            const a = agg.get(k)!;
            a.sets_done += 1;
            a.volume += vol;

            const ses = bySesion.get(r.id_sesion);
            if (ses) {
              ses.total_series_done += 1;
              ses.total_kg_done += vol;
            }
          }

          for (const a of agg.values()) {
            const ses = bySesion.get(a.id_sesion);
            if (ses) {
              ses.ejercicios.push({
                id: a.id,
                nombre: a.nombre,
                grupo_muscular: a.grupo_muscular,
                equipamento: a.equipamento,
                ejemplo: a.ejemplo,
                sets_done: a.sets_done,
                volume: a.volume,
              });
            }
          }

          // 4) Salida ordenada
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
