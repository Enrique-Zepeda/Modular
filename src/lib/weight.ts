export type WeightUnit = "kg" | "lbs";

const KG_PER_LB = 0.45359237;

/**
 * Conversión cruda entre unidades.
 * Úsalo cuando NECESITES el número real (ej. normalizar antes de guardar).
 */
export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit,
  opts: { precision?: number } = {}
): number {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  if (from === to) return value;

  const precision = opts.precision ?? 3; // un poco más preciso
  let result = value;

  if (from === "kg" && to === "lbs") {
    result = value / KG_PER_LB;
  } else if (from === "lbs" && to === "kg") {
    result = value * KG_PER_LB;
  }

  return Number(result.toFixed(precision));
}

/**
 * el usuario escribe en su unidad → lo pasamos a kg para la BD
 * aquí mantenemos decimales para no perder info
 */
export function normalizeToKg(valueInUserUnit: number, userUnit: WeightUnit): number {
  return convertWeight(valueInUserUnit, userUnit, "kg", { precision: 3 });
}

/**
 * la BD nos da kg → lo mostramos en la unidad del usuario
 * 🔴 AQUÍ es donde aplicamos TU regla global:
 *  - si es kg → Math.round
 *  - si es lbs → convertimos y Math.round
 */
export function presentInUserUnit(valueInKg: number, unit: WeightUnit): number {
  if (typeof valueInKg !== "number" || Number.isNaN(valueInKg)) return 0;

  if (unit === "kg") {
    return Math.round(valueInKg);
  }

  // lbs
  const lbs = valueInKg / KG_PER_LB;
  return Math.round(lbs);
}

/**
 * auxiliar por si en algún punto recibes un número en la unidad del usuario
 * y lo quieres llevar a kg con buena precisión
 */
export function toKg(value: number, unit: WeightUnit): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (unit === "kg") return value;
  return Number((value * KG_PER_LB).toFixed(3));
}
