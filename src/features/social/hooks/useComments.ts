import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SocialComment } from "@/types/social";
import { createComment, deleteComment, fetchComments } from "../api/socialApi";
import { supabase } from "@/lib/supabase/client";

/**
 * Hook para manejar comentarios con:
 * - carga paginada (desc por created_at),
 * - add/remove con optimismo,
 * - realtime (INSERT/DELETE/UPDATE).
 */
export function useComments(sessionId: number) {
  const PAGE_SIZE = 20;

  const [items, setItems] = useState<SocialComment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Evita duplicados cuando llega el mismo registro por realtime + respuesta HTTP
  const seen = useRef<Set<number>>(new Set());

  // ===== Carga inicial =====
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setItems([]);
    setCursor(null);
    setHasMore(true);
    seen.current.clear();

    (async () => {
      try {
        const { items: first, nextCursor } = await fetchComments({
          sessionId,
          limit: PAGE_SIZE,
          cursor: null,
        });
        if (!mounted) return;

        first.forEach((c) => seen.current.add(c.id_comment));
        setItems(first);
        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "No se pudieron cargar los comentarios");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // ===== Realtime =====
  useEffect(() => {
    const channel = supabase.channel(`comments:${sessionId}`);

    // INSERT
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "SocialComments", filter: `id_sesion=eq.${sessionId}` },
      (payload) => {
        const row = payload.new as SocialComment;
        if (!row || seen.current.has(row.id_comment)) return;
        seen.current.add(row.id_comment);
        // La lista está en orden DESC ⇒ los nuevos van adelante
        setItems((prev) => [row, ...prev]);
      }
    );

    // DELETE
    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "SocialComments", filter: `id_sesion=eq.${sessionId}` },
      (payload) => {
        const row = payload.old as SocialComment;
        if (!row) return;
        setItems((prev) => prev.filter((c) => c.id_comment !== row.id_comment));
        seen.current.delete(row.id_comment);
      }
    );

    // UPDATE (edición de texto)
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "SocialComments", filter: `id_sesion=eq.${sessionId}` },
      (payload) => {
        const row = payload.new as SocialComment;
        if (!row) return;
        setItems((prev) => prev.map((c) => (c.id_comment === row.id_comment ? row : c)));
      }
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // ===== Acciones =====
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const { items: next, nextCursor } = await fetchComments({
        sessionId,
        limit: PAGE_SIZE,
        cursor,
      });
      next.forEach((c) => seen.current.add(c.id_comment));
      setItems((prev) => [...prev, ...next]);
      setCursor(nextCursor);
      setHasMore(Boolean(nextCursor));
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar más comentarios");
    } finally {
      setLoading(false);
    }
  }, [sessionId, cursor, hasMore, loading]);

  const add = useCallback(
    async (texto: string) => {
      // optimista: agregamos un placeholder temporal (id negativo)
      const optimistic: SocialComment = {
        id_comment: -Date.now(),
        id_sesion: sessionId,
        author_uid: "me",
        texto,
        created_at: new Date().toISOString(),
        updated_at: null,
      };

      setItems((prev) => [optimistic, ...prev]);

      try {
        const saved = await createComment(sessionId, texto);
        // Reemplazar el optimista por el real (si no llegó ya por realtime)
        setItems((prev) => {
          const idx = prev.findIndex((c) => c.id_comment === optimistic.id_comment);
          const already = prev.findIndex((c) => c.id_comment === saved.id_comment) >= 0;
          if (already && idx >= 0) {
            // ya llegó por realtime; solo quitamos optimista
            const cp = prev.slice();
            cp.splice(idx, 1);
            return cp;
          }
          if (idx >= 0) {
            const cp = prev.slice();
            cp[idx] = saved;
            return cp;
          }
          // no estaba (llegó por realtime): devolvemos prev intacto
          return prev;
        });
        seen.current.add(saved.id_comment);
        return saved;
      } catch (e) {
        // revertir optimista
        setItems((prev) => prev.filter((c) => c.id_comment !== optimistic.id_comment));
        throw e;
      }
    },
    [sessionId]
  );

  const remove = useCallback(
    async (id_comment: number) => {
      const prev = items;
      setItems((s) => s.filter((c) => c.id_comment !== id_comment));
      try {
        await deleteComment(id_comment);
        seen.current.delete(id_comment);
      } catch (e) {
        setItems(prev); // rollback
        throw e;
      }
    },
    [items]
  );

  return { items, loading, hasMore, loadMore, add, remove, error };
}
