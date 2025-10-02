// Utilidad pequeña y estable para normalizar etiquetas de sensación.
// Si no coincide, devolvemos "Sin sensaciones".
const MAP: Record<string, string> = {
  facil: "Fácil",
  fácil: "Fácil",
  moderado: "Moderado",
  dificil: "Difícil",
  difícil: "Difícil",
  "muy dificil": "Muy difícil",
  "muy difícil": "Muy difícil",
  "al fallo": "Al fallo",
  "sin sensaciones": "Sin sensaciones",
};

export function normalizeSensation(v: unknown): string {
  if (typeof v !== "string") return "Sin sensaciones";
  const key = v.trim().toLowerCase();
  return MAP[key] ?? (v.trim() ? v.trim() : "Sin sensaciones");
}

/**
 * Devuelve clases Tailwind para pintar el chip/badge de sensación
 * según el diseño solicitado:
 * - Sin sensaciones → gris claro
 * - Fácil → verde
 * - Moderado → amarillo/dorado (amber)
 * - Difícil → naranja
 * - Muy difícil → naranja intenso
 * - Al fallo → rojo
 *
 * Nota: Solo incluye las clases de color. Combínalas con tu contenedor base.
 */
export function sensationPillClasses(label?: string | null): string {
  const l = normalizeSensation(label ?? undefined);
  switch (l) {
    case "Sin sensaciones":
      return "border-gray-300 bg-gray-50 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-700 hover:shadow-gray-500/10";
    case "Fácil":
      return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 hover:shadow-emerald-500/20";
    case "Moderado":
      return "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 hover:shadow-amber-500/20";
    case "Difícil":
      return "border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 hover:shadow-orange-500/20";
    case "Muy difícil":
      return "border-orange-400 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700 hover:shadow-orange-500/30";
    case "Al fallo":
      return "border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 hover:shadow-red-500/20";
    default:
      return "border-muted bg-muted/30 text-muted-foreground";
  }
}
