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

  return (
    <Card className={cn("border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90", className)}>
      <CardContent className="p-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary/20 ring-4 ring-primary/10 shadow-xl shadow-primary/5">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? "Usuario"} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-2xl font-bold tracking-tight truncate">{displayName ?? "Usuario"}</div>
            <div className="text-base text-muted-foreground truncate">{username ? `@${username}` : ""}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
