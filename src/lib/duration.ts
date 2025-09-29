// Mantengo el archivo en tu ruta actual y exporto helpers seguros.
// Si ya tienes cosas aquí, puedes dejar estos exports junto a lo demás.

export function formatDurationShort(totalSeconds?: number | null): string | null {
  if (totalSeconds == null || isNaN(totalSeconds)) return null;
  const s = Math.max(0, Math.floor(totalSeconds));

  if (s < 60) {
    // 0..59 => "Ss"
    return `${s}s`;
  }

  const minutes = Math.floor(s / 60);
  const seconds = s % 60;

  if (s < 3600) {
    // 1..59 min => "Mm Ss"
    return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(s / 3600);
  const rem = s % 3600;
  const remMin = Math.floor(rem / 60);
  const remSec = rem % 60;

  // "Hh Mm" y solo mostramos segundos si no son 00 para >= 1h
  if (remSec) {
    return `${hours}h ${remMin}m ${remSec}s`;
  }
  return `${hours}h ${remMin}m`;
}

export function diffSecondsSafe(endedAt?: string | null, startedAt?: string | null): number | null {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt ?? startedAt).getTime();
  if (!isFinite(start) || !isFinite(end)) return null;
  const diff = Math.floor((end - start) / 1000);
  return Math.max(0, diff);
}
