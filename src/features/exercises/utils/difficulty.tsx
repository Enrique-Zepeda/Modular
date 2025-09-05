import { Activity, Target, Zap } from "lucide-react";
import type { ComponentType } from "react";

export function difficultyColor(d?: string | null) {
  const v = (d || "").toLowerCase();
  switch (v) {
    case "principiante":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200";
    case "intermedio":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200";
    case "avanzado":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200";
  }
}

export const difficultyIcon: Record<string, ComponentType<{ className?: string }>> = {
  principiante: Activity,
  intermedio: Target,
  avanzado: Zap,
};
