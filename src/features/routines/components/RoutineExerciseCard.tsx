import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseImage } from "@/components/ui/exercise-image";

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
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{title ?? "Sin nombre"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {group && <Badge variant="secondary">{group}</Badge>}

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <p className="font-semibold">{series}</p>
            <p className="text-muted-foreground">Series</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{reps}</p>
            <p className="text-muted-foreground">Reps</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{weight}kg</p>
            <p className="text-muted-foreground">Peso</p>
          </div>
        </div>

        {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}

        <div className="mt-4">
          <ExerciseImage
            src={image ?? undefined}
            alt={title ?? "Ejercicio"}
            aspectRatio="16/9"
            size="lg"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
