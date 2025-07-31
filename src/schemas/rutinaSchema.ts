import { z } from 'zod';

export const crearRutinaSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  
  tipoRutina: z.enum(['fuerza', 'hipertrofia', 'resistencia'], {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de rutina válido' })
  }),
  
  diasPorSemana: z
    .number()
    .min(1, 'Debes entrenar al menos 1 día por semana')
    .max(7, 'No puedes entrenar más de 7 días por semana'),
  
  nivelDificultad: z.enum(['principiante', 'intermedio', 'avanzado'], {
    errorMap: () => ({ message: 'Debes seleccionar un nivel de dificultad válido' })
  })
});

export type CrearRutinaFormData = z.infer<typeof crearRutinaSchema>; 