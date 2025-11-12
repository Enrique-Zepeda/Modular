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
} from "@/features/workouts/utils/numberInput";

import { useAppSelector } from "@/hooks";
import { presentInUserUnit, normalizeToKg } from "@/lib/weight";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName?: string;
  defaults?: { series?: number; reps?: number; kg?: number }; // kg desde la DB
  onConfirm: (cfg: { series: number; reps: number; kg: number }) => void; // kg hacia la DB
};

export function ExerciseQuickConfigDialog({ open, onOpenChange, exerciseName, defaults, onConfirm }: Props) {
  const userUnit = useAppSelector((s) => s.preferences?.weightUnit ?? "kg");

  const [series, setSeries] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0); // mostrado en unidad del usuario

  useEffect(() => {
    if (open) {
      setSeries(defaults?.series ?? 3);
      setReps(defaults?.reps ?? 10);

      // 👇 viene en kg → lo muestro en la unidad del usuario usando la regla global
      const shown = typeof defaults?.kg === "number" ? presentInUserUnit(defaults.kg, userUnit) : 0;
      setWeight(shown);
    }
  }, [open, defaults?.series, defaults?.reps, defaults?.kg, userUnit]);

  const confirm = () => {
    const s = Math.max(1, Math.floor(series || 1));
    const r = Math.max(1, Math.floor(reps || 1));

    // 👇 el usuario escribió en su unidad → lo mando a kg con tu redondeo global (ceil cuando es kg)
    const weightInKg = normalizeToKg(Math.max(0, weight || 0), userUnit);

    onConfirm({
      series: s,
      reps: r,
      kg: weightInKg,
    });
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
            <label className="text-sm font-medium">Peso ({userUnit})</label>
            <Input
              type="text"
              inputMode="decimal"
              value={String(weight ?? "")}
              onChange={(e) => {
                // si quieres solo enteros en la UI:
                const v = sanitizeInteger(e.target.value);
                setWeight(Number(v) || 0);
              }}
              onKeyDown={onDecimalKeyDown}
              onPaste={(e) =>
                handlePasteDecimal(e, (v) => {
                  const clean = sanitizeInteger(v);
                  setWeight(Number(clean) || 0);
                })
              }
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
