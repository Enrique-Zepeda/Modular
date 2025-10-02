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
    // Mensaje específico si hay mayúsculas
    .refine((s) => s === s.toLowerCase(), {
      message: "El username debe estar en minúsculas",
    })
    // Reglas de caracteres permitidos (tal como ya tenías)
    .regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y '_'"),
  nombre: z.string().trim().min(1, "Requerido"),
  edad: z
    .number({ invalid_type_error: "Edad inválida" })
    .int("Debe ser entero")
    .min(13, "Mínimo 13")
    .max(100, "Máximo 100"),
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
