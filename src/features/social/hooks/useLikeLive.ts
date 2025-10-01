import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

function isValidUuid(v?: string | null) {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

type Options = {
  initialLiked?: boolean; // del feed si vino
  initialCount?: number; // del feed si vino
};

/**
 * Hook de likes robusto:
 * - Nunca consulta author_uid si myUid no es UUID válido (evita 400).
 * - Dedup de eventos Postgres por id_like (evita +2).
 * - Broadcast entre clientes para reflejo inmediato (y luego recount exacto).
 * - Preflight antes de insertar para no duplicar si ya existe.
 * - El corazón cambia al instante; el contador se estabiliza con recount.
 */
export function useLikeLive(sessionId: number, myUid?: string | null, opts?: Options) {
  const [likedByMe, setLikedByMe] = useState<boolean>(!!opts?.initialLiked);
  const [count, setCount] = useState<number>(Math.max(0, opts?.initialCount ?? 0));

  // anti-doble-clic dentro del mismo botón
  const workingRef = useRef(false);

  // dedup de eventos Postgres
  const seenInsertIds = useRef<Set<number>>(new Set());
  const seenDeleteIds = useRef<Set<number>>(new Set());

  // canal broadcast compartido por quienes ven el mismo post
  const chanRef = useRef<RealtimeChannel | null>(null);

  // helper: recount exacto
  const recount = useCallback(async () => {
    const { count: c } = await supabase
      .from("SocialLikes")
      .select("id_like", { count: "exact", head: true })
      .eq("id_sesion", sessionId);
    setCount(c ?? 0);
  }, [sessionId]);

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

  // -------- realtime Postgres con DEDUP --------
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

          const au = (payload.new as any)?.author_uid as string | undefined;
          if (isValidUuid(myUid) && au === myUid) setLikedByMe(true);

          // Ajuste rápido + recount para estabilizar (por si hay retrasos/duplicados)
          setCount((x) => x + 1);
          void recount();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "SocialLikes", filter: `id_sesion=eq.${sessionId}` },
        (payload) => {
          const id = (payload.old as any)?.id_like as number | undefined;
          if (id && seenDeleteIds.current.has(id)) return; // dedup
          if (id) seenDeleteIds.current.add(id);

          const au = (payload.old as any)?.author_uid as string | undefined;
          if (isValidUuid(myUid) && au === myUid) setLikedByMe(false);

          setCount((x) => Math.max(0, x - 1));
          void recount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [sessionId, myUid, recount]);

  // -------- broadcast entre clientes (reflejo inmediato) --------
  useEffect(() => {
    // unimos un canal "neutral" de broadcast (self:false para no recibirnos a nosotros mismos)
    const chan = supabase.channel(`broadcast:likes:${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    chan
      .on("broadcast", { event: "like_delta" }, async (_msg) => {
        // En lugar de sumar/restar directo (podría duplicar con Postgres),
        // pedimos el conteo exacto ASAP.
        await recount();
      })
      .subscribe();

    chanRef.current = chan;

    return () => {
      if (chanRef.current) supabase.removeChannel(chanRef.current);
      chanRef.current = null;
    };
  }, [sessionId, recount]);

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
          await recount();
          return;
        }

        // optimista: pinta rojo
        setLikedByMe(true);

        // insertar y marcar dedup
        const { data, error } = await supabase
          .from("SocialLikes")
          .insert({ id_sesion: sessionId })
          .select("id_like")
          .single();
        if (error) {
          setLikedByMe(false); // revert
        } else if (data?.id_like) {
          seenInsertIds.current.add(data.id_like as number);
          // Avisa a otros clientes para que recalculen YA
          chanRef.current?.send({ type: "broadcast", event: "like_delta", payload: { delta: +1, liker: myUid } });
        }
      } else {
        // optimista: apaga
        setLikedByMe(false);

        const { data, error } = await supabase
          .from("SocialLikes")
          .delete()
          .eq("id_sesion", sessionId)
          .eq("author_uid", myUid as string)
          .select("id_like")
          .single();

        if (error) {
          setLikedByMe(true); // revert
        } else {
          if (data?.id_like) seenDeleteIds.current.add(data.id_like as number);
          chanRef.current?.send({ type: "broadcast", event: "like_delta", payload: { delta: -1, liker: myUid } });
        }
      }
    } finally {
      workingRef.current = false;
      // estabiliza el contador
      await recount();
    }
  }, [likedByMe, myUid, sessionId, recount]);

  return { likedByMe, count, toggle };
}
