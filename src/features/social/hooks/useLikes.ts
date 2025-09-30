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
  // ¿tenemos algún valor inicial válido?
  const hasInitial = Boolean(initial && (typeof initial.count === "number" || typeof initial.likedByMe === "boolean"));

  const [state, setState] = useState<LikeState>({
    count: hasInitial && typeof initial?.count === "number" ? Math.max(0, initial!.count!) : 0,
    likedByMe: hasInitial && typeof initial?.likedByMe === "boolean" ? !!initial!.likedByMe : false,
    loading: !hasInitial,
  });

  const ids = useMemo(() => [sessionId], [sessionId]);

  /**
   * 🔁 NUEVO: si los props iniciales llegan DESPUÉS del primer render,
   * hidratamos el estado inmediatamente y detenemos el loading.
   */
  useEffect(() => {
    if (typeof initial?.count === "number" || typeof initial?.likedByMe === "boolean") {
      setState((s) => ({
        ...s,
        count: typeof initial.count === "number" ? Math.max(0, initial.count) : s.count,
        likedByMe: typeof initial.likedByMe === "boolean" ? !!initial.likedByMe : s.likedByMe,
        loading: false,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.count, initial?.likedByMe]); // solo reaccionamos a cambios reales en props

  /**
   * Carga inicial SOLO si no hubo iniciales válidos.
   */
  useEffect(() => {
    let mounted = true;
    if (hasInitial) return;

    (async () => {
      try {
        const [counts, liked] = await Promise.all([fetchLikesCountBySessions(ids), fetchLikedByMe(sessionId)]);
        if (!mounted) return;
        setState({
          count: counts[sessionId] ?? 0,
          likedByMe: !!liked,
          loading: false,
        });
      } catch (e: any) {
        if (!mounted) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: e?.message ?? "No se pudo cargar likes",
        }));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sessionId, hasInitial]); // eslint-disable-line

  /**
   * Realtime: mantener contador y bandera al día.
   */
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
