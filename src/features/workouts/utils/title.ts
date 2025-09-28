// (sin cambios si ya lo creaste; incluyo por claridad)

export function safeTitle(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export function pickMineTitle(w: any): string {
  return safeTitle(w?.rutina_nombre) ?? safeTitle(w?.Rutinas?.nombre) ?? safeTitle(w?.titulo) ?? "Entrenamiento";
}

export function pickFriendTitle(w: any): string {
  const username = typeof w?.username === "string" ? w.username.trim() : "";
  return (
    safeTitle(w?.rutina_nombre) ?? safeTitle(w?.nota) ?? (username ? `Entrenamiento de ${username}` : "Entrenamiento")
  );
}
