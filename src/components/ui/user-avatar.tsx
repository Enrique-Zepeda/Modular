import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type Sexo = "masculino" | "femenino" | string | null | undefined;
type Size = "xs" | "sm" | "md" | "lg" | "xl" | number;

const sizeToPx: Record<Exclude<Size, number>, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
};

/** Normaliza muchos alias a 'female' | 'male' */
function normalizeSexo(sexo?: Sexo): "female" | "male" {
  const s = String(sexo ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

  // femeninos comunes
  const fem = ["femenino", "femenina", "female", "mujer", "f", "w", "woman", "girls", "girl", "fem"];
  if (fem.some((k) => s === k || s.startsWith(k))) return "female";

  // por defecto, masculino
  return "male";
}

/** Rutas candidatas para los avatares por defecto */
function buildDefaultCandidates(sexo?: Sexo) {
  const file = normalizeSexo(sexo) === "female" ? "female.png" : "male.png";
  const base = (import.meta as any)?.env?.BASE_URL ?? "/";
  const baseTrim = String(base).replace(/\/+$/, "");

  const candidates = [`${baseTrim}/avatars/${file}`, `/avatars/${file}`, `avatars/${file}`];
  return Array.from(new Set(candidates));
}

export function UserAvatar({
  url,
  sexo,
  alt,
  className,
  size = "md",
  fallbackText,
  imageClassName,
}: {
  url?: string | null;
  sexo?: Sexo;
  alt?: string;
  className?: string;
  size?: Size;
  fallbackText?: string;
  imageClassName?: string;
}) {
  const px = typeof size === "number" ? size : sizeToPx[size];

  // si la URL viene como "null"/"undefined" en string, trátalo como vacío
  const cleanUrl = url && !/^null|undefined$/i.test(url.trim()) ? url.trim() : "";

  const defaultCandidates = React.useMemo(() => buildDefaultCandidates(sexo), [sexo]);
  const initialCandidates = React.useMemo(() => {
    const list: string[] = [];
    if (cleanUrl) list.push(cleanUrl);
    list.push(...defaultCandidates);
    return list;
  }, [cleanUrl, defaultCandidates]);

  const [idx, setIdx] = React.useState(0);
  const src = initialCandidates[idx];

  React.useEffect(() => {
    setIdx(0); // reinicia al cambiar url/sexo
  }, [cleanUrl, sexo]);

  const handleError = React.useCallback(() => {
    setIdx((i) => (i < initialCandidates.length - 1 ? i + 1 : i));
  }, [initialCandidates.length]);

  return (
    <Avatar className={cn(className)} style={{ width: px, height: px }}>
      <AvatarImage src={src} alt={alt} loading="lazy" className={cn(imageClassName)} onError={handleError} />
      <AvatarFallback>{fallbackText?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
