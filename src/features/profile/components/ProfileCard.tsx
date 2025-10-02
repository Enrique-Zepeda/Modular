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
    <Card
      className={cn(
        "border-2 border-border/60 bg-gradient-to-br from-card via-card/98 to-card/95 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <CardContent className="p-8 relative">
        <div className="flex items-center gap-8">
          <Avatar className="h-28 w-28 border-4 border-primary/30 ring-4 ring-primary/10 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? "Usuario"} />
            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="text-3xl font-extrabold tracking-tight truncate bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text">
              {displayName ?? "Usuario"}
            </div>
            <div className="text-lg text-muted-foreground truncate font-medium">{username ? `@${username}` : ""}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
