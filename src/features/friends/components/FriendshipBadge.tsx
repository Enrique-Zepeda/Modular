"use client";

import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  useListFriendsQuery,
  useListOutgoingRequestsQuery,
  useSendFriendRequestMutation,
} from "@/features/friends/api";
import { useGetMyProfileQuery } from "@/features/profile/api/userProfileApi";
import { UserPlus, Clock, Check, Loader2 } from "lucide-react";

type Props = {
  /** id del usuario visitado (string o number) */
  targetId: string | number;
  /** para UX en el toast, opcional */
  targetUsername?: string | null;
  className?: string;
};

const FriendshipBadge: React.FC<Props> = ({ targetId, targetUsername, className }) => {
  const tid = String(targetId);

  // Mi perfil para detectar si estoy viendo mi propio perfil
  const myQ = useGetMyProfileQuery();
  const isSelf = myQ.data ? String(myQ.data.id_usuario) === tid : false;

  // Listas existentes en tu API de amigos
  const friendsQ = useListFriendsQuery();
  const outgoingQ = useListOutgoingRequestsQuery();
  const [sendReq, sendReqState] = useSendFriendRequestMutation();

  if (isSelf) return null; // no mostrar nada en mi propio perfil

  const isLoading = friendsQ.isLoading || outgoingQ.isLoading || myQ.isLoading;

  if (isLoading)
    return (
      <Badge
        variant="secondary"
        className={cn("gap-2 px-4 py-2 shadow-sm border-2 border-border/60 bg-muted/50", className)}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-xs font-medium">Cargando…</span>
      </Badge>
    );

  const isFriend = !!friendsQ.data?.some((f) => String(f.id_usuario) === tid);
  const hasOutgoingPending = !!outgoingQ.data?.some(
    (r) => String(r.destinatario_id) === tid && r.estado === "pendiente"
  );

  const handleSend = async () => {
    if (isFriend || hasOutgoingPending || sendReqState.isLoading) return;
    try {
      await sendReq({ destinatario_id: Number(tid) }).unwrap();
      toast.success(`Solicitud enviada${targetUsername ? ` a @${targetUsername}` : ""}`);
      // para refrescar otros módulos que escuchen este evento (ya lo usas en el modal)
      window.dispatchEvent(new CustomEvent("friends:changed"));
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo enviar la solicitud");
    }
  };

  if (isFriend) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-2 px-4 py-2 shadow-md border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-500/10 text-green-600 dark:text-green-400 hover:shadow-lg hover:border-green-500/40 transition-all duration-300",
          className
        )}
        title="Ya son amigos"
      >
        <Check className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">Amigos</span>
      </Badge>
    );
  }

  if (hasOutgoingPending) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-2 px-4 py-2 shadow-md border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 text-amber-600 dark:text-amber-400 hover:shadow-lg hover:border-amber-500/50 transition-all duration-300",
          className
        )}
        title="Solicitud enviada"
      >
        <Clock className="h-3.5 w-3.5 animate-pulse" />
        <span className="text-xs font-semibold">Pendiente</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="default"
      className={cn(
        "gap-2 px-4 py-2 cursor-pointer shadow-lg border-2 border-primary/30 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 hover:border-primary/50",
        sendReqState.isLoading && "opacity-70 cursor-wait",
        className
      )}
      onClick={handleSend}
      title={sendReqState.isLoading ? "Enviando…" : "Agregar amigo"}
      aria-busy={sendReqState.isLoading}
    >
      {sendReqState.isLoading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-xs font-semibold">Enviando…</span>
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">Agregar</span>
        </>
      )}
    </Badge>
  );
};

export default FriendshipBadge;
