// (igual que el que te pasé) — sin cambios funcionales
export interface UnifiedItem {
  key: string;
  idSesion: number;
  titulo: string;
  startedAt: string;
  endedAt: string;
  totalSets: number;
  totalVolume: number;
  username: string;
  avatarUrl?: string;
  ejercicios: any[];
  sensacionFinal?: string;
  isMine: boolean;
  readOnly: boolean;
  endedSort: string;
  __score?: number;
}

export function scoreItem(item: UnifiedItem, source: "mine" | "friends"): number {
  const hasRealTitle = item.titulo && item.titulo !== "Entrenamiento";
  let score = 0;
  if (hasRealTitle) score += 2;
  if (source === "friends") score += 1;
  return score;
}

export function mergeAndDedup(mine: UnifiedItem[], friends: UnifiedItem[]): UnifiedItem[] {
  const merged = [
    ...friends.map((x) => ({ ...x, __score: scoreItem(x, "friends") })),
    ...mine.map((x) => ({ ...x, __score: scoreItem(x, "mine") })),
  ];
  const bestById = new Map<number, UnifiedItem>();
  for (const it of merged) {
    const prev = bestById.get(it.idSesion);
    if (!prev || (it.__score ?? 0) > (prev.__score ?? 0)) {
      bestById.set(it.idSesion, it);
    }
  }
  const out = Array.from(bestById.values());
  out.sort((a, b) => (a.endedSort < b.endedSort ? 1 : -1));
  return out;
}
