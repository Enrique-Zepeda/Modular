import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type MainExercise = {
  id: number;
  nombre: string;
  ejemplo?: string | null; // gif/url si existe
  sets: number; // nº total de sets hechos
  sesiones: number; // en cuántas sesiones aparece
  volumen_kg: number; // suma de (kg*reps)
};

function normalizeUsername(u?: string) {
  const x = (u ?? "").trim();
  return x.startsWith("@") ? x.slice(1) : x;
}

/**
 * Calcula el ejercicio "main" del usuario:
 * - Considera las últimas N sesiones finalizadas.
 * - Cuenta sets (done=true) por ejercicio y suma volumen (kg*reps).
 * - Devuelve el ejercicio con MÁS SETS (desempata por volumen y nombre).
 */
export function useMainExercise(username?: string, maxSessions = 300) {
  const uname = useMemo(() => normalizeUsername(username), [username]);
  const [data, setData] = useState<MainExercise | null>(null);
  const [isLoading, setLoading] = useState<boolean>(!!uname);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!uname) return;
      setLoading(true);
      setError(null);
      try {
        // 1) uid por username
        const { data: urow, error: uerr } = await supabase
          .from("Usuarios")
          .select("auth_uid")
          .eq("username", uname)
          .maybeSingle();
        if (uerr) throw uerr;
        const uid = urow?.auth_uid;
        if (!uid) {
          if (alive) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        // 2) últimas N sesiones cerradas
        const ses = await supabase
          .from("Entrenamientos")
          .select("id_sesion")
          .eq("owner_uid", uid)
          .not("ended_at", "is", null)
          .order("ended_at", { ascending: false })
          .limit(maxSessions);
        if (ses.error) throw ses.error;
        const ids = (ses.data ?? []).map((r: any) => Number(r.id_sesion));
        if (ids.length === 0) {
          if (alive) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        // 3) sets done en esas sesiones
        const setsRes = await supabase
          .from("EntrenamientoSets")
          .select("id_sesion, id_ejercicio, kg, reps, done")
          .in("id_sesion", ids)
          .eq("done", true);
        if (setsRes.error) throw setsRes.error;

        // 4) agregados por ejercicio
        type Agg = { sets: number; volumen: number; sesiones: Set<number> };
        const byEx = new Map<number, Agg>();
        for (const row of setsRes.data ?? []) {
          const sid = Number((row as any).id_sesion);
          const eid = Number((row as any).id_ejercicio);
          const kg = Number((row as any).kg ?? 0);
          const reps = Number((row as any).reps ?? 0);
          const agg = byEx.get(eid) ?? { sets: 0, volumen: 0, sesiones: new Set<number>() };
          agg.sets += 1;
          if (Number.isFinite(kg) && Number.isFinite(reps)) agg.volumen += kg * reps;
          agg.sesiones.add(sid);
          byEx.set(eid, agg);
        }
        if (byEx.size === 0) {
          if (alive) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        // 5) elegir el "main" (más sets, desempata por volumen y nombre)
        const exerciseIds = Array.from(byEx.keys());
        const info = await supabase.from("Ejercicios").select("id, nombre, ejemplo").in("id", exerciseIds);
        if (info.error) throw info.error;

        const meta = new Map<number, { nombre: string; ejemplo: string | null }>();
        for (const e of info.data ?? []) {
          meta.set(Number((e as any).id), {
            nombre: (e as any).nombre ?? "Ejercicio",
            ejemplo: (e as any).ejemplo ?? null,
          });
        }

        const sorted = exerciseIds.sort((a, b) => {
          const A = byEx.get(a)!;
          const B = byEx.get(b)!;
          if (A.sets !== B.sets) return B.sets - A.sets;
          if (A.volumen !== B.volumen) return B.volumen - A.volumen;
          const na = meta.get(a)?.nombre ?? "";
          const nb = meta.get(b)?.nombre ?? "";
          return na.localeCompare(nb);
        });

        const bestId = sorted[0];
        const agg = byEx.get(bestId)!;
        const m = meta.get(bestId);

        if (alive) {
          setData({
            id: bestId,
            nombre: m?.nombre ?? "Ejercicio",
            ejemplo: m?.ejemplo ?? null,
            sets: agg.sets,
            sesiones: agg.sesiones.size,
            volumen_kg: Math.round(agg.volumen * 10) / 10,
          });
          setLoading(false);
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? "No se pudo calcular el ejercicio principal");
          setLoading(false);
        }
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [uname, maxSessions]);

  return { main: data, isLoading: isLoading, error };
}
