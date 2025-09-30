import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProfileCardProps = {
  variant?: "compact" | "full";
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  className?: string;
};

export default function ProfileCard({
  variant = "compact",
  displayName,
  username,
  avatarUrl,
  className,
}: ProfileCardProps) {
  const initials = (displayName || username || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (variant === "compact") {
    return (
      <Card className={cn("bg-muted/30 border-muted/40", className)}>
        <CardContent className="flex items-center gap-3 p-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? "Usuario"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{displayName ?? "Usuario"}</div>
            <div className="text-xs text-muted-foreground truncate">{username ? `@${username}` : ""}</div>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link to="/profile">Ver</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  // Variante full: por ahora contenedor simple (se completará en pasos siguientes)
  return (
    <Card className={cn(className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? "Usuario"} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xl font-semibold">{displayName ?? "Usuario"}</div>
            <div className="text-sm text-muted-foreground">{username ? `@${username}` : ""}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
