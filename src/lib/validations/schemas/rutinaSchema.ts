import { z } from "zod";

export const crearRutinaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string().min(1, "La descripción es obligatoria").max(500, "La descripción no puede exceder 500 caracteres"),
  nivel_recomendado: z.enum(["principiante", "intermedio", "avanzado"]),
  objetivo: z.enum(["fuerza", "hipertrofia", "resistencia"]),
  duracion_estimada: z.number().min(1, "La duración debe ser al menos 1 minuto").max(300, "La duración no puede exceder 300 minutos"),
});

export type CrearRutinaFormData = z.infer<typeof crearRutinaSchema>; 