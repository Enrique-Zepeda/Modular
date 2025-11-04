import { z } from "zod";

export const NIVELES = ["principiante", "intermedio", "avanzado"] as const;
export const OBJETIVOS = ["fuerza", "hipertrofia", "resistencia"] as const;
export const SEXOS = ["masculino", "femenino"] as const;

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .refine((s) => s === s.toLowerCase(), { message: "El username debe estar en minúsculas" }),

  nombre: z.string().trim().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),

  // ✅ Nuevo: pedimos fecha_nacimiento y validamos 13–100 años
  fecha_nacimiento: z
    .string({ required_error: "Selecciona tu fecha de nacimiento" })
    .refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida")
    .refine((v) => {
      const d = new Date(v);
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      return age >= 13 && age <= 100;
    }, "Debes tener entre 13 y 100 años"),

  peso: z.number({ invalid_type_error: "Peso inválido" }).min(1, "Peso inválido"),

  altura: z
    .number({ invalid_type_error: "Altura inválida" })
    .int("Debe ser entero")
    .min(100, "3 dígitos")
    .max(999, "3 dígitos"),

  nivel_experiencia: z.enum(NIVELES, { required_error: "Selecciona un nivel" }),
  objetivo: z.enum(OBJETIVOS, { required_error: "Selecciona un objetivo" }),
  sexo: z.enum(SEXOS, { required_error: "Selecciona tu sexo" }),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
