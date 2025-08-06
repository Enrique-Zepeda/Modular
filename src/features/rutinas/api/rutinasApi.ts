import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../../lib/supabase/client";
import type { Rutina, Ejercicio, EjercicioRutina, RutinaConEjercicios, CrearRutinaFormData, AgregarEjercicioFormData, FiltrosEjercicios } from "../../../types/rutinas";

export const rutinasApi = createApi({
  reducerPath: "rutinasApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Rutinas", "Ejercicios", "EjerciciosRutina"],
  endpoints: (builder) => ({
    // Obtener todas las rutinas
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
} = rutinasApi; 