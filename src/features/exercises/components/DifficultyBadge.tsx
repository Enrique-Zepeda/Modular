import { Badge } from "@/components/ui/badge";
import { difficultyColor, difficultyIcon } from "@/lib/difficulty";

export function DifficultyBadge({ value }: { value?: string | null }) {
  if (!value) return null;
  const v = value.toLowerCase();
  const Icon = difficultyIcon[v];
  return (
    <Badge
      className={`shrink-0 border rounded-full
      text-[11px] sm:text-xs font-medium
      px-2.5 py-1 sm:px-3 sm:py-1.5
      bg-card/50 text-foreground/90 whitespace-nowrap
      ${difficultyColor(v)}
    `}
    >
      {/* Truncamos en móvil para evitar desbordes; icono no colapsa */}
      <span className="flex items-center gap-1 min-h-6 sm:min-h-7 leading-none truncate max-w-[78vw] sm:max-w-none">
        {Icon ? <Icon className="h-3 w-3 flex-shrink-0" /> : null}
        <span className="truncate">{value}</span>
      </span>
    </Badge>
  );
}
