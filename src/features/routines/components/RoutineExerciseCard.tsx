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
    <Card
      className="
      relative h-full overflow-hidden rounded-2xl
      border-2 border-border/60
      bg-gradient-to-br from-background to-primary/5
      transition-all duration-300 group
    "
    >
      {/* Overlay decorativo que aparece al hover, no bloquea interacciones */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative p-5 sm:p-6 pb-3">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex flex-1 items-start gap-2 min-w-0">
            <div className="mt-0.5 shrink-0 rounded-lg bg-primary/20 border border-primary/30 p-1.5">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            {/* Título con clamp y truncado para evitar overflow en móvil */}
            <CardTitle className="min-w-0 text-balance text-base sm:text-lg font-bold line-clamp-2">
              {title ?? "Sin nombre"}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative p-5 sm:p-6 space-y-4">
        {group && (
          <Badge
            variant="secondary"
            className="w-fit rounded-full bg-primary/15 border border-primary/30 text-primary font-semibold px-3 py-1"
          >
            {group}
          </Badge>
        )}

        {/* Métricas en 3 columnas: caben en móvil, con tipografía adaptativa */}
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/40 bg-muted/50 p-3 sm:p-4 text-center">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-primary">{series}</p>
            <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Series
            </p>
          </div>
          <div className="border-x border-border/40 px-2">
            <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{reps}</p>
            <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Reps
            </p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {displayWeight}
              {unit}
            </p>
            <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Peso
            </p>
          </div>
        </div>

        {description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{description}</p>}

        {/* Imagen responsiva: contenedor con borde y radios consistentes */}
        <div className="mt-2">
          <div className="overflow-hidden rounded-xl border-2 border-border/40">
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
