import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

function isValidUuid(v?: string | null) {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

type Options = {
  initialLiked?: boolean; // del feed si vino
  initialCount?: number; // del feed si vino
};

/**
 * Hook de likes:
 * - Nunca consulta author_uid si myUid no es UUID válido.
 * - Dedup de eventos Realtime por id_like (evita +2 “fantasma”).
 * - Preflight antes de insertar para no duplicar si ya existe.
 * - El corazón cambia al instante; el contador se corrige por realtime o recount.
 */
export function useLikeLive(sessionId: number, myUid?: string | null, opts?: Options) {
  const [likedByMe, setLikedByMe] = useState<boolean>(!!opts?.initialLiked);
  const [count, setCount] = useState<number>(Math.max(0, opts?.initialCount ?? 0));

  // anti-doble-clic dentro del mismo botón
  const workingRef = useRef(false);

  // sets para evitar procesar dos veces el mismo evento realtime
  const seenInsertIds = useRef<Set<number>>(new Set());
  const seenDeleteIds = useRef<Set<number>>(new Set());

  // -------- baseline: conteo total --------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count: c } = await supabase
        .from("SocialLikes")
        .select("id_like", { count: "exact", head: true })
        .eq("id_sesion", sessionId);
      if (!cancelled) setCount(c ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // -------- baseline: mi like (solo si no viene del feed) --------
  useEffect(() => {
    if (opts?.initialLiked !== undefined) return; // ya nos lo dijeron
    if (!isValidUuid(myUid)) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("SocialLikes")
        .select("id_like")
        .eq("id_sesion", sessionId)
        .eq("author_uid", myUid as string)
        .maybeSingle();
      if (!cancelled && !error) setLikedByMe(!!data);
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, myUid, opts?.initialLiked]);

  // -------- realtime con DEDUP --------
  useEffect(() => {
    const ch = supabase
      .channel(`realtime:sociallikes:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "SocialLikes", filter: `id_sesion=eq.${sessionId}` },
        (payload) => {
          const id = (payload.new as any)?.id_like as number | undefined;
          if (id && seenInsertIds.current.has(id)) return; // dedup
          if (id) seenInsertIds.current.add(id);

          setCount((x) => x + 1);
          const au = (payload.new as any)?.author_uid as string | undefined;
          if (isValidUuid(myUid) && au === myUid) setLikedByMe(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "SocialLikes", filter: `id_sesion=eq.${sessionId}` },
        (payload) => {
          const id = (payload.old as any)?.id_like as number | undefined;
          if (id && seenDeleteIds.current.has(id)) return; // dedup
          if (id) seenDeleteIds.current.add(id);

          setCount((x) => Math.max(0, x - 1));
          const au = (payload.old as any)?.author_uid as string | undefined;
          if (isValidUuid(myUid) && au === myUid) setLikedByMe(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [sessionId, myUid]);

  // -------- toggle seguro --------
  const toggle = useCallback(async () => {
    if (!isValidUuid(myUid) || workingRef.current) return;
    workingRef.current = true;

    try {
      if (!likedByMe) {
        // preflight (evita insertar si ya existe)
        const { data: exists } = await supabase
          .from("SocialLikes")
          .select("id_like")
          .eq("id_sesion", sessionId)
          .eq("author_uid", myUid as string)
          .maybeSingle();
        if (exists) {
          setLikedByMe(true);
          // recount por si el conteo estaba atrasado
          const { count: c } = await supabase
            .from("SocialLikes")
            .select("id_like", { count: "exact", head: true })
            .eq("id_sesion", sessionId);
          setCount(c ?? 0);
          return;
        }

        // optimista: pinta rojo
        setLikedByMe(true);

        // insertar y marcar el id para dedup si llega el evento
        const { data, error } = await supabase
          .from("SocialLikes")
          .insert({ id_sesion: sessionId })
          .select("id_like, author_uid")
          .single();
        if (error) {
          setLikedByMe(false); // revert
        } else if (data?.id_like) {
          seenInsertIds.current.add(data.id_like);
        }
      } else {
        // optimista: apaga
        setLikedByMe(false);

        // borrar; (no sabemos id_like, el realtime dedup cubrirá si hay duplicados del evento)
        const { error } = await supabase
          .from("SocialLikes")
          .delete()
          .eq("id_sesion", sessionId)
          .eq("author_uid", myUid as string);
        if (error) {
          setLikedByMe(true); // revert
        }
      }
    } finally {
      workingRef.current = false;
      // recount exacto para estabilizar (por si hubo duplicados o latencia de eventos)
      const { count: c } = await supabase
        .from("SocialLikes")
        .select("id_like", { count: "exact", head: true })
        .eq("id_sesion", sessionId);
      setCount(c ?? 0);
    }
  }, [likedByMe, myUid, sessionId]);

  return { likedByMe, count, toggle };
}
