import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/client";
import type { Friend, FriendRequest, UserPublicProfile } from "@/types/friends";

const tableUsers = "Usuarios";
const tableFriends = "Amigos";
const tableRequests = "SolicitudesAmistad";

export const friendsApi = createApi({
  reducerPath: "friendsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Friends", "Requests", "Search"],
  endpoints: (builder) => ({
    // -----------------------------
    // BÚSQUEDA DE USUARIOS (global)
    // -----------------------------
    searchUsers: builder.query<UserPublicProfile[], { term: string }>({
      async queryFn({ term }) {
        try {
          // RPC recomendada (si la creaste)
          const rpc = await supabase.rpc("search_users", { term });
          if (!rpc.error && rpc.data) {
            return { data: rpc.data as UserPublicProfile[] };
          }
        } catch (_) {
          // ignore y fallback abajo
        }

        // Fallback: búsqueda directa (menos precisa sin normalize en cliente)
        const me = await supabase.rpc("current_usuario_id");
        const myId = me.data as number;

        const { data, error } = await supabase
          .from(tableUsers)
          .select("id_usuario,username,nombre,url_avatar")
          .ilike("username", `%${term}%`)
          .neq("id_usuario", myId) // <- number
          .limit(20);

        if (error) return { error };
        return { data: (data ?? []) as UserPublicProfile[] };
      },
      providesTags: (_res, _err, { term }) => [{ type: "Search", id: term }],
    }),

    // -----------------------------
    // MIS AMIGOS (Modelo B real)
    // -----------------------------
    listFriends: builder.query<Friend[], void>({
      async queryFn() {
        try {
          const me = await supabase.rpc("current_usuario_id");
          const myId = me.data as number;

          // Solo las columnas reales que existen en tu tabla
          const { data: pairs, error: errPairs } = await supabase
            .from(tableFriends)
            .select("id_usuario1,id_usuario2")
            .or(`id_usuario1.eq.${myId},id_usuario2.eq.${myId}`);

          if (errPairs) return { error: errPairs };

          const others = (pairs ?? []).map((p: any) => (p.id_usuario1 === myId ? p.id_usuario2 : p.id_usuario1));
          if (!others.length) return { data: [] };

          const { data: users, error: errUsers } = await supabase
            .from(tableUsers)
            .select("id_usuario,username,nombre,url_avatar")
            .in("id_usuario", others);

          if (errUsers) return { error: errUsers };

          const byId = new Map<number, any>((users ?? []).map((u: any) => [u.id_usuario as number, u]));
          const out: Friend[] = (pairs ?? []).map((p: any) => {
            const otherId: number = p.id_usuario1 === myId ? p.id_usuario2 : p.id_usuario1;
            const u = byId.get(otherId) || {};
            return {
              id_usuario: otherId,
              username: u.username ?? "",
              nombre: u.nombre ?? null,
              url_avatar: u.url_avatar ?? null,
              // created_at no existe en tu tabla; lo dejamos como null
              created_at: null,
            };
          });

          return { data: out };
        } catch (error: any) {
          return { error };
        }
      },
      providesTags: ["Friends"],
    }),

    // --------------------------------
    // SOLICITUDES (entrantes/salientes)
    // --------------------------------
    listIncomingRequests: builder.query<FriendRequest[], void>({
      async queryFn() {
        const me = await supabase.rpc("current_usuario_id");
        const myId = me.data as number;

        const { data, error } = await supabase
          .from(tableRequests)
          .select(
            `
            id_solicitud, solicitante_id, destinatario_id, estado, mensaje, created_at, updated_at,
            solicitante:Usuarios!SolicitudesAmistad_solicitante_id_fkey(id_usuario,username,nombre,url_avatar)
          `
          )
          .eq("destinatario_id", myId)
          .eq("estado", "pendiente")
          .order("created_at", { ascending: false });

        if (error) return { error };
        return { data: (data ?? []) as any as FriendRequest[] };
      },
      providesTags: ["Requests"],
    }),

    listOutgoingRequests: builder.query<FriendRequest[], void>({
      async queryFn() {
        const me = await supabase.rpc("current_usuario_id");
        const myId = me.data as number;

        const { data, error } = await supabase
          .from(tableRequests)
          .select(
            `
            id_solicitud, solicitante_id, destinatario_id, estado, mensaje, created_at, updated_at,
            destinatario:Usuarios!SolicitudesAmistad_destinatario_id_fkey(id_usuario,username,nombre,url_avatar)
          `
          )
          .eq("solicitante_id", myId)
          .eq("estado", "pendiente")
          .order("created_at", { ascending: false });

        if (error) return { error };
        return { data: (data ?? []) as any as FriendRequest[] };
      },
      providesTags: ["Requests"],
    }),

    // -----------------------------
    // ACCIONES (mutaciones)
    // -----------------------------
    sendFriendRequest: builder.mutation<FriendRequest, { destinatario_id: number; mensaje?: string }>({
      async queryFn({ destinatario_id, mensaje }) {
        const { data, error } = await supabase.rpc("request_friend", {
          destinatario: destinatario_id, // <- number
          p_mensaje: mensaje ?? null,
        });
        if (error) return { error };
        return { data: data as FriendRequest };
      },
      invalidatesTags: ["Requests", "Search"],
    }),

    acceptFriendRequest: builder.mutation<FriendRequest, { id_solicitud: string }>({
      async queryFn({ id_solicitud }) {
        const { data, error } = await supabase.rpc("respond_friend_request", {
          p_id: id_solicitud,
          accion: "aceptar",
        });
        if (error) return { error };
        return { data: data as FriendRequest };
      },
      invalidatesTags: ["Requests", "Friends", "Search"],
    }),

    rejectFriendRequest: builder.mutation<FriendRequest, { id_solicitud: string }>({
      async queryFn({ id_solicitud }) {
        const { data, error } = await supabase.rpc("respond_friend_request", {
          p_id: id_solicitud,
          accion: "rechazar",
        });
        if (error) return { error };
        return { data: data as FriendRequest };
      },
      invalidatesTags: ["Requests", "Search"],
    }),

    cancelFriendRequest: builder.mutation<FriendRequest, { id_solicitud: string }>({
      async queryFn({ id_solicitud }) {
        const { data, error } = await supabase
          .from(tableRequests)
          .update({ estado: "cancelada" })
          .eq("id_solicitud", id_solicitud)
          .eq("estado", "pendiente")
          .select("*")
          .single();

        if (error) return { error };
        return { data: data as FriendRequest };
      },
      invalidatesTags: ["Requests", "Search"],
    }),
  }),
});

export const {
  useSearchUsersQuery,
  useListFriendsQuery,
  useListIncomingRequestsQuery,
  useListOutgoingRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelFriendRequestMutation,
} = friendsApi;
