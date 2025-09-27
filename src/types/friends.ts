export type UserPublicProfile = {
  id_usuario: string;
  username: string;
  nombre: string | null;
  url_avatar: string | null;
};

export type Friend = {
  // Representación “del otro” lista para UI
  id_usuario: string;
  username: string;
  nombre: string | null;
  url_avatar: string | null;
  created_at?: string | null;
};

export type FriendRequestState = "pendiente" | "aceptada" | "rechazada" | "cancelada";

export type FriendRequest = {
  id_solicitud: string;
  solicitante_id: string;
  destinatario_id: string;
  estado: FriendRequestState;
  mensaje: string | null;
  created_at: string;
  updated_at: string;
  // Para UI enriquecida
  solicitante?: UserPublicProfile;
  destinatario?: UserPublicProfile;
};
