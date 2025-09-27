import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Friend } from "@/types/friends";

export default function FriendsList({ friends }: { friends: Friend[] }) {
  if (!friends.length) {
    return <div className="text-sm text-muted-foreground">Aún no tienes amigos.</div>;
  }
  return (
    <div className="grid gap-3">
      {friends.map((f) => (
        <Card key={f.id_usuario} className="border-muted/60">
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={f.url_avatar ?? undefined} alt={f.username} />
              <AvatarFallback>{f.username?.slice(0, 2)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">@{f.username}</div>
              {f.nombre && <div className="text-sm text-muted-foreground truncate">{f.nombre}</div>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
