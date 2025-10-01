import {
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelFriendRequestMutation,
} from "../api/friendsApi";
import { toast } from "react-hot-toast";

export function useFriendActions() {
  const [sendReq, sendState] = useSendFriendRequestMutation();
  const [acceptReq, acceptState] = useAcceptFriendRequestMutation();
  const [rejectReq, rejectState] = useRejectFriendRequestMutation();
  const [cancelReq, cancelState] = useCancelFriendRequestMutation();

  return {
    send: async (destinatario_id: string, mensaje?: string) => {
      const p = sendReq({ destinatario_id, mensaje }).unwrap();
      await toast.promise(p, {
        loading: "Enviando solicitud…",
        success: "Solicitud enviada",
        error: (e) => e?.message ?? "No se pudo enviar",
      });
    },
    accept: async (id_solicitud: string) => {
      const p = acceptReq({ id_solicitud }).unwrap();
      await toast.promise(p, {
        loading: "Aceptando…",
        success: "Ahora som amigos 🎉",
        error: (e) => e?.message ?? "No se pudo aceptar",
      });
    },
    reject: async (id_solicitud: string) => {
      const p = rejectReq({ id_solicitud }).unwrap();
      await toast.promise(p, {
        loading: "Rechazando…",
        success: "Solicitud rechazada",
        error: (e) => e?.message ?? "No se pudo rechazar",
      });
    },
    cancel: async (id_solicitud: string) => {
      const p = cancelReq({ id_solicitud }).unwrap();
      await toast.promise(p, {
        loading: "Cancelando…",
        success: "Solicitud cancelada",
        error: (e) => e?.message ?? "No se pudo cancelar",
      });
    },
    state: { sendState, acceptState, rejectState, cancelState },
  };
}
