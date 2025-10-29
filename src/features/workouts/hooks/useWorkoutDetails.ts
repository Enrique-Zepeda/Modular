import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatDurationShort } from "@/lib/duration";

/** -------- Tipos -------- */
export type WorkoutSet = {
  idx: number | null;
  kg: number | null;
  reps: number | null;
  rpe: number | string | null;
  done: boolean | null;
};

export type WorkoutExercise = {
  id_ejercicio: number;
  nombre?: string | null;
  grupo_muscular?: string | null;
  ejemplo?: string | null;
  sets: WorkoutSet[];
};

export type WorkoutDetails = {
  id_sesion: number;
  /** Etiqueta opcional (semilla) para mostrar duración inmediata */
  durationLabel?: string;
  /** Segundos de duración (calculado con meta o columnas directas) */
  durationSeconds?: number;
  /** Meta cruda por si quieres debug/mostrar */
  startedAt?: string | null;
  endedAt?: string | null;

  sensacion_global?: string | number | null;
  totalVolume?: number;
  exercises: WorkoutExercise[];
};

/** -------- Caché simple en memoria -------- */
const detailsCache = new Map<number, WorkoutDetails>();

/** Utilidad: diferencia segura en segundos entre timestamps ISO */
function diffSecondsSafe(from?: string | null, to?: string | null) {
  if (!from) return 0;
  const a = Date.parse(from);
  const b = Date.parse(to ?? from);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.floor((b - a) / 1000));
}

/** Construcción a partir de filas (1 consulta) + meta (started/ended/segundos) */
function buildDetailsFromRows(
  sessionId: number,
  rows: any[],
  opts?: { durationLabel?: string | null; sensacion?: string | number | null },
  meta?: { started_at?: string | null; ended_at?: string | null; dur_seg?: number | null }
): WorkoutDetails {
  const byEx = new Map<number, WorkoutSet[]>();

  for (const r of rows ?? []) {
    const id_ejercicio = Number(r.id_ejercicio);
    if (!Number.isFinite(id_ejercicio)) continue;

    if (!byEx.has(id_ejercicio)) byEx.set(id_ejercicio, []);
    byEx.get(id_ejercicio)!.push({
      idx: r.idx ?? null,
      kg: r.kg ?? null,
      reps: r.reps ?? null,
      rpe: r.rpe ?? null,
      done: r.done ?? null,
    });
  }

  // meta ejercicios
  const metaMap = new Map<
    number,
    { nombre?: string | null; grupo_muscular?: string | null; ejemplo?: string | null }
  >();
  for (const r of rows ?? []) {
    const ex = (r as any).Ejercicios;
    if (ex && Number.isFinite(ex.id)) {
      metaMap.set(ex.id, {
        nombre: ex.nombre ?? null,
        grupo_muscular: ex.grupo_muscular ?? null,
        ejemplo: ex.ejemplo ?? null,
      });
    }
  }

  const exercises: WorkoutExercise[] = [];
  for (const [id_ejercicio, sets] of byEx.entries()) {
    const m = metaMap.get(id_ejercicio);
    const ordered = sets.slice().sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0));
    exercises.push({
      id_ejercicio,
      nombre: m?.nombre,
      grupo_muscular: m?.grupo_muscular,
      ejemplo: m?.ejemplo,
      sets: ordered,
    });
  }
  exercises.sort((a, b) => a.id_ejercicio - b.id_ejercicio);

  const totalVolume = rows.reduce((acc, r: any) => {
    const kg = typeof r.kg === "number" ? r.kg : 0;
    const reps = typeof r.reps === "number" ? r.reps : 0;
    return acc + kg * reps;
  }, 0);

  // Calcular durationSeconds con prioridad:
  // 1) meta.dur_seg si existe
  // 2) diff(ended_at, started_at)
  const startedAt = meta?.started_at ?? null;
  const endedAt = meta?.ended_at ?? startedAt ?? null;

  const durationSeconds =
    typeof meta?.dur_seg === "number" && Number.isFinite(meta?.dur_seg) && (meta?.dur_seg as number) >= 0
      ? (meta?.dur_seg as number)
      : diffSecondsSafe(startedAt ?? undefined, endedAt ?? undefined);

  return {
    id_sesion: sessionId,
    durationLabel: opts?.durationLabel ?? undefined,
    durationSeconds,
    startedAt,
    endedAt,
    sensacion_global: opts?.sensacion ?? null,
    totalVolume,
    exercises,
  };
}

