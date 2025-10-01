import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type ProfileWorkoutExercise = {
  exercise_id: string;
  name: string;
  sets: number;
  volume_kg: number;
};

export type ProfileWorkoutItem = {
  id: string; // id_sesion como string para consistencia en FE
  started_at: string | null;
  ended_at: string | null;
  duration_sec: number | null;
  total_sets?: number;
  total_volume_kg?: number;
  difficulty?: string | null;
  routine_name?: string | null;
  exercises?: ProfileWorkoutExercise[]; // 👈 listado por sesión
};

type State =
  | { status: "idle" | "loading"; items: ProfileWorkoutItem[]; error: null; hasMore: boolean }
  | { status: "success"; items: ProfileWorkoutItem[]; error: null; hasMore: boolean }
  | { status: "error"; items: ProfileWorkoutItem[]; error: string; hasMore: boolean };

function normalizeUsername(u?: string) {
  const x = (u ?? "").trim();
  return x.startsWith("@") ? x.slice(1) : x;
}

function diffSeconds(a?: string | null, b?: string | null) {
  if (!a || !b) return null;
  const sa = new Date(a).getTime();
  const sb = new Date(b).getTime();
  if (Number.isNaN(sa) || Number.isNaN(sb)) return null;
  const d = Math.floor((sb - sa) / 1000);
  return d >= 0 ? d : null;
}

function difficultyLabel(score: unknown): string | null {
  const n = typeof score === "number" ? score : Number(score);
  if (!Number.isFinite(n)) return null;
  // Ajusta si tu escala es diferente
  switch (n) {
    case 1:
      return "Muy fácil";
    case 2:
      return "Fácil";
    case 3:
      return "Normal";
    case 4:
      return "Difícil";
    case 5:
      return "Muy difícil";
    default:
      return String(n);
  }
}

