import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, ImageIcon, CheckCircle2, Circle, Plus } from "lucide-react";
import type { WorkoutExercise } from "@/features/workouts/types";

import {
  onDecimalKeyDown,
  onIntegerKeyDown,
  handlePasteDecimal,
  handlePasteInteger,
  sanitizeDecimal,
  sanitizeInteger,
} from "@/features/workouts/utils/numberInput";

import { useGetPreviousSetsForExercisesQuery } from "@/features/workouts/api/workoutsApi";

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
  const exerciseId = useMemo<number | undefined>(() => {
    return (ex as any).id_ejercicio ?? (ex as any).exerciseId ?? (ex as any).id;
  }, [ex]);

  const args = useMemo(() => (exerciseId ? [Number(exerciseId)] : []), [exerciseId]);
  const { data: prevBatch } = useGetPreviousSetsForExercisesQuery(args, { skip: !exerciseId });

  // PREVIOUS para este ejercicio, claves = índice real (1..N) o fallback a ordinal
  const prevForExercise = exerciseId ? prevBatch?.[Number(exerciseId)] : undefined;

  // Usar idx si es válido (>=1). Si no, usar si+1 (ordinal visual).
  const formatPrev = (rawIdx: any, visualIndex: number) => {
    if (!prevForExercise) return "—";
    const idxNum = Number(rawIdx);
    const key = Number.isFinite(idxNum) && idxNum >= 1 ? idxNum : visualIndex + 1;
    const p = prevForExercise[key];
    if (!p) return "—";
    const kg = p.kg ?? null;
    const reps = p.reps ?? null;
    const rpe = p.rpe ?? null;
    if (kg == null || reps == null) return "—";
    return `${kg} kg × ${reps}${rpe ? ` @ ${rpe}` : ""}`;
  };

  return (
    <div className="group relative bg-card/30 backdrop-blur-sm rounded-2xl p-4 border border-border/40 hover:border-border/60 hover:bg-card/50 transition-all duration-300 shadow-sm hover:shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          {(ex as any).imagen ? (
            <img
              src={(ex as any).imagen || "/placeholder.svg"}
              alt={(ex as any).nombre ?? ex.exerciseName ?? "Ejercicio"}
              className="w-12 h-12 rounded-xl object-cover border-2 border-border/20 shadow-sm"
              onError={(e) => ((e.currentTarget.src = ""), (e.currentTarget.alt = "Sin imagen"))}
            />
          ) : (
            <div className="w-12 h-12 grid place-items-center rounded-xl border-2 border-dashed border-border/30 bg-muted/20">
              <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-bold text-foreground mb-1 text-balance leading-tight">
            {(ex as any).nombre ?? ex.exerciseName ?? `Ejercicio ${ei + 1}`}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {(ex as any).sets.length} {(ex as any).sets.length === 1 ? "serie" : "series"}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAskDelete(ei, (ex as any).nombre ?? ex.exerciseName)}
          title="Eliminar ejercicio"
          className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-destructive rounded-xl h-8 w-8 transition-all duration-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {(ex as any).sets.map((s: any, si: number) => (
          <SetRow
            key={`${s.idx}-${si}`}
            previousText={formatPrev(s.idx, si)} // ← PREVIOUS del set equivalente
            setIndexLabel={s.idx}
            values={{ ...s }}
            onChange={(field, val) => onUpdateSet(ei, si, field, val)}
            onToggleDone={() => onToggleSet(ei, si)}
            onRemove={() => onRemoveSet(ei, si)}
          />
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSet(ei)}
          className="w-full gap-2 rounded-xl hover:bg-primary/5 hover:text-primary border border-dashed border-border/30 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary transition-all duration-300 h-9 text-xs font-medium"
        >
          <Plus className="h-3 w-3" />
          Añadir serie
        </Button>
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
  previousText?: string;
};

const SetRow = memo(function SetRow({
  setIndexLabel,
  values,
  onChange,
  onToggleDone,
  onRemove,
  previousText,
}: RowProps) {
  return (
    <div
      className={`group/set flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
        values.done
          ? "bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30"
          : "bg-background/60 hover:bg-muted/30 border border-transparent hover:border-border/30"
      }`}
    >
      <div className="flex-shrink-0 w-12">
        <span className="text-xs font-bold text-primary tabular-nums">Set {setIndexLabel}</span>
      </div>

      {/* PREVIOUS (no editable) */}
      <div className="hidden sm:flex w-36 justify-end text-xs text-muted-foreground tabular-nums pr-2 select-none">
        {previousText ?? "—"}
      </div>

      <div className="flex-1 grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">KG</label>
          <Input
            inputMode="decimal"
            value={values.kg}
            onChange={(e) => onChange("kg", sanitizeDecimal(e.target.value))}
            onKeyDown={onDecimalKeyDown}
            onPaste={(e) => handlePasteDecimal(e, (v) => onChange("kg", v))}
            placeholder="0"
            className="h-8 tabular-nums focus-visible:ring-2 focus-visible:ring-primary rounded-lg font-semibold text-sm border-border/30 bg-background/80"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">REPS</label>
          <Input
            inputMode="numeric"
            value={values.reps}
            onChange={(e) => onChange("reps", sanitizeInteger(e.target.value))}
            onKeyDown={onIntegerKeyDown}
            onPaste={(e) => handlePasteInteger(e, (v) => onChange("reps", v))}
            placeholder="0"
            className="h-8 tabular-nums focus-visible:ring-2 focus-visible:ring-primary rounded-lg font-semibold text-sm border-border/30 bg-background/80"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">RPE</label>
          <select
            className="w-full h-8 rounded-lg border border-border/30 bg-background/80 px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
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
      </div>

      <div className="flex-shrink-0 flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleDone}
          className={`p-2 rounded-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            values.done
              ? "text-emerald-600 bg-emerald-100/80 hover:bg-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60"
              : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30"
          }`}
          title={values.done ? "Marcar como no completado" : "Marcar como completado"}
        >
          {values.done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          title="Eliminar serie"
          className="opacity-0 group-hover/set:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-destructive rounded-xl h-8 w-8 transition-all duration-300"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});