/** -------- Prefetch (para hover/focus) -------- */
export async function prefetchWorkoutDetails(
  sessionId: number,
  seed?: { durationLabel?: string | null; sensacion?: string | number | null }
) {
  if (!sessionId || detailsCache.has(sessionId)) return;

  // Consultas en paralelo para menor latencia
  const [setsQ, metaQ] = await Promise.all([
    supabase
      .from("EntrenamientoSets")
      .select("id_sesion,id_ejercicio,idx,kg,reps,rpe,done,Ejercicios(id,nombre,grupo_muscular,ejemplo)")
      .eq("id_sesion", sessionId)
      .order("id_ejercicio", { ascending: true })
      .order("idx", { ascending: true }),
    supabase
      .from("Entrenamientos")
      .select("started_at, ended_at, duracion_seg, duracion_seconds")
      .eq("id_sesion", sessionId)
      .maybeSingle(),
  ]);

  if (setsQ.error) return; // silencioso en prefetch

  const dur =
    (typeof metaQ.data?.duracion_seconds === "number" && metaQ.data?.duracion_seconds) ??
    (typeof metaQ.data?.duracion_seg === "number" && metaQ.data?.duracion_seg) ??
    null;

  const details = buildDetailsFromRows(sessionId, setsQ.data ?? [], seed, {
    started_at: metaQ.data?.started_at ?? null,
    ended_at: metaQ.data?.ended_at ?? null,
    dur_seg: dur,
  });

  detailsCache.set(sessionId, details);
}

/** -------- Hook principal (usa caché) -------- */
export function useWorkoutDetails(
  sessionId?: number,
  seed?: { durationLabel?: string | null; sensacion?: string | number | null }
) {
  const [data, setData] = useState<WorkoutDetails | null>(() =>
    sessionId ? detailsCache.get(sessionId) ?? null : null
  );
  const [loading, setLoading] = useState<boolean>(!detailsCache.has(sessionId ?? -1) && !!sessionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!sessionId) return;

      // si está en caché, úsalo y no consultes
      const cached = detailsCache.get(sessionId);
      if (cached) {
        if (alive) {
          setData(cached);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      // Consultas en paralelo
      const [setsQ, metaQ] = await Promise.all([
        supabase
          .from("EntrenamientoSets")
          .select("id_sesion,id_ejercicio,idx,kg,reps,rpe,done,Ejercicios(id,nombre,grupo_muscular,ejemplo)")
          .eq("id_sesion", sessionId)
          .order("id_ejercicio", { ascending: true })
          .order("idx", { ascending: true }),
        supabase
          .from("Entrenamientos")
          .select("started_at, ended_at, duracion_seg, duracion_seconds")
          .eq("id_sesion", sessionId)
          .maybeSingle(),
      ]);

      if (setsQ.error) {
        if (alive) {
          setError(setsQ.error.message ?? "No se pudo cargar el entrenamiento");
          setLoading(false);
        }
        return;
      }

      const dur =
        (typeof metaQ.data?.duracion_seconds === "number" && metaQ.data?.duracion_seconds) ??
        (typeof metaQ.data?.duracion_seg === "number" && metaQ.data?.duracion_seg) ??
        null;

      const built = buildDetailsFromRows(sessionId, setsQ.data ?? [], seed, {
        started_at: metaQ.data?.started_at ?? null,
        ended_at: metaQ.data?.ended_at ?? null,
        dur_seg: dur,
      });

      detailsCache.set(sessionId, built);

      if (alive) {
        setData(built);
        setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [sessionId, seed?.durationLabel, seed?.sensacion]);

  return { data, loading, error };
}

/** Utilidad para cuando solo tienes segundos y quieres semilla de duración */
export function durationSeedFromSeconds(seconds?: number | null) {
  if (seconds == null) return undefined;
  const s = Math.max(0, Math.floor(seconds));
  return formatDurationShort(s);
}
