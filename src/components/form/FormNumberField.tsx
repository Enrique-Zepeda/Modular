import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { toFloat, toInt } from "@/lib/number";

type NumericName<T extends FieldValues> = FieldPath<T>;

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: NumericName<T>;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

export function FormNumberField<T extends FieldValues>({ control, name, label, min, max, step }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode={step && step % 1 !== 0 ? "decimal" : "numeric"}
              min={min}
              max={max}
              step={step}
              value={Number.isFinite(field.value as number) ? (field.value as number) : 0}
              onChange={(e) => {
                const raw = e.target.value;
                const parsed = step && step % 1 !== 0 ? toFloat(raw, 0) : toInt(raw, 0);
                const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, parsed));
                field.onChange(clamped);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
