export type WorkoutSessionLike<T = any> = T & { started_at: string | Date };

export type GroupedSessions<T = any> = Array<{
  header: string;
  items: T[];
}>;

/** Devuelve una clave YYYY-MM-DD en una zona horaria dada sin librerías externas */
function ymdKey(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(date); // YYYY-MM-DD
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function makeHeader(d: Date, now: Date, locale: string, timeZone: string) {
  const todayKey = ymdKey(now, timeZone);
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yesterdayKey = ymdKey(y, timeZone);
  const key = ymdKey(d, timeZone);

  if (key === todayKey) return "Hoy";
  if (key === yesterdayKey) return "Ayer";

  const fmt = new Intl.DateTimeFormat(locale, { timeZone, day: "2-digit", month: "short", year: "numeric" });
  const raw = fmt.format(d);
  // Capitalizar la abreviatura del mes en español (sep -> Sep)
  return raw.replace(/\b([a-záéíóúñ]{3,})\b/gi, (m) => m[0].toUpperCase() + m.slice(1).toLowerCase());
}

/**
 * Agrupa sesiones por día local.
 * - Hoy -> "Hoy"
 * - Ayer -> "Ayer"
 * - Otros -> "DD MMM YYYY" (e.g., "19 Sep 2025")
 */
export function groupWorkoutsByDay<T = any>(
  sessions: WorkoutSessionLike<T>[],
  opts: { locale?: string; timeZone?: string; now?: Date } = {}
): GroupedSessions<T> {
  const locale = opts.locale ?? "es-MX";
  const timeZone = opts.timeZone ?? "America/Mexico_City";
  const now = opts.now ?? new Date();

  // Ordenar DESC por started_at
  const sorted = [...sessions].sort((a, b) => +toDate(b.started_at) - +toDate(a.started_at));

  const groupsMap = new Map<string, { header: string; items: T[]; date: Date }>();

  for (const s of sorted) {
    const d = toDate(s.started_at);
    const key = ymdKey(d, timeZone);
    let g = groupsMap.get(key);
    if (!g) {
      g = { header: makeHeader(d, now, locale, timeZone), items: [], date: d };
      groupsMap.set(key, g);
    }
    g.items.push(s as unknown as T);
  }

  // Retornar en orden DESC por fecha
  return Array.from(groupsMap.values())
    .sort((a, b) => +b.date - +a.date)
    .map(({ header, items }) => ({ header, items }));
}
