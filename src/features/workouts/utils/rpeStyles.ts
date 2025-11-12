import { CircleHelp, Feather, ThumbsUp, FlameIcon, TriangleAlert, Skull } from "lucide-react";

export type RPELabel = "Sin sensaciones" | "Fácil" | "Moderado" | "Difícil" | "Muy difícil" | "Al fallo" | string; // por si llega algo raro del back

export function getRPEStyles(rpeValue: RPELabel) {
  switch (rpeValue) {
    case "Sin sensaciones":
      return {
        bgClass: "from-muted/30 to-muted/20",
        borderClass: "border-border/50",
        textClass: "text-muted-foreground",
        iconColor: "text-muted-foreground/60",
        icon: CircleHelp,
      };
    case "Fácil":
      return {
        bgClass: "from-emerald-50 to-emerald-100/70 dark:from-emerald-950/20 dark:to-emerald-900/10",
        borderClass: "border-emerald-300/70 dark:border-emerald-700/40",
        textClass: "text-emerald-700 dark:text-emerald-400",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        icon: Feather,
      };
    case "Moderado":
      return {
        bgClass: "from-blue-50 to-blue-100/70 dark:from-blue-950/20 dark:to-blue-900/10",
        borderClass: "border-blue-300/70 dark:border-blue-700/40",
        textClass: "text-blue-700 dark:text-blue-400",
        iconColor: "text-blue-600 dark:text-blue-400",
        icon: ThumbsUp,
      };
    case "Difícil":
      return {
        bgClass: "from-orange-50 to-orange-100/70 dark:from-orange-950/20 dark:to-orange-900/10",
        borderClass: "border-orange-300/70 dark:border-orange-700/40",
        textClass: "text-orange-700 dark:text-orange-400",
        iconColor: "text-orange-600 dark:text-orange-400",
        icon: FlameIcon,
      };
    case "Muy difícil":
      return {
        bgClass: "from-red-50 to-red-100/70 dark:from-red-950/20 dark:to-red-900/10",
        borderClass: "border-red-300/70 dark:border-red-700/40",
        textClass: "text-red-700 dark:text-red-400",
        iconColor: "text-red-600 dark:text-red-400",
        icon: TriangleAlert,
      };
    case "Al fallo":
      return {
        bgClass: "from-purple-50 to-purple-100/70 dark:from-purple-950/20 dark:to-purple-900/10",
        borderClass: "border-purple-400/80 dark:border-purple-600/50",
        textClass: "text-purple-800 dark:text-purple-300 font-black",
        iconColor: "text-purple-700 dark:text-purple-400",
        icon: Skull,
      };
    default:
      return {
        bgClass: "from-muted/30 to-muted/20",
        borderClass: "border-border/50",
        textClass: "text-muted-foreground",
        iconColor: "text-muted-foreground/60",
        icon: CircleHelp,
      };
  }
}
