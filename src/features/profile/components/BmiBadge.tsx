import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBmiFromProfile } from "../hooks/useBmi";
import type { UserProfile } from "@/types/user";

// ✅ mismo endpoint que Settings (perfil completo por auth_uid del usuario actual)
import { useGetCurrentUserProfileQuery } from "@/features/settings/api/profileApi";

const COLORS: Record<string, string> = {
  under: "bg-sky-500/20 border-sky-500/50 shadow-sky-500/20 text-sky-700 dark:text-sky-200",
  normal: "bg-emerald-500/20 border-emerald-500/50 shadow-emerald-500/20 text-emerald-700 dark:text-emerald-200",
  over: "bg-amber-500/20 border-amber-500/50 shadow-amber-500/20 text-amber-700 dark:text-amber-200",
  obese: "bg-orange-600/20 border-orange-600/50 shadow-orange-600/20 text-orange-700 dark:text-orange-200",
  morbid: "bg-red-600/20 border-red-600/50 shadow-red-600/20 text-red-700 dark:text-red-200",
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
      <Badge
        className={cn(
          // Mobile-first: altura táctil mínima, texto responsivo
          "inline-flex min-h-[2.25rem] items-center justify-center rounded-full px-3 text-xs sm:text-sm",
          "border-2 border-muted-foreground/30 text-muted-foreground bg-muted/40 shadow-sm",
          className
        )}
      >
        IMC: incompleto
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        // Mobile-first: buen área táctil y legible en pantallas pequeñas
        "inline-flex min-h-[2.5rem] items-center justify-center rounded-full px-3.5 text-xs sm:text-sm font-bold",
        "shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.03]",
        COLORS[category],
        className
      )}
      title={`Índice de Masa Corporal: ${bmi.toFixed(1)} (${label})`}
    >
      IMC {bmi.toFixed(1)} — {label}
    </Badge>
  );
}
