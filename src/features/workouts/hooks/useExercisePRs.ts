import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type BestPrev = { oneRm: number | null; weight: number | null; volume: number | null };
type SetLike = { kg: number | null; reps: number | null; done: boolean | null | undefined };
type Opts = {
  formula?: "epley" | "brzycki" | ((kg: number, reps: number) => number);
  tolerancePct?: number;
  historySessions?: number;
};

// ===== Cache en módulo para evitar reconsultas redundantes =====
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const cache = new Map<string, { at: number; best: BestPrev }>();
const inflight = new Map<string, Promise<BestPrev>>();

function makeKey(uid: string, exerciseId: number, currentSessionId?: number, n?: number) {
  return [uid, exerciseId, currentSessionId ?? "none", n ?? 30].join("|");
}

/** Permite invalidar la caché (por ejercicio) o toda. */
export function invalidateExercisePRsCache(exerciseIds?: number[] | "all") {
  if (!exerciseIds || exerciseIds === "all") {
    cache.clear();
    inflight.clear();
    return;
  }
  const ids = new Set(exerciseIds.map(String));
  for (const key of Array.from(cache.keys())) {
    const parts = key.split("|");
    const exId = parts[1]; // uid|exerciseId|sessionId|n
    if (ids.has(exId)) cache.delete(key);
  }
  for (const key of Array.from(inflight.keys())) {
    const parts = key.split("|");
    const exId = parts[1];
    if (ids.has(exId)) inflight.delete(key);
  }
}

function epley1rm(kg: number, reps: number) {
  return kg * (1 + reps / 30);
}
function brzycki1rm(kg: number, reps: number) {
  return kg * (36 / (37 - reps));
}
function get1rm(formula: Opts["formula"], kg: number, reps: number) {
  if (typeof formula === "function") return formula(kg, reps);
  if (formula === "brzycki") return brzycki1rm(kg, reps);
  return epley1rm(kg, reps);
}

async function loadBestPrev(
  uid: string,
  exerciseId: number,
  currentSessionId?: number,
  historySessions: number = 30,
  formula?: Opts["formula"]
): Promise<BestPrev> {
  const key = makeKey(uid, exerciseId, currentSessionId, historySessions);
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.best;

  const pending = inflight.get(key);
  if (pending) return pending;

  const p = (async () => {
    // 1) últimas N sesiones finalizadas del usuario (excluir actual)
    let sesQ = supabase
      .from("Entrenamientos")
      .select("id_sesion, ended_at")
      .eq("owner_uid", uid)
      .not("ended_at", "is", null)
      .order("ended_at", { ascending: false })
      .limit(historySessions);
    if (currentSessionId) sesQ = sesQ.neq("id_sesion", currentSessionId);

    const ses = await sesQ;
    if (ses.error || !ses.data?.length) {
      const empty = { oneRm: null, weight: null, volume: null };
      cache.set(key, { at: now, best: empty });
      return empty;
    }
    const sesIds = ses.data.map((r) => r.id_sesion as number);

    // 2) sets done del ejercicio en esas sesiones
    const sets = await supabase
      .from("EntrenamientoSets")
      .select("id_sesion, id_ejercicio, kg, reps, done")
      .in("id_sesion", sesIds)
      .eq("id_ejercicio", exerciseId)
      .eq("done", true);

    if (sets.error || !sets.data?.length) {
      const empty = { oneRm: null, weight: null, volume: null };
      cache.set(key, { at: now, best: empty });
      return empty;
    }

    // 3) agregados en cliente
    let max1rm = 0;
    let maxW = 0;
    const volBySession = new Map<number, number>();

    for (const r of sets.data) {
      const kg = typeof r.kg === "number" ? r.kg : 0;
      const reps = typeof r.reps === "number" ? r.reps : 0;
      if (kg <= 0 || reps <= 0) continue;

      const est = get1rm(formula, kg, reps);
      if (Number.isFinite(est) && est > max1rm) max1rm = est;

      if (kg > maxW) maxW = kg;

      const v = kg * reps;
      const s = Number(r.id_sesion);
      volBySession.set(s, (volBySession.get(s) ?? 0) + v);
    }

    const maxVol = Math.max(0, ...Array.from(volBySession.values()));
    const best: BestPrev = {
      oneRm: max1rm > 0 ? max1rm : null,
      weight: maxW > 0 ? maxW : null,
      volume: maxVol > 0 ? maxVol : null,
    };
    cache.set(key, { at: now, best });
    return best;
  })();

  inflight.set(key, p);
  const res = await p.finally(() => inflight.delete(key));
  return res;
}

export function useExercisePRs(exerciseId?: number, currentSessionId?: number, opts?: Opts) {
  const [bestPrev, setBestPrev] = useState<BestPrev>({ oneRm: null, weight: null, volume: null });
  const [loading, setLoading] = useState(false);

  const tol = opts?.tolerancePct ?? 0.01;
  const hist = opts?.historySessions ?? 30;

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!exerciseId) return;
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) {
        if (alive) setLoading(false);
        return;
      }
      const best = await loadBestPrev(uid, Number(exerciseId), currentSessionId, hist, opts?.formula);
      if (alive) {
        setBestPrev(best);
        setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [exerciseId, currentSessionId, hist, opts?.formula]);

  const cmp = useCallback(
    (curr: number | null, prev: number | null) => {
      if (curr == null || !Number.isFinite(curr) || curr <= 0) return false;
      if (prev == null || !Number.isFinite(prev) || prev <= 0) return true; // sin histórico → cuenta como PR
      return curr > prev * (1 + tol - 1e-6);
    },
    [tol]
  );

  const isSetPR = useCallback(
    (set: SetLike) => {
      const kg = Number(set.kg ?? 0);
      const reps = Number(set.reps ?? 0);
      const done = !!set.done;
      if (!done || kg <= 0 || reps <= 0) return { type: null as const, value: null as number | null };

      const est = get1rm(opts?.formula, kg, reps);
      if (cmp(est, bestPrev.oneRm)) return { type: "1RM" as const, value: est };
      if (cmp(kg, bestPrev.weight)) return { type: "WEIGHT" as const, value: kg };
      return { type: null as const, value: null as number | null };
    },
    [bestPrev.oneRm, bestPrev.weight, cmp, opts?.formula]
  );

  const isSessionVolumePR = useCallback(
    (currentVolume: number) => cmp(currentVolume, bestPrev.volume),
    [bestPrev.volume, cmp]
  );

  return {
    bestPrev,
    isSetPR,
    isSessionVolumePR,
    loading,
  };
}
