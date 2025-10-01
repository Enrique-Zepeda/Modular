import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserMinus, Check, X, Clock } from "lucide-react";
import type { FriendRequest } from "@/types/friends";

type ItemsProps = {
  items: FriendRequest[];
  variant: "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
};

export function RequestsList({ items, variant, onAccept, onReject, onCancel }: ItemsProps) {
  if (!items.length)
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          {variant === "incoming" ? (
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Clock className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          No hay solicitudes {variant === "incoming" ? "entrantes" : "salientes"}
        </p>
        <p className="text-xs text-muted-foreground/70">
          {variant === "incoming"
            ? "Cuando alguien te envíe una solicitud, aparecerá aquí"
            : "Las solicitudes que envíes aparecerán aquí"}
        </p>
      </div>
    );

  return (
    <div className="grid gap-3">
      {items.map((r) => {
        const other =
          variant === "incoming" ? r.solicitante?.[0] ?? r.solicitante : r.destinatario?.[0] ?? r.destinatario;
        const username = (other as any)?.username ?? "";
        const nombre = (other as any)?.nombre ?? null;
        const url_avatar = (other as any)?.url_avatar ?? null;
        const id_usuario = (other as any)?.id_usuario ?? "";

        return (
          <Card
            key={r.id_solicitud}
            className="border-muted/60 hover:border-muted transition-colors bg-gradient-to-br from-background to-muted/10"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-50 blur-sm" />
                <Avatar className="h-12 w-12 relative border-2 border-background">
                  <AvatarImage src={url_avatar ?? undefined} alt={username} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-300 font-semibold">
                    {username?.slice(0, 2)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate text-foreground">@{username}</div>
                {nombre && <div className="text-sm text-muted-foreground truncate">{nombre}</div>}
              </div>

              {variant === "incoming" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/20"
                    onClick={() => onAccept?.(r.id_solicitud)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aceptar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent"
                    onClick={() => onReject?.(r.id_solicitud)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 bg-transparent"
                  onClick={() => onCancel?.(r.id_solicitud)}
                >
                  <UserMinus className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
