import { memo } from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, ImageIcon, CheckCircle2, Circle } from "lucide-react";
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
    <div className="flex gap-3 p-4 rounded-xl border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:from-card/90 hover:to-card/60 transition-all duration-300 shadow-md">
      <div className="flex-shrink-0 flex items-start">
        {ex.imagen ? (
          <img
            src={ex.imagen || "/placeholder.svg"}
            alt={ex.nombre ?? "Ejercicio"}
            className="w-16 h-16 rounded-xl object-cover border-2 border-primary/20 shadow-sm"
            onError={(e) => ((e.currentTarget.src = ""), (e.currentTarget.alt = "Sin imagen"))}
          />
        ) : (
          <div className="w-16 h-16 grid place-items-center rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <ImageIcon className="h-6 w-6 text-primary/60" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold truncate text-balance bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {ex.nombre ?? `Ejercicio ${ei + 1}`}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAskDelete(ei, ex.nombre)}
            title="Eliminar ejercicio"
            className="hover:bg-destructive/20 hover:text-destructive text-destructive/60 focus-visible:ring-2 focus-visible:ring-destructive rounded-lg h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
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

          <Separator className="my-3 bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddSet(ei)}
              className="gap-2 rounded-lg border-primary/30 hover:bg-primary/10 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary"
            >
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
    <div
      className={`grid grid-cols-12 items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300 ${
        values.done
          ? "bg-gradient-to-r from-emerald-50/80 to-green-50/60 border-emerald-200/60 dark:from-emerald-950/40 dark:to-green-950/20 dark:border-emerald-800/40"
          : "bg-gradient-to-r from-background/80 to-muted/20 border-border/60 hover:from-muted/40 hover:to-muted/20 hover:border-primary/30"
      }`}
    >
      <div className="col-span-2 text-xs font-bold text-primary">Set {setIndexLabel}</div>

      <div className="col-span-3 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">KG</label>
        <Input
          inputMode="decimal"
          value={values.kg}
          onChange={(e) => onChange("kg", sanitizeDecimal(e.target.value))}
          onKeyDown={onDecimalKeyDown}
          onPaste={(e) => handlePasteDecimal(e, (v) => onChange("kg", v))}
          placeholder="0"
          className="h-8 tabular-nums focus-visible:ring-2 focus-visible:ring-primary rounded-md border-2 font-semibold text-sm"
        />
      </div>

      <div className="col-span-3 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">REPS</label>
        <Input
          inputMode="numeric"
          value={values.reps}
          onChange={(e) => onChange("reps", sanitizeInteger(e.target.value))}
          onKeyDown={onIntegerKeyDown}
          onPaste={(e) => handlePasteInteger(e, (v) => onChange("reps", v))}
          placeholder="0"
          className="h-8 tabular-nums focus-visible:ring-2 focus-visible:ring-primary rounded-md border-2 font-semibold text-sm"
        />
      </div>

      <div className="col-span-2 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">RPE</label>
        <select
          className="w-full h-8 rounded-md border-2 bg-background px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
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
        <button
          type="button"
          onClick={onToggleDone}
          className={`p-1 rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary ${
            values.done
              ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
          title={values.done ? "Marcar como no completado" : "Marcar como completado"}
        >
          {values.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          title="Eliminar serie"
          className="hover:bg-destructive/20 hover:text-destructive text-destructive/60 focus-visible:ring-2 focus-visible:ring-destructive rounded-md h-7 w-7"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});
