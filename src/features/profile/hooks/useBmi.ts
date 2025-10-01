import { useMemo } from "react";
import { z } from "zod";
import type { UserProfile } from "@/types/user";

export type BmiCategoryKey = "under" | "normal" | "over" | "obese" | "morbid";

export const BMI_RANGES: Array<{ min: number; max: number; key: BmiCategoryKey; label: string }> = [
  { min: 0, max: 18.5, key: "under", label: "Bajo peso" },
  { min: 18.5, max: 25, key: "normal", label: "Normal" },
  { min: 25, max: 30, key: "over", label: "Sobrepeso" },
  { min: 30, max: 40, key: "obese", label: "Obeso" },
  { min: 40, max: 100, key: "morbid", label: "Obesidad mórbida" },
];

const AnthroSchema = z.object({
  peso: z.number().positive(),
  // Admitimos 'altura' en m o cm. También toleramos 'estatura' por si el perfil lo nombra así.
  altura: z.number().positive(),
});

export function normalizeHeightToMeters(altura: number): number {
  // Si es >3 asumimos que viene en centímetros.
  return altura > 3 ? altura / 100 : altura;
}

/** IMC = kg / (m^2) */
export function computeBmi({ pesoKg, altura }: { pesoKg: number; altura: number }, digits = 1): number {
  const h = normalizeHeightToMeters(altura);
  const bmi = pesoKg / (h * h);
  const f = Math.pow(10, digits);
  return Math.round(bmi * f) / f;
}

export function classifyBmi(bmi: number): { key: BmiCategoryKey; label: string } {
  const found = BMI_RANGES.find((r) => bmi >= r.min && bmi < r.max) ?? BMI_RANGES[BMI_RANGES.length - 1];
  return { key: found.key, label: found.label };
}

export function useBmiFromProfile(profile: UserProfile | null) {
  return useMemo(() => {
    if (!profile) {
      return {
        canCompute: false as const,
        bmi: null as number | null,
        category: null as BmiCategoryKey | null,
        label: null as string | null,
        heightM: null as number | null,
        weightKg: null as number | null,
        sexo: null as string | null,
        edad: null as number | null,
      };
    }

    // Tolerancia a nombres alternativos.
    const rawAltura = (profile as any).altura ?? (profile as any).estatura ?? null;
    const rawPeso = (profile as any).peso ?? null;

    if (rawAltura == null || rawPeso == null) {
      return {
        canCompute: false as const,
        bmi: null,
        category: null,
        label: null,
        heightM: null,
        weightKg: null,
        sexo: (profile as any).sexo ?? null,
        edad: (profile as any).edad ?? null,
      };
    }

    const parse = AnthroSchema.safeParse({ peso: Number(rawPeso), altura: Number(rawAltura) });
    if (!parse.success) {
      return {
        canCompute: false as const,
        bmi: null,
        category: null,
        label: null,
        heightM: null,
        weightKg: null,
        sexo: (profile as any).sexo ?? null,
        edad: (profile as any).edad ?? null,
      };
    }

    const heightM = normalizeHeightToMeters(parse.data.altura);
    const weightKg = parse.data.peso;
    const bmi = computeBmi({ pesoKg: weightKg, altura: heightM }, 1);
    const { key, label } = classifyBmi(bmi);

    return {
      canCompute: true as const,
      bmi,
      category: key,
      label,
      heightM,
      weightKg,
      sexo: (profile as any).sexo ?? null,
      edad: (profile as any).edad ?? null,
    };
  }, [profile]);
}
