import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Users, UserMinus } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg p-0 overflow-hidden border-2 border-border/60", className)}>
        <DialogHeader className="px-6 pt-8 pb-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="size-5 text-primary" />
            </div>
            Amigos de @{username?.replace(/^@+/, "")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <p className="text-sm text-destructive">{error ?? "No se pudieron cargar las amistades."}</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Este usuario aún no tiene amigos.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <ul className="space-y-2">
                {friends.map((f) => {
                  const initial = (f.nombre?.[0] || f.username?.[0] || "?").toUpperCase();
                  const isPending = pendingId === f.id;
                  return (
                    <li
                      key={f.id}
                      className="p-3 flex items-center gap-4 rounded-xl border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                    >
                      <Link
                        to={`/u/${f.username}`}
                        className="flex items-center gap-3 min-w-0 flex-1 group"
                        onClick={() => onOpenChange(false)}
                      >
                        <Avatar className="size-12 border-2 border-primary/20 ring-2 ring-primary/10 shadow-sm">
                          <AvatarImage src={f.avatarUrl ?? undefined} />
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
                              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isPending}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Eliminar a @${f.username}`}
                            >
                              <UserMinus className="h-4 w-4" />
                              <span className="hidden sm:inline">Eliminar</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar de amigos</AlertDialogTitle>
                              <AlertDialogDescription>
                                Quitarás a <strong>@{f.username}</strong> de tu lista de amigos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleUnfriend(f.id, f.username)}
                              >
                                Confirmar
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
