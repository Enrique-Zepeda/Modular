import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Slice = { name: string; value: number }; // value = volumen (kg*reps)

function normalizeUsername(u?: string) {
  const x = (u ?? "").trim();
  return x.startsWith("@") ? x.slice(1) : x;
}
function daysAgoISO(days: number) {
  const dt = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return dt.toISOString();
}

// Normaliza grupo muscular (evita nulls y variantes)
function normalizeGroup(raw?: string | null): string {
  if (!raw) return "Otros";
  const x = raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
  const canonical = x[0]?.toUpperCase() + x.slice(1).toLowerCase();
  return canonical || "Otros";
}

/**
 * Agrega volumen por grupo muscular para las últimas `recentDays` (default 60).
 * Si quieres histórico total, pásale recentDays = 36500.
 */
export function useMuscleVolumeDistribution(username?: string, recentDays = 60, maxSessions = 400) {
  const uname = useMemo(() => normalizeUsername(username), [username]);
  const [data, setData] = useState<Slice[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setLoading] = useState<boolean>(!!uname);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!uname) return;
      setLoading(true);
      setError(null);
      try {
        // 1) UID por username
        const { data: urow, error: uerr } = await supabase
          .from("Usuarios")
          .select("auth_uid")
          .eq("username", uname)
          .maybeSingle();
        if (uerr) throw uerr;
        const uid = urow?.auth_uid;
        if (!uid) {
          if (alive) {
            setData([]);
            setTotal(0);
            setLoading(false);
          }
          return;
        }

        // 2) Sesiones cerradas recientes
        const q = supabase
          .from("Entrenamientos")
          .select("id_sesion, ended_at")
          .eq("owner_uid", uid)
          .not("ended_at", "is", null)
          .order("ended_at", { ascending: false })
          .limit(maxSessions);

        if (recentDays > 0) q.gte("ended_at", daysAgoISO(recentDays));
        const ses = await q;
        if (ses.error) throw ses.error;

        const ids = (ses.data ?? []).map((r: any) => Number(r.id_sesion));
        if (ids.length === 0) {
          if (alive) {
            setData([]);
            setTotal(0);
            setLoading(false);
          }
          return;
        }

        // 3) Sets hechos (done=true) en esas sesiones
        const setsRes = await supabase
          .from("EntrenamientoSets")
          .select("id_ejercicio, kg, reps, done, id_sesion")
          .in("id_sesion", ids)
          .eq("done", true);
        if (setsRes.error) throw setsRes.error;

        // 4) Agregar volumen por ejercicio
        const byExercise = new Map<number, number>(); // id_ejercicio -> volumen
        for (const row of setsRes.data ?? []) {
          const eid = Number((row as any).id_ejercicio);
          const kg = Number((row as any).kg ?? 0);
          const reps = Number((row as any).reps ?? 0);
          const vol = Number.isFinite(kg) && Number.isFinite(reps) ? kg * reps : 0;
          byExercise.set(eid, (byExercise.get(eid) ?? 0) + vol);
        }
        if (byExercise.size === 0) {
          if (alive) {
            setData([]);
            setTotal(0);
            setLoading(false);
          }
          return;
        }

        // 5) Traer grupos musculares
        const exerciseIds = Array.from(byExercise.keys());
        const info = await supabase.from("Ejercicios").select("id, grupo_muscular").in("id", exerciseIds);
        if (info.error) throw info.error;

        const byGroup = new Map<string, number>();
        for (const e of info.data ?? []) {
          const id = Number((e as any).id);
          const group = normalizeGroup((e as any).grupo_muscular);
          const vol = byExercise.get(id) ?? 0;
          byGroup.set(group, (byGroup.get(group) ?? 0) + vol);
        }

        const entries = Array.from(byGroup.entries())
          .map(([name, value]) => ({ name, value }))
          .filter((s) => s.value > 0)
          .sort((a, b) => b.value - a.value);

        const sum = entries.reduce((a, b) => a + b.value, 0);

        if (alive) {
          setData(entries);
          setTotal(sum);
          setLoading(false);
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? "Error al calcular distribución");
          setLoading(false);
        }
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [uname, recentDays, maxSessions]);

  return { data, total, isLoading, error };
}
