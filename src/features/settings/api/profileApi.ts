import { supabase } from "@/lib/supabase/client";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { UserProfile } from "@/types/user"; // ya existe en tu repo

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getCurrentUserProfile: builder.query<UserProfile, void>({
      async queryFn() {
        // 1) Obtener user auth
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) return { error: authErr };
        const user = authData?.user;
        if (!user) return { error: { name: "NoAuth", message: "No hay sesión activa" } as any };

        // 2) Leer fila en Usuarios (recomendado por auth_uid)
        const { data, error } = await supabase.from("Usuarios").select("*").eq("auth_uid", user.id).single(); // esperamos 1 fila

        if (error) return { error };
        return { data: data as UserProfile };
      },
      // cachea la lectura del perfil
      providesTags: (_res) => [{ type: "UserProfile", id: "current" }],
    }),
  }),
});

export const { useGetCurrentUserProfileQuery } = profileApi;
