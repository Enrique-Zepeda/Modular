export type WeightUnit = "kg" | "lbs";

const KG_PER_LB = 0.45359237;

export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit,
  opts: { precision?: number } = {}
): number {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  if (from === to) return value;
  const precision = opts.precision ?? 2;

  let result = value;
  if (from === "kg" && to === "lbs") {
    result = value / KG_PER_LB;
  } else if (from === "lbs" && to === "kg") {
    result = value * KG_PER_LB;
  }
  return Number(result.toFixed(precision));
}

// el usuario escribe en su unidad → lo pasamos a kg para la BD
export function normalizeToKg(valueInUserUnit: number, userUnit: WeightUnit): number {
  return convertWeight(valueInUserUnit, userUnit, "kg", { precision: 2 });
}

// la BD nos da kg → lo mostramos en la unidad del usuario
export function presentInUserUnit(valueInKg: number, unit: WeightUnit): number {
  if (typeof valueInKg !== "number" || Number.isNaN(valueInKg)) return 0;

  // DB siempre en kg
  if (unit === "kg") {
    return Math.round(valueInKg); // 👈 entero
  }

  // a lbs y redondeamos
  const lbs = valueInKg / KG_PER_LB;
  return Math.round(lbs); // 👈 entero
}
