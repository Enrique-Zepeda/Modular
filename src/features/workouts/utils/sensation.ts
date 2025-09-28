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