export function useProfileWorkouts(username: string | undefined, pageSize = 10) {
  const uname = useMemo(() => normalizeUsername(username), [username]);
  const [state, setState] = useState<State>({ status: "idle", items: [], error: null, hasMore: true });
  const pageRef = useRef(0);
  const authUidRef = useRef<string | null>(null);

  const loadPage = useCallback(
    async (page: number) => {
      if (!uname) return { items: [] as ProfileWorkoutItem[], hasMore: false };

      const offset = page * pageSize;
      const limit = pageSize;

      // 0) Resolver auth_uid por username (cache)
      if (!authUidRef.current) {
        const { data: urow, error: uerr } = await supabase
          .from("Usuarios")
          .select("auth_uid, id_usuario, username")
          .eq("username", uname)
          .maybeSingle();

        if (uerr) throw uerr;
        if (!urow) return { items: [] as ProfileWorkoutItem[], hasMore: false };
        authUidRef.current = urow.auth_uid;
      }

      // 1) Sesiones finalizadas
      const { data: sessions, error: serr } = await supabase
        .from("Entrenamientos")
        .select("id_sesion, started_at, ended_at, duracion_seg, sensacion_global, id_rutina")
        .eq("owner_uid", authUidRef.current!)
        .not("ended_at", "is", null)
        .order("ended_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (serr) throw serr;

      const baseItems: ProfileWorkoutItem[] =
        (sessions ?? []).map((s: any) => ({
          id: String(s.id_sesion ?? s.id ?? s.uuid ?? ""),
          started_at: s.started_at ?? null,
          ended_at: s.ended_at ?? null,
          duration_sec: s.duracion_seg ?? diffSeconds(s.started_at, s.ended_at),
          difficulty: difficultyLabel(s.sensacion_global),
          routine_name: null,
          exercises: [],
        })) ?? [];

      if (baseItems.length === 0) {
        return { items: [] as ProfileWorkoutItem[], hasMore: false };
      }

      // 2) Sets de todas las sesiones en la página
      const ids = baseItems.map((i) => i.id).filter(Boolean);
      const { data: sets, error: setErr } = await supabase
        .from("EntrenamientoSets")
        .select("id_sesion, id_ejercicio, reps, peso_kg, peso")
        .in("id_sesion", ids);

      if (setErr) {
        // Seguimos mostrando la lista aunque falle este agregado
        console.warn("No se pudo traer sets:", setErr);
      }

      // 2a) Agregar por sesión y por ejercicio
      const perSessionAgg = new Map<
        string,
        { totalSets: number; totalVolume: number; perExercise: Map<string, { sets: number; volume: number }> }
      >();

      const exerciseIds = new Set<string>();
      for (const row of (sets ?? []) as any[]) {
        const sid = String(row.id_sesion);
        const eid = String(row.id_ejercicio);
        const reps = Number(row.reps ?? 0);
        const peso = Number(row.peso_kg ?? row.peso ?? 0);

        if (eid) exerciseIds.add(eid);

        const agg = perSessionAgg.get(sid) ?? {
          totalSets: 0,
          totalVolume: 0,
          perExercise: new Map<string, { sets: number; volume: number }>(),
        };

        agg.totalSets += 1;
        if (Number.isFinite(reps) && Number.isFinite(peso)) {
          agg.totalVolume += reps * peso;
          const e = agg.perExercise.get(eid) ?? { sets: 0, volume: 0 };
          e.sets += 1;
          e.volume += reps * peso;
          agg.perExercise.set(eid, e);
        }

        perSessionAgg.set(sid, agg);
      }

      // 2b) Pintar los agregados totales en los items
      for (const it of baseItems) {
        const a = perSessionAgg.get(it.id);
        if (a) {
          it.total_sets = a.totalSets;
          it.total_volume_kg = Math.round(a.totalVolume * 10) / 10;
        }
      }

      // 3) Resolver nombres de ejercicios
      const exerciseMap = new Map<string, string>();
      if (exerciseIds.size > 0) {
        const { data: ejercicios } = await supabase
          .from("Ejercicios")
          .select("id_ejercicio, nombre")
          .in("id_ejercicio", Array.from(exerciseIds));

        for (const e of (ejercicios ?? []) as any[]) {
          exerciseMap.set(String(e.id_ejercicio), e.nombre ?? "Ejercicio");
        }
      }

      // 4) Construir arreglo exercises por sesión
      for (const it of baseItems) {
        const a = perSessionAgg.get(it.id);
        if (!a) continue;
        const list: ProfileWorkoutExercise[] = [];
        for (const [eid, data] of a.perExercise.entries()) {
          list.push({
            exercise_id: eid,
            name: exerciseMap.get(eid) ?? "Ejercicio",
            sets: data.sets,
            volume_kg: Math.round(data.volume * 10) / 10,
          });
        }
        // Ordenar por volumen desc, luego nombre
        list.sort((x, y) => y.volume_kg - x.volume_kg || x.name.localeCompare(y.name));
        it.exercises = list;
      }

      // 5) Resolver nombres de rutina (si hay id_rutina)
      const routineIds = Array.from(
        new Set((sessions ?? []).map((s: any) => s.id_rutina).filter((v: any) => v != null))
      );
      if (routineIds.length > 0) {
        const { data: rutinas } = await supabase
          .from("Rutinas")
          .select("id_rutina, nombre")
          .in("id_rutina", routineIds);
        const rmap = new Map((rutinas ?? []).map((r: any) => [String(r.id_rutina), r.nombre]));
        (sessions ?? []).forEach((s: any, idx: number) => {
          if (s.id_rutina != null) baseItems[idx].routine_name = rmap.get(String(s.id_rutina)) ?? null;
        });
      }

      return { items: baseItems, hasMore: (sessions?.length ?? 0) === limit };
    },
    [uname, pageSize]
  );

  const loadMore = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const { items, hasMore } = await loadPage(pageRef.current);
      pageRef.current += 1;
      setState((s) => ({
        status: "success",
        items: [...s.items, ...items],
        error: null,
        hasMore,
      }));
    } catch (e: any) {
      setState((s) => ({ ...s, status: "error", error: e?.message ?? "Error al cargar", hasMore: s.hasMore }));
    }
  }, [loadPage]);

  const refetch = useCallback(async () => {
    pageRef.current = 0;
    authUidRef.current = null;
    setState({ status: "loading", items: [], error: null, hasMore: true });
    try {
      const { items, hasMore } = await loadPage(0);
      pageRef.current = 1;
      setState({ status: "success", items, error: null, hasMore });
    } catch (e: any) {
      setState({ status: "error", items: [], error: e?.message ?? "Error al cargar", hasMore: false });
    }
  }, [loadPage]);

  useEffect(() => {
    if (!uname) return;
    refetch();
  }, [uname, refetch]);

  return {
    items: state.items,
    isLoading: state.status === "loading" && state.items.length === 0,
    isFetchingMore: state.status === "loading" && state.items.length > 0,
    isError: state.status === "error",
    error: state.status === "error" ? state.error : null,
    hasMore: state.hasMore,
    loadMore,
    refetch,
  };
}
