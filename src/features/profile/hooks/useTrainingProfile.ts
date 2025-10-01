import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type TrainingBadge = {
  label: "Fácil" | "Moderado" | "Difícil" | "Muy difícil" | "Al fallo";
  title: string;
  color: string;
  avgScore: number;
  samples: number; // sesiones consideradas
} | null;

const scoreToLabel = (n: number): TrainingBadge["label"] => {
  const s = Math.min(5, Math.max(1, Math.round(n)));
  return (["Fácil", "Moderado", "Difícil", "Muy difícil", "Al fallo"] as const)[s - 1];
};

const rpeToScore = (val: unknown): number | null => {
  if (val == null) return null;
  if (typeof val === "number" && Number.isFinite(val)) {
    if (val <= 4) return 1;
    if (val <= 6) return 2;
    if (val <= 8) return 3;
    if (val === 9) return 4;
    return 5;
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
    if (x === "facil") return 1;
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

const trainingProfileMap = {
  Fácil: { title: "Entrena por Hábito", color: "#2ECC71" },
  Moderado: { title: "Entrena como Atleta", color: "#3498DB" },
  Difícil: { title: "Entrena como Guerrero", color: "#9B59B6" },
  "Muy difícil": { title: "Entrena como Bestia", color: "#E67E22" },
  "Al fallo": { title: "Entrena como dios del olimpo", color: "#E74C3C" },
} as const;

function normalizeUsername(u?: string) {
  const x = (u ?? "").trim();
  return x.startsWith("@") ? x.slice(1) : x;
}

/**
 * Calcula el “perfil de entrenamiento” a partir del RPE de los sets:
 * - Para cada sesión cerrada, hace la media de RPE de sus sets (done=true).
 * - Luego promedia esas medias por sesión (evita sesgos por #sets).
 */
export function useTrainingProfile(username?: string, maxSessions = 200) {
  const uname = useMemo(() => normalizeUsername(username), [username]);
  const [badge, setBadge] = useState<TrainingBadge>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!uname);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!uname) return;
      setIsLoading(true);
      setError(null);
      try {
        // 1) UID por username
        const { data: urow, error: uerr } = await supabase
          .from("Usuarios")
          .select("auth_uid")
          .eq("username", uname)
          .maybeSingle();
        if (uerr) throw uerr;
        if (!urow?.auth_uid) {
          if (alive) {
            setBadge(null);
            setIsLoading(false);
          }
          return;
        }

        // 2) Últimas N sesiones cerradas
        const { data: sesiones, error: serr } = await supabase
          .from("Entrenamientos")
          .select("id_sesion")
          .eq("owner_uid", urow.auth_uid)
          .not("ended_at", "is", null)
          .order("ended_at", { ascending: false })
          .limit(maxSessions);
        if (serr) throw serr;
        const ids = (sesiones ?? []).map((s: any) => Number(s.id_sesion));
        if (ids.length === 0) {
          if (alive) {
            setBadge(null);
            setIsLoading(false);
          }
          return;
        }

        // 3) RPE de los sets “done” en esas sesiones
        const { data: sets, error: setErr } = await supabase
          .from("EntrenamientoSets")
          .select("id_sesion, rpe, done")
          .in("id_sesion", ids)
          .eq("done", true);
        if (setErr) throw setErr;

        // 4) Media por sesión y luego media global
        const bySession = new Map<number, number[]>();
        for (const row of sets ?? []) {
          const sid = Number((row as any).id_sesion);
          const score = rpeToScore((row as any).rpe);
          if (score == null) continue;
          const arr = bySession.get(sid) ?? [];
          arr.push(score);
          bySession.set(sid, arr);
        }
        const sessionMeans: number[] = [];
        for (const arr of bySession.values()) {
          if (arr.length) {
            sessionMeans.push(arr.reduce((a, b) => a + b, 0) / arr.length);
          }
        }
        if (!sessionMeans.length) {
          if (alive) {
            setBadge(null);
            setIsLoading(false);
          }
          return;
        }

        const globalMean = sessionMeans.reduce((a, b) => a + b, 0) / sessionMeans.length;
        const label = scoreToLabel(globalMean);
        const meta = trainingProfileMap[label];

        if (alive) {
          setBadge({
            label,
            title: meta.title,
            color: meta.color,
            avgScore: Number(globalMean.toFixed(2)),
            samples: sessionMeans.length,
          });
          setIsLoading(false);
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? "Error al calcular el perfil");
          setIsLoading(false);
        }
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [uname, maxSessions]);

  return { badge, isLoading, error };
}
