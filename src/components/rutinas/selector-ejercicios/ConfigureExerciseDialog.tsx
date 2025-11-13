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
      <DialogContent
        className="
        w-[96vw] max-w-[96vw] sm:max-w-lg p-0 overflow-hidden sm:rounded-2xl
        bg-background
      "
      >
        {/* Contenedor para controlar alturas en móvil/desktop */}
        <div className="flex flex-col max-h-[85vh] min-w-0">
          {/* Header con padding y separación visual */}
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b bg-card/50 backdrop-blur">
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-lg sm:text-xl font-bold">Configurar Ejercicio</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Configura las series, repeticiones y peso sugerido para{" "}
                <span className="font-semibold text-foreground">{ejercicio?.nombre ?? "Sin nombre"}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Contenido scrolleable si crece */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Grid responsiva: 1 col en móvil, 3 cols desde sm */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                {/* Botonera: apilada en móvil, en línea en desktop */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-11 sm:h-10 w-full sm:flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 sm:h-10 w-full sm:flex-1"
                    disabled={form.getValues("id_ejercicio") === 0}
                  >
                    Agregar Ejercicio
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
