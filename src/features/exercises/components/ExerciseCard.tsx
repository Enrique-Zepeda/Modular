import type { Exercise } from "@/types/exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "principiante":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermedio":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "avanzado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold leading-tight">{exercise.nombre}</CardTitle>
          <Badge
            variant="secondary"
            className={cn("text-xs font-medium", getDifficultyColor(exercise.dificultad ?? ""))}
          >
            {exercise.dificultad ?? "Sin especificar"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {exercise.grupo_muscular}
            </Badge>
            {exercise.equipamento && (
              <Badge variant="outline" className="text-xs">
                {exercise.equipamento}
              </Badge>
            )}
          </div>

          {exercise.descripcion && <p className="text-sm text-muted-foreground line-clamp-3">{exercise.descripcion}</p>}

          {exercise.musculos_involucrados && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Músculos:</span> {exercise.musculos_involucrados}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
