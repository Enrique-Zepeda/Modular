"use client";

import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

import {
  useListFriendsQuery,
  useListOutgoingRequestsQuery,
  useListIncomingRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useUnfriendMutation,
} from "@/features/friends/api";
import { useGetMyProfileQuery } from "@/features/profile/api/userProfileApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [unfriend, unfriendState] = useUnfriendMutation();

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

  const handleUnfriend = async () => {
    try {
      await unfriend({ other_id: Number(tid) }).unwrap();
      toast.success(`Has eliminado a @${targetUsername ?? "usuario"}`);
      window.dispatchEvent(new CustomEvent("friends:changed"));
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo eliminar la amistad");
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
      <div className={cn("flex flex-col items-end gap-2", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "cursor-default flex items-center gap-2 bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/10 shadow-sm",
                  className
                )}
                role="status"
                aria-label={`Amigo de ${targetUsername || "usuario"}`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Son amigos
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs bg-card border border-border shadow-lg text-card-foreground">
              @{targetUsername || "usuario"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 gap-1"
              disabled={unfriendState.isLoading}
              title="Eliminar de amigos"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {unfriendState.isLoading ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border border-border shadow-lg rounded-lg">
            <AlertDialogTitle className="text-base font-semibold">Eliminar de amigos</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              ¿Estás seguro que deseas eliminar a{" "}
              <strong className="text-foreground">@{targetUsername ?? "usuario"}</strong> de tu lista de amigos?
            </AlertDialogDescription>
            <div className="flex justify-end gap-3 pt-4">
              <AlertDialogCancel className="px-4 py-2 text-sm font-medium">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                onClick={handleUnfriend}
              >
                Eliminar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (incomingReq) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-md hover:shadow-lg transition-all duration-200"
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
          className="gap-1 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent transition-colors duration-200"
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
              className={cn(
                "cursor-default flex items-center gap-2 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
                className
              )}
              role="status"
              aria-label={`Solicitud pendiente con ${targetUsername || "usuario"}`}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              Esperando…
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs bg-card border border-border shadow-lg text-card-foreground">
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
        "cursor-pointer select-none gap-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg hover:ring-2 hover:ring-primary/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
        sendReqState.isLoading && "opacity-75",
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
      aria-label={sendReqState.isLoading ? "Enviando solicitud de amistad…" : "Agregar amigo"}
      title={sendReqState.isLoading ? "Enviando solicitud…" : "Agregar amigo"}
    >
      {sendReqState.isLoading ? (
        <div className="flex items-center gap-1.5">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          <span className="hidden sm:inline font-medium">Enviando…</span>
        </div>
      ) : (
        <span className="font-medium">Enviar solicitud de amistad</span>
      )}
    </Badge>
  );
};

export default FriendshipBadge;
