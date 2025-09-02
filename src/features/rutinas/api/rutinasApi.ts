import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../../lib/supabase/client";
import type { Rutina, Ejercicio, EjercicioRutina, RutinaConEjercicios, CrearRutinaFormData, AgregarEjercicioFormData, FiltrosEjercicios, UsuarioRutina, RutinaConUsuario } from "../../../types/rutinas";

export const rutinasApi = createApi({
  reducerPath: "rutinasApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Rutinas", "Ejercicios", "EjerciciosRutina", "UsuarioRutinas"],
  endpoints: (builder) => ({
    // Obtener todas las rutinas públicas
    getRutinas: builder.query<Rutina[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("Rutinas")
            .select("*")
            .order("nombre");

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Rutinas"],
    }),

    // Obtener rutinas del usuario (públicas y privadas)
    getRutinasUsuario: builder.query<RutinaConUsuario[], void>({
      queryFn: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuario no autenticado");

          // Primero obtener el id_usuario de la tabla Usuarios
          const { data: usuarioData, error: errorUsuario } = await supabase
            .from("Usuarios")
            .select("id_usuario")
            .eq("auth_uid", user.id)
            .single();

          if (errorUsuario || !usuarioData) {
            throw new Error("Usuario no encontrado en la base de datos");
          }

          const { data, error } = await supabase
            .from("UsuarioRutina")
            .select(`
              *,
              rutina:Rutinas(*)
            `)
            .eq("id_usuario", usuarioData.id_usuario)
            .order("created_at", { ascending: false });

          if (error) throw error;

          const rutinasConUsuario: RutinaConUsuario[] = (data || []).map(item => ({
            ...item.rutina,
            usuarioRutina: {
              id: item.id,
              id_usuario: item.id_usuario,
              id_rutina: item.id_rutina,
              privada: item.privada,
              activa: item.activa,
              created_at: item.created_at,
              id_programa: item.id_programa,
            }
          }));

          return { data: rutinasConUsuario };
        } catch (error) {
          console.error("Error en getRutinasUsuario:", error);
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["UsuarioRutinas"],
    }),

    // Obtener rutinas activas del usuario
    getRutinasActivas: builder.query<RutinaConUsuario[], void>({
      queryFn: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuario no autenticado");

          // Primero obtener el id_usuario de la tabla Usuarios
          const { data: usuarioData, error: errorUsuario } = await supabase
            .from("Usuarios")
            .select("id_usuario")
            .eq("auth_uid", user.id)
            .single();

          if (errorUsuario || !usuarioData) {
            throw new Error("Usuario no encontrado en la base de datos");
          }

          const { data, error } = await supabase
            .from("UsuarioRutina")
            .select(`
              *,
              rutina:Rutinas(*)
            `)
            .eq("id_usuario", usuarioData.id_usuario)
            .eq("activa", true)
            .order("created_at", { ascending: false });

          if (error) throw error;

          const rutinasConUsuario: RutinaConUsuario[] = (data || []).map(item => ({
            ...item.rutina,
            usuarioRutina: {
              id: item.id,
              id_usuario: item.id_usuario,
              id_rutina: item.id_rutina,
              privada: item.privada,
              activa: item.activa,
              created_at: item.created_at,
              id_programa: item.id_programa,
            }
          }));

          return { data: rutinasConUsuario };
        } catch (error) {
          console.error("Error en getRutinasActivas:", error);
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["UsuarioRutinas"],
    }),

    // Obtener rutinas públicas (para el listado general)
    getRutinasPublicas: builder.query<Rutina[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("UsuarioRutina")
            .select(`
              *,
              rutina:Rutinas(*)
            `)
            .eq("privada", false)
            .order("created_at", { ascending: false });

          if (error) throw error;

          const rutinasPublicas: Rutina[] = (data || []).map(item => item.rutina);
          return { data: rutinasPublicas };
        } catch (error) {
          console.error("Error en getRutinasPublicas:", error);
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["UsuarioRutinas"],
    }),

    // Obtener una rutina específica con sus ejercicios
    getRutinaById: builder.query<RutinaConEjercicios, number>({
      queryFn: async (id_rutina) => {
        try {
          // Obtener la rutina
          const { data: rutina, error: errorRutina } = await supabase
            .from("Rutinas")
            .select("*")
            .eq("id_rutina", id_rutina)
            .single();

          if (errorRutina) throw errorRutina;

          // Obtener los ejercicios de la rutina
          const { data: ejerciciosRutina, error: errorEjercicios } = await supabase
            .from("EjerciciosRutinas")
            .select(`
              *,
              ejercicio:Ejercicios(*)
            `)
            .eq("id_rutina", id_rutina);

          if (errorEjercicios) throw errorEjercicios;

          const rutinaConEjercicios: RutinaConEjercicios = {
            ...rutina,
            ejercicios: ejerciciosRutina || [],
          };

          return { data: rutinaConEjercicios };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Rutinas", id }],
    }),

    // Crear una nueva rutina
    crearRutina: builder.mutation<Rutina, CrearRutinaFormData>({
      queryFn: async (rutinaData) => {
        try {
          const { data, error } = await supabase
            .from("Rutinas")
            .insert([rutinaData])
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Rutinas"],
    }),

    // Obtener todos los ejercicios con filtros opcionales
    getEjercicios: builder.query<Ejercicio[], FiltrosEjercicios>({
      queryFn: async (filtros) => {
        try {
          let query = supabase.from("Ejercicios").select("*");

          if (filtros.grupo_muscular) {
            query = query.eq("grupo_muscular", filtros.grupo_muscular);
          }

          if (filtros.dificultad) {
            query = query.eq("dificultad", filtros.dificultad);
          }

          if (filtros.equipamento) {
            query = query.eq("equipamento", filtros.equipamento);
          }

          if (filtros.search) {
            query = query.ilike("nombre", `%${filtros.search}%`);
          }

          const { data, error } = await query.order("nombre");

          if (error) throw error;
          return { data: data || [] };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["Ejercicios"],
    }),

    // Agregar ejercicio a una rutina
    agregarEjercicioARutina: builder.mutation<EjercicioRutina, { id_rutina: number; ejercicioData: AgregarEjercicioFormData }>({
      queryFn: async ({ id_rutina, ejercicioData }) => {
        try {
          const { data, error } = await supabase
            .from("EjerciciosRutinas")
            .insert([{
              id_rutina,
              id_ejercicio: ejercicioData.id_ejercicio,
              series: ejercicioData.series,
              repeticiones: ejercicioData.repeticiones,
              peso_sugerido: ejercicioData.peso_sugerido,
            }])
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_result, _error, { id_rutina }) => [
        { type: "Rutinas", id: id_rutina },
        "EjerciciosRutina",
      ],
    }),

    // Remover ejercicio de una rutina
    removerEjercicioDeRutina: builder.mutation<void, { id_rutina: number; id_ejercicio: number }>({
      queryFn: async ({ id_rutina, id_ejercicio }) => {
        try {
          const { error } = await supabase
            .from("EjerciciosRutinas")
            .delete()
            .eq("id_rutina", id_rutina)
            .eq("id_ejercicio", id_ejercicio);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_result, _error, { id_rutina }) => [
        { type: "Rutinas", id: id_rutina },
        "EjerciciosRutina",
      ],
    }),

    // Actualizar ejercicio en una rutina
    actualizarEjercicioEnRutina: builder.mutation<EjercicioRutina, { id_rutina: number; id_ejercicio: number; ejercicioData: Partial<AgregarEjercicioFormData> }>({
      queryFn: async ({ id_rutina, id_ejercicio, ejercicioData }) => {
        try {
          const { data, error } = await supabase
            .from("EjerciciosRutinas")
            .update({
              series: ejercicioData.series,
              repeticiones: ejercicioData.repeticiones,
              peso_sugerido: ejercicioData.peso_sugerido,
            })
            .eq("id_rutina", id_rutina)
            .eq("id_ejercicio", id_ejercicio)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (_result, _error, { id_rutina }) => [
        { type: "Rutinas", id: id_rutina },
        "EjerciciosRutina",
      ],
    }),

    // Eliminar una rutina
    eliminarRutina: builder.mutation<void, number>({
      queryFn: async (id_rutina) => {
        try {
          // Primero eliminar los ejercicios de la rutina
          const { error: errorEjercicios } = await supabase
            .from("EjerciciosRutinas")
            .delete()
            .eq("id_rutina", id_rutina);

          if (errorEjercicios) throw errorEjercicios;

          // Luego eliminar la rutina
          const { error: errorRutina } = await supabase
            .from("Rutinas")
            .delete()
            .eq("id_rutina", id_rutina);

          if (errorRutina) throw errorRutina;

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Rutinas"],
    }),

    // Crear rutina del usuario (con privacidad por defecto)
    crearRutinaUsuario: builder.mutation<RutinaConUsuario, CrearRutinaFormData>({
      queryFn: async (rutinaData) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuario no autenticado");

          // Primero obtener el id_usuario de la tabla Usuarios
          const { data: usuarioData, error: errorUsuario } = await supabase
            .from("Usuarios")
            .select("id_usuario")
            .eq("auth_uid", user.id)
            .single();

          if (errorUsuario || !usuarioData) {
            throw new Error("Usuario no encontrado en la base de datos");
          }

          // Crear la rutina
          const { data: rutina, error: errorRutina } = await supabase
            .from("Rutinas")
            .insert([rutinaData])
            .select()
            .single();

          if (errorRutina) throw errorRutina;

          // Crear la relación UsuarioRutina (privada por defecto)
          const { data: usuarioRutina, error: errorUsuarioRutina } = await supabase
            .from("UsuarioRutina")
            .insert([{
              id_usuario: usuarioData.id_usuario,
              id_rutina: rutina.id_rutina,
              privada: true, // Por defecto privada
              activa: false, // Por defecto inactiva
            }])
            .select()
            .single();

          if (errorUsuarioRutina) throw errorUsuarioRutina;

          const rutinaConUsuario: RutinaConUsuario = {
            ...rutina,
            usuarioRutina: {
              id: usuarioRutina.id,
              id_usuario: usuarioRutina.id_usuario,
              id_rutina: usuarioRutina.id_rutina,
              privada: usuarioRutina.privada,
              activa: usuarioRutina.activa,
              created_at: usuarioRutina.created_at,
              id_programa: usuarioRutina.id_programa,
            }
          };

          return { data: rutinaConUsuario };
        } catch (error) {
          console.error("Error en crearRutinaUsuario:", error);
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["Rutinas", "UsuarioRutinas"],
    }),

    // Cambiar privacidad de una rutina
    cambiarPrivacidadRutina: builder.mutation<void, { id_usuario_rutina: number; privada: boolean }>({
      queryFn: async ({ id_usuario_rutina, privada }) => {
        try {
          const { error } = await supabase
            .from("UsuarioRutina")
            .update({ privada })
            .eq("id", id_usuario_rutina);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["UsuarioRutinas"],
    }),

    // Cambiar actividad de una rutina
    cambiarActividadRutina: builder.mutation<void, { id_usuario_rutina: number; activa: boolean }>({
      queryFn: async ({ id_usuario_rutina, activa }) => {
        try {
          const { error } = await supabase
            .from("UsuarioRutina")
            .update({ activa })
            .eq("id", id_usuario_rutina);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: ["UsuarioRutinas"],
    }),
  }),
});

export const {
  useGetRutinasQuery,
  useGetRutinaByIdQuery,
  useCrearRutinaMutation,
  useGetEjerciciosQuery,
  useAgregarEjercicioARutinaMutation,
  useRemoverEjercicioDeRutinaMutation,
  useActualizarEjercicioEnRutinaMutation,
  useEliminarRutinaMutation,
  useGetRutinasUsuarioQuery,
  useGetRutinasActivasQuery,
  useGetRutinasPublicasQuery,
  useCrearRutinaUsuarioMutation,
  useCambiarPrivacidadRutinaMutation,
  useCambiarActividadRutinaMutation,
} = rutinasApi; 