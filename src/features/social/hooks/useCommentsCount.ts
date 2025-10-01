import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { onCommentsChanged } from "../lib/socialEvents";

// Estado con "baseline" nulo hasta tener el conteo real.
// Export 1: API clásica (sólo número) para usos simples.
export function useCommentsCount(sessionId: number): number {
  const { count } = useCommentsCountState(sessionId);
  return Math.max(0, count ?? 0);
}

// Export 2: API con "ready" para componer mejor con valores iniciales del feed.
export function useCommentsCountState(sessionId: number): { count: number | null; ready: boolean } {
  const [count, setCount] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  // Carga inicial: baseline exacta
  useEffect(() => {
    let cancel = false;
    setReady(false);
    setCount(null);
    (async () => {
      const { count: c } = await supabase
        .from("SocialComments")
        .select("id_comment", { count: "exact", head: true })
        .eq("id_sesion", sessionId);
      if (!cancel) {
        setCount(c ?? 0);
        setReady(true);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [sessionId]);

  // Realtime — si llega un evento antes del baseline, recalc exacto (un fetch ligero) y marcamos listo.
  useEffect(() => {
    const ch = supabase
      .channel(`realtime:comments-count:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "SocialComments", filter: `id_sesion=eq.${sessionId}` },
        async () => {
          if (count === null) {
            const { count: c } = await supabase
              .from("SocialComments")
              .select("id_comment", { count: "exact", head: true })
              .eq("id_sesion", sessionId);
            setCount(c ?? 0);
            setReady(true);
          } else {
            setCount((x) => (x == null ? 1 : x + 1));
            setReady(true);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "SocialComments", filter: `id_sesion=eq.${sessionId}` },
        async () => {
          if (count === null) {
            const { count: c } = await supabase
              .from("SocialComments")
              .select("id_comment", { count: "exact", head: true })
              .eq("id_sesion", sessionId);
            setCount(c ?? 0);
            setReady(true);
          } else {
            setCount((x) => Math.max(0, (x ?? 0) - 1));
            setReady(true);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, count]);

  // Bus de eventos local (mismo comportamiento que realtime)
  useEffect(() => {
    return onCommentsChanged(async (sid, delta) => {
      if (sid !== sessionId || !delta) return;
      if (count === null) {
        const { count: c } = await supabase
          .from("SocialComments")
          .select("id_comment", { count: "exact", head: true })
          .eq("id_sesion", sessionId);
        setCount(c ?? 0);
        setReady(true);
      } else {
        setCount((x) => Math.max(0, (x ?? 0) + delta));
        setReady(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, count]);

  // Fallback periódico (si no llega realtime)
  useEffect(() => {
    const id = window.setInterval(async () => {
      const { count: c } = await supabase
        .from("SocialComments")
        .select("id_comment", { count: "exact", head: true })
        .eq("id_sesion", sessionId);
      setCount(c ?? 0);
      setReady(true);
    }, 15000);
    return () => window.clearInterval(id);
  }, [sessionId]);

  return { count, ready };
}

export default useCommentsCount;
