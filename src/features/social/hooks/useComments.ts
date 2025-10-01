import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SocialComment } from "@/types/social";
import { emitCommentsChanged } from "../lib/socialEvents";

const PAGE_SIZE = 20;

type State = {
  items: SocialComment[];
  loading: boolean;
  error: unknown;
  page: number;
  hasMore: boolean;
};

function uniqueMerge(prev: SocialComment[], next: SocialComment[]) {
  const map = new Map<number, SocialComment>();
  for (const c of [...prev, ...next]) map.set(c.id_comment, c);
  return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

async function fetchPage(sessionId: number, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("SocialComments")
    .select("*")
    .eq("id_sesion", sessionId)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return data as SocialComment[];
}

export function useComments(sessionId: number) {
  const [state, setState] = useState<State>({
    items: [],
    loading: true,
    error: null,
    page: 0,
    hasMore: true,
  });

  const seen = useRef<Set<number>>(new Set());
  const mounted = useRef(true);

  // Carga inicial
  useEffect(() => {
    mounted.current = true;
    setState((s) => ({ ...s, loading: true, error: null, items: [], page: 0, hasMore: true }));
    (async () => {
      try {
        const first = await fetchPage(sessionId, 0);
        if (!mounted.current) return;
        setState((s) => ({
          ...s,
          items: first,
          loading: false,
          page: 0,
          hasMore: first.length === PAGE_SIZE,
        }));
      } catch (e) {
        if (!mounted.current) return;
        setState((s) => ({ ...s, loading: false, error: e }));
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, [sessionId]);

  // Realtime (si existe)
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:comments:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "SocialComments", filter: `id_sesion=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as SocialComment;
          if (seen.current.has(row.id_comment)) return;
          setState((s) => ({ ...s, items: uniqueMerge([row], s.items) }));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "SocialComments", filter: `id_sesion=eq.${sessionId}` },
        (payload) => {
          const id = (payload.old as any).id_comment as number;
          setState((s) => ({ ...s, items: s.items.filter((c) => c.id_comment !== id) }));
          seen.current.delete(id);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "SocialComments", filter: `id_sesion=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as SocialComment;
          setState((s) => ({
            ...s,
            items: s.items.map((c) => (c.id_comment === row.id_comment ? { ...c, texto: row.texto } : c)),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Fallback (si no hay realtime)
  useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const latest = await fetchPage(sessionId, 0);
        setState((s) => ({
          ...s,
          items: uniqueMerge(latest, s.items),
        }));
      } catch {
        /* ignore */
      }
    }, 12000);
    return () => window.clearInterval(id);
  }, [sessionId]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      const nextPage = state.page + 1;
      const pageData = await fetchPage(sessionId, nextPage);
      setState((s) => ({
        ...s,
        items: uniqueMerge(s.items, pageData),
        page: nextPage,
        hasMore: pageData.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e }));
    }
  }, [sessionId, state.hasMore, state.loading, state.page]);

  const add = useCallback(
    async (texto: string) => {
      const { data, error } = await supabase
        .from("SocialComments")
        .insert({ texto, id_sesion: sessionId })
        .select()
        .single();
      if (error) throw error;

      if (data?.id_comment) {
        seen.current.add(data.id_comment);
        setState((s) => ({ ...s, items: uniqueMerge([data as SocialComment], s.items) }));
        // notifica contadores en UI (misma pestaña)
        emitCommentsChanged(sessionId, +1);
      }
    },
    [sessionId]
  );

  const remove = useCallback(
    async (id_comment: number) => {
      const prev = state.items;
      setState((s) => ({ ...s, items: s.items.filter((c) => c.id_comment !== id_comment) }));
      emitCommentsChanged(sessionId, -1); // refresca contadores locales

      try {
        const { error } = await supabase.from("SocialComments").delete().eq("id_comment", id_comment);
        if (error) throw error;
        seen.current.delete(id_comment);
      } catch (e) {
        // revert si falla
        setState((s) => ({ ...s, items: prev }));
        emitCommentsChanged(sessionId, +1);
        // revalidación suave
        try {
          const latest = await fetchPage(sessionId, 0);
          setState((s) => ({ ...s, items: uniqueMerge(latest, s.items) }));
        } catch {
          /* ignore */
        }
        throw e;
      }
    },
    [sessionId, state.items]
  );

  return useMemo(
    () => ({
      items: state.items,
      loading: state.loading,
      hasMore: state.hasMore,
      loadMore,
      add,
      remove,
      error: state.error,
    }),
    [state.items, state.loading, state.hasMore, state.error, loadMore, add, remove]
  );
}
