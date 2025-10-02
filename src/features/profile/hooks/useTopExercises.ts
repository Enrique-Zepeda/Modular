// FILE: src/features/profile/hooks/useTopExercises.ts

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type TopExercise = {
  id: number;
  nombre: string;
  ejemplo?: string | null; // gif/url si existe
  sets: number; // nº total de sets hechos (done=true si existe la columna)
  sesiones: number; // en cuántas sesiones aparece
  volumen_kg: number; // suma de (kg*reps)
};

function normalizeUsername(u?: string) {
  const x = (u ?? "").trim();
  return x.startsWith("@") ? x.slice(1) : x;
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Calcula los N ejercicios destacados del usuario.
 * Criterio de ranking (en este orden):
 *  1) volumen_kg (desc)
 *  2) sets (desc)
 *  3) nombre (asc) para desempatar de forma estable
 *
 * Notas:
 * - Considera las últimas `maxSessions` sesiones finalizadas (`ended_at` no nulo).
 * - Cuenta solo sets "done" si la columna existe; si no existe, cuenta todos.
 * - Volumen = (kg|peso_kg|peso) * (reps|repeticiones) por set, sumado.
 */
export function useTopExercises(username?: string, topN = 3, maxSessions = 300) {
  const uname = useMemo(() => normalizeUsername(username), [username]);
  const [data, setData] = useState<TopExercise[] | null>(null);
  const [isLoading, setLoading] = useState<boolean>(!!uname);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!uname) return;
      setLoading(true);
      setError(null);

      try {
        // 1) auth_uid por username
        const { data: urow, error: uerr } = await supabase
          .from("Usuarios")
          .select("auth_uid")
          .eq("username", uname)
          .maybeSingle();
        if (uerr) throw uerr;

        const uid = (urow as any)?.auth_uid as string | undefined;
        if (!uid) {
          if (alive) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        // 2) últimas sesiones finalizadas
        const ses = await supabase
          .from("Entrenamientos")
          .select("id_sesion, ended_at")
          .eq("owner_uid", uid)
          .not("ended_at", "is", null)
          .order("ended_at", { ascending: false })
          .limit(maxSessions);
        if (ses.error) throw ses.error;

        const ids: number[] = (ses.data ?? [])
          .map((r: any) => num((r as any).id_sesion))
          .filter((x) => Number.isFinite(x) && x > 0);

        if (ids.length === 0) {
          if (alive) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        // 3) sets de esas sesiones (select * para tolerar nombres de columnas)
        const setsRes = await supabase.from("EntrenamientoSets").select("*").in("id_sesion", ids);
        if (setsRes.error) throw setsRes.error;

        // 4) agregado por ejercicio
        type Agg = { sets: number; volumen: number; sesiones: Set<number> };
        const byEx = new Map<number, Agg>();

        for (const row of setsRes.data ?? []) {
          const sid = num((row as any).id_sesion);
          const eid = num((row as any).id_ejercicio);
          if (!eid || !sid) continue;

          // Si existe "done", consideramos solo done === true
          const hasDone = Object.prototype.hasOwnProperty.call(row, "done");
          const isDone = hasDone ? Boolean((row as any).done) : true;
          if (!isDone) continue;

          const reps = num((row as any).reps ?? (row as any).repeticiones, 0);
          const weight = num((row as any).kg ?? (row as any).peso_kg ?? (row as any).peso, 0);
          const vol = Math.max(0, reps) * Math.max(0, weight);

          const prev = byEx.get(eid) ?? { sets: 0, volumen: 0, sesiones: new Set<number>() };
          prev.sets += 1;
          prev.volumen += vol;
          prev.sesiones.add(sid);
          byEx.set(eid, prev);
        }

        if (byEx.size === 0) {
          if (alive) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        // 5) metadata de ejercicios
        const exerciseIds = Array.from(byEx.keys());
        const info = await supabase.from("Ejercicios").select("id, nombre, ejemplo").in("id", exerciseIds);
        if (info.error) throw info.error;

        const meta = new Map<number, { nombre: string; ejemplo: string | null }>();
        for (const e of info.data ?? []) {
          meta.set(num((e as any).id), {
            nombre: String((e as any).nombre ?? "Ejercicio"),
            ejemplo: (e as any).ejemplo ?? null,
          });
        }

        // 6) Ranking: volumen desc -> sets desc -> nombre asc
        const sorted = exerciseIds.sort((a, b) => {
          const A = byEx.get(a)!;
          const B = byEx.get(b)!;
          if (A.volumen !== B.volumen) return B.volumen - A.volumen; // 1) volumen_kg desc
          if (A.sets !== B.sets) return B.sets - A.sets; // 2) sets desc
          const na = meta.get(a)?.nombre ?? "";
          const nb = meta.get(b)?.nombre ?? "";
          return na.localeCompare(nb); // 3) nombre asc
        });

        const result: TopExercise[] = sorted.slice(0, Math.max(1, topN)).map((id) => {
          const agg = byEx.get(id)!;
          const m = meta.get(id);
          return {
            id,
            nombre: m?.nombre ?? `Ejercicio #${id}`,
            ejemplo: m?.ejemplo ?? null,
            sets: agg.sets,
            sesiones: agg.sesiones.size,
            // Guardamos como entero; si prefieres 1 decimal: Math.round(agg.volumen * 10) / 10
            volumen_kg: Math.round(agg.volumen),
          };
        });

        if (alive) {
          setData(result);
          setLoading(false);
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? "No se pudo calcular los ejercicios destacados");
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [uname, topN, maxSessions]);

  return { top: data, isLoading, error };
}
