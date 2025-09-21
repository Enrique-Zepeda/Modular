import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  onIntegerKeyDown,
  onDecimalKeyDown,
  handlePasteInteger,
  handlePasteDecimal,
  sanitizeInteger,
  sanitizeDecimal,
} from "@/features/workouts/utils/numberInput";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName?: string;
  defaults?: { series?: number; reps?: number; kg?: number };
  onConfirm: (cfg: { series: number; reps: number; kg: number }) => void;
};

export function ExerciseQuickConfigDialog({ open, onOpenChange, exerciseName, defaults, onConfirm }: Props) {
  const [series, setSeries] = useState<number>(defaults?.series ?? 3);
  const [reps, setReps] = useState<number>(defaults?.reps ?? 10);
  const [kg, setKg] = useState<number>(defaults?.kg ?? 0);

  useEffect(() => {
    if (open) {
      setSeries(defaults?.series ?? 3);
      setReps(defaults?.reps ?? 10);
      setKg(defaults?.kg ?? 0);
    }
  }, [open, defaults?.series, defaults?.reps, defaults?.kg]);

  const confirm = () => {
    const s = Math.max(1, Math.floor(series || 1));
    const r = Math.max(1, Math.floor(reps || 1));
    const w = Math.max(0, Number.isFinite(kg) ? kg : 0);
    onConfirm({ series: s, reps: r, kg: w });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Ejercicio</DialogTitle>
          <DialogDescription>
            Configura las series, repeticiones y peso para <b>{exerciseName ?? "el ejercicio"}</b>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">Series</label>
            <Input
              type="text"
              inputMode="numeric"
              value={String(series ?? "")}
              onChange={(e) => setSeries(Number(sanitizeInteger(e.target.value)) || 0)}
              onKeyDown={onIntegerKeyDown}
              onPaste={(e) => handlePasteInteger(e, (v) => setSeries(Number(v) || 0))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Repeticiones</label>
            <Input
              type="text"
              inputMode="numeric"
              value={String(reps ?? "")}
              onChange={(e) => setReps(Number(sanitizeInteger(e.target.value)) || 0)}
              onKeyDown={onIntegerKeyDown}
              onPaste={(e) => handlePasteInteger(e, (v) => setReps(Number(v) || 0))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Peso (kg)</label>
            <Input
              type="text"
              inputMode="decimal"
              value={String(kg ?? "")}
              onChange={(e) => setKg(Number(sanitizeDecimal(e.target.value)) || 0)}
              onKeyDown={onDecimalKeyDown}
              onPaste={(e) => handlePasteDecimal(e, (v) => setKg(Number(v) || 0))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={confirm}>Agregar Ejercicio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
