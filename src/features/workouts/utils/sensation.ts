import { CircleHelp, Feather, Skull, TriangleAlert, FlameIcon, ThumbsUp } from "lucide-react";

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

// estilos compatibles con los del RPE
export function getSensationStyles(label?: string | null) {
  const l = normalizeSensation(label ?? undefined);

  switch (l) {
    case "Fácil":
      return {
        bgClass: "from-emerald-50 to-emerald-100/70 dark:from-emerald-950/20 dark:to-emerald-900/10",
        borderClass: "border-emerald-300/70 dark:border-emerald-700/40",
        textClass: "text-emerald-700 dark:text-emerald-400",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        icon: Feather,
        shadowClass: "shadow-emerald-200/30 dark:shadow-emerald-950/20",
      };
    case "Moderado":
      return {
        bgClass: "from-blue-50 to-blue-100/70 dark:from-blue-950/20 dark:to-blue-900/10",
        borderClass: "border-blue-300/70 dark:border-blue-700/40",
        textClass: "text-blue-700 dark:text-blue-400",
        iconColor: "text-blue-600 dark:text-blue-400",
        icon: ThumbsUp,
        shadowClass: "shadow-blue-200/30 dark:shadow-blue-950/20",
      };
    case "Difícil":
      return {
        bgClass: "from-orange-50 to-orange-100/70 dark:from-orange-950/20 dark:to-orange-900/10",
        borderClass: "border-orange-300/70 dark:border-orange-700/40",
        textClass: "text-orange-700 dark:text-orange-400",
        iconColor: "text-orange-600 dark:text-orange-400",
        icon: FlameIcon,
        shadowClass: "shadow-orange-200/30 dark:shadow-orange-950/30",
      };
    case "Muy difícil":
      return {
        bgClass: "from-red-50 to-red-100/70 dark:from-red-950/20 dark:to-red-900/10",
        borderClass: "border-red-300/70 dark:border-red-700/40",
        textClass: "text-red-700 dark:text-red-400",
        iconColor: "text-red-600 dark:text-red-400",
        icon: TriangleAlert,
        shadowClass: "shadow-red-200/30 dark:shadow-red-950/30",
      };
    case "Al fallo":
      return {
        // 👇 le metemos animate-pulse solo aquí
        bgClass: "from-purple-50 to-purple-100/70 dark:from-purple-950/20 dark:to-purple-900/10 animate-pulse",
        borderClass: "border-purple-400/80 dark:border-purple-600/50",
        textClass: "text-purple-800 dark:text-purple-300 font-black",
        iconColor: "text-purple-700 dark:text-purple-400",
        icon: Skull,
        shadowClass: "shadow-purple-300/40 dark:shadow-purple-950/30",
      };
    case "Sin sensaciones":
    default:
      return {
        bgClass: "from-muted/30 to-muted/20",
        borderClass: "border-border/50",
        textClass: "text-muted-foreground",
        iconColor: "text-muted-foreground/60",
        icon: CircleHelp,
        shadowClass: "shadow-muted/20",
      };
  }
}

// lo que usa la card
export function sensationPillClasses(label?: string | null): string {
  const styles = getSensationStyles(label);
  return ["bg-gradient-to-br", styles.bgClass, "border-2", styles.borderClass, styles.textClass, styles.shadowClass]
    .filter(Boolean)
    .join(" ");
}
