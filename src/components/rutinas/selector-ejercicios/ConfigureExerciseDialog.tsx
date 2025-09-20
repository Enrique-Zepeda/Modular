import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { Ejercicio } from "@/types/rutinas";
import { agregarEjercicioSchema, type AgregarEjercicioFormData } from "@/lib/validations/schemas/ejercicioSchema";
import { FormNumberField } from "@/components/form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ejercicio: Ejercicio | null;
  onSubmit: (data: AgregarEjercicioFormData) => void;
}

export const ConfigureExerciseDialog: React.FC<Props> = ({ open, onOpenChange, ejercicio, onSubmit }) => {
  const form = useForm<AgregarEjercicioFormData>({
    resolver: zodResolver(agregarEjercicioSchema),
    defaultValues: {
      id_ejercicio: 0,
      series: 3,
      repeticiones: 10,
      peso_sugerido: 0,
    },
  });

  useEffect(() => {
    if (open && ejercicio) {
      form.reset({
        id_ejercicio: ejercicio.id,
        series: 3,
        repeticiones: 10,
        peso_sugerido: 0,
      });
    }
    if (!open) {
      form.reset({
        id_ejercicio: 0,
        series: 3,
        repeticiones: 10,
        peso_sugerido: 0,
      });
    }
  }, [open, ejercicio, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Ejercicio</DialogTitle>
          <DialogDescription>
            Configura las series, repeticiones y peso sugerido para{" "}
            <span className="font-semibold">{ejercicio?.nombre ?? "Sin nombre"}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormNumberField control={form.control} name="series" label="Series" min={1} max={20} step={1} />
              <FormNumberField
                control={form.control}
                name="repeticiones"
                label="Repeticiones"
                min={1}
                max={100}
                step={1}
              />
              <FormNumberField
                control={form.control}
                name="peso_sugerido"
                label="Peso (kg)"
                min={0}
                max={1000}
                step={0.5}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={form.getValues("id_ejercicio") === 0}>
                Agregar Ejercicio
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
