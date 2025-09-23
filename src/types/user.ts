export type Sexo = "masculino" | "femenino";

export interface UserProfile {
  id_usuario: number;
  auth_uid?: string | null;
  correo: string;
  username: string | null;
  nombre: string | null;
  edad: number | null;
  peso: number | null;
  altura: number | null;
  nivel_experiencia: "principiante" | "intermedio" | "avanzado" | null;
  objetivo: "fuerza" | "hipertrofia" | "resistencia" | null;
  sexo: Sexo | null;
  fecha_registro?: string | null;
}

export function isProfileComplete(p: UserProfile | null): boolean {
  if (!p) return false;
  return Boolean(
    p.username &&
      p.nombre &&
      p.edad !== null &&
      p.peso !== null &&
      p.altura !== null &&
      p.nivel_experiencia &&
      p.objetivo &&
      p.sexo // 👈 requerido ahora
  );
}
