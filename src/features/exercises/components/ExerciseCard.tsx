import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseImage } from "@/components/ui/exercise-image";
import type { Exercise } from "@/types/exercises";
import { DifficultyBadge } from "./DifficultyBadge";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
            {exercise.nombre || "Sin nombre"}
          </CardTitle>
          <DifficultyBadge value={exercise.dificultad} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {exercise.grupo_muscular && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              {exercise.grupo_muscular}
            </Badge>
          )}
          {exercise.equipamento && (
            <Badge variant="outline" className="text-xs">
              {exercise.equipamento}
            </Badge>
          )}
        </div>
        {exercise.descripcion && (
          <CardDescription className="text-sm line-clamp-2 leading-relaxed">{exercise.descripcion}</CardDescription>
        )}
        {exercise.musculos_involucrados && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
            <span className="font-medium">Músculos:</span> {exercise.musculos_involucrados}
          </div>
        )}
        {exercise.ejemplo && (
          <div className="mt-4">
            <div className="aspect-video w-full overflow-hidden rounded-lg">
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
