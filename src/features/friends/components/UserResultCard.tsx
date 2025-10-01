import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserPublicProfile } from "@/types/friends";
import { UserPlus, Clock, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";
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
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import * as React from "react";

type Props = {
  user: UserPublicProfile;
  status?: "none" | "friend" | "pending-in" | "pending-out";
  onSend?: (id: string) => void;
  onAccept?: (idSolicitud: string) => void;
  onCancel?: (idSolicitud: string) => void;
  onReject?: (idSolicitud: string) => void;
};

export default function UserResultCard({ user, status = "none", onSend }: Props) {
  const [localStatus, setLocalStatus] = React.useState(status);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => setLocalStatus(status), [status]);

  const initial = (user.nombre?.charAt(0) || user.username?.charAt(0) || "?").toUpperCase();

  async function unfriend() {
    const other = Number(user.id_usuario);
    if (!Number.isFinite(other)) {
      toast.error("Id de usuario inválido.");
      return;
    }
    setPending(true);
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

      setLocalStatus("none");
      // 🔔 avisa a quien esté escuchando (p. ej., ProfilePage) para refrescar el summary
      window.dispatchEvent(new CustomEvent("friends:changed"));
      toast.success(`Has eliminado a @${user.username}.`, { id: t });
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo eliminar.", { id: t });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-muted/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      <CardContent className="p-5 flex items-center gap-4">
        {/* Clickeable a perfil */}
        <Link to={`/u/${user.username}`} className="flex items-center gap-4 min-w-0 flex-1 group/link">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300">
              <AvatarImage src={user.url_avatar ?? undefined} alt={user.username} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator (decorative) */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full ring-2 ring-background" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-semibold text-base truncate group-hover/link:text-primary transition-colors">
              {user.username}
            </div>
            {user.nombre && (
              <div className="text-sm text-muted-foreground truncate flex items-center gap-1.5">{user.nombre}</div>
            )}
          </div>
        </Link>

        {/* Acciones */}
        {localStatus === "friend" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                disabled={pending}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                aria-label="Eliminar de amigos"
              >
                <UserMinus className="h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar de amigos</AlertDialogTitle>
                <AlertDialogDescription>
                  Quitarás a <strong>@{user.username}</strong> de tu lista de amigos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={unfriend}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : localStatus === "pending-out" ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pendiente</span>
          </div>
        ) : (
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSend?.(user.id_usuario);
            }}
          >
            <UserPlus className="h-4 w-4" /> Solicitar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
