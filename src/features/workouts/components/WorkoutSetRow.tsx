import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { RPE_OPTIONS } from "../types";

export const WorkoutSetRow = memo(function WorkoutSetRow({
  setIndexLabel,
  values,
  onChange,
  onToggleDone,
  onRemove,
}: {
  setIndexLabel: number;
  values: { idx: number; kg: string; reps: string; rpe: string; done: boolean };
  onChange: (field: "kg" | "reps" | "rpe", val: string) => void;
  onToggleDone: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-12 items-center gap-3 sm:gap-4">
      {/* Set label: línea propia en móvil */}
      <div className="col-span-12 md:col-span-2 text-xs sm:text-sm text-muted-foreground">
        <span className="font-semibold">Set</span> {setIndexLabel}
      </div>

      {/* KG */}
      <div className="col-span-6 md:col-span-3">
        <label className="block text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">KG</label>
        <Input
          inputMode="decimal"
          value={values.kg}
          onChange={(e) => onChange("kg", e.target.value)}
          placeholder="kg"
          className="h-11 rounded-xl tabular-nums"
        />
      </div>

      {/* Reps */}
      <div className="col-span-6 md:col-span-3">
        <label className="block text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Reps</label>
        <Input
          inputMode="numeric"
          value={values.reps}
          onChange={(e) => onChange("reps", e.target.value)}
          placeholder="reps"
          className="h-11 rounded-xl tabular-nums"
        />
      </div>

      {/* RPE */}
      <div className="col-span-6 md:col-span-2">
        <label className="block text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">RPE</label>
        <select
          className="w-full h-11 rounded-xl border bg-background px-3 text-sm"
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

      {/* Acciones */}
      <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-3">
        <label className="text-xs sm:text-sm">Hecho</label>
        <input
          type="checkbox"
          className="h-5 w-5 rounded"
          checked={values.done}
          onChange={onToggleDone}
          aria-label="Marcar set como hecho"
        />
        <Button variant="ghost" size="icon" onClick={onRemove} title="Eliminar serie" className="h-9 w-9 rounded-lg">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
