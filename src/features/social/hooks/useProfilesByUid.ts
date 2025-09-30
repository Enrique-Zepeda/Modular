import { useEffect, useMemo, useState } from "react";
import { fetchProfilesByUids, type MinimalProfile } from "../api/socialApi";

/**
 * Hook muy simple que:
 * - deduplica UIDs,
 * - trae perfiles mínimos,
 * - expone un map { uid -> { username, url_avatar } }
 */
export function useProfilesByUid(uids: string[]) {
  const uniq = useMemo(() => Array.from(new Set((uids || []).filter(Boolean))), [uids]);
  const [map, setMap] = useState<Record<string, MinimalProfile>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    if (!uniq.length) {
      setMap({});
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await fetchProfilesByUids(uniq);
        if (!mounted) return;
        setMap(res);
      } catch {
        if (!mounted) return;
        setMap({});
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [uniq]);

  return { map, loading };
}
