import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserPublicProfile } from "@/types/friends";
import { UserPlus, Check, Clock } from "lucide-react";

type Props = {
  user: UserPublicProfile;
  status?: "none" | "friend" | "pending-in" | "pending-out";
  onSend?: (id: string) => void;
  onAccept?: (idSolicitud: string) => void;
  onCancel?: (idSolicitud: string) => void;
  onReject?: (idSolicitud: string) => void;
};

export default function UserResultCard({ user, status = "none", onSend }: Props) {
  return (
    <Card className="border-muted/60">
      <CardContent className="p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.url_avatar ?? undefined} alt={user.username} />
          <AvatarFallback>{user.username?.slice(0, 2)?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">@{user.username}</div>
          {user.nombre && <div className="text-sm text-muted-foreground truncate">{user.nombre}</div>}
        </div>
        {status === "friend" ? (
          <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check className="h-4 w-4" /> Amigo
          </span>
        ) : status === "pending-out" ? (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" /> Pendiente
          </span>
        ) : (
          <Button size="sm" onClick={() => onSend?.(user.id_usuario)} className="gap-1">
            <UserPlus className="h-4 w-4" /> Solicitar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
