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
    <div className="grid grid-cols-12 items-center gap-2">
      <div className="col-span-2 text-xs text-muted-foreground">Set {setIndexLabel}</div>
      <div className="col-span-3 flex items-center gap-2">
        <label className="text-xs w-10">KG</label>
        <Input
          inputMode="decimal"
          value={values.kg}
          onChange={(e) => onChange("kg", e.target.value)}
          placeholder="kg"
          className="h-8"
        />
      </div>
      <div className="col-span-3 flex items-center gap-2">
        <label className="text-xs w-10">Reps</label>
        <Input
          inputMode="numeric"
          value={values.reps}
          onChange={(e) => onChange("reps", e.target.value)}
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
