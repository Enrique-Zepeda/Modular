import { z } from "zod";
import { passwordSchema } from "./passwordSchema";

export const registerSchema = z
  .object({
    email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Debes confirmar tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
