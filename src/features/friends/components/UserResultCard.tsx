import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserPublicProfile } from "@/types/friends";
import { UserPlus, Check, Clock, UserMinus } from "lucide-react";
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
    <Card className="border-muted/60">
      <CardContent className="p-4 flex items-center gap-3">
        {/* Clickeable a perfil */}
        <Link to={`/u/${user.username}`} className="flex items-center gap-3 min-w-0 group">
          <Avatar className="h-10 w-10 ring-1 ring-border/50">
            <AvatarImage src={user.url_avatar ?? undefined} alt={user.username} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate group-hover:underline">@{user.username}</div>
            {user.nombre && <div className="text-sm text-muted-foreground truncate">{user.nombre}</div>}
          </div>
        </Link>

        <div className="flex-1" />

        {/* Acciones */}
        {localStatus === "friend" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-destructive hover:text-destructive"
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
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" /> Pendiente
          </span>
        ) : (
          <Button
            size="sm"
            className="gap-1"
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
