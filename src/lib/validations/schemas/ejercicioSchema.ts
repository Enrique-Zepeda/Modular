import { z } from "zod";

export const agregarEjercicioSchema = z.object({
  id_ejercicio: z.number().min(1, "Debes seleccionar un ejercicio"),
  series: z.number().min(1, "Debe tener al menos 1 serie").max(20, "No puede exceder 20 series"),
  repeticiones: z.number().min(1, "Debe tener al menos 1 repetición").max(100, "No puede exceder 100 repeticiones"),
  peso_sugerido: z.number().min(0, "El peso no puede ser negativo").max(1000, "El peso no puede exceder 1000 kg"),
});

export type AgregarEjercicioFormData = z.infer<typeof agregarEjercicioSchema>; 