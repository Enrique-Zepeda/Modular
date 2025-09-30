import { useCallback, useEffect, useMemo, useState } from "react";
import { addLike, fetchLikedByMe, fetchLikesCountBySessions, getCurrentUserUid, removeLike } from "../api/socialApi";
import { useSocialRealtime } from "./useSocialRealtime";

type LikeState = {
  count: number;
  likedByMe: boolean;
  loading: boolean;
  error?: string;
};

type Initial = { count?: number; likedByMe?: boolean } | undefined;

export function useLikes(sessionId: number, initial?: Initial) {
  const [state, setState] = useState<LikeState>({
    count: Math.max(0, initial?.count ?? 0),
    likedByMe: !!initial?.likedByMe,
    loading: initial == null, // si viene inicial, arrancamos sin load
  });

  const ids = useMemo(() => [sessionId], [sessionId]);

  // Carga inicial SOLO si no viene estado inicial
  useEffect(() => {
    let mounted = true;
    if (initial) return; // ya tenemos valores
    (async () => {
      try {
        const [counts, liked] = await Promise.all([fetchLikesCountBySessions(ids), fetchLikedByMe(sessionId)]);
        if (!mounted) return;
        setState({ count: counts[sessionId] ?? 0, likedByMe: liked, loading: false });
      } catch (e: any) {
        if (!mounted) return;
        setState((s) => ({ ...s, loading: false, error: e?.message ?? "No se pudo cargar likes" }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionId, initial]); // eslint-disable-line

  // Realtime (incrementa/decrementa conteo y marca liked_by_me si soy yo)
  useSocialRealtime(ids, {
    onLikeInsert: (row) => {
      if (row.id_sesion !== sessionId) return;
      setState((s) => ({ ...s, count: s.count + 1 }));
      void getCurrentUserUid().then((uid) => {
        if (uid && uid === row.author_uid) setState((s) => ({ ...s, likedByMe: true }));
      });
    },
    onLikeDelete: (row) => {
      if (row.id_sesion !== sessionId) return;
      setState((s) => ({ ...s, count: Math.max(0, s.count - 1) }));
      void getCurrentUserUid().then((uid) => {
        if (uid && uid === row.author_uid) setState((s) => ({ ...s, likedByMe: false }));
      });
    },
  });

  const like = useCallback(async () => {
    setState((s) => ({ ...s, likedByMe: true, count: s.count + 1 }));
    try {
      await addLike(sessionId);
    } catch (e) {
      // revertir on error
      setState((s) => ({ ...s, likedByMe: false, count: Math.max(0, s.count - 1) }));
      throw e;
    }
  }, [sessionId]);

  const unlike = useCallback(async () => {
    setState((s) => ({ ...s, likedByMe: false, count: Math.max(0, s.count - 1) }));
    try {
      await removeLike(sessionId);
    } catch (e) {
      // revertir on error
      setState((s) => ({ ...s, likedByMe: true, count: s.count + 1 }));
      throw e;
    }
  }, [sessionId]);

  return { ...state, like, unlike };
}
