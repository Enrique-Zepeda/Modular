import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

import {
  useListFriendsQuery,
  useListOutgoingRequestsQuery,
  useListIncomingRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from "@/features/friends/api";
import { useGetMyProfileQuery } from "@/features/profile/api/userProfileApi";

type Props = {
  targetId: string | number;
  targetUsername?: string | null;
  className?: string;
};

// UI-ONLY REFACTOR: Converted to mini-card badge with Avatar, Tooltip, and improved accessibility
const FriendshipBadge: React.FC<Props> = ({ targetId, targetUsername, className }) => {
  const tid = String(targetId);

  // 🧩 TODOS los hooks van siempre al tope (nunca condicionales)
  const myQ = useGetMyProfileQuery();
  const friendsQ = useListFriendsQuery();
  const outgoingQ = useListOutgoingRequestsQuery();
  const incomingQ = useListIncomingRequestsQuery();

  const [sendReq, sendReqState] = useSendFriendRequestMutation();
  const [acceptReq, acceptReqState] = useAcceptFriendRequestMutation();
  const [rejectReq, rejectReqState] = useRejectFriendRequestMutation();

  // Derivados
  const isSelf = myQ.data ? String(myQ.data.id_usuario) === tid : false;
  const isLoading = friendsQ.isLoading || outgoingQ.isLoading || incomingQ.isLoading || myQ.isLoading;

  const isFriend = !!friendsQ.data?.some((f: any) => String(f.id_usuario) === tid);
  const outgoingReq = outgoingQ.data?.find((r: any) => String(r.destinatario_id) === tid && r.estado === "pendiente");
  const incomingReq = incomingQ.data?.find((r: any) => String(r.solicitante_id) === tid && r.estado === "pendiente");

  // Acciones
  const handleSend = async () => {
    if (isFriend || outgoingReq || incomingReq || sendReqState.isLoading) return;
    try {
      await sendReq({ destinatario_id: Number(tid) }).unwrap();
      toast.success(`Solicitud enviada${targetUsername ? ` a @${targetUsername}` : ""}`);
      window.dispatchEvent(new CustomEvent("friends:changed"));
    } catch (e: any) {
      const msg = e?.message?.includes("uniq_sa_pair_pending")
        ? "Ya existe una solicitud pendiente entre ustedes."
        : e?.message ?? "No se pudo enviar la solicitud";
      toast.error(msg);
    }
  };

  const handleAccept = async () => {
    if (!incomingReq || acceptReqState.isLoading) return;
    try {
      await acceptReq({ id_solicitud: incomingReq.id_solicitud }).unwrap();
      toast.success(`Ahora sigues a @${targetUsername ?? "usuario"}`);
      window.dispatchEvent(new CustomEvent("friends:changed"));
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo aceptar la solicitud");
    }
  };

  const handleReject = async () => {
    if (!incomingReq || rejectReqState.isLoading) return;
    try {
      await rejectReq({ id_solicitud: incomingReq.id_solicitud }).unwrap();
      toast.success(`Solicitud de @${targetUsername ?? "usuario"} rechazada`);
      window.dispatchEvent(new CustomEvent("friends:changed"));
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo rechazar la solicitud");
    }
  };

  if (isSelf) return null;
  if (isLoading)
    return (
      <Badge variant="secondary" className={className}>
        Cargando…
      </Badge>
    );
  if (isFriend) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={cn("cursor-default flex items-center gap-2", className)}
              role="status"
              aria-label={`Amigo de ${targetUsername || "usuario"}`}
            >
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Son amigos
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            @{targetUsername || "usuario"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (incomingReq) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white gap-1"
          onClick={handleAccept}
          disabled={acceptReqState.isLoading}
          aria-label={`Aceptar solicitud de ${targetUsername || "usuario"}`}
          title="Aceptar solicitud"
        >
          <Check className="h-4 w-4" />
          {acceptReqState.isLoading ? "Aceptando…" : "Aceptar"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 bg-transparent"
          onClick={handleReject}
          disabled={rejectReqState.isLoading}
          aria-label={`Rechazar solicitud de ${targetUsername || "usuario"}`}
          title="Rechazar solicitud"
        >
          <X className="h-4 w-4" />
          {rejectReqState.isLoading ? "Rechazando…" : "Rechazar"}
        </Button>
      </div>
    );
  }

  if (outgoingReq) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn("cursor-default flex items-center gap-2", className)}
              role="status"
              aria-label={`Solicitud pendiente con ${targetUsername || "usuario"}`}
            >
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Esperando…
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Solicitud pendiente con @{targetUsername || "usuario"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge
      variant="default"
      className={cn(
        "cursor-pointer select-none gap-1 hover:ring-2 hover:ring-offset-2 hover:ring-offset-background transition-all",
        className
      )}
      onClick={handleSend}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSend();
        }
      }}
      role="button"
      tabIndex={sendReqState.isLoading ? -1 : 0}
      aria-busy={sendReqState.isLoading}
      aria-label={sendReqState.isLoading ? "Enviando solicitud…" : "Agregar amigo"}
      title={sendReqState.isLoading ? "Enviando…" : "Agregar amigo"}
    >
      {sendReqState.isLoading ? "Enviando…" : "Agregar"}
    </Badge>
  );
};

export default FriendshipBadge;
