import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useProfileFriends } from "../hooks/useProfileFriends";
import { Users, UserMinus, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Props = {
  username: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  className?: string;
  canManageFriends?: boolean;
  /** 🔔 callback para notificar cambios al padre (ProfilePage) */
  onFriendsChanged?: () => void;
};

function normalize(s: string) {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// UI-ONLY REFACTOR: Improved modal design with better search UX, loading states, and accessibility
export default function ProfileFriendsModal({
  username,
  open,
  onOpenChange,
  className,
  canManageFriends = false,
  onFriendsChanged,
}: Props) {
  const { friends, isLoading, isError, error, refetch } = useProfileFriends(username);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  // 🔎 estado de búsqueda local (misma UI, sin componentes nuevos)
  const [query, setQuery] = React.useState("");

  // Filtrado por nombre o username (diacríticos-insensitive)
  const filteredFriends = React.useMemo(() => {
    const q = normalize(query);
    if (!q) return friends;
    return friends.filter((f) => {
      const u = normalize(f.username ?? "");
      const n = normalize(f.nombre ?? "");
      return u.includes(q) || n.includes(q);
    });
  }, [friends, query]);

  React.useEffect(() => {
    if (!open) return;
    refetch();
  }, [open, refetch]);

  const notifyChange = React.useCallback(() => {
    onFriendsChanged?.();
    // evento global para que otras vistas interesadas refresquen (opcional)
    window.dispatchEvent(new CustomEvent("friends:changed"));
  }, [onFriendsChanged]);

  const handleUnfriend = async (friendId: string, friendHandle: string) => {
    const other = Number(friendId);
    if (!Number.isFinite(other)) {
      toast.error("Id de usuario inválido.");
      return;
    }
    setPendingId(friendId);
    const t = toast.loading("Eliminando…");
    try {
      const { data: meId, error: meErr } = await supabase.rpc("current_usuario_id");
      if (meErr) throw meErr;
      if (!meId) throw new Error("No se pudo resolver tu usuario.");

      const { error: delErr } = await supabase
        .from("Amigos")
        .delete()
        .or(
          `and(id_usuario1.eq.${meId},id_usuario2.eq.${other}),` + `and(id_usuario1.eq.${other},id_usuario2.eq.${meId})`
        );

      if (delErr) throw delErr;

      toast.success(`Has eliminado a @${friendHandle}.`, { id: t });
      await refetch();
      notifyChange(); // ✅ avisa al padre y al global
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo eliminar.", { id: t });
    } finally {
      setPendingId(null);
    }
  };

  // Lista efectiva según búsqueda
  const list = query ? filteredFriends : friends;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className={cn("sm:max-w-lg p-0 overflow-hidden border-2 border-border/60", className)}
      >
        <DialogHeader className="px-6 pt-8 pb-4 border-b border-border/60 bg-gradient-to-br from-background to-muted/5">
          <DialogTitle aria-describedby={undefined} className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2.5 bg-primary/10 rounded-lg ring-1 ring-primary/20">
              <Users className="size-5 text-primary" />
            </div>
            <span className="truncate">Amigos de {username?.replace(/^@+/, "")}</span>
          </DialogTitle>

          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o @usuario…"
                className="pl-9 h-10"
                inputMode="search"
                spellCheck="false"
                aria-label="Buscar amigos"
                autoFocus
              />
            </div>
            {query && (
              <div className="text-xs text-muted-foreground">
                {list.length} de {friends.length} coinciden
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-muted/40 animate-pulse"
                  role="status"
                  aria-label="Cargando…"
                />
              ))}
            </div>
          ) : isError ? (
            /* UI-ONLY: Improved error state */
            <div className="p-6 text-center">
              <div className="p-4 rounded-full bg-destructive/10 mb-3 w-fit mx-auto">
                <Users className="h-6 w-6 text-destructive/60" />
              </div>
              <p className="text-sm font-medium text-destructive mb-1">No se pudo cargar la lista</p>
              <p className="text-xs text-muted-foreground">{error ?? "Intenta recargar la página."}</p>
            </div>
          ) : list.length === 0 ? (
            /* UI-ONLY: Improved empty state with better messaging */
            <div className="p-6 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-3 w-fit mx-auto">
                <Users className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {query ? "No se encontraron amigos" : "Sin amigos aún"}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {query ? `No hay amigos que coincidan con "${query}".` : "Este usuario aún no tiene amigos."}
              </p>
            </div>
          ) : (
            /* UI-ONLY: Improved friends list with better card design and accessibility */
            <ScrollArea className="h-full pr-4">
              <ul className="space-y-2">
                {list.map((f) => {
                  const initial = (f.nombre?.[0] || f.username?.[0] || "?").toUpperCase();
                  const isPending = pendingId === f.id;
                  return (
                    <li
                      key={f.id}
                      className="p-3 flex items-center gap-3 rounded-xl border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90 hover:border-primary/40 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/40"
                    >
                      <Link
                        to={`/u/${f.username}`}
                        className="flex items-center gap-3 min-w-0 flex-1 group outline-none rounded"
                        onClick={() => onOpenChange(false)}
                        aria-label={`Ir al perfil de ${f.nombre || f.username}`}
                      >
                        <Avatar className="size-12 border-2 border-primary/20 ring-2 ring-primary/10 shadow-sm flex-shrink-0">
                          <AvatarImage src={f.avatarUrl ?? undefined} alt={`Avatar de ${f.username}`} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate group-hover:underline">
                            {f.nombre ?? `@${f.username}`}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">@{f.username}</div>
                        </div>
                      </Link>

                      {canManageFriends && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                              disabled={isPending}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Eliminar a ${f.username} de amigos`}
                              title="Eliminar de amigos"
                            >
                              {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">{isPending ? "Eliminando…" : "Eliminar"}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar de amigos</AlertDialogTitle>
                              <AlertDialogDescription>
                                Quitarás a <strong>@{f.username}</strong> de tu lista de amigos. Esta acción no puede
                                deshacerse.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleUnfriend(f.id, f.username)}
                              >
                                Confirmar eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
