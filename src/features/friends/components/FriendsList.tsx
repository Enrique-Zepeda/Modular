import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Friend } from "@/types/friends";
import { Link } from "react-router-dom";
import { MessageCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FriendsList({ friends }: { friends: Friend[] }) {
  if (!friends.length) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="text-4xl opacity-20">👥</div>
        <div className="text-sm text-muted-foreground">Aún no tienes amigos.</div>
        <div className="text-xs text-muted-foreground/60">Busca usuarios para agregar a tu red</div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {friends.map((f) => {
        const initial = (f.nombre?.charAt(0) || f.username?.charAt(0) || "U").toUpperCase();

        return (
          <Card
            key={f.id_usuario}
            className="border-muted/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
          >
            <CardContent className="p-5 flex items-center gap-4">
              <Link to={`/u/${f.username}`} className="flex items-center gap-4 min-w-0 flex-1 group/link">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300">
                    <AvatarImage src={f.url_avatar ?? undefined} alt={f.username} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full ring-2 ring-background" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate group-hover/link:text-primary transition-colors flex items-center gap-2">
                    @{f.username}
                    <UserCheck className="h-4 w-4 text-green-500" />
                  </div>
                  {f.nombre && <div className="text-sm text-muted-foreground truncate">{f.nombre}</div>}
                </div>
              </Link>

              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                asChild
              >
                <Link to={`/u/${f.username}`}>
                  <MessageCircle className="h-4 w-4" />
                  Ver perfil
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
