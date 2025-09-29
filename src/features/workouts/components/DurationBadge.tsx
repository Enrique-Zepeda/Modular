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
      className="whitespace-nowrap"
      aria-label="Duración del entrenamiento"
      title="Duración del entrenamiento"
    >
      {text}
    </Badge>
  );
}
