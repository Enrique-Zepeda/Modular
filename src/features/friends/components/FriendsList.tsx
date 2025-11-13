import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Friend } from "@/types/friends";
import { Link } from "react-router-dom";
import { MessageCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FriendsList({ friends }: { friends: Friend[] }) {
  if (!friends.length) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 sm:py-12 space-y-3 text-center">
        <div className="text-3xl sm:text-4xl opacity-20">👥</div>
        <div className="text-sm sm:text-base text-muted-foreground">Aún no tienes amigos.</div>
        <div className="text-xs sm:text-sm text-muted-foreground/60">Busca usuarios para agregar a tu red</div>
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
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Link to={`/u/${f.username}`} className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 group/link">
                <div className="relative flex-shrink-0">
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
                  <div className="font-semibold text-sm sm:text-base truncate group-hover/link:text-primary transition-colors flex items-center gap-2">
                    @{f.username}
                    <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  </div>
                  {f.nombre && <div className="text-xs sm:text-sm text-muted-foreground truncate">{f.nombre}</div>}
                </div>
              </Link>

              <Button
                size="sm"
                variant="ghost"
                // En mobile siempre visible y full-width; en desktop aparece al hover del card
                className="mt-1.5 w-full justify-center gap-1.5 text-xs sm:mt-0 sm:w-auto sm:justify-end sm:text-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
