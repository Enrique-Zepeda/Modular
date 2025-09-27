import { useEffect, useState } from "react";
import { useSearchUsersQuery } from "../api/friendsApi";

export function useFriendSearch(initial = "") {
  const [term, setTerm] = useState(initial);
  const [debounced, setDebounced] = useState(initial);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(t);
  }, [term]);

  const { data, isFetching, isError, error } = useSearchUsersQuery(
    debounced ? { term: debounced } : ({ term: "" } as any),
    { skip: !debounced }
  );

  return { term, setTerm, results: data ?? [], isFetching, isError, error };
}
