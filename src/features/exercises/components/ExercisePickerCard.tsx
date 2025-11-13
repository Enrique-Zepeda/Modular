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
      className={`group relative h-full flex flex-col rounded-xl border bg-card p-3 sm:p-4
      transition-all duration-200
      ${
        selected
          ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
          : "md:hover:border-primary/30 md:hover:shadow-lg md:hover:bg-accent/50"
      }`}
    >
      {/* Imagen responsiva con aspecto fijo */}
      <div className="relative mb-3 sm:mb-4">
        <ExerciseImage
          src={(exercise as any).gif_url || (exercise as any).imagen_url}
          alt={exercise.nombre}
          aspectRatio="16/9"
          size="lg"
          className="rounded-xl"
        />
      </div>

      {/* Info; flex-1 para empujar el botón al fondo y alinear cards en grid */}
      <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
        <h4 className="text-sm sm:text-[15px] font-medium leading-tight line-clamp-2 break-words">{exercise.nombre}</h4>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[11px] sm:text-xs">
            {exercise.grupo_muscular}
          </Badge>

          {diff && (
            <Badge
              variant="outline"
              className={`text-[11px] sm:text-xs
              ${
                (diff === "Principiante" &&
                  "border-emerald-400/50 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10") ||
                (diff === "Intermedio" &&
                  "border-amber-400/50 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10") ||
                "border-rose-400/50 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10"
              }`}
            >
              {diff}
            </Badge>
          )}
        </div>

        {equip && <p className="line-clamp-1 text-[11px] sm:text-xs text-muted-foreground">{equip}</p>}

        {exercise.descripcion && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{exercise.descripcion}</p>
        )}
      </div>

      {/* Acción; botón full-width en móvil, altura táctil segura */}
      <div className="mt-3 sm:mt-4">
        <Button
          size="sm"
          onClick={() => onSelect(exercise)}
          disabled={selected}
          className="w-full h-10 sm:h-9 transition-all"
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
