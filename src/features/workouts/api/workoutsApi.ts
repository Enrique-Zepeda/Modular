import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";
import { dashboardApi } from "@/features/dashboard/api/dashboardApi";

import type { FinishedWorkoutRich } from "@/types/workouts";
import { friendsFeedApi } from "@/features/friends/api/friendsFeedApi";

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
type UserWorkoutExercise = {
  id_ejercicio: number;
  nombre: string;
  sets: number;
  volumen_kg: number;
  ejemplo?: string | null;
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
  tagTypes: ["Workouts", "FinishedWorkouts"],
  endpoints: (builder) => ({
    getWorkoutsByUsername: builder.query<
      {
        items: Array<{
          id_sesion: number;
          titulo: string | null;
          started_at: string | null;
          ended_at: string | null;
          duracion_seg: number | null;
          total_sets: number;
          total_volume_kg: number;
          sensacion: string | null; // ← ahora viene de RPE sets si existe
          ejercicios: Array<{
            id_ejercicio: number;
            nombre: string;
            sets: number;
            volumen_kg: number;
            ejemplo?: string | null;
          }>;
        }>;
        hasMore: boolean;
      },
      { username: string; page?: number; pageSize?: number }
    >({
      async queryFn({ username, page = 0, pageSize = 10 }) {
        try {
          const { supabase } = await import("@/lib/supabase/client");
          const uname = username.replace(/^@+/, "").trim();
          if (!uname) return { data: { items: [], hasMore: false } };

          // Helpers locales: RPE → score (1..5) → label
          const scoreToLabel = (n: number) => {
            const s = Math.min(5, Math.max(1, Math.round(n)));
            return (["Fácil", "Moderado", "Difícil", "Muy difícil", "Al fallo"] as const)[s - 1];
          };
          const rpeToScore = (val: unknown): number | null => {
            if (val == null) return null;
            if (typeof val === "number" && Number.isFinite(val)) {
              // Mapea 1..10 a 1..5
              if (val <= 4) return 1;
              if (val <= 6) return 2;
              if (val <= 8) return 3;
              if (val === 9) return 4;
              return 5; // 10 → al fallo
            }
            if (typeof val === "string") {
              const x = val
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .toLowerCase()
                .trim();
              if (x.includes("fallo")) return 5;
              if (x.includes("muy") && x.includes("dificil")) return 4;
              if (x === "dificil") return 3;
              if (x === "moderado") return 2;
              if (x === "facil") return 1; // 👈 FIX aquí
              // intenta extraer número si viniera "RPE 8"
              const m = x.match(/(\d+(\.\d+)?)/);
              if (m) {
                const n = Number(m[1]);
                if (Number.isFinite(n)) {
                  if (n <= 4) return 1;
                  if (n <= 6) return 2;
                  if (n <= 8) return 3;
                  if (n === 9) return 4;
                  return 5;
                }
              }
            }
            return null;
          };

          // 1) auth_uid por username
          const { data: urow, error: uerr } = await supabase
            .from("Usuarios")
            .select("auth_uid, id_usuario")
            .eq("username", uname)
            .maybeSingle();
          if (uerr) return { error: uerr as any };
          if (!urow?.auth_uid) return { data: { items: [], hasMore: false } };

          const offset = page * pageSize;
          const limit = pageSize;

          // 2) Sesiones finalizadas
          const { data: sessions, error: serr } = await supabase
            .from("Entrenamientos")
            .select("id_sesion, started_at, ended_at, duracion_seg, id_rutina") // sensacion_global puede venir null
            .eq("owner_uid", urow.auth_uid)
            .not("ended_at", "is", null)
            .order("ended_at", { ascending: false })
            .range(offset, offset + limit - 1);
          if (serr) return { error: serr as any };

          const itemsRaw =
            (sessions ?? []).map((s: any) => ({
              id_sesion: Number(s.id_sesion),
              started_at: s.started_at ?? null,
              ended_at: s.ended_at ?? null,
              duracion_seg:
                typeof s.duracion_seg === "number"
                  ? s.duracion_seg
                  : s.started_at && s.ended_at
                  ? Math.max(0, Math.floor((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000))
                  : null,
              id_rutina: s.id_rutina ?? null,
            })) ?? [];

          if (itemsRaw.length === 0) {
            return { data: { items: [], hasMore: false } };
          }

          // 3) Sets de todas las sesiones
          const sesionIds = itemsRaw.map((i) => i.id_sesion);
          const { data: sets, error: setErr } = await supabase
            .from("EntrenamientoSets")
            .select("id_sesion, id_ejercicio, reps, kg, rpe, done")
            .in("id_sesion", sesionIds)
            .eq("done", true);
          if (setErr) return { error: setErr as any };

          // agregados por sesión y ejercicio (y RPE)
          const perSession: Map<
            number,
            {
              totalSets: number;
              totalVolume: number;
              rpeScores: number[];
              perExercise: Map<number, { sets: number; volume: number }>;
            }
          > = new Map();
          const exerciseIds = new Set<number>();

          for (const row of sets ?? []) {
            const sid = Number((row as any).id_sesion);
            const eid = Number((row as any).id_ejercicio);
            const reps = Number((row as any).reps ?? 0);
            const peso = Number((row as any).kg ?? 0);
            const rpeScore = rpeToScore((row as any).rpe);

            if (Number.isFinite(eid)) exerciseIds.add(eid);

            const agg = perSession.get(sid) ?? {
              totalSets: 0,
              totalVolume: 0,
              rpeScores: [],
              perExercise: new Map<number, { sets: number; volume: number }>(),
            };

            agg.totalSets += 1;
            if (Number.isFinite(reps) && Number.isFinite(peso)) {
              agg.totalVolume += reps * peso;
              const e = agg.perExercise.get(eid) ?? { sets: 0, volume: 0 };
              e.sets += 1;
              e.volume += reps * peso;
              agg.perExercise.set(eid, e);
            }
            if (rpeScore != null) agg.rpeScores.push(rpeScore);

            perSession.set(sid, agg);
          }

          // 4) Nombres + gif de ejercicios
          const exInfo = new Map<number, { nombre: string; ejemplo: string | null }>();
          if (exerciseIds.size > 0) {
            const { data: ejercicios, error: exErr } = await supabase
              .from("Ejercicios")
              .select("id, nombre, ejemplo")
              .in("id", Array.from(exerciseIds));
            if (exErr) return { error: exErr as any };
            for (const e of ejercicios ?? []) {
              exInfo.set(Number((e as any).id), {
                nombre: (e as any).nombre ?? "Ejercicio",
                ejemplo: (e as any).ejemplo ?? null,
              });
            }
          }

          // 5) Nombres de rutinas
          const rutinaIds = Array.from(new Set(itemsRaw.map((i) => i.id_rutina).filter((x) => x != null))) as number[];
          const rutinaNames = new Map<number, string>();
          if (rutinaIds.length > 0) {
            const { data: rutinas } = await supabase
              .from("Rutinas")
              .select("id_rutina, nombre")
              .in("id_rutina", rutinaIds);
            for (const r of rutinas ?? []) {
              rutinaNames.set(Number((r as any).id_rutina), (r as any).nombre ?? "Entrenamiento");
            }
          }

          const items = itemsRaw.map((r) => {
            const agg = perSession.get(r.id_sesion);
            const ejercicios: Array<{
              id_ejercicio: number;
              nombre: string;
              sets: number;
              volumen_kg: number;
              ejemplo?: string | null;
            }> = [];
            let sensacion: string | null = null;

            if (agg) {
              // ejercicios
              for (const [eid, v] of agg.perExercise.entries()) {
                const info = exInfo.get(eid);
                ejercicios.push({
                  id_ejercicio: eid,
                  nombre: info?.nombre ?? "Ejercicio",
                  sets: v.sets,
                  volumen_kg: Math.round(v.volume * 10) / 10,
                  ejemplo: info?.ejemplo ?? null,
                });
              }
              ejercicios.sort((a, b) => b.volumen_kg - a.volumen_kg || a.nombre.localeCompare(b.nombre));

              // sensación por sesión (media de RPE → label)
              if (agg.rpeScores.length) {
                const mean = agg.rpeScores.reduce((a, b) => a + b, 0) / agg.rpeScores.length;
                sensacion = scoreToLabel(mean);
              }
            }

            return {
              id_sesion: r.id_sesion,
              titulo: r.id_rutina != null ? rutinaNames.get(Number(r.id_rutina)) ?? "Entrenamiento" : "Entrenamiento",
              started_at: r.started_at,
              ended_at: r.ended_at,
              duracion_seg: r.duracion_seg,
              total_sets: agg?.totalSets ?? 0,
              total_volume_kg: Math.round((agg?.totalVolume ?? 0) * 10) / 10,
              sensacion,
              ejercicios,
            };
          });

          return { data: { items, hasMore: (sessions?.length ?? 0) === limit } };
        } catch (e: any) {
          return { error: e };
        }
      },
      providesTags: (_res, _err, args) => [{ type: "WorkoutsByUser" as const, id: args.username }],
    }),

    /** Crear sesión con sets (RPC transaccional) */
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
      invalidatesTags: [
        { type: "Workouts", id: "LIST" },
        { type: "FinishedWorkouts", id: "LIST" },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // refrescar KPIs del mes
          dispatch(dashboardApi.util.invalidateTags([{ type: "Kpis", id: "MONTH" }]));
          // y el feed unificado (por si la sesión aparece ahí)
          dispatch(friendsFeedApi.util.invalidateTags(["FriendsFeed"]));
        }
      },
    }),

    /** ✅ Listado simple de mis sesiones (compat con export existente) */
    listUserWorkouts: builder.query<WorkoutListItem[], void>({
      async queryFn() {
        try {
          const { data: userData, error: userErr } = await supabase.auth.getUser();
          if (userErr) throw userErr;
          const uid = userData.user?.id;
          if (!uid) throw new Error("No authenticated user");

          const { data, error } = await supabase
            .from("Entrenamientos")
            .select(
              `
              id_sesion, started_at, ended_at, duracion_seg, total_volumen, sensacion_global, notas,
              Rutinas ( id_rutina, nombre ),
              sets:EntrenamientoSets (
                id_ejercicio, idx, kg, reps, rpe, done,
                Ejercicios ( id, nombre, ejemplo )
              )
            `
            )
            .eq("owner_uid", uid)
            .order("started_at", { ascending: false })
            .limit(50);

          if (error) return { error };
          return { data: (data ?? []) as unknown as WorkoutListItem[] };
        } catch (error) {
          return { error: error as any };
        }
      },
      providesTags: [{ type: "Workouts", id: "LIST" }],
    }),

    /**
     * Entrenamientos finalizados (solo sets done) + perfil + nombre real de la rutina.
     * 🔧 Cambios clave:
     *  - Incluimos `duracion_seg` desde Entrenamientos.
     *  - Mantenemos el contrato FinishedWorkoutRich actual.
     */
    getFinishedWorkoutsRich: builder.query<FinishedWorkoutRich[], { limit?: number; offset?: number }>({
      async queryFn({ limit = 20, offset = 0 }) {
        try {
          // 1) Sesiones finalizadas (+ duracion_seg)
          const sesRes = await supabase
            .from("Entrenamientos")
            .select("id_sesion, id_rutina, owner_uid, started_at, ended_at, sensacion_global, duracion_seg") // 👈 AQUI
            .not("ended_at", "is", null)
            .order("ended_at", { ascending: false })
            .range(offset, offset + limit - 1);

          if (sesRes.error) throw sesRes.error;
          const sesiones = (sesRes.data ?? []) as Array<{
            id_sesion: number;
            id_rutina: number | null;
            owner_uid: string;
            started_at: string;
            ended_at: string | null;
            sensacion_global: string | null;
            duracion_seg: number | null;
          }>;
          if (sesiones.length === 0) return { data: [] };

          const sesionIds = sesiones.map((s) => s.id_sesion);
          const rutinaIds = Array.from(new Set(sesiones.map((s) => s.id_rutina).filter((x): x is number => x != null)));
          const ownerUids = Array.from(new Set(sesiones.map((s) => s.owner_uid)));

          // 1.b) Perfiles
          const perfRes = await supabase
            .from("Usuarios")
            .select("auth_uid, username, url_avatar, sexo")
            .in("auth_uid", ownerUids);
          if (perfRes.error) throw perfRes.error;

          const profileByUid = new Map<
            string,
            { username: string | null; url_avatar: string | null; sexo: string | null }
          >();
          for (const p of perfRes.data ?? []) {
            profileByUid.set(p.auth_uid, {
              username: p.username ?? null,
              url_avatar: p.url_avatar ?? null,
              sexo: (p as any).sexo ?? null, // 👈 guarda sexo
            });
          }

          // 1.c) Nombres de rutinas
          let rutinaById = new Map<number, string | null>();
          if (rutinaIds.length > 0) {
            const rutRes = await supabase.from("Rutinas").select("id_rutina, nombre").in("id_rutina", rutinaIds);
            if (rutRes.error) throw rutRes.error;
            rutinaById = new Map<number, string | null>(
              (rutRes.data ?? []).map((r) => [r.id_rutina as number, (r.nombre as string) ?? null])
            );
          }

          // 2) SOLO sets done + info ejercicio
          const setsRes = await supabase
            .from("EntrenamientoSets")
            .select(
              `
              id_sesion,
              id_ejercicio,
              kg,
              reps,
              rpe,
              done,
              Ejercicios:Ejercicios ( id, nombre, grupo_muscular, equipamento, ejemplo )
            `
            )
            .in("id_sesion", sesionIds)
            .eq("done", true);
          if (setsRes.error) throw setsRes.error;

          const sets = (setsRes.data ?? []) as Array<{
            id_sesion: number;
            id_ejercicio: number;
            kg: number;
            reps: number;
            rpe: string | null;
            Ejercicios?: {
              id: number;
              nombre: string | null;
              grupo_muscular: string | null;
              equipamento: string | null;
              ejemplo: string | null;
            } | null;
          }>;

          // 3) Helpers RPE
          const toScore = (r?: string | null) => {
            if (!r) return null;
            const x = r
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .toLowerCase()
              .trim();
            if (x === "facil") return 1;
            if (x === "moderado") return 2;
            if (x === "dificil") return 3;
            if (x === "muy dificil") return 4;
            if (x === "al fallo") return 5;
            return null;
          };
          const scoreToLabel = (m: number | null) => {
            if (m == null) return "Sin sensaciones";
            if (m < 1.5) return "Fácil";
            if (m < 2.5) return "Moderado";
            if (m < 3.5) return "Difícil";
            if (m < 4.5) return "Muy difícil";
            return "Al fallo";
          };

          // 4) Agregación por sesión/ejercicio
          const bySesion = new Map<FinishedWorkoutRich["id_sesion"], FinishedWorkoutRich>();
          const exKey = (sid: number, eid: number) => `${sid}-${eid}`;
          const exAgg = new Map<
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
              rpeScores: number[];
            }
          >();

          for (const s of sesiones) {
            const prof = profileByUid.get(s.owner_uid) ?? { username: null, url_avatar: null, sexo: null };
            const titulo = rutinaById.get(s.id_rutina as number) ?? "Entrenamiento";
            bySesion.set(s.id_sesion, {
              id_sesion: s.id_sesion,
              id_rutina: s.id_rutina ?? null,
              owner_uid: s.owner_uid,
              started_at: s.started_at,
              ended_at: (s.ended_at as string) ?? s.started_at,
              total_sets: 0,
              total_volume: 0,
              titulo,
              username: prof.username,
              url_avatar: prof.url_avatar,
              sexo: prof.sexo,
              ejercicios: [],
              sensacion_final: s.sensacion_global ?? null,
              duracion_seg: s.duracion_seg ?? null,
            } as any);
          }

          for (const set of sets) {
            const vol = Number(set.kg) * Number(set.reps);
            const key = exKey(set.id_sesion, set.id_ejercicio);
            const ej = set.Ejercicios ?? ({} as any);
            if (!exAgg.has(key)) {
              exAgg.set(key, {
                id_sesion: set.id_sesion,
                id: set.id_ejercicio,
                nombre: ej?.nombre ?? null,
                grupo_muscular: ej?.grupo_muscular ?? null,
                equipamento: ej?.equipamento ?? null,
                ejemplo: ej?.ejemplo ?? null,
                sets_done: 0,
                volume: 0,
                rpeScores: [],
              });
            }
            const acc = exAgg.get(key)!;
            acc.sets_done += 1;
            acc.volume += vol;
            const sc = toScore(set.rpe);
            if (sc != null) acc.rpeScores.push(sc);

            const ses = bySesion.get(set.id_sesion)!;
            ses.total_volume = Number(ses.total_volume) + vol;
            ses.total_sets = (ses.total_sets ?? 0) + 1;
          }

          for (const agg of exAgg.values()) {
            const ses = bySesion.get(agg.id_sesion)!;
            ses.ejercicios!.push({
              id: agg.id,
              nombre: agg.nombre,
              grupo_muscular: agg.grupo_muscular,
              equipamento: agg.equipamento,
              ejemplo: agg.ejemplo ?? undefined,
              sets_done: agg.sets_done,
              volume: agg.volume,
            });
          }

          for (const ses of bySesion.values()) {
            if (!ses.sensacion_final) {
              const scores = Array.from(exAgg.values())
                .filter((x) => x.id_sesion === ses.id_sesion)
                .flatMap((x) => x.rpeScores);
              const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
              ses.sensacion_final = scoreToLabel(mean);
            }
          }

          const data = Array.from(bySesion.values()).sort((a, b) => (a.ended_at < b.ended_at ? 1 : -1));
          return { data };
        } catch (error) {
          return { error: error as any };
        }
      },
      providesTags: [{ type: "FinishedWorkouts", id: "LIST" }],
    }),

    /** Borrar sesión (RPC o fallback) */
    deleteWorkoutSession: builder.mutation<{ success: true }, { id_sesion: number }>({
      async queryFn({ id_sesion }) {
        const rpc = await supabase.rpc("delete_workout_session", { p_id_sesion: id_sesion });
        if (!rpc.error) return { data: { success: true } };

        // Fallback si no existe el RPC en tu entorno
        const { error: sErr } = await supabase.from("EntrenamientoSets").delete().eq("id_sesion", id_sesion);
        if (sErr) return { error: sErr };
        const { error: eErr } = await supabase.from("Entrenamientos").delete().eq("id_sesion", id_sesion);
        if (eErr) return { error: eErr };

        return { data: { success: true } };
      },
      invalidatesTags: [
        { type: "Workouts", id: "LIST" },
        { type: "FinishedWorkouts", id: "LIST" },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // refrescar KPIs + feed unificado
        dispatch(dashboardApi.util.invalidateTags([{ type: "Kpis", id: "MONTH" }]));
        dispatch(friendsFeedApi.util.invalidateTags(["FriendsFeed"]));

        try {
          await queryFulfilled;
        } catch {
          dispatch(dashboardApi.util.invalidateTags([{ type: "Kpis", id: "MONTH" }]));
          dispatch(friendsFeedApi.util.invalidateTags(["FriendsFeed"]));
        }
      },
    }),
  }),
});

export const {
  useCreateWorkoutSessionMutation,
  useListUserWorkoutsQuery,
  useDeleteWorkoutSessionMutation,
  useGetFinishedWorkoutsRichQuery,
  useGetWorkoutsByUsernameQuery,
  useLazyGetWorkoutsByUsernameQuery,
} = workoutsApi;
