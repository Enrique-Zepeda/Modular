import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBmiFromProfile } from "../hooks/useBmi";
import type { UserProfile } from "@/types/user";

// ✅ mismo endpoint que Settings (perfil completo por auth_uid del usuario actual)
import { useGetCurrentUserProfileQuery } from "@/features/settings/api/profileApi";

const COLORS: Record<string, string> = {
  under: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  normal: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  over: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  obese: "bg-orange-600/20 text-orange-300 border-orange-600/40",
  morbid: "bg-red-600/20 text-red-300 border-red-600/40",
};

type Props = {
  /** Si estás viendo tu propio perfil, pásalo en true para poder hacer fallback seguro. */
  isSelf?: boolean;
  /** Puedes pasar el perfil si ya lo tienes; si no, se carga solo cuando isSelf=true. */
  profile?: UserProfile | null;
  className?: string;
  showPlaceholder?: boolean;
};

function hasAnthro(p?: any | null) {
  if (!p) return false;
  const peso = p.peso ?? null;
  const altura = p.altura ?? p.estatura ?? null;
  return peso != null && altura != null;
}

export default function BmiBadge({ isSelf = false, profile, className, showPlaceholder = true }: Props) {
  // Cargamos desde DB cuando:
  // - no nos pasan profile (undefined) y es el propio perfil
  // - o nos pasan profile pero SIN peso/altura y es el propio perfil (fallback)
  const shouldFetch = isSelf && (typeof profile === "undefined" || (profile != null && !hasAnthro(profile)));

  const { data: myProfile } = useGetCurrentUserProfileQuery(undefined, { skip: !shouldFetch });
  const effectiveProfile: UserProfile | null = shouldFetch ? myProfile ?? profile ?? null : profile ?? null;

  const { canCompute, bmi, label, category } = useBmiFromProfile(effectiveProfile);

  if (!canCompute || !bmi || !category) {
    if (!showPlaceholder) return null;
    return (
      <Badge className={cn("border-muted-foreground/20 text-muted-foreground bg-muted/30", className)}>
        IMC: incompleto
      </Badge>
    );
  }

  return (
    <Badge
      className={cn("border", COLORS[category], className)}
      title={`Índice de Masa Corporal: ${bmi.toFixed(1)} (${label})`}
    >
      IMC {bmi.toFixed(1)} — {label}
    </Badge>
  );
}
