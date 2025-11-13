import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseImage } from "@/components/ui/exercise-image";
import type { Exercise } from "@/types/exercises";
import { DifficultyBadge } from "./DifficultyBadge";

export function ExercisesListCard({ exercise }: { exercise: Exercise }) {
  return (
    <Card
      className="
      h-full flex flex-col
      border-2 border-border/60 md:hover:border-primary/40
      shadow-lg md:hover:shadow-2xl md:hover:-translate-y-1
      transition-all duration-300
      bg-gradient-to-br from-background via-background to-primary/5
      overflow-hidden group rounded-xl
    "
    >
      {/* Overlay decorativo solo en hover desktop para no saturar móvil */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardHeader className="relative p-4 sm:p-6 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base sm:text-lg font-bold leading-tight line-clamp-2 md:group-hover:text-primary transition-colors">
            {exercise.nombre || "Sin nombre"}
          </CardTitle>
          <DifficultyBadge value={exercise.dificultad} />
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 space-y-3 sm:space-y-4">
        <div className="flex flex-wrap gap-2">
          {exercise.grupo_muscular && (
            <Badge
              variant="secondary"
              className="text-[11px] sm:text-xs bg-primary/15 border border-primary/30 text-primary font-semibold rounded-full px-3 py-1"
            >
              {exercise.grupo_muscular}
            </Badge>
          )}
          {exercise.equipamento && (
            <Badge
              variant="outline"
              className="text-[11px] sm:text-xs bg-accent/10 border-border/40 text-foreground font-semibold rounded-full px-3 py-1"
            >
              {exercise.equipamento}
            </Badge>
          )}
        </div>

        {exercise.descripcion && (
          <CardDescription className="text-sm line-clamp-2 leading-relaxed">{exercise.descripcion}</CardDescription>
        )}

        {exercise.musculos_involucrados && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 border border-border/40">
            <span className="font-semibold">Músculos:</span> {exercise.musculos_involucrados}
          </div>
        )}

        {exercise.ejemplo && (
          <div className="mt-2 sm:mt-4">
            <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-border/40">
              <ExerciseImage
                src={exercise.ejemplo}
                alt={exercise.nombre || "Ejercicio"}
                aspectRatio="16/9"
                size="lg"
                className="w-full h-full"
                showFallback
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
