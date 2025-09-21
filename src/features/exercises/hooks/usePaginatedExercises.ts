import { useEffect, useState } from "react";
import type { Exercise } from "@/types/exercises";
import { ITEMS_PER_PAGE } from "../utils/constants";
import { useLazyGetExercisesQuery } from "../api/exercisesApi"; // o exercisesApi

export function usePaginatedExercises(argsBuilder: (page: number) => any) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [fetchExercises, { isFetching, isLoading: isInitialQueryLoading, error }] = useLazyGetExercisesQuery();

  // cargar página 0 cuando cambien filtros
  useEffect(() => {
    let mounted = true;
    (async () => {
      setPage(0);
      setExercises([]);
      setHasMore(true);
      const res = await fetchExercises(argsBuilder(0))
        .unwrap()
        .catch(() => null);
      if (!mounted || !res) return;
      const list = res.data ?? [];
      setExercises(list);
      setHasMore(list.length === ITEMS_PER_PAGE);
    })();
    return () => {
      mounted = false;
    };
  }, [argsBuilder, fetchExercises]);

  const loadMore = async () => {
    const next = page + 1;
    const res = await fetchExercises(argsBuilder(next))
      .unwrap()
      .catch(() => null);
    if (!res) return;
    const list = res.data ?? [];
    const merged = [...exercises];
    const seen = new Set(merged.map((e) => e.id));
    for (const ex of list)
      if (!seen.has(ex.id)) {
        merged.push(ex);
        seen.add(ex.id);
      }
    setExercises(merged);
    setHasMore(list.length === ITEMS_PER_PAGE);
    setPage(next);
  };

  return { exercises, hasMore, loadMore, isFetching, isInitialQueryLoading, error };
}
