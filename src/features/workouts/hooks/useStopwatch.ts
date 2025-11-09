import { useEffect, useRef, useState } from "react";

/**
 * Cronómetro persistente.
 * - Si pasas `startedAt`, calcula elapsed = now - startedAt (rehidratable).
 * - Si NO pasas `startedAt`, funciona como antes (baseline = mount time).
 */
export function useStopwatch(active: boolean, startedAt?: string | number | Date) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    // baseline desde startedAt si existe; si no, desde "ahora"
    const base = startedAt != null ? new Date(startedAt as any).getTime() : Date.now();

    startRef.current = base;

    const id = setInterval(() => {
      if (startRef.current != null) setElapsed(Date.now() - startRef.current);
    }, 1000);

    return () => clearInterval(id);
  }, [active, startedAt]);

  return elapsed;
}
