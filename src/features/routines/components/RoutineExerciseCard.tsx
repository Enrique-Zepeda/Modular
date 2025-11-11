import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { Dumbbell } from "lucide-react";
import { useWeightUnit } from "@/hooks";
import { presentInUserUnit } from "@/lib/weight";

export function RoutineExerciseCard({
  title,
  group,
  description,
  series,
  reps,
  weight,
  image,
}: {
  title?: string | null;
  group?: string | null;
  description?: string | null;
  series: number;
  reps: number;
  weight: number;
  image?: string | null;
  onRemove: () => void;
  removing: boolean;
}) {
  const { unit } = useWeightUnit(); // 👈 leemos preferencia global
  const displayWeight = presentInUserUnit(weight ?? 0, unit);
  return (
    <Card className="h-full border-2 border-border/60  transition-all duration-300  bg-gradient-to-br from-background to-primary/5 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0  transition-opacity duration-300 pointer-events-none" />

      <CardHeader className="pb-3 relative ">
        <div className="flex justify-between items-start gap-3 ">
          <div className="flex items-start gap-2 flex-1">
            <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/30 mt-0.5">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg line-clamp-2 font-bold">{title ?? "Sin nombre"}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative ">
        {group && (
          <Badge
            variant="secondary"
            className="bg-primary/15 border border-primary/30 text-primary font-semibold rounded-full px-3 py-1"
          >
            {group}
          </Badge>
        )}

        <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-xl border border-border/40">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{series}</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">Series</p>
          </div>
          <div className="text-center border-x border-border/40">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{reps}</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">Reps</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {displayWeight}
              {unit}
            </p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">Peso</p>
          </div>
        </div>

        {description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>}

        <div className="mt-4">
          <div className="rounded-xl overflow-hidden border-2 border-border/40">
            <ExerciseImage
              src={image ?? undefined}
              alt={title ?? "Ejercicio"}
              aspectRatio="16/9"
              size="lg"
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
