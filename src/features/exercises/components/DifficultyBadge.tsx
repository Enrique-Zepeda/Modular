import { Badge } from "@/components/ui/badge";
import { difficultyColor, difficultyIcon } from "@/lib/difficulty";

export function DifficultyBadge({ value }: { value?: string | null }) {
  if (!value) return null;
  const v = value.toLowerCase();
  const Icon = difficultyIcon[v];
  return (
    <Badge className={`text-xs font-medium shrink-0 border ${difficultyColor(v)}`}>
      <div className="flex items-center gap-1">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {value}
      </div>
    </Badge>
  );
}
