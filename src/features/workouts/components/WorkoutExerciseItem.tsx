import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { WorkoutSetRow } from "./WorkoutSetRow";
import type { WorkoutExercise } from "../types";

export function WorkoutExerciseItem({
  ex,
  ei,
  onAskDelete,
  onAddSet,
  onUpdateSet,
  onToggleSet,
  onRemoveSet,
}: {
  ex: WorkoutExercise;
  ei: number;
  onAskDelete: (ei: number, name?: string) => void;
  onAddSet: (ei: number) => void;
  onUpdateSet: (ei: number, si: number, field: "kg" | "reps" | "rpe", value: string) => void;
  onToggleSet: (ei: number, si: number) => void;
  onRemoveSet: (ei: number, si: number) => void;
}) {
  return (
    <>
      {/* Imagen / placeholder */}
      <div className="flex-shrink-0 flex items-start gap-2">
        {ex.imagen ? (
          <img
            src={ex.imagen}
            alt={ex.nombre ?? "Ejercicio"}
            className="w-14 h-14 rounded-md object-cover border"
            onError={(e) => ((e.currentTarget.src = ""), (e.currentTarget.alt = "Sin imagen"))}
          />
        ) : (
          <div className="w-14 h-14 grid place-items-center rounded-md border">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info + sets */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3">
          <CardTitle className="text-base truncate">{ex.nombre ?? `Ejercicio`}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onAskDelete(ei, ex.nombre)} title="Eliminar ejercicio">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {ex.sets.map((s, si) => (
            <WorkoutSetRow
              key={`${s.idx}-${si}`}
              setIndexLabel={s.idx}
              values={s}
              onChange={(field, val) => onUpdateSet(ei, si, field, val)}
              onToggleDone={() => onToggleSet(ei, si)}
              onRemove={() => onRemoveSet(ei, si)}
            />
          ))}

          <Separator className="my-2" />

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onAddSet(ei)}>
              <Plus className="h-4 w-4 mr-1" /> Añadir serie
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
