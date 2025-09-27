import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      <div className="text-sm text-muted-foreground">
        No hay solicitudes {variant === "incoming" ? "entrantes" : "salientes"}.
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
          <Card key={r.id_solicitud} className="border-muted/60">
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={url_avatar ?? undefined} alt={username} />
                <AvatarFallback>{username?.slice(0, 2)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">@{username}</div>
                {nombre && <div className="text-sm text-muted-foreground truncate">{nombre}</div>}
              </div>
              {variant === "incoming" ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="default" onClick={() => onAccept?.(r.id_solicitud)}>
                    Aceptar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onReject?.(r.id_solicitud)}>
                    Rechazar
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => onCancel?.(r.id_solicitud)}>
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
