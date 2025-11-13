import { Badge } from "@/components/ui/badge";
import { formatDurationShort } from "@/lib/duration";

/**
 * Badge discreto para mostrar la duración total del entrenamiento.
 * - No renderiza nada si la duración no es válida.
 * - Usa variant="secondary" para un look neutro (no compite con la "sensación").
 */
export function DurationBadge({ seconds }: { seconds?: number | null }) {
  const text = formatDurationShort(seconds);
  if (!text) return null;

  return (
    <Badge
      variant="secondary"
      className="inline-flex items-center gap-1.5 h-8 sm:h-7 px-2.5 rounded-full border border-border/40 bg-muted/50 text-foreground/80 whitespace-nowrap max-w-[65vw] sm:max-w-none overflow-hidden text-ellipsis font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label="Duración del entrenamiento"
      title="Duración del entrenamiento"
    >
      <span className="tabular-nums">{text}</span>
    </Badge>
  );
}
