import { memo } from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Image as ImageIcon } from "lucide-react";
import type { WorkoutExercise } from "@/features/workouts/types";

import {
  onDecimalKeyDown,
  onIntegerKeyDown,
  handlePasteDecimal,
  handlePasteInteger,
  sanitizeDecimal,
  sanitizeInteger,
} from "@/features/workouts/utils/numberInput";

const RPE_OPTIONS = ["Fácil", "Moderado", "Difícil", "Muy difícil", "Al fallo"] as const;

type Props = {
  ex: WorkoutExercise;
  ei: number;
  onAskDelete: (ei: number, name?: string) => void;
  onAddSet: (ei: number) => void;
  onUpdateSet: (ei: number, si: number, field: "kg" | "reps" | "rpe", value: string) => void;
  onToggleSet: (ei: number, si: number) => void;
  onRemoveSet: (ei: number, si: number) => void;
};

export function WorkoutExerciseItem({ ex, ei, onAskDelete, onAddSet, onUpdateSet, onToggleSet, onRemoveSet }: Props) {
  return (
    <div className="flex gap-3">
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
          <CardTitle className="text-base truncate">{ex.nombre ?? `Ejercicio ${ei + 1}`}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onAskDelete(ei, ex.nombre)} title="Eliminar ejercicio">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {ex.sets.map((s, si) => (
            <SetRow
              key={`${s.idx}-${si}`}
              setIndexLabel={s.idx}
              values={{ ...s }}
              onChange={(field, val) => onUpdateSet(ei, si, field, val)}
              onToggleDone={() => onToggleSet(ei, si)}
              onRemove={() => onRemoveSet(ei, si)}
            />
          ))}

          <Separator className="my-2" />

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onAddSet(ei)}>
              Añadir serie
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponente: SetRow ---------- */
type RowProps = {
  setIndexLabel: number;
  values: { idx: number; kg: string; reps: string; rpe: string; done: boolean; doneAt?: string };
  onChange: (field: "kg" | "reps" | "rpe", val: string) => void;
  onToggleDone: () => void;
  onRemove: () => void;
};

const SetRow = memo(function SetRow({ setIndexLabel, values, onChange, onToggleDone, onRemove }: RowProps) {
  return (
    <div className="grid grid-cols-12 items-center gap-2">
      <div className="col-span-2 text-xs text-muted-foreground">Set {setIndexLabel}</div>

      <div className="col-span-3 flex items-center gap-2">
        <label className="text-xs w-10">KG</label>
        <Input
          inputMode="decimal"
          value={values.kg}
          onChange={(e) => onChange("kg", sanitizeDecimal(e.target.value))}
          onKeyDown={onDecimalKeyDown}
          onPaste={(e) => handlePasteDecimal(e, (v) => onChange("kg", v))}
          placeholder="kg"
          className="h-8"
        />
      </div>

      <div className="col-span-3 flex items-center gap-2">
        <label className="text-xs w-10">Reps</label>
        <Input
          inputMode="numeric"
          value={values.reps}
          onChange={(e) => onChange("reps", sanitizeInteger(e.target.value))}
          onKeyDown={onIntegerKeyDown}
          onPaste={(e) => handlePasteInteger(e, (v) => onChange("reps", v))}
          placeholder="reps"
          className="h-8"
        />
      </div>

      <div className="col-span-2 flex items-center gap-2">
        <label className="text-xs w-10">RPE</label>
        <select
          className="w-full h-8 rounded-md border bg-background px-2 text-sm"
          value={values.rpe}
          onChange={(e) => onChange("rpe", e.target.value)}
        >
          <option value="">--</option>
          {RPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-2 flex items-center justify-end gap-2">
        <label className="text-xs">Hecho</label>
        <input type="checkbox" className="h-4 w-4" checked={values.done} onChange={onToggleDone} />
        <Button variant="ghost" size="icon" onClick={onRemove} title="Eliminar serie">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
