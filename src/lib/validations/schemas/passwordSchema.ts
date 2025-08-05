import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(1, "La contraseña es obligatoria")
  .min(8, "Debe tener al menos 8 caracteres")
  .max(128, "Debe tener menos de 128 caracteres")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/\d/, "Debe contener al menos un número");
// .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial");
