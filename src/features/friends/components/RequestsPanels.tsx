import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserPlus, UserMinus, Check, X, Clock, Search } from "lucide-react";
import type { FriendRequest } from "@/types/friends";
import * as React from "react";
import { cn } from "@/lib/utils";
import { UserAvatar, type Sexo } from "@/components/ui/user-avatar";

type ItemsProps = {
  items: FriendRequest[];
  variant: "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
};

// UI-ONLY REFACTOR: Added search capability, improved card layout, better accessibility
export function RequestsList({ items, variant, onAccept, onReject, onCancel }: ItemsProps) {
  const [query, setQuery] = React.useState("");

  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return items;
    const q = query
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    return items.filter((r) => {
      const other =
        variant === "incoming" ? r.solicitante?.[0] ?? r.solicitante : r.destinatario?.[0] ?? r.destinatario;
      const username = ((other as any)?.username ?? "").toLowerCase();
      const nombre = ((other as any)?.nombre ?? "").toLowerCase();
      const normalUsername = username.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalNombre = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalUsername.includes(q) || normalNombre.includes(q);
    });
  }, [items, query, variant]);
  if (!items.length)
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 sm:py-12 text-center space-y-2">
        <div className="p-4 rounded-full bg-muted/50 mb-2 sm:mb-4">
          {variant === "incoming" ? (
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Clock className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm sm:text-base font-medium text-muted-foreground">
          No hay solicitudes {variant === "incoming" ? "entrantes" : "salientes"}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground/70 max-w-xs sm:max-w-none">
          {variant === "incoming"
            ? "Cuando alguien te envíe una solicitud, aparecerá aquí"
            : "Las solicitudes que envíes aparecerán aquí"}
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Sticky search: respeta safe area en mobile */}
      <div className="sticky top-[env(safe-area-inset-top)] sm:top-0 z-10 bg-background/95 backdrop-blur-sm pb-3 pt-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={variant === "incoming" ? "Buscar solicitudes entrantes…" : "Buscar solicitudes salientes…"}
            className="pl-9 h-10 text-sm"
            aria-label={
              variant === "incoming"
                ? "Buscar solicitudes de amistad entrantes"
                : "Buscar solicitudes de amistad salientes"
            }
            spellCheck="false"
          />
        </div>
        {query && (
          <p className="mt-2 text-xs text-muted-foreground">
            {filteredItems.length} de {items.length} coinciden
          </p>
        )}
      </div>

      {filteredItems.length === 0 && query && (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
          <Search className="h-8 w-8 text-muted-foreground/40 mb-1" />
          <p className="text-sm text-muted-foreground max-w-sm">
            No se encontraron solicitudes que coincidan con <span className="break-all">"{query}"</span>
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {filteredItems.map((r) => {
          const other =
            variant === "incoming" ? r.solicitante?.[0] ?? r.solicitante : r.destinatario?.[0] ?? r.destinatario;
          const username = (other as any)?.username ?? "";
          const nombre = (other as any)?.nombre ?? null;
          const url_avatar = (other as any)?.url_avatar ?? null;
          const sexo = ((other as any)?.sexo ?? null) as Sexo | null;
          const initials = (username || "U").slice(0, 2).toUpperCase();

          return (
            <Card
              key={r.id_solicitud}
              className={cn(
                "border-muted/60 hover:border-primary/40 transition-all duration-200",
                "bg-gradient-to-br from-background to-muted/10",
                "hover:shadow-md focus-within:ring-2 focus-within:ring-primary/40"
              )}
            >
              {/* En mobile apila avatar/texto/botones; en desktop se alinea en fila */}
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-50 blur-sm" />
                  <UserAvatar
                    url={url_avatar}
                    sexo={sexo}
                    alt={`Avatar de ${username}`}
                    size={48}
                    className="relative border-2 border-background ring-1 ring-primary/20 rounded-full"
                    imageClassName="object-cover"
                    fallbackText={initials}
                  />
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  {nombre && (
                    <div className="font-semibold truncate text-foreground text-sm md:text-base">{nombre}</div>
                  )}
                  <div className="text-xs md:text-sm text-muted-foreground truncate">@{username}</div>
                </div>

                {variant === "incoming" ? (
                  <div className="mt-2 sm:mt-0 flex w-full sm:w-auto flex-col sm:flex-row gap-2 flex-shrink-0 sm:justify-end">
                    <Button
                      size="sm"
                      className="w-full sm:w-auto justify-center bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 gap-1 text-xs sm:text-sm"
                      onClick={() => onAccept?.(r.id_solicitud)}
                      aria-label={`Aceptar solicitud de ${username}`}
                      title="Aceptar solicitud"
                    >
                      <Check className="h-4 w-4" />
                      <span className="hidden sm:inline">Aceptar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto justify-center border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent gap-1 text-xs sm:text-sm"
                      onClick={() => onReject?.(r.id_solicitud)}
                      aria-label={`Rechazar solicitud de ${username}`}
                      title="Rechazar solicitud"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Rechazar</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 sm:mt-0 w-full sm:w-auto justify-center border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 bg-transparent gap-1 flex-shrink-0 text-xs sm:text-sm"
                    onClick={() => onCancel?.(r.id_solicitud)}
                    aria-label={`Cancelar solicitud a ${username}`}
                    title="Cancelar solicitud"
                  >
                    <UserMinus className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancelar</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
