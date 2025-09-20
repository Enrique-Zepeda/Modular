import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { Plus, Check } from "lucide-react";
import type { Exercise } from "@/types/exercises";

interface Props {
  exercise: Exercise;
  selected: boolean;
  onSelect: (e: Exercise) => void;
}

export const ExercisePickerCard: React.FC<Props> = ({ exercise, selected, onSelect }) => {
  const equip = (exercise as any).equipamento ?? (exercise as any).equipamiento;
  const diff = exercise.dificultad;

  return (
    <div
      className={`group relative rounded-xl border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg ${
        selected ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20" : "hover:bg-accent/50"
      }`}
    >
      {/* Imagen */}
      <div className="relative mb-4">
        <ExerciseImage
          src={(exercise as any).gif_url || (exercise as any).imagen_url}
          alt={exercise.nombre}
          aspectRatio="16/9"
          size="lg"
          className="rounded-xl"
        />
      </div>

      {/* Info */}
      <div className="space-y-3">
        <h4 className="min-h-[2.5rem] text-sm font-medium leading-tight line-clamp-2">{exercise.nombre}</h4>

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {exercise.grupo_muscular}
          </Badge>
          {diff && (
            <Badge
              variant="outline"
              className={`text-xs ${
                (diff === "Principiante" && "border-green-500 text-green-700 bg-green-50") ||
                (diff === "Intermedio" && "border-yellow-500 text-yellow-700 bg-yellow-50") ||
                "border-red-500 text-red-700 bg-red-50"
              }`}
            >
              {diff}
            </Badge>
          )}
        </div>

        {equip && <p className="line-clamp-1 text-xs text-muted-foreground">{equip}</p>}

        {exercise.descripcion && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{exercise.descripcion}</p>
        )}
      </div>

      {/* Acción */}
      <div className="mt-4">
        <Button
          size="sm"
          onClick={() => onSelect(exercise)}
          disabled={selected}
          className="w-full transition-all"
          variant={selected ? "secondary" : "default"}
        >
          {selected ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Agregado
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" />
              Agregar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
