import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FriendshipBadge } from "@/features/friends/components";
import { cn } from "@/lib/utils";
import { Badge } from "lucide-react";

// 1. Helper para color (añadido aquí para que el componente sea autocontenido)
function hexToRgba(hex: string, alpha = 0.12) {
  const m = hex.replace("#", "").match(/^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
  if (!m) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = m.slice(1).map((h) => Number.parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 2. Tipo para la nueva prop 'training'
type TrainingBadgeProps = {
  badge: {
    color: string;
    title: string;
    avgScore: number;
    samples: number;
  } | null;
} | null;

export type ProfileCardProps = {
  variant?: "compact" | "full";
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  className?: string;
  training?: TrainingBadgeProps;
  friendshipTargetId?: string | number | null;
  friendshipTargetUsername?: string | null;
};

export default function ProfileCard({
  variant = "compact",
  displayName,
  username,
  avatarUrl,
  className,
  training,
  friendshipTargetId,
  friendshipTargetUsername,
}: ProfileCardProps) {
  const isCompact = variant === "compact";
  const initials = (displayName || username || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // La variante 'compact' no se modifica
  if (variant === "compact") {
    return (
      <Card className={cn("bg-muted/30 border-muted/40", className)}>
        {/* ...código de la variante compacta sin cambios... */}
      </Card>
    );
  }

  // Modificaciones en la variante 'full'
  return (
    <Card
      className={cn(
        "border-2 border-border/60 bg-gradient-to-br from-card via-card/98 to-card/95 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <CardContent className="p-8 relative">
        <div className="flex items-start justify-between gap-8">
          {/* IZQUIERDA: avatar + info */}
          <div className="flex items-center gap-6">
            <Avatar className="h-28 w-28 border-4 border-primary/30 ring-4 ring-primary/10 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
              <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? "Usuario"} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="text-3xl font-extrabold tracking-tight truncate bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text">
                {displayName ?? "Usuario"}
              </div>
              <div className="text-lg text-muted-foreground truncate font-medium">{username ? `${username}` : ""}</div>

              {training?.badge && (
                <div className="pt-1">
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-md shadow-sm inline-block"
                    style={{
                      color: training.badge.color,
                      background: `linear-gradient(135deg, ${hexToRgba(training.badge.color, 0.25)}, ${hexToRgba(
                        training.badge.color,
                        0.1
                      )})`,
                      border: `1px solid ${hexToRgba(training.badge.color, 0.5)}`,
                      textShadow: `0 0 8px ${hexToRgba(training.badge.color, 0.5)}`,
                    }}
                    title={`Promedio: ${training.badge.avgScore} (${training.badge.samples} sesiones)`}
                  >
                    {training.badge.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* DERECHA: badge de amistad */}
          {friendshipTargetId != null && (
            <div className="flex-shrink-0">
              <FriendshipBadge targetId={friendshipTargetId} targetUsername={friendshipTargetUsername ?? undefined} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
