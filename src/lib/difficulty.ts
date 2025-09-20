import type { ComponentType } from "react";
import { Activity, Target, Zap } from "lucide-react";

// 1) Tipo fuerte para evitar typos y facilitar autocompletado
export type Difficulty = "principiante" | "intermedio" | "avanzado";

// 2) Normalizador (acepta null/undefined y variantes de mayúsculas)
export function normalizeDifficulty(d?: string | null): Difficulty | "desconocido" {
  const v = (d ?? "").trim().toLowerCase();
  if (v === "principiante" || v === "intermedio" || v === "avanzado") return v;
  return "desconocido";
}

// 3) Clases por dificultad (usa tokens Tailwind/shadcn que ya empleas)
export function difficultyColor(d?: string | null) {
  switch (normalizeDifficulty(d)) {
    case "principiante":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200";
    case "intermedio":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200";
    case "avanzado":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200";
    case "desconocido":
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200";
  }
}

// 4) Iconos (tipado exacto)
export const difficultyIcon: Record<Difficulty, ComponentType<{ className?: string }>> = {
  principiante: Activity,
  intermedio: Target,
  avanzado: Zap,
} as const;

// 5) Meta unificada (por si quieres consumir todo desde un solo helper)
export function getDifficultyMeta(d?: string | null) {
  const level = normalizeDifficulty(d);
  return {
    level, // "principiante" | "intermedio" | "avanzado" | "desconocido"
    className: difficultyColor(level),
    Icon: level === "desconocido" ? Activity : difficultyIcon[level as Difficulty],
    label:
      level === "principiante"
        ? "Principiante"
        : level === "intermedio"
        ? "Intermedio"
        : level === "avanzado"
        ? "Avanzado"
        : "Desconocido",
  };
}
