import { Badge } from "@/components/ui/badge";

const COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Fácil: "secondary",
  Moderado: "default",
  Difícil: "outline",
  "Muy difícil": "outline",
  "Al fallo": "destructive",
};

export function SensationBadge({ label }: { label?: string }) {
  if (!label || label === "Sin sensaciones") return null;
  const variant = COLORS[label] ?? "outline";
  return <Badge variant={variant}>{label}</Badge>;
}
