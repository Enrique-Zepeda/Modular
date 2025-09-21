import { useEffect, useRef, useState } from "react";

export function useStopwatch(active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      if (startRef.current != null) setElapsed(Date.now() - startRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return elapsed;
}
